package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func generateAllow() *events.APIGatewayV2CustomAuthorizerSimpleResponse {
	return &events.APIGatewayV2CustomAuthorizerSimpleResponse{
		IsAuthorized: true,
	}
}

func HandleRequest(event *events.APIGatewayV2HTTPRequest) *events.APIGatewayV2CustomAuthorizerSimpleResponse {
	eventJson, err := json.Marshal(event)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to marshal event: %s\n", err)
		return generateAllow()
	}

	fmt.Println("Authorization Header:", event.Headers["Authorization"])
	fmt.Printf("Event JSON: %s\n", eventJson)

	// Add your custom authorization logic here
	// Example: Check if the Authorization header is present
	authHeader := event.Headers["Authorization"]
	if authHeader == "" {
		fmt.Println("Authorization header missing")
		return generateAllow()
	}

	// If the authorization is successful
	return generateAllow()
}

func main() {
	lambda.Start(HandleRequest)
}
