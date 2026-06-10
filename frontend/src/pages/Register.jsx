import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ArrowRight, Loader } from "lucide-react";
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
    } catch {
      showToast("Could not reach the server. Is it running?", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-brand" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <img src="/images/logo.webp" alt="Edubits" width="32" height="32" />
          <span>Edubits</span>
        </div>

        <div className="auth-left-copy">
          <h2>Engineering made <br /> easier.</h2>
          <p>SGPA calculators, PYQs, Playlists, quizzes, and productivity tools — all in one place.</p>
        </div>

        <img
          src="/images/graduation.svg"
          alt="Students celebrating graduation"
          className="auth-illustration"
        />
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Create your account</h1>
            <p>It's free. No ads, Not now, Not ever.</p>
          </div>

          <form onSubmit={handleRegister}>
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

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <Loader size={16} className="spin-icon" />
                  Waking server...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?
            <Link to="/login">
              Log in <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}