package main

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func generateAllow() *events.APIGatewayV2CustomAuthorizerSimpleResponse {
	return &events.APIGatewayV2CustomAuthorizerSimpleResponse{
		IsAuthorized: true,
	}
}

func HandleRequest(events *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2CustomAuthorizerSimpleResponse, error) {
	fmt.Println("Hello, World!")
	eventJson, _ := json.Marshal(events)
	fmt.Println(events)
	fmt.Println(eventJson)

	lr := generateAllow()

	return lr, nil

}

func main() {
	lambda.Start(HandleRequest)
}
