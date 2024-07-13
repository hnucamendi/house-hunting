import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmSignUp } from "../../utils/authService";
import {
  Box,
  Stack,
  Button,
  Typography,
  FormGroup,
  FormControl,
  InputLabel,
  Input
} from "@mui/material";

export default function Confirm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [confirmationCode, setConfirmationCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await confirmSignUp(email, confirmationCode);
      alert("Account confirmed successfully!\nSign in on next page.");
      navigate("/login");
    } catch (error) {
      alert(`Failed to confirm account: ${error}`);
    }
  };
  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={2} alignItems={"center"} justifyContent={"center"}>
        <Typography variant="h2" align="center">Confirm Account</Typography>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <FormControl>
              <InputLabel htmlFor="confirm-email">Email</InputLabel>
              <Input
                id="confirm-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </FormControl>
          </FormGroup>
          <FormGroup>
            <FormControl>
              <InputLabel htmlFor="confirm-code">Confirmation Code</InputLabel>
              <Input
                id="confirm-code"
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)
                }
                placeholder="Confirmation Code"
                required
              />
            </FormControl>
          </FormGroup>
          <Button type="submit">Confirm Account</Button>
        </form>
      </Stack>
    </Box>
  );
}