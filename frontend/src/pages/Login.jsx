import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import "./login.css";

import { ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Please enter your email and password", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Login failed", "error");
        return;
      }

      login(data);
      navigate("/tasks");
    } catch (err) {
      showToast("Could not reach the server. Is it running?", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-glow" />

      <form className="login-card" onSubmit={handleLogin}>
        
        {/* Branding */}
        <div className="login-header">
          <div className="logo">
            <img src="/images/logo.png" alt="Edubits Logo" />
            <span className="logo-text">Edubits</span>
          </div>

          <h1>Welcome Back</h1>
          <p className="subtitle">
            Continue your focused learning journey
          </p>
        </div>

        {/* Inputs */}
        <div className="input-group">
          <input
            type="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Email</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>Password</label>
        </div>

        {/* CTA */}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer */}
        <div className="login-footer">
          <span className="footer-text">New to Edubits?</span>
          <Link to="/register" className="footer-link">
            Create account <ArrowRight size={16} className="arrow-icon" />
          </Link>
        </div>
      </form>
    </div>
  );
}