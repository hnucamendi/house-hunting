package main

import (
	"crypto/md5"
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

type IDType string

const (
	USERID     IDType = "ID"
	PROJECTID  IDType = "PROJECTID"
	CategoryID IDType = "CATEGORYID"
	EntryID    IDType = "ENTRYID"
	NoteID     IDType = "NOTEID"
	ScoreID    IDType = "SCOREID"
)

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
	Key   string `json:"key"`
	Value string `json:"value"`
}

type Category struct {
	Id       string     `json:"id"`
	Category string     `json:"category"`
	Criteria []Criteria `json:"criteria"`
}

type HouseEntry struct {
	Id      string        `json:"id"`
	Address string        `json:"address"`
	Scores  []HouseScores `json:"scores"`
	Notes   []HouseNotes  `json:"notes"`
}

type Project struct {
	UserId       string       `json:"id"`
	ProjectId    string       `json:"projectId"`
	Title        string       `json:"title"`
	Description  string       `json:"description"`
	Categories   []Category   `json:"catagories"`
	HouseEntries []HouseEntry `json:"houseEntries"`
}

func (p *Project) generateId(pre IDType) string {
	b := []byte(fmt.Sprintf("%s::%s::%s", pre, p.UserId, p.ProjectId))
	return fmt.Sprintf("%x", md5.Sum(b))
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

	project.UserId = project.generateId(USERID)
	project.ProjectId = project.generateId(PROJECTID)

	for i := range project.Categories {
		project.Categories[i].Id = project.generateId(CategoryID)
	}

	for i := range project.HouseEntries {
		project.HouseEntries[i].Id = project.generateId(EntryID)
		for j := range project.HouseEntries[i].Scores {
			project.HouseEntries[i].Scores[j].Id = project.generateId(ScoreID)
		}
		for j := range project.HouseEntries[i].Notes {
			project.HouseEntries[i].Notes[j].Id = project.generateId(NoteID)
		}
	}

	p, err := dynamodbattribute.Marshal(project)
	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       fmt.Sprintf("Failed to marshal house entries: %v\n", err),
		}, nil
	}

	db := dynamodb.New(sess)

	_, err = db.PutItem(&dynamodb.PutItemInput{
		TableName: aws.String("UsersTable"),
		Item:      p.M,
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
