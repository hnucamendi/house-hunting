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

type Response struct {
	Item struct {
		UserId       string `json:"id"`
		ProjectId    string `json:"project_id"`
		HouseEntries struct {
			L []struct {
				M struct {
					Address struct {
						S string `json:"S"`
					} `json:"address"`
					Id struct {
						S string `json:"S"`
					} `json:"id"`
					Notes struct {
						L []struct {
							M struct {
								Title struct {
									S string `json:"S"`
								} `json:"title"`
								Note struct {
									S string `json:"S"`
								} `json:"note"`
								Id struct {
									S string `json:"S"`
								} `json:"id"`
							} `json:"M"`
						} `json:"L"`
					} `json:"notes"`
					Scores struct {
						L []struct {
							M struct {
								Title struct {
									S string `json:"S"`
								} `json:"title"`
								Score struct {
									N string `json:"N"`
								} `json:"score"`
								Id struct {
									S string `json:"S"`
								} `json:"id"`
							} `json:"M"`
						} `json:"L"`
					} `json:"scores"`
				} `json:"M"`
			} `json:"L"`
		} `json:"house_entries"`
	} `json:"Item"`
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

	t, _ := json.Marshal(response)
	err = json.Unmarshal([]byte(out.GoString()), &response)
	if err != nil {
		fmt.Println("error unmarshaling response:", err)
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("failed to unmarshal response: %v\n%v\n%v\n", err, t, out.GoString()),
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
