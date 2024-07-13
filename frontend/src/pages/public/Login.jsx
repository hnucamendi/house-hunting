import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../../utils/authService.js";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignUp) {
      setPasswordRequirements({
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
      });
    }
  }, [password, isSignUp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleSignIn();
    }
  };

  const handleSignIn = async () => {
    try {
      const session = await signIn(email, password);
      if (session && session.AccessToken) {
        sessionStorage.setItem("accessToken", session.AccessToken);
        window.location.href = "/projects";
      } else {
        throw new Error("SignIn session or AccessToken is undefined");
      }
    } catch (error) {
      alert(`Sign in failed: ${error.message}`);
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!Object.values(passwordRequirements).every(Boolean)) {
      alert("Please meet all password requirements");
      return;
    }
    try {
      await signUp(email, password);
      navigate("/confirm", { state: { email } });
    } catch (error) {
      alert(`Sign up failed: ${error.message}`);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <ListItem dense>
      <ListItemIcon>
        {met ? <CheckIcon color="success" /> : <CloseIcon color="error" />}
      </ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  );

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Welcome
        </Typography>
        <Typography component="h2" variant="h6" gutterBottom>
          {isSignUp ? "Sign up to create an account" : "Sign in to your account"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isSignUp && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <List>
                <PasswordRequirement
                  met={passwordRequirements.length}
                  text="At least 8 characters long"
                />
                <PasswordRequirement
                  met={passwordRequirements.lowercase}
                  text="Contains a lowercase letter"
                />
                <PasswordRequirement
                  met={passwordRequirements.uppercase}
                  text="Contains an uppercase letter"
                />
              </List>
            </>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <Box textAlign="center">
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword('');
                setConfirmPassword('');
              }}
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Need an account? Sign Up"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

Login.propTypes - {
  met: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
}

export default Login;