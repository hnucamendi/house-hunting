import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../../utils/authService.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const session = await signIn(email, password);
      console.log(`Sign in Successful ${session}`);
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
      <div className="container" style={{ width: "30%" }}>
        <h1 className="m-2">Welcome</h1>
        <h4 className="m-2">
          {isSignUp ? "Sign up to create an account" : "Sign in to your account"}
        </h4>
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          <div className="m-2">
            <input
              className="form-control"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="m-2">
            <input
              className="form-control"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          {isSignUp && (
            <div className="m-2">
              <input
                className="form-control"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />
            </div>
          )}
          <button className="btn btn-primary m-2" type="submit">{isSignUp ? "Sign Up" : "Sign In"}</button>
        </form>
        <button className="btn btn-light m-2" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}