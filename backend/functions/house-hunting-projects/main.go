package main

import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	return &events.APIGatewayV2HTTPResponse{}, nil

}

func main() {
	lambda.Start(HandleRequest)
}
