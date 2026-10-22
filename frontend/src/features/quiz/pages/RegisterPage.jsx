import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Zap } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      return;
    }
    if (password.length < 6) {
      score = 1;
    } else {
      score = 2;
      if (password.length >= 8 && /\d/.test(password)) {
        score = 3;
        if (password.length >= 10 && /[^A-Za-z0-9]/.test(password)) {
          score = 4;
        }
      }
    }
    setStrength(score);
  }, [password]);

  const getStrengthColor = (index) => {
    if (index >= strength) return "#374151";
    if (strength === 1) return "#ef4444";
    if (strength === 2) return "#f59e0b";
    if (strength === 3) return "#3b82f6";
    if (strength === 4) return "#22c55e";
    return "#374151";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", {
        name: name,
        email,
        password,
      });

      navigate("/quizzes");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <style>{`
        :root {
          --bg-card: #111214;
          --bg-input: #1a1d21;
          --border: #2a2d32;
          --text-primary: #ffffff;
          --text-secondary: #9CA3AF;
          --input-placeholder: #555a63;
          --text-muted: #555a63;
          --strength-bg: #2a2d32;
        }

        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          font-family: var(--font-sans);
          padding: 20px;
        }

        .register-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px 36px;
          width: 100%;
          max-width: 400px;
          backdrop-filter: blur(12px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .logo-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .logo {
          font-size: 28px;
          margin-bottom: 8px;
          display: block;
        }

        .wordmark {
          font-weight: 800;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .heading {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          text-align: center;
        }

        .subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 24px;
          text-align: center;
        }

        .form-group {
          margin-bottom: 20px;
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-primary);
        }

        .strength-meter {
          display: flex;
          gap: 4px;
          margin-top: 8px;
          height: 4px;
        }

        .strength-bar {
          flex: 1;
          border-radius: 2px;
          background: var(--strength-bg);
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(90deg, #7C3AED, #a855f7);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .footer-text {
          text-align: center;
          margin-top: 16px;
        }

        .login-link {
          color: #a855f7;
        }
      `}</style>

      <div className="register-card">
        <div className="logo-section">
          <span className="logo"><Zap size={20} /></span>
          <span className="wordmark">QuizEngine</span>
        </div>

        <h2 className="heading">Create account</h2>
        <p className="subtitle">Join and start learning</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="strength-meter">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="strength-bar"
                  style={{ background: getStrengthColor(i) }}
                />
              ))}
            </div>
          </div>

          <button className="submit-btn" type="submit">
            Create account →
          </button>
        </form>

        <p className="footer-text">
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
