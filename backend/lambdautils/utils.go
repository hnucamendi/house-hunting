package lambdautils

import "github.com/aws/aws-lambda-go/events"

func GenerateAllow() *events.APIGatewayV2CustomAuthorizerSimpleResponse {
	return &events.APIGatewayV2CustomAuthorizerSimpleResponse{
		IsAuthorized: true,
	}
}

func GenerateDeny() *events.APIGatewayV2CustomAuthorizerSimpleResponse {
	return &events.APIGatewayV2CustomAuthorizerSimpleResponse{
		IsAuthorized: false,
	}
}
