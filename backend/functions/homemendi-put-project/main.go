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

type HouseEntry struct {
	Address string        `json:"address"`
	Scores  []HouseScores `json:"scores"`
	Notes   []string      `json:"notes"`
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

func validateAccess(ctx context.Context, projectId, id string) (bool, error) {
	item := &dynamodb.QueryInput{
		TableName:              aws.String("UsersTable"),
		KeyConditionExpression: aws.String("id = :id AND projectId = :projectId"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":id":        &types.AttributeValueMemberS{Value: id},
			":projectId": &types.AttributeValueMemberS{Value: projectId},
		},
	}

	res, err := db.Query(ctx, item)
	if err != nil {
		return false, err
	}

	if len(res.Items) == 0 {
		return false, nil
	}

	return true, nil
}

func HandleRequest(ctx context.Context, event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	projectId := event.QueryStringParameters["projectId"]
	if projectId == "" {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 400,
			Body:       "Missing projectId",
		}, nil
	}

	token := &Token{
		event.Headers,
		JWTPayload{},
	}

	email := token.processJWT()
	id := generateId(USERID, email)

	access, err := validateAccess(ctx, projectId, id)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to validate access: %v", err),
		}, nil
	}

	if !access {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 403,
			Body:       "User does not have access to this project",
		}, nil
	}

	var he HouseEntry
	err = json.Unmarshal([]byte(event.Body), &he)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 400,
			Body:       fmt.Sprintf("Failed to parse request: %v", err),
		}, nil
	}

	p, err := attributevalue.Marshal(he)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to marshal house entries: %v\n", err),
		}, nil
	}

	item := &dynamodb.UpdateItemInput{
		TableName: aws.String("UsersTable"),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{
				Value: id,
			},
			"projectId": &types.AttributeValueMemberS{
				Value: projectId,
			},
		},
		UpdateExpression: aws.String("SET #proj.houseEntries = list_append(if_not_exists(#proj.houseEntries, :empty_list), :h)"),
		ExpressionAttributeNames: map[string]string{
			"#proj": "project",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":h": &types.AttributeValueMemberL{
				Value: []types.AttributeValue{p},
			},
			":empty_list": &types.AttributeValueMemberL{
				Value: []types.AttributeValue{},
			},
		},
	}

	_, err = db.UpdateItem(ctx, item)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to update item: %v", err),
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
