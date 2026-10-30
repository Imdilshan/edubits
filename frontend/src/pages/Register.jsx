import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loader, ArrowRight } from "lucide-react";
import { GoogleIcon, GitHubIcon } from "../features/homepage/BrandIcons";
import { API_URL } from "../config/api";
import "./login.css";

const handleOAuthLogin = (provider) => {
  window.location.href = `${API_URL}/auth/${provider}`;
};

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
        credentials: "include",
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
      navigate("/resources");
    } catch {
      showToast("Could not reach the server. Is it running?", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-left" aria-label="Edubits resources">
        <Link to="/" className="auth-left-brand">
          <img src="/images/favicon.png" alt="Edubits logo" width="40" height="40" className="auth-logo" />
          <span>Edubits</span>
        </Link>

        <div className="auth-left-copy">
          <h2>Let's make Engineering <span>easier.</span></h2>
          <p>Get PYQs, Notes, Playlists, Sgpa Calculator &amp; more...</p>
        </div>

        <figure className="auth-resource-preview">
          <img src="/images/homepage/Resources.png" alt="Preview of Edubits study resources organized by year" />
        </figure>
      </section>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Create your account</h1>
            <p>It's free. No ads. Not now. Not ever.</p>
          </div>

          <div className="auth-oauth-buttons">
            <button
              type="button"
              className="btn btn-secondary auth-oauth-btn auth-oauth-btn--google"
              onClick={() => handleOAuthLogin("google")}
            >
              <GoogleIcon /> Continue with Google
            </button>
            <button
              type="button"
              className="btn btn-secondary auth-oauth-btn auth-oauth-btn--github"
              onClick={() => handleOAuthLogin("github")}
            >
              <GitHubIcon /> Continue with GitHub
            </button>
          </div>

          <div className="auth-divider">or</div>

          <form onSubmit={handleRegister} className="auth-form">
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

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <Loader size={16} className="spin-icon" />
                  Creating account...
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
