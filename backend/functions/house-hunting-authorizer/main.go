package main

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/golang-jwt/jwt/v4"
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

type Key struct {
	Alg string `json:"alg"`
	E   string `json:"e"`
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	N   string `json:"n"`
	Use string `json:"use"`
}

type PublicKeys struct {
	Keys []Key `json:"keys"`
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

func parseToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("kid header not found")
		}

		keys, err := getPublicKey()
		if err != nil {
			return nil, err
		}

		var publicKey *rsa.PublicKey
		for _, key := range keys.Keys {
			if key.Kid == kid {
				publicKey, err = convertKey(key)
				if err != nil {
					return nil, err
				}
				break
			}
		}

		if publicKey == nil {
			return nil, fmt.Errorf("unable to find appropriate key")
		}

		return publicKey, nil
	})

	if err != nil {
		return nil, err
	}

	return token, nil
}

func getPublicKey() (*PublicKeys, error) {
	url := "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_JfP0nnpWY/.well-known/jwks.json"
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("Failed to get public key: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	var keys PublicKeys
	if err := json.NewDecoder(resp.Body).Decode(&keys); err != nil {
		log.Printf("Failed to decode public key: %v", err)
		return nil, err
	}

	return &keys, nil
}

func convertKey(key Key) (*rsa.PublicKey, error) {
	// Decode the base64 encoded modulus and exponent
	nBytes, err := base64.RawURLEncoding.DecodeString(key.N)
	if err != nil {
		return nil, fmt.Errorf("failed to decode modulus: %v", err)
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(key.E)
	if err != nil {
		return nil, fmt.Errorf("failed to decode exponent: %v", err)
	}

	// Convert the modulus bytes to a big integer
	n := new(big.Int).SetBytes(nBytes)

	// Convert the exponent bytes to an integer
	var e int
	for i := 0; i < len(eBytes); i++ {
		e = e*256 + int(eBytes[i])
	}

	return &rsa.PublicKey{N: n, E: e}, nil
}

func HandleRequest(event *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2CustomAuthorizerSimpleResponse, error) {
	authBearer, found := strings.CutPrefix(event.Headers["authorization"], "Bearer")
	if !found {
		log.Printf("Authorization header malformed")
		return generateDeny(), nil
	}

	auth := strings.TrimSpace(authBearer)

	token, err := parseToken(auth)
	if err != nil {
		log.Printf("Failed to parse JWT")
		return generateDeny(), nil
	}

	if !token.Valid {
		log.Printf("Invalid token")
		return generateDeny(), nil
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		log.Printf("Failed to parse claims")
		return generateDeny(), nil
	}

	if claims["iss"] != "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_JfP0nnpWY" {
		log.Println("Invalid issuer")
		return generateDeny(), nil
	}

	if claims["aud"] != "us-east-1_JfP0nnpWY" {
		log.Println("Invalid audience")
		return generateDeny(), nil
	}

	if claims["token_use"] != "id" {
		log.Println("Invalid token use")
		return generateDeny(), nil
	}

	exp, ok := claims["exp"].(float64)
	if !ok || int64(exp) < time.Now().Unix() {
		log.Println("Token expired")
		return generateDeny(), nil
	}

	emailVerified, ok := claims["email_verified"].(bool)
	if !ok || !emailVerified {
		log.Println("Email not verified")
		return generateDeny(), nil
	}

	log.Printf("User authorized")
	return generateAllow(), nil
}

func main() {
	lambda.Start(HandleRequest)
}
