import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { ArrowRight } from "lucide-react";
import { Loader } from "lucide-react";

import ToolPreview from "../components/ToolPreview";
import "./login.css";

const API_URL = import.meta.env.VITE_API_URL;

const handleGoogleLogin = () => {
  window.location.href = `${API_URL}/auth/google`;
};

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
    } catch {
      showToast("Could not reach the server. Is it running?", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-layout">

        <div className="side left">
          <ToolPreview 
            title="SGPA Calculator" 
            image="/images/sgpa.webp"
          />
          <ToolPreview
            title="Internal Marks Calculator" 
            image="/images/imc.webp"
          />
        </div>

        <div className="center">
          <form className="login-card" onSubmit={handleLogin}>
            
            <div className="login-header">
              <div className="logo">
                <img src="/images/logo.webp" alt="Edubits Logo" width="40" height="40" />
                <span className="logo-text">Edubits</span>
              </div>

              <h1>Welcome Back</h1>
              <p className="subtitle">
                Continue your focused learning journey
              </p>
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

            <button type="submit" disabled={loading}>

              {loading ? (
                <span className="btn-loading">
                  <Loader size={16} className="spin-icon" />
                  Waking server...
                </span>
              ) : (
                "Login"
              )}
            </button>



            <div className="login-footer">
              <span className="footer-text">New to Edubits?</span>
              <Link to="/register" className="footer-link">
                Register{" "}
                <ArrowRight size={16} className="arrow-icon" />
              </Link>
            </div>

            <div className="login-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width="20"
                height="20"
              />
              Continue with Google
            </button>
          </form>
        </div>

        <div className="side right">
          <ToolPreview 
            title="Task Tracker" 
            image="/images/task.webp"
          />
          <ToolPreview
            title="Pyq's" 
            image="/images/pyq.webp"
          />
        </div>

      </div>
    </div>
  );
}
