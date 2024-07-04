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

type HouseNotes struct {
	Id    string `json:"id"`
	Title string `json:"title"`
	Note  string `json:"note"`
}

type HouseScores struct {
	Id         string `json:"id"`
	Score      int    `json:"score"`
	CriteriaId string `json:"criteriaId"`
}

type Criteria struct {
	Id    string `json:"id"`
	Key   string `json:"key"`
	Value string `json:"value"`
}

type HouseEntry struct {
	EntryId string        `json:"id"`
	Address string        `json:"address"`
	Scores  []HouseScores `json:"scores"`
	Notes   []HouseNotes  `json:"notes"`
}

type Project struct {
	UserId       string                         `json:"id"`
	ProjectId    string                         `json:"projectId"`
	Title        string                         `json:"title"`
	Description  string                         `json:"description"`
	Criteria     []map[string]map[string]string `json:"criteria"`
	HouseEntries []HouseEntry                   `json:"houseEntries"`
}

type ProjectsRequest struct {
	UserId    string `json:"id"`
	ProjectId string `json:"project_id"`
}

// func dynamoToGo(value *dynamodb.AttributeValue) interface{} {
// 	if value.S != nil {
// 		return *value.S
// 	}
// 	if value.N != nil {
// 		return *value.N
// 	}
// 	if value.BOOL != nil {
// 		return *value.BOOL
// 	}
// 	if value.M != nil {
// 		m := make(map[string]interface{})
// 		for k, v := range value.M {
// 			m[k] = dynamoToGo(v)
// 		}
// 		return m
// 	}
// 	if value.L != nil {
// 		l := make([]interface{}, len(value.L))
// 		for i, v := range value.L {
// 			l[i] = dynamoToGo(v)
// 		}
// 		return l
// 	}
// 	if value.NULL != nil && *value.NULL {
// 		return nil
// 	}
// 	return nil
// }

// func dynamoMapToGoMap(item map[string]*dynamodb.AttributeValue) map[string]interface{} {
// 	m := make(map[string]interface{})
// 	for k, v := range item {
// 		m[k] = dynamoToGo(v)
// 	}
// 	return m
// }

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	id := event.QueryStringParameters["id"]
	projectId := event.QueryStringParameters["projectId"]

	if id == "" || projectId == "" {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 400,
			Body:       "Missing id or projectId",
		}, nil
	}

	db := dynamodb.New(sess)

	out, err := db.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String("UsersTable"),
		Key: map[string]*dynamodb.AttributeValue{
			"id": {
				S: &id,
			},
			"projectId": {
				S: &projectId,
			},
		},
	})
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to get item: %v\n", err),
		}, nil
	}

	if out.Item == nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 404,
			Body:       "Item not found",
		}, nil
	}

	var project []Project
	err = dynamodbattribute.UnmarshalMap(out.Item, &project)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to unmarshal item: %v\n", err),
		}, nil
	}

	normalJson, err := json.MarshalIndent(project, "", "  ")
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
