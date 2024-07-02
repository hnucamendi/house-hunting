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
	UserId    string `json:"id"`
	ProjectId string `json:"project_id"`
}

func dynamoToGo(value *dynamodb.AttributeValue) interface{} {
	if value.S != nil {
		return *value.S
	}
	if value.N != nil {
		return *value.N
	}
	if value.BOOL != nil {
		return *value.BOOL
	}
	if value.M != nil {
		m := make(map[string]interface{})
		for k, v := range value.M {
			m[k] = dynamoToGo(v)
		}
		return m
	}
	if value.L != nil {
		l := make([]interface{}, len(value.L))
		for i, v := range value.L {
			l[i] = dynamoToGo(v)
		}
		return l
	}
	if value.NULL != nil && *value.NULL {
		return nil
	}
	return nil
}

func dynamoMapToGoMap(item map[string]*dynamodb.AttributeValue) map[string]interface{} {
	m := make(map[string]interface{})
	for k, v := range item {
		m[k] = dynamoToGo(v)
	}
	return m
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

	fmt.Println(out.String(), out.GoString())

	var dynamoResponse map[string]*dynamodb.AttributeValue
	err = json.Unmarshal([]byte(out.String()), &dynamoResponse)
	if err != nil {
		fmt.Println("Error unmarshaling dynamo JSON:", err)
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to unmarshal dynamo JSON: %v", err),
		}, nil
	}

	goMap := dynamoMapToGoMap(dynamoResponse["Item"].M)

	normalJson, err := json.MarshalIndent(goMap, "", "  ")
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
