package main

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"strings"

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

type Token struct {
	Headers map[string]string
	JWT     JWTPayload
}

type JWTPayload struct {
	Iss             string `json:"iss"`
	Sub             string `json:"sub"`
	Aud             string `json:"aud"`
	Exp             int64  `json:"exp"`
	Iat             int64  `json:"iat"`
	Jti             string `json:"jti"`
	EmailVerified   bool   `json:"email_verified"`
	CognitoUsername string `json:"cognito:username"`
	OriginJti       string `json:"origin_jti"`
	EventID         string `json:"event_id"`
	TokenUse        string `json:"token_use"`
	AuthTime        int64  `json:"auth_time"`
	Email           string `json:"email"`
}

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
	Id           string       `json:"id"`
	UserId       string       `json:"userId"`
	Title        string       `json:"title"`
	Description  string       `json:"description"`
	Categories   []Category   `json:"catagories"`
	HouseEntries []HouseEntry `json:"houseEntries"`
}

func (jwt *Token) decodeSegment(seg string) ([]byte, error) {
	if l := len(seg) % 4; l != 0 {
		seg += strings.Repeat("=", 4-l)
	}
	return base64.URLEncoding.DecodeString(seg)
}

func (jwt *Token) parseJWT(token string) error {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return fmt.Errorf("token contains an invalid number of segments")
	}

	payloadBytes, err := jwt.decodeSegment(parts[1])
	if err != nil {
		return fmt.Errorf("failed to decode JWT payload: %v", err)
	}

	if err := json.Unmarshal(payloadBytes, &jwt.JWT); err != nil {
		return fmt.Errorf("failed to unmarshal JWT payload: %v", err)
	}

	return nil
}

func (jwt *Token) processJWT() string {
	authBearer, found := strings.CutPrefix(jwt.Headers["authorization"], "Bearer")
	if !found {
		log.Printf("Authorization header malformed")
	}

	auth := strings.TrimSpace(authBearer)

	err := jwt.parseJWT(auth)
	if err != nil {
		log.Printf("Failed to parse JWT")
	}

	return jwt.JWT.Email
}

func (p *Project) generateId(pre IDType) string {
	b := []byte(fmt.Sprintf("%s::%s", pre, p.UserId))
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

	token := &Token{
		event.Headers,
		JWTPayload{},
	}

	email := token.processJWT()
	project.UserId = email

	project.Id = project.generateId(USERID)
	project.UserId = project.generateId(PROJECTID)

	fmt.Println("ID:", project.UserId)

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
