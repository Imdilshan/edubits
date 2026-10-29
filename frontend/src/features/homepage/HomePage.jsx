import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { trackEvent } from "../../utils/analytics";
import { API_URL } from "../../config/api";
import { GoogleIcon } from "./BrandIcons";
import HomeFooter from "./HomeFooter";
import { featuredTools, otherTools, features } from "./homeData";
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
          <span>easier.</span>
        </h1>
        <p className="hp-tagline">
          Get PYQs, Notes, Playlists, Sgpa Calculator &amp; more...
        </p>
        <AuthActions placement="hero" />
      </header>

      <section className="hp-section" aria-label="Edubits reach">
        <p className="hp-eyebrow">Growing with every semester</p>
        <div className="hp-proof">
          <div className="hp-proof-item">
            <span className="hp-proof-value">750+</span>
            <span className="hp-proof-label">students using Edubits</span>
          </div>
          <div className="hp-proof-item">
            <span className="hp-proof-value">~6K</span>
            <span className="hp-proof-label">visits in an average month</span>
          </div>
          <div className="hp-proof-item hp-proof-item--peak">
            <span className="hp-proof-value">~10K</span>
            <span className="hp-proof-label">visits last end sem</span>
          </div>
        </div>
      </section>

      <section className="hp-section hp-section--tight" aria-label="Product preview">
        <figure className="hp-preview">
          <img src="/images/homepage/Resources.png" alt="Edubits Resources page" decoding="async" />
        </figure>
      </section>

      <section className="hp-section" aria-label="Edubits features">
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

        <h3 className="hp-group-title">Useful Calculators</h3>
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

      <section className="hp-section" aria-labelledby="hp-cta-title">
        <div className="hp-cta">
          <h2 id="hp-cta-title" className="hp-section-title">Make engineering <span className="hp-cta-accent">easier.</span></h2>
          <p className="hp-cta-text">Create an account to access everything for <span className="hp-cta-accent">free.</span></p>
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
