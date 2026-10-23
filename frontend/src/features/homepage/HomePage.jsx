import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { trackEvent } from "../../utils/analytics";
import { API_URL } from "../../config/api";
import { GoogleIcon } from "./BrandIcons";
import HomeFooter from "./HomeFooter";
import { featuredTools, otherTools, proofStats, features } from "./homeData";
import "./homepage.css";

// Use the same-origin /api proxy in production so OAuth cookies remain
// first-party on mobile browsers. Local development uses the backend URL.
function AuthActions({ placement }) {
  const handleGoogleClick = (e) => {
    e.preventDefault();
    trackEvent("oauth_login_click", { provider: "Google", placement });
    window.location.assign(e.currentTarget.href);
  };

  return (
    <div className="hp-actions">
      <div className="hp-auth-buttons">
        <Link
          to="/register"
          className="hp-btn hp-btn-primary"
          onClick={() => trackEvent("auth_click", { type: "register", method: "email", placement })}
        >
          Get started
        </Link>
        <a
          href={`${API_URL}/auth/google`}
          className="hp-btn hp-btn-secondary"
          onClick={handleGoogleClick}
        >
          <GoogleIcon /> Continue with Google
        </a>
      </div>
      <p className="hp-login-hint">
        Already have an account?{" "}
        <Link
          to="/login"
          onClick={() => trackEvent("auth_click", { type: "login", method: "email", placement })}
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

function ToolCard({ tool, group, index, featured }) {
  const Icon = tool.icon;
  return (
    <Link
      to={tool.href}
      className={`hp-tool-card${featured ? " hp-tool-card--featured" : ""}`}
      onClick={() => trackEvent("tool_open", { tool_name: tool.name, tool_group: group })}
      style={{ animationDelay: `${index * (featured ? 0.08 : 0.06)}s` }}
    >
      <div className={`hp-tool-icon${featured ? " hp-tool-icon--large" : ""}`}><Icon /></div>
      <div className="hp-tool-content">
        <h3 className="hp-tool-name">{tool.name}</h3>
        <p className="hp-tool-desc">{tool.desc}</p>
      </div>
      {featured && <span className="hp-tool-arrow"><ChevronRight size={20} /></span>}
    </Link>
  );
}

function MemberView({ name }) {
  return (
    <main className="hp-main">
      <header className="hp-hero">
        <h1 className="hp-headline">
          Welcome back, <br />
          <span>{name}</span>
        </h1>
        <p className="hp-tagline">Your all-in-one academic toolkit for engineering.</p>
      </header>

      <section className="hp-tools-section">
        <div className="hp-tool-group">
          <h2 className="hp-group-title">Popular tools <span className="hp-group-sub">Quick access</span></h2>
          <div className="hp-tool-grid hp-tool-grid--featured">
            {featuredTools.map((tool, i) => (
              <ToolCard key={tool.href} tool={tool} group="exam_prep" index={i} featured />
            ))}
          </div>
        </div>

        <div className="hp-tool-group">
          <h2 className="hp-group-title">Other tools</h2>
          <div className="hp-tool-grid">
            {otherTools.map((tool, i) => (
              <ToolCard key={tool.href} tool={tool} group="other" index={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function LandingView() {
  return (
    <main className="hp-main">
      <header className="hp-hero">
        <h1 className="hp-headline">
          Engineering made
          <br />
          <span>easier</span>
        </h1>
        <p className="hp-tagline">
          PYQs, notes, quizzes and calculators, built by students for engineering students at Chandigarh University.
        </p>
        <AuthActions placement="hero" />
      </header>

      <section className="hp-section hp-section--tight" aria-label="Product preview">
        <figure className="hp-preview">
          <img src="/images/homepage/Pyq.png" alt="Edubits PYQs page" decoding="async" />
        </figure>
      </section>

      <section className="hp-section" aria-label="Edubits in numbers">
        <div className="hp-proof">
          {proofStats.map((stat) => (
            <div key={stat.label} className="hp-proof-item">
              <span className="hp-proof-value">{stat.value}</span>
              <span className="hp-proof-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="hp-section" aria-labelledby="hp-features-title">
        <p className="hp-eyebrow">What you get</p>
        <h2 id="hp-features-title" className="hp-section-title">Everything for your semester</h2>

        {features.map((feature, i) => (
          <article key={feature.id} className={`hp-feature${i % 2 ? " hp-feature--reverse" : ""}`}>
            <div className="hp-feature-copy">
              <p className="hp-eyebrow">{feature.eyebrow}</p>
              <h3 className="hp-feature-title">{feature.title}</h3>
              <p className="hp-feature-desc">{feature.desc}</p>
            </div>
            <div className="hp-preview">
              <img src={feature.image} alt={feature.alt} loading="lazy" decoding="async" />
            </div>
          </article>
        ))}

        <h3 className="hp-group-title">And the rest of your toolkit</h3>
        <div className="hp-tool-grid">
          {otherTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <article key={tool.href} className="hp-tool-card">
                <div className="hp-tool-icon"><Icon /></div>
                <div className="hp-tool-content">
                  <h4 className="hp-tool-name">{tool.name}</h4>
                  <p className="hp-tool-desc">{tool.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="hp-section" aria-labelledby="hp-origin-title">
        <p className="hp-eyebrow">Why it exists</p>
        <h2 id="hp-origin-title" className="hp-section-title">Built because the portal crashed</h2>
        <p className="hp-origin-text">
          Edubits began as an SGPA calculator, written when the college website crashed during SGPA calculation
          season. Every tool since then exists because we needed it first.
        </p>
      </section>

      <section className="hp-section" aria-labelledby="hp-cta-title">
        <div className="hp-cta">
          <h2 id="hp-cta-title" className="hp-section-title">Start with the PYQs</h2>
          <p className="hp-cta-text">Join the students already using Edubits for exams and results season.</p>
          <AuthActions placement="final_cta" />
        </div>
      </section>
    </main>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="hp-everything">
      {user ? <MemberView name={user?.name || "Student"} /> : <LandingView />}
      <HomeFooter />
    </div>
  );
}
