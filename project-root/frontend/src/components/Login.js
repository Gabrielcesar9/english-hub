import { useState } from "react";
import '../main.css';
const API_URL = process.env.REACT_APP_API_URL;

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data));
      onLogin(data); // data should include lessonMistakes
      localStorage.setItem("token", data.token); // Store the token
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        {!showReset ? (
          <>
            <form className="login-form" onSubmit={handleSubmit}>
              <input className="login-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
              <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
              <button className="login-btn" type="submit">Login</button>
            </form>
            {error && <div className="login-error">{error}</div>}
            <button
              className="login-link-btn"
              type="button"
              onClick={() => setShowReset(true)}
              style={{ marginTop: "12px", background: "none", border: "none", color: "#3B3B98", cursor: "pointer", textDecoration: "underline" }}
            >
              Forgot password?
            </button>
          </>
        ) : (
          <PasswordResetForm onBack={() => setShowReset(false)} />
        )}
      </div>
    </div>
  );
}

// Password reset form component
function PasswordResetForm({ onBack }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleRequest = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/request-password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email })
    });
    if (res.ok) {
      setSent(true);
      setError("");
    } else {
      setError("Could not send reset link. Check your info.");
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: "18px", color: "#3B3B98" }}>Reset Password</h3>
      {!sent ? (
        <form className="login-form" onSubmit={handleRequest}>
          <input className="login-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
          <input className="login-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <button className="login-btn" type="submit">Send Reset Link</button>
        </form>
      ) : (
        <div style={{ color: "#43e97b", marginBottom: "12px" }}>
          If your info is correct, a reset link was sent to your email.
        </div>
      )}
      {error && <div className="login-error">{error}</div>}
      <button
        className="login-link-btn"
        type="button"
        onClick={onBack}
        style={{ marginTop: "12px", background: "none", border: "none", color: "#3B3B98", cursor: "pointer", textDecoration: "underline" }}
      >
        Back to Login
      </button>
    </div>
  );
}