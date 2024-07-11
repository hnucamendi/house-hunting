import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../../utils/authService.js";
import "../../styles/login.css";

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
    <div>
      <div className="login-box">
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h1>Welcome</h1>
        <h4>
          {isSignUp ? "Sign up to create an account" : "Sign in to your account"}
        </h4>
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          <label className="input-group">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required>
            </input>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </label>
          <label className="input-group">
            <input
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
            </input>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </label>
          {isSignUp && (
            <label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required>
              </input>
              <p>Must be 8 characters{isTrueL && isSignUp ? <span>✅</span> : <span>❌</span>}</p>
              <br />
              <p>Must have uppercase{isTrueU && isSignUp ? <span>✅</span> : <span>❌</span>}</p>
              <br />
              <p>Must have lowercase {isTrueLW && isSignUp ? <span>✅</span> : <span>❌</span>}</p>
            </label>
          )}
          <button type="submit">{isSignUp ? "Sign Up" : "Sign In"}</button>
        </form>
        <div className="signup-link">

          {
            isSignUp
              ? <p>Already have an account? <button onClick={() => setIsSignUp(!isSignUp)}>Sign In</button></p>
              : <p>Need an account? <button onClick={() => setIsSignUp(!isSignUp)}>Sign Up</button></p>
          }
        </div>
      </div>
    </div>
  );
}