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

func convertHouseEntriesToAttributeValue(entries []HouseEntry) []*dynamodb.AttributeValue {
	var avs []*dynamodb.AttributeValue
	for _, entry := range entries {
		scoresAttr := make([]*dynamodb.AttributeValue, len(entry.Scores))
		for i, score := range entry.Scores {
			scoresAttr[i] = &dynamodb.AttributeValue{
				M: map[string]*dynamodb.AttributeValue{
					"id":         {S: aws.String(score.Id)},
					"score":      {N: aws.String(fmt.Sprintf("%d", score.Score))},
					"criteriaId": {S: aws.String(score.CriteriaId)},
				},
			}
		}

		notesAttr := make([]*dynamodb.AttributeValue, len(entry.Notes))
		for i, note := range entry.Notes {
			notesAttr[i] = &dynamodb.AttributeValue{
				M: map[string]*dynamodb.AttributeValue{
					"id":    {S: aws.String(note.Id)},
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

func convertCriteriaToAttributeValue(criteria []map[string]map[string]string) []*dynamodb.AttributeValue {
	var avs []*dynamodb.AttributeValue
	for _, c := range criteria {
		for key, value := range c {
			avs = append(avs, &dynamodb.AttributeValue{
				M: map[string]*dynamodb.AttributeValue{
					"id":    {S: aws.String(value["id"])},
					"key":   {S: aws.String(key)},
					"value": {S: aws.String(value["value"])},
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
	c := convertCriteriaToAttributeValue(project.Criteria)

	db := dynamodb.New(sess)

	_, err = db.PutItem(&dynamodb.PutItemInput{
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
			"criteria": {
				L: c,
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
