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

func generateDeny() *events.APIGatewayV2CustomAuthorizerSimpleResponse {
	return &events.APIGatewayV2CustomAuthorizerSimpleResponse{
		IsAuthorized: false,
	}
}

func HandleRequest(events *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2CustomAuthorizerSimpleResponse, error) {
	eventJson, _ := json.Marshal(events)
	fmt.Println(events.RequestContext.Authentication)
	fmt.Printf("HERE TAMOCHIM %s\n", eventJson)

	lr := generateAllow()
	return lr, nil

}

func main() {
	lambda.Start(HandleRequest)
}
