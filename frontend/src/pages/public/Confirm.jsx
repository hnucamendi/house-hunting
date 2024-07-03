import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmSignUp } from "../../utils/authService";

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
    <div className="parent">
      <div className="container" style={{ width: "30%" }}>
        <h2 className="m-2">Confirm Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="m-2">
            <input
              className="form-control"
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
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="Confirmation Code"
              required
            />
          </div>
          <button className="btn btn-primary m-2" type="submit">Confirm Account</button>
        </form>
      </div>
    </div>
  );
}