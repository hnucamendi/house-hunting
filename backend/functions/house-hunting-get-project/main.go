package main

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
)

var sess = session.Must(session.NewSession())

type IDType string

const (
	USERID     IDType = "USERID"
	PROJECTID  IDType = "PROJECTID"
	CRITERIAID IDType = "CRITERIAID"
)

type Token struct {
	Headers map[string]string
	JWT     JWTPayload
}

type JWTPayload struct {
	Iss             string `json:"iss"`
	Sub             string `json:"sub"`
	Aud             string `json:"aud"`
	Exp             int64  `json:"exp"`
	Iat             int64  `json:"iat"`
	Jti             string `json:"jti"`
	EmailVerified   bool   `json:"email_verified"`
	CognitoUsername string `json:"cognito:username"`
	OriginJti       string `json:"origin_jti"`
	EventID         string `json:"event_id"`
	TokenUse        string `json:"token_use"`
	AuthTime        int64  `json:"auth_time"`
	Email           string `json:"email"`
}

type HouseScores struct {
	Score      float32 `json:"score"`
	CriteriaId string  `json:"criteriaId"`
}

type Criteria struct {
	Id       string            `json:"id"`
	Category string            `json:"category"`
	Details  map[string]string `json:"details"`
}

type HouseEntry struct {
	Address string        `json:"address"`
	Scores  []HouseScores `json:"scores"`
	Notes   []string      `json:"notes"`
}

type Project struct {
	Id           string       `json:"id"`
	Title        string       `json:"title"`
	Description  string       `json:"description"`
	Criteria     []Criteria   `json:"criteria"`
	HouseEntries []HouseEntry `json:"houseEntries"`
}

type User struct {
	Id        string  `json:"id"`
	ProjectId string  `json:"projectId"`
	Email     string  `json:"email"`
	Project   Project `json:"project"`
}

type ProjectsRequest struct {
	UserId    string `json:"id"`
	ProjectId string `json:"project_id"`
}

func (jwt *Token) decodeSegment(seg string) ([]byte, error) {
	if l := len(seg) % 4; l != 0 {
		seg += strings.Repeat("=", 4-l)
	}
	return base64.URLEncoding.DecodeString(seg)
}

func (jwt *Token) parseJWT(token string) error {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return fmt.Errorf("token contains an invalid number of segments")
	}

	payloadBytes, err := jwt.decodeSegment(parts[1])
	if err != nil {
		return fmt.Errorf("failed to decode JWT payload: %v", err)
	}

	if err := json.Unmarshal(payloadBytes, &jwt.JWT); err != nil {
		return fmt.Errorf("failed to unmarshal JWT payload: %v", err)
	}

	return nil
}

func (jwt *Token) processJWT() string {
	authBearer, found := strings.CutPrefix(jwt.Headers["authorization"], "Bearer")
	if !found {
		log.Printf("Authorization header malformed")
	}

	auth := strings.TrimSpace(authBearer)

	err := jwt.parseJWT(auth)
	if err != nil {
		log.Printf("Failed to parse JWT")
	}

	return jwt.JWT.Email
}

func generateId(pre IDType, key string) string {
	b := []byte(fmt.Sprintf("%s::%s", pre, key))
	return fmt.Sprintf("%x", md5.Sum(b))
}

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	token := &Token{
		event.Headers,
		JWTPayload{},
	}

	projectId := event.QueryStringParameters["projectId"]
	email := token.processJWT()

	id := generateId(USERID, email)
	db := dynamodb.New(sess)

	out, err := db.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String("UsersTable"),
		Key: map[string]*dynamodb.AttributeValue{
			"id": {
				S: aws.String(id),
			},
			"projectId": {
				S: aws.String(projectId),
			},
		},
	})
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to get item: %v\n", err),
		}, nil
	}

	if out.Item == nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 404,
			Body:       "Items not found",
		}, nil
	}

	var user User
	err = dynamodbattribute.UnmarshalMap(out.Item, &user)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to unmarshal item: %v\n", err),
		}, nil
	}

	normalJson, err := json.MarshalIndent(user, "", "  ")
	if err != nil {
		fmt.Println("Error marshaling to JSON:", err)
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to marshal JSON: %v", err),
		}, nil
	}

	return &events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Body:       string(normalJson),
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
