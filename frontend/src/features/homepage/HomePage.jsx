import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { trackEvent } from "../../utils/analytics";

import {
  Layers,
  BrainCircuit,
  GraduationCap,
  ClipboardList,
  CheckSquare,
  GitBranch,
  Globe,
  Mail,
  ChevronRight,
} from "lucide-react";

import "./homepage.css";
import { GoogleIcon, GitHubIcon, MicrosoftIcon } from "./BrandIcons";

const examPrepTools = [
  {
    href: "/resources",
    icon: <Layers />,
    name: "Resources",
    desc: "Notes, Pyq's & Playlists",
    tag: "Exam prep",
  },
  {
    href: "/quizzes",
    icon: <BrainCircuit  />,
    name: "QuizEngine",
    desc: "NPTEL Prep & College Viva",
    tag: "Exam prep",
  },
];

const otherTools = [
  {
    href: "/sgpa",
    icon: <GraduationCap />,
    name: "GPA Calculator",
    desc: "Calculate Sgpa & Cgpa",
    tag: "Calculator",
  },
  {
    href: "/internal",
    icon: <ClipboardList />,
    name: "Internal Marks Calculator",
    desc: "Calculate Internal marks for each subject",
    tag: "Calculator",
  },
  // {
  //   href: "/tasks",
  //   icon: <CheckSquare />,
  //   name: "Task Tracker",
  //   desc: "Track Deadlines",
  //   tag: "Tracker",
  // },
];

// VITE_API_URL already ends in /api (e.g. https://api.example.com/api).
// Using it keeps OAuth links working on Vercel, where "/api/..." would
// otherwise be rewritten to index.html.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const oauthProviders = [
  { name: "Google", icon: <GoogleIcon />, href: `${API_URL}/auth/google`, color: "var(--brand-google)" },
  { name: "GitHub", icon: <GitHubIcon />, href: `${API_URL}/auth/github`, color: "var(--brand-github)" },
  { name: "Microsoft", icon: <MicrosoftIcon />, href: `${API_URL}/auth/microsoft`, color: "var(--brand-microsoft)" },
];

export default function HomePage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Logged-in users never see the landing page
  useEffect(() => {
    if (token) navigate("/resources", { replace: true });
  }, [token, navigate]);

  if (token) return null;

  const handleOAuthClick = (e, providerName) => {
    e.preventDefault();
    trackEvent("oauth_login_click", { provider: providerName });
    window.location.assign(e.currentTarget.href);
  };

  return (
    <div className="hp-everything">
      <main className="hp-main">
        <header className="hp-hero">
          <h1 className="hp-headline">
            Engineering made
            <br />
            <span>Easier</span>
          </h1>
          {/* <p className="hp-tagline">Your all-in-one academic toolkit for CU engineering</p> */}

          <div className="hp-auth-buttons">
            <a
              href="/login"
              className="hp-btn hp-btn-secondary"
              onClick={() => { trackEvent("auth_click", { type: "login", method: "email" }); }}
            >
              <Mail size={18} /> Log in
            </a>
            <a
              href="/register"
              className="hp-btn hp-btn-primary"
              onClick={() => { trackEvent("auth_click", { type: "register", method: "email" }); }}
            >
              <Mail size={18} /> Sign up
            </a>
          </div>

          <div className="hp-divider">
            <span>or continue with</span>
          </div>

          <div className="hp-oauth-buttons">
            {oauthProviders.map((p) => (
              <a
                key={p.name}
                href={p.href}
                className="hp-btn hp-btn-oauth"
                style={{ borderColor: p.color }}
                onClick={(e) => handleOAuthClick(e, p.name)}
              >
                <span className="hp-oauth-icon" style={{ color: p.color }}>{p.icon}</span>
                <span>{p.name}</span>
              </a>
            ))}
          </div>
        </header>

        <section className="hp-tools-section">
          <div className="hp-tool-group">
            <h2 className="hp-group-title">Popular <span className="hp-group-sub">Most used</span></h2>
            <div className="hp-tool-grid hp-tool-grid--featured">
              {examPrepTools.map((tool, i) => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className="hp-tool-card hp-tool-card--featured"
                  onClick={() => trackEvent("tool_open", { tool_name: tool.name, tool_group: "exam_prep" })}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="hp-tool-icon hp-tool-icon--large">{tool.icon}</div>
                  <div className="hp-tool-content">
                    <h3 className="hp-tool-name">{tool.name}</h3>
                    <p className="hp-tool-desc">{tool.desc}</p>
                  </div>
                  <span className="hp-tool-arrow"><ChevronRight size={20} /></span>
                </Link>
              ))}
            </div>
          </div>

          <div className="hp-tool-group">
            <h2 className="hp-group-title">Other tools</h2>
            <div className="hp-tool-grid">
              {otherTools.map((tool, i) => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className="hp-tool-card"
                  onClick={() => trackEvent("tool_open", { tool_name: tool.name, tool_group: "other" })}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="hp-tool-icon">{tool.icon}</div>
                  <div className="hp-tool-content">
                    <h3 className="hp-tool-name">{tool.name}</h3>
                    <p className="hp-tool-desc">{tool.desc}</p>
                  </div>
                  
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="hp-footer">
        <div className="hp-footer-grid">
          <div className="hp-footer-brand">
            <span className="hp-footer-logo">Edubits</span>
            <p className="hp-footer-desc">Built by students, for students at Chandigarh University.</p>
          </div>
          <nav className="hp-footer-nav">
            <h4>Product</h4>
            <ul>
              <li><Link to="/resources">Resources</Link></li>
              <li><Link to="/quizzes">QuizEngine</Link></li>
              <li><Link to="/sgpa">SGPA & CGPA</Link></li>
              <li><Link to="/internal">Internal Marks</Link></li>
              <li><Link to="/tasks">Task Tracker</Link></li>
            </ul>
          </nav>
          <nav className="hp-footer-nav">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Blog</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Careers</a></li>
            </ul>
          </nav>
          <nav className="hp-footer-nav">
            <h4>Legal</h4>
            <ul>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Privacy</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Terms</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Cookies</a></li>
            </ul>
          </nav>
        </div>
        <div className="hp-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Edubits. All rights reserved.</p>
          <div className="hp-footer-social">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitBranch size={18} /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Globe size={18} /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Discord"><Mail size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}