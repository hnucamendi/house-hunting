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
	USERID     IDType = "USERID"
	PROJECTID  IDType = "PROJECTID"
	CRITERIAID IDType = "CRITERIAID"
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
	Title string `json:"title"`
	Note  string `json:"note"`
}

type HouseScores struct {
	Score      int    `json:"score"`
	CriteriaId string `json:"criteriaId"`
}

type Criteria struct {
	Id       string `json:"id"`
	Category string `json:"category"`
	Key      string `json:"key"`
	Value    string `json:"value"`
}

type HouseEntry struct {
	Address string        `json:"address"`
	Scores  []HouseScores `json:"scores"`
	Notes   []HouseNotes  `json:"notes"`
}

type Project struct {
	Id           string       `json:"id"`
	Title        string       `json:"title"`
	Description  string       `json:"description"`
	Criteria     []Criteria   `json:"criteria"`
	HouseEntries []HouseEntry `json:"houseEntries"`
}

type User struct {
	Id       string    `json:"id"`
	Email    string    `json:"email"`
	Projects []Project `json:"projects"`
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

func (u *User) generateId(pre IDType, identifier string) string {
	if pre == USERID {
		b := []byte(fmt.Sprintf("%s::%s", pre, u.Email))
		return fmt.Sprintf("%x", md5.Sum(b))
	}

	b := []byte(fmt.Sprintf("%s::%s::%s", pre, u.Email, identifier))
	return fmt.Sprintf("%x", md5.Sum(b))
}

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	var user User
	err := json.Unmarshal([]byte(event.Body), &user)
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

	user.Email = token.processJWT()
	user.Id = user.generateId(USERID, "")

	for i := range user.Projects {
		user.Projects[i].Id = user.generateId(PROJECTID, user.Projects[i].Title)

		for j := range user.Projects[i].Criteria {
			user.Projects[i].Criteria[j].Id = user.generateId(CRITERIAID, user.Projects[i].Criteria[j].Category)
		}

		for j := range user.Projects[i].HouseEntries {
			for k := range user.Projects[i].HouseEntries[j].Scores {
				user.Projects[i].HouseEntries[j].Scores[k].CriteriaId = user.generateId(CRITERIAID, user.Projects[i].Criteria[j].Category)
			}
		}
	}

	p, err := dynamodbattribute.Marshal(user)
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
