package main

import (
	"context"
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var (
	db *dynamodb.Client
)

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("Failed to load SDK configuration: %v", err)
	}
	db = dynamodb.NewFromConfig(cfg)
}

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

func HandleRequest(ctx context.Context, event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	token := &Token{
		event.Headers,
		JWTPayload{},
	}

	email := token.processJWT()
	id := generateId(USERID, email)

	input := &dynamodb.QueryInput{
		TableName: aws.String("UsersTable"),
		KeyConditions: map[string]types.Condition{
			"id": {
				ComparisonOperator: types.ComparisonOperatorEq,
				AttributeValueList: []types.AttributeValue{
					&types.AttributeValueMemberS{
						Value: id,
					},
				},
			},
		},
	}

	out, err := db.Query(ctx, input)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to get item: %v\n", err),
		}, nil
	}

	if out.Count <= 0 {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 200,
			Body:       `{"message": "No projects found"}`,
		}, nil
	}

	var users []User
	err = attributevalue.UnmarshalListOfMaps(out.Items, &users)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to unmarshal items: %v", err),
		}, nil
	}

	responseJSON, err := json.MarshalIndent(users, "", "  ")
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to marshal JSON: %v", err),
		}, nil
	}

	return &events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Body:       string(responseJSON),
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
