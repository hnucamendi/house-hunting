import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config.json";

export const cognitoClient = new CognitoIdentityProviderClient({
  region: config.region,
});

export const checkTokenValidity = async () => {
  const accessToken = sessionStorage.getItem('accessToken'); // Adjust based on how you store the token

  if (!accessToken) {
    return false;
  }

  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    await cognitoClient.send(command);
    return true; // Token is valid
  } catch (error) {
    console.error("Token validation error:", error);
    return false; // Token is invalid or expired
  }
};

export const useSessionCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        console.log('Session is not valid:', isValid)
        navigate('/login');
      }
      console.log('Session is valid:', isValid)
    };

    checkSession();

    // Optionally, set up an interval to check periodically
    const intervalId = setInterval(checkSession, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId);
  }, [navigate]);
};

export const signIn = async (username, password) => {
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: config.clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };


  const command = new InitiateAuthCommand(params);
  const { AuthenticationResult } = await cognitoClient.send(command);
  if (AuthenticationResult) {
    sessionStorage.setItem("idToken", AuthenticationResult.IdToken || "");
    sessionStorage.setItem(
      "accessToken",
      AuthenticationResult.AccessToken || "",
    );
    sessionStorage.setItem(
      "refreshToken",
      AuthenticationResult.RefreshToken || "",
    );
    return AuthenticationResult;
  }
};

export const signUp = async (email, password) => {
  const params = {
    ClientId: config.clientId,
    Username: email,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  };

  const command = new SignUpCommand(params);
  const response = await cognitoClient.send(command);
  console.log(`Sign up success ${response}`);
  return response;
};

export const confirmSignUp = async (username, code) => {
  const params = {
    ClientId: config.clientId,
    Username: username,
    ConfirmationCode: code,
  };

  const command = new ConfirmSignUpCommand(params);
  await cognitoClient.send(command);
  return true;
};