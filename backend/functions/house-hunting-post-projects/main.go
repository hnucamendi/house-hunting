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
	NoteId string `json:"id"`
	Title  string `json:"title"`
	Note   string `json:"note"`
}

type HouseScores struct {
	ScoreId string `json:"id"`
	Title   string `json:"title"`
	Score   int    `json:"score"`
}

type ProjectCriteria struct {
	CriteriaId string `json:"id"`
	Key        string `json:"key"`
	Value      string `json:"value"`
}

type HouseEntry struct {
	EntryId string        `json:"id"`
	Address string        `json:"address"`
	Scores  []HouseScores `json:"scores"`
	Notes   []HouseNotes  `json:"notes"`
}

type Project struct {
	UserId          string              `json:"id"`
	ProjectId       string              `json:"projectId"`
	Title           string              `json:"title"`
	Description     string              `json:"description"`
	ProjectCriteria []map[string]string `json:"projectCriteria"`
	HouseEntries    []HouseEntry        `json:"houseEntries"`
}

func convertHouseEntriesToAttributeValue(entries []HouseEntry) []*dynamodb.AttributeValue {
	var avs []*dynamodb.AttributeValue
	for _, entry := range entries {
		scoresAttr := make([]*dynamodb.AttributeValue, len(entry.Scores))
		for i, score := range entry.Scores {
			scoresAttr[i] = &dynamodb.AttributeValue{
				M: map[string]*dynamodb.AttributeValue{
					"id":    {S: aws.String(score.ScoreId)},
					"title": {S: aws.String(score.Title)},
					"score": {N: aws.String(fmt.Sprintf("%d", score.Score))},
				},
			}
		}

		notesAttr := make([]*dynamodb.AttributeValue, len(entry.Notes))
		for i, note := range entry.Notes {
			notesAttr[i] = &dynamodb.AttributeValue{
				M: map[string]*dynamodb.AttributeValue{
					"id":    {S: aws.String(note.NoteId)},
					"title": {S: aws.String(note.Title)},
					"note":  {S: aws.String(note.Note)},
				},
			}
		}

		avs = append(avs, &dynamodb.AttributeValue{
			M: map[string]*dynamodb.AttributeValue{
				"id":      {S: aws.String(entry.EntryId)},
				"address": {S: aws.String(entry.Address)},
				"scores":  {L: scoresAttr},
				"notes":   {L: notesAttr},
			},
		})
	}
	return avs
}

func convertProjectCriteriaToAttributeValue(criteria []map[string]string) []*dynamodb.AttributeValue {
	var avs []*dynamodb.AttributeValue
	for _, c := range criteria {
		for k, v := range c {
			avs = append(avs, &dynamodb.AttributeValue{
				M: map[string]*dynamodb.AttributeValue{
					"key":   {S: aws.String(k)},
					"value": {S: aws.String(v)},
				},
			})
		}
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

	he := convertHouseEntriesToAttributeValue(project.HouseEntries)
	pc := convertProjectCriteriaToAttributeValue(project.ProjectCriteria)

	db := dynamodb.New(sess)

	out, err := db.PutItem(&dynamodb.PutItemInput{
		TableName: aws.String("UsersTable"),
		Item: map[string]*dynamodb.AttributeValue{
			"id": {
				S: &project.UserId,
			},
			"projectId": {
				S: &project.ProjectId,
			},
			"houseEntries": {
				L: he,
			},
			"projectCriteria": {
				L: pc,
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
		Body:       "Success",
	}, nil

}

func main() {
	lambda.Start(HandleRequest)
}
