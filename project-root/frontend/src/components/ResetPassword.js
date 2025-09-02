import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const res = await fetch("http://localhost:5000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword })
    });
    if (res.ok) {
      setMessage("Password reset successful! Redirecting to login...");
      setError("");
      setTimeout(() => {
        navigate("/"); // Redirect to login page after 2 seconds
      }, 2000);
    } else {
      setError("Invalid or expired link.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Set New Password</h2>
        <form className="login-form" onSubmit={handleReset}>
          <input className="login-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" />
          <input className="login-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm Password" />
          <button className="login-btn" type="submit">Reset Password</button>
        </form>
        {message && <div style={{ color: "#43e97b", marginTop: "12px" }}>{message}</div>}
        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}