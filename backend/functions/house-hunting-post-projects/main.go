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
	NoteId string `json:"note_id"`
	Note   string `json:"note"`
}

type HouseScores struct {
	ScoreId string `json:"score_id"`
	Score   int    `json:"score"`
}

type HouseEntry struct {
	EntryId string        `json:"entry_id"`
	Address string        `json:"address"`
	Scores  []HouseScores `json:"scores"`
	Notes   []HouseNotes  `json:"notes"`
}

type Project struct {
	UserId       string       `json:"user_id"`
	ProjectId    string       `json:"project_id"`
	Title        string       `json:"title"`
	Description  string       `json:"description"`
	HouseEntries []HouseEntry `json:"house_entries"`
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

	j, _ := json.Marshal(project.HouseEntries)
	js := string(j)

	db := dynamodb.New(sess)

	out, err := db.PutItem(&dynamodb.PutItemInput{
		TableName: aws.String("UsersTable"),
		Item: map[string]*dynamodb.AttributeValue{
			"user_id": {
				S: &project.UserId,
			},
			"project_id": {
				S: &project.ProjectId,
			},
			"house_entries": {
				S: &js,
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
