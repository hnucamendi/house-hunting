package main

import (
	"context"
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
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
	Id        string     `json:"id"`
	ProjectId string     `json:"projectId"`
	Settings  UserConfig `json:"settings"`
	Project   Project    `json:"project"`
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

func generateId(pre IDType, identifier string) string {
	b := []byte(fmt.Sprintf("%s::%s", pre, identifier))
	return fmt.Sprintf("%x", md5.Sum(b))
}

func getProjects(token string) ([]User, error) {
	request, err := http.NewRequest("GET", "https://api.homemendi.com/projects", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", token)

	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, fmt.Errorf("failed to get projects: %v", err)
	}

	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	var users []User
	if err := json.Unmarshal(respBody, &users); err != nil {
		return nil, fmt.Errorf("failed to unmarshal users: %v\n%v", err, string(respBody))
	}

	return users, nil
}

func HandleRequest(ctx context.Context, event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	token := &Token{
		event.Headers,
		JWTPayload{},
	}

	email := token.processJWT()
	id := generateId(USERID, email)

	var u User
	err := json.Unmarshal([]byte(event.Body), &u)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 400,
			Body:       fmt.Sprintf("Failed to parse request: %v", err),
		}, nil
	}

	projs, err := getProjects(token.Headers["authorization"])
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to get projects: %v", err),
		}, nil
	}

	for _, proj := range projs {
		item := &dynamodb.UpdateItemInput{
			TableName: aws.String("UsersTable"),
			Key: map[string]types.AttributeValue{
				"id": &types.AttributeValueMemberS{
					Value: id,
				},
				"projectId": &types.AttributeValueMemberS{
					Value: proj.ProjectId,
				},
			},
			UpdateExpression: aws.String("SET #settings.#lang = :langValue"),
			ExpressionAttributeNames: map[string]string{
				"#settings": "settings",
				"#lang":     "language",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":langValue": &types.AttributeValueMemberS{Value: u.Settings.Language},
			},
		}

		_, err = db.UpdateItem(ctx, item)
		if err != nil {
			return &events.APIGatewayV2HTTPResponse{
				StatusCode: 500,
				Body:       fmt.Sprintf("Failed to update item: %v", err),
			}, nil
		}
	}

	return &events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Body:       "Success",
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
