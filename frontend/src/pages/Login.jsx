import { useState } from "react";
import { useAuth } from "../context/authValue";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/toastValue";
import { Loader, ArrowRight, Sparkles } from "lucide-react";
import { GoogleIcon, GitHubIcon } from "../features/homepage/BrandIcons";
import { API_URL } from "../config/api";
import WarmTooltip from "../components/ui/WarmTooltip";
import AuthCutoutLayout from "./AuthCutoutLayout";
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
      showToast("Could not reach the server. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCutoutLayout
      mode="login"
      title="Welcome back."
      subtitle="Log in to continue your engineering workspace."
    >
      <div className="auth-oauth-buttons">
        <WarmTooltip content="Sign in with your Google account" side="top">
          <button
            type="button"
            className="btn btn-secondary auth-oauth-btn"
            onClick={() => handleOAuthLogin("google")}
          >
            <GoogleIcon /> Google
          </button>
        </WarmTooltip>
        <WarmTooltip content="Sign in with your GitHub account" side="top">
          <button
            type="button"
            className="btn btn-secondary auth-oauth-btn"
            onClick={() => handleOAuthLogin("github")}
          >
            <GitHubIcon /> GitHub
          </button>
        </WarmTooltip>
      </div>

      <div className="auth-divider">or</div>

      <form onSubmit={handleLogin} className="auth-form">
        <div className="input-group">
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="login-email">Email</label>
        </div>

        <div className="input-group">
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="login-password">Password</label>
        </div>

        <div className="auth-autofill-row">
          <button
            type="button"
            onClick={() => {
              setEmail("demo@edubits.io");
              setPassword("Password12345!");
            }}
            className="auth-autofill-btn"
          >
            <Sparkles size={12} /> Auto-fill Demo Credentials
          </button>
        </div>

        <WarmTooltip content="Log in to your account" side="top">
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <Loader size={15} className="spin-icon" />
                Signing in...
              </span>
            ) : (
              "Log in"
            )}
          </button>
        </WarmTooltip>
      </form>

      <p className="auth-footer auth-footer--mobile">
        New to Edubits?
        <Link to="/register">
          Create account <ArrowRight size={14} />
        </Link>
      </p>
    </AuthCutoutLayout>
  );
}
