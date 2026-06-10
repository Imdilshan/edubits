import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { ArrowRight, Loader } from "lucide-react";
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
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-brand">
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
            <h1>Welcome back</h1>
            <p>Log in to continue your learning journey</p>
          </div>

          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              width="20"
              height="20"
            />
            Continue with Google
          </button>

          <div className="auth-divider">or</div>

          <form onSubmit={handleLogin}>
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
