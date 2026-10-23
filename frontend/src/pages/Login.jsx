import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { Loader, ArrowRight } from "lucide-react";
import { GoogleIcon, GitHubIcon } from "../features/homepage/BrandIcons";
import { API_URL } from "../config/api";
import "./login.css";

const handleOAuthLogin = (provider) => {
  window.location.href = `${API_URL}/auth/${provider}`;
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Login failed", "error");
        return;
      }

      login(data);
      navigate("/resources");
    } catch {
      showToast("Could not reach the server. Is it running?", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">

        {/* <div className="auth-left-brand">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-logo">
            <rect width="40" height="40" rx="10" fill="currentColor"/>
            <path d="M12 14h16M12 20h12M12 26h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Edubits</span>
        </div> */}

        <div className="auth-left-brand">
          <img src="/images/favicon.png" alt="Edubits logo" width="40" height="40" className="auth-logo" />
          <span>Edubits</span>
        </div>

        <div className="auth-left-copy">
          <h2>Engineering made <br /> easier.</h2>
          <p>Resources, QuizEngine, calculators & task tracking — all in one place for engineering students.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Log in to continue your learning journey</p>
          </div>

          <div className="auth-oauth-buttons">
            <button
              type="button"
              className="btn btn-secondary auth-oauth-btn auth-oauth-btn--google"
              onClick={() => handleOAuthLogin("google")}
            >
              <GoogleIcon /> Google
            </button>
            <button
              type="button"
              className="btn btn-secondary auth-oauth-btn auth-oauth-btn--github"
              onClick={() => handleOAuthLogin("github")}
            >
              <GitHubIcon /> GitHub
            </button>
          </div>

          <div className="auth-divider">or</div>

          <form onSubmit={handleLogin} className="auth-form">
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

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <Loader size={16} className="spin-icon" />
                  Waking server...
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <p className="auth-footer">
            New to Edubits?
            <Link to="/register">
              Create account <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
