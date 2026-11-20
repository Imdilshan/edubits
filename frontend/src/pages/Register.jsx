import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authValue";
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

    if (password.length < 12) {
      showToast("Password must be at least 12 characters", "error");
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
    <AuthCutoutLayout
      mode="register"
      title="Create account."
      subtitle="Free forever. No ads. Built for engineering."
    >
      <div className="auth-oauth-buttons">
        <WarmTooltip content="Sign up with Google" side="top">
          <button
            type="button"
            className="btn btn-secondary auth-oauth-btn"
            onClick={() => handleOAuthLogin("google")}
          >
            <GoogleIcon /> Google
          </button>
        </WarmTooltip>
        <WarmTooltip content="Sign up with GitHub" side="top">
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

      <form onSubmit={handleRegister} className="auth-form">
        <div className="input-group">
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="register-name">Full Name</label>
        </div>

        <div className="input-group">
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="register-email">Email</label>
        </div>

        <div className="input-group">
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="register-password">Password (12+ chars)</label>
        </div>

        <div className="auth-autofill-row">
          <button
            type="button"
            onClick={() => {
              const rand = Math.floor(1000 + Math.random() * 9000);
              setName("Student " + rand);
              setEmail(`student${rand}@edubits.io`);
              setPassword("Password12345!");
            }}
            className="auth-autofill-btn"
          >
            <Sparkles size={12} /> Auto-fill Sample Credentials
          </button>
        </div>

        <WarmTooltip content="Create your permanent Edubits account" side="top">
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <Loader size={15} className="spin-icon" />
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </WarmTooltip>
      </form>

      <p className="auth-footer auth-footer--mobile">
        Already have an account?
        <Link to="/login">
          Log in <ArrowRight size={14} />
        </Link>
      </p>
    </AuthCutoutLayout>
  );
}
