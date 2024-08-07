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

type Criteria struct {
	Id      string              `json:"id"`
	Details map[string][]string `json:"details"`
}

type Project struct {
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Criteria    []Criteria `json:"criteria"`
}

type UserConfig struct {
	Language string `json:"language"`
}

type User struct {
	Id        string     `json:"id" dynamodbav:"id"`
	ProjectId string     `json:"projectId" dynamodbav:"projectId"`
	Settings  UserConfig `json:"settings" dynamodbav:"settings"`
	Project   Project    `json:"project" dynamodbav:"project"`
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

func (u *User) generateId(pre IDType, identifier string) string {
	if pre == USERID {
		b := []byte(fmt.Sprintf("%s::%s", pre, identifier))
		return fmt.Sprintf("%x", md5.Sum(b))
	}

	b := []byte(fmt.Sprintf("%s::%s::%s", pre, identifier, identifier))
	return fmt.Sprintf("%x", md5.Sum(b))
}

func HandleRequest(ctx context.Context, event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	var user User
	err := json.Unmarshal([]byte(event.Body), &user)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 400,
			Body:       fmt.Sprintf("Failed to parse request: %v", err),
		}, nil
	}

	token := &Token{
		event.Headers,
		JWTPayload{},
	}

	email := token.processJWT()
	user.Id = user.generateId(USERID, email)
	user.ProjectId = user.generateId(PROJECTID, user.Project.Title)

	for i := range user.Project.Criteria {
		for k := range user.Project.Criteria[i].Details {
			user.Project.Criteria[i].Id = user.generateId(CRITERIAID, k)
		}
	}

	p, err := attributevalue.MarshalMap(user)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to marshal house entries: %v\n", err),
		}, nil
	}

	item := &dynamodb.PutItemInput{
		TableName: aws.String("UsersTable"),
		Item:      p,
	}

	_, err = db.PutItem(ctx, item)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to put item: %v\n", err),
		}, nil
	}

	return &events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Body:       "Success",
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
