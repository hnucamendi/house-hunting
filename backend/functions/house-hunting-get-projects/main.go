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

var sess = session.Must(session.NewSession())

type ProjectsRequest struct {
	ProjectId string `json:"project_id"`
	UserId    string `json:"user_id"`
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

	out, err := db.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String("ProjectsTable"),
		Key: map[string]*dynamodb.AttributeValue{
			"project_id": {
				S: &payload.ProjectId,
			},
			"user_id": {
				S: &payload.UserId,
			},
		},
	})
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to put item: %v", err),
		}, nil
	}

	return &events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Body:       out.GoString(),
	}, nil

}

func main() {
	lambda.Start(HandleRequest)
}
