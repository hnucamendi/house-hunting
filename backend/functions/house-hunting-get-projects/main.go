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

type StringValue struct {
	S string `json:"S"`
}

type NumberValue struct {
	N string `json:"N"`
}

type Note struct {
	ID    StringValue `json:"id"`
	Title StringValue `json:"title"`
	Note  StringValue `json:"note"`
}

type Score struct {
	ID    StringValue `json:"id"`
	Title StringValue `json:"title"`
	Score NumberValue `json:"score"`
}

type HouseEntry struct {
	ID      StringValue `json:"id"`
	Address StringValue `json:"address"`
	Scores  []struct {
		M Score `json:"M"`
	} `json:"scores"`
	Notes []struct {
		M Note `json:"M"`
	} `json:"notes"`
}

type Item struct {
	ID           StringValue `json:"id"`
	ProjectID    StringValue `json:"project_id"`
	HouseEntries []struct {
		M HouseEntry `json:"M"`
	} `json:"house_entries"`
}

type Response struct {
	Item Item `json:"Item"`
}

var sess = session.Must(session.NewSession())

type ProjectsRequest struct {
	UserId    string `json:"id"`
	ProjectId string `json:"project_id"`
}

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	id := event.QueryStringParameters["id"]
	project_id := event.QueryStringParameters["project_id"]

	if id == "" || project_id == "" {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 400,
			Body:       "Missing id or project_id",
		}, nil
	}

	db := dynamodb.New(sess)

	out, err := db.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String("UsersTable"),
		Key: map[string]*dynamodb.AttributeValue{
			"id": {
				S: &id,
			},
			"project_id": {
				S: &project_id,
			},
		},
	})
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to get item: %v\t%s %s\n", err, id, project_id),
		}, nil
	}

	var response Response
	err = json.Unmarshal([]byte(out.GoString()), &response)
	if err != nil {
		fmt.Println("Error unmarshaling response:", err)
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to unmarshal response: %v", err),
		}, nil
	}

	responseJSON, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Error marshaling response:", err)
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to marshal response: %v", err),
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
