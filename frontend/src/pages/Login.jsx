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
    } catch (err) {
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
            image="/images/sgpa.png"
          />
          <ToolPreview
            title="Internal Marks Calculator" 
            image="/images/imc.png"
          />
        </div>

        <div className="center">
          <form className="login-card" onSubmit={handleLogin}>
            
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
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

          </form>
        </div>

        <div className="side right">
          <ToolPreview 
            title="Task Tracker" 
            image="/images/task.png"
          />
          <ToolPreview
            title="Pyq's" 
            image="/images/pyq.png"
          />
        </div>

      </div>
    </div>
  );
}