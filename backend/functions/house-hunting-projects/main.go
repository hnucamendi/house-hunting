package main

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	eventJson, _ := json.Marshal(event)
	return &events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Body:       fmt.Sprintf("Hello, World! this is a test for house-hunting-projects\n%s\n", eventJson),
	}, nil

}

func main() {
	lambda.Start(HandleRequest)
}
