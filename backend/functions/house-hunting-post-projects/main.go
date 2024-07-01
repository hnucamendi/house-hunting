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

type HouseNotes struct {
	NoteId    string `json:"id"`
	NoteTitle string `json:"title"`
	Note      string `json:"note"`
}

type HouseScores struct {
	ScoreId    string `json:"id"`
	ScoreTitle string `json:"title"`
	Score      int    `json:"score"`
}

type HouseEntry struct {
	EntryId string        `json:"id"`
	Address string        `json:"address"`
	Scores  []HouseScores `json:"scores"`
	Notes   []HouseNotes  `json:"notes"`
}

type Project struct {
	UserId       string       `json:"id"`
	ProjectId    string       `json:"project_id"`
	Title        string       `json:"title"`
	Description  string       `json:"description"`
	HouseEntries []HouseEntry `json:"house_entries"`
}

func convertHouseEntriesToAttributeValue(entries []HouseEntry) []*dynamodb.AttributeValue {
	var avs []*dynamodb.AttributeValue
	for _, entry := range entries {
		scores, _ := json.Marshal(entry.Scores)
		notes, _ := json.Marshal(entry.Notes)
		avs = append(avs, &dynamodb.AttributeValue{
			M: map[string]*dynamodb.AttributeValue{
				"id":      {S: aws.String(entry.EntryId)},
				"address": {S: aws.String(entry.Address)},
				"scores":  {S: aws.String(string(scores))},
				"notes":   {S: aws.String(string(notes))},
			},
		})
	}
	return avs
}

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	var project Project
	err := json.Unmarshal([]byte(event.Body), &project)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 400,
			Body:       fmt.Sprintf("Failed to parse request: %v", err),
		}, nil
	}

	entries := convertHouseEntriesToAttributeValue(project.HouseEntries)

	db := dynamodb.New(sess)

	out, err := db.PutItem(&dynamodb.PutItemInput{
		TableName: aws.String("UsersTable"),
		Item: map[string]*dynamodb.AttributeValue{
			"id": {
				S: &project.UserId,
			},
			"project_id": {
				S: &project.ProjectId,
			},
			"house_entries": {
				L: entries,
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
