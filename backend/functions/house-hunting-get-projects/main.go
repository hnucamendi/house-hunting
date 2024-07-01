package main

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

type Method string

var sess = session.Must(session.NewSession())

const (
	UPLOAD Method = "UPLOAD"
	FETCH  Method = "FETCH"
)

type ProjectsRequest struct {
	ProjectId   string `json:"project_id"`
	UserId      string `json:"user_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Method      Method `json:"method"`
}

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	var payload ProjectsRequest
	err := json.Unmarshal([]byte(event.Body), &payload)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 400,
			Body:       fmt.Sprintf("Failed to parse request: %v", err),
		}, nil
	}

	db := dynamodb.New(sess)

	db.PutItem(&dynamodb.PutItemInput{
		TableName: aws.String("house-hunting-projects"),
		Item: map[string]*dynamodb.AttributeValue{
			"project_id": {
				S: &payload.ProjectId,
			},
			"user_id": {
				S: &payload.UserId,
			},
			"title": {
				S: &payload.Title,
			},
			"description": {
				S: &payload.Description,
			},
		},
	})

	return &events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Body:       fmt.Sprintf("Hello, World! this is a test for house-hunting-projects"),
	}, nil

}

func main() {
	lambda.Start(HandleRequest)
}
