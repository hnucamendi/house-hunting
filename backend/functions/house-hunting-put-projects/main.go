package main

import (
	"encoding/json"
	"fmt"

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

type HouseNotes struct {
	Title string `json:"title"`
	Note  string `json:"note"`
}

type HouseScores struct {
	Score      int    `json:"score"`
	CriteriaId string `json:"criteriaId"`
}

type HouseEntry struct {
	Address string        `json:"address"`
	Scores  []HouseScores `json:"scores"`
	Notes   []HouseNotes  `json:"notes"`
}

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	projectId := event.QueryStringParameters["projectId"]
	var he HouseEntry
	err := json.Unmarshal([]byte(event.Body), &he)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 400,
			Body:       fmt.Sprintf("Failed to parse request: %v", err),
		}, nil
	}

	p, err := dynamodbattribute.Marshal(he)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to marshal house entries: %v\n", err),
		}, nil
	}

	db := dynamodb.New(sess)

	_, err = db.UpdateItem(&dynamodb.UpdateItemInput{
		TableName: aws.String("ProjectsTable"),
		Key: map[string]*dynamodb.AttributeValue{
			"id": {
				S: aws.String(projectId),
			},
		},
		UpdateExpression: aws.String("SET houses = list_append(houses, :h)"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":h": {
				L: []*dynamodb.AttributeValue{p},
			},
		},
	})
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
