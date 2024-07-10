import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../../utils/authService.js";
import { Container, Form, Button } from "react-bootstrap";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isTrueL, setIsTrueL] = useState(false)
  const [isTrueU, setIsTrueU] = useState(false)
  const [isTrueLW, setIsTrueLW] = useState(false)
  const navigate = useNavigate();


  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const session = await signIn(email, password);
      if (session && typeof session.AccessToken != "undefined") {
        sessionStorage.setItem("accessToken", session.AccessToken);
        if (sessionStorage.getItem("accessToken")) {
          window.location.href = "/projects";
        } else {
          console.error("Session Token was not set properly");
        }
      } else {
        console.error("SignIn session or AccessToken is undefined");
      }
    } catch (error) {
      alert(`Sign in failed ${error}`);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await signUp(email, password);
      navigate("/confirm", { state: { email } });
    } catch (error) {
      alert(`Sign up failed ${error}`);
    }
  };

  return (
    <div className="parent">
      <Container className="container" style={{ width: "70%" }}>
        <h1 className="m-2">Welcome</h1>
        <h4 className="m-2">
          {isSignUp ? "Sign up to create an account" : "Sign in to your account"}
        </h4>
        <Form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          <Form.Group>
            <Form.Control
              className="form-control"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Control
              className="form-control"
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                if (e.target.value.match(/[a-z]/)) {
                  setIsTrueLW(true)
                }
                if (e.target.value.match(/[A-Z]/)) {
                  setIsTrueU(true)
                }
                if (e.target.value.length >= 8) {
                  setIsTrueL(true)
                }
                setPassword(e.target.value)
              }}
              placeholder="Password"
              required>
            </Form.Control>
          </Form.Group>
          {isSignUp && (
            <Form.Group>
              <Form.Control
                className="form-control"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required>
              </Form.Control>
              <Form.Text>Must be 8 characters{isTrueL && isSignUp ? <span>✅</span> : <span>❌</span>}</Form.Text>
              <br />
              <Form.Text>Must have uppercase{isTrueU && isSignUp ? <span>✅</span> : <span>❌</span>}</Form.Text>
              <br />
              <Form.Text>Must have lowercase {isTrueLW && isSignUp ? <span>✅</span> : <span>❌</span>}</Form.Text>
            </Form.Group>
          )}
          <Button className="btn btn-primary m-2" type="submit">{isSignUp ? "Sign Up" : "Sign In"}</Button>
        </Form>
        <Button className="btn btn-light m-2" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up"}
        </Button>
      </Container>
    </div >
  );
}