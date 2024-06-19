package main

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(events *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2CustomAuthorizerSimpleResponse, error) {
	fmt.Println("Hello, World!")
	eventJson, _ := json.Marshal(events)
	fmt.Println(events.RequestContext.Authentication)
	fmt.Printf("HERE TAMOCHIM %s\n", eventJson)

	lr := lambdautils.GenerateAllow()
	return lr, nil

}

func main() {
	lambda.Start(HandleRequest)
}
