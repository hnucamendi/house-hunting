package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

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

func decodeSegment(seg string) ([]byte, error) {
	if l := len(seg) % 4; l != 0 {
		seg += strings.Repeat("=", 4-l)
	}
	return base64.URLEncoding.DecodeString(seg)
}

func parseJWT(token string) (JWTPayload, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return JWTPayload{}, fmt.Errorf("token contains an invalid number of segments")
	}

	payloadBytes, err := decodeSegment(parts[1])
	if err != nil {
		return JWTPayload{}, fmt.Errorf("failed to decode JWT payload: %v", err)
	}
	var payload JWTPayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return JWTPayload{}, fmt.Errorf("failed to unmarshal JWT payload: %v", err)
	}

	return payload, nil
}

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2CustomAuthorizerSimpleResponse, error) {
	authBearer, found := strings.CutPrefix(event.Headers["authorization"], "Bearer")
	if !found {
		log.Printf("Authorization header malformed")
		return generateDeny(), nil
	}

	auth := strings.TrimSpace(authBearer)

	p, err := parseJWT(auth)
	if err != nil {
		log.Printf("Failed to parse JWT")
		return generateDeny(), nil
	}

	if p.Exp < time.Now().Unix() {
		log.Println("Token expired")
		return generateDeny(), nil
	}

	if !p.EmailVerified {
		log.Println("Email not verified")
		return generateDeny(), nil
	}

	log.Printf("user authorized")

	return generateAllow(), nil
}

func main() {
	lambda.Start(HandleRequest)
}
