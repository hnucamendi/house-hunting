package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest() (string, error) {
	fmt.Println("Hello World")
	return "Hello World", nil
}

func main() {
	lambda.Start(HandleRequest)
}
