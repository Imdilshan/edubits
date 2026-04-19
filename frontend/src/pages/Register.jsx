import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ArrowRight } from "lucide-react";
import "./login.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      showToast("All fields are required", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Registration failed", "error");
        return;
      }

      login(data);
      showToast("Account created! Welcome to Edubits.", "success");
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

      <form className="login-card" onSubmit={handleRegister}>
        
        {/* Header */}
        <div className="login-header">
          <div className="logo" onClick={() => navigate("/")}>
            <img src="/images/logo.png" alt="Edubits Logo" />
            <span className="logo-text">Edubits</span>
          </div>

          <h1>Create Account</h1>
          <p className="subtitle">
            Smile! You are awesome.
          </p>
        </div>

        {/* Inputs */}
        <div className="input-group">
          <input
            type="text"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label>Full Name</label>
        </div>

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
          {loading ? "Creating account..." : "Register"}
        </button>

        {/* Footer */}
        <div className="login-footer">
          <span className="footer-text">Already have an account?</span>
          <Link to="/login" className="footer-link">
            Login <ArrowRight size={16} className="arrow-icon" />
          </Link>
        </div>

      </form>
    </div>
  );
}
