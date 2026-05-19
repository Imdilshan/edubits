import { Link } from "react-router-dom";
import "./homepage.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";

import { Calculator, ClipboardCheck, CheckSquare, BookOpen, FolderKanban, BookMarked } from "lucide-react";
import { Zap, Construction, Clock, Box } from "lucide-react";
import { Rocket } from "lucide-react";
import { Star } from "lucide-react";
import { Heart } from "lucide-react";
import { MessageCircle } from "lucide-react";

const tools = [
  {
    href: "/sgpa",
    icon: <Calculator />,
    name: "SGPA Calculator",
    desc: "Input your grades, see SGPA instantly.",
    tag: "Calculator",
    cardClass: "card-blue",
    iconClass: "icon-blue",
    tagClass: "tag-blue",
  },
  {
    href: "/internal",
    icon: <ClipboardCheck />,
    name: "Internal Marks Calculator",
    desc: "Calculate all internal marks in seconds.",
    tag: "Calculator",
    cardClass: "card-red",
    iconClass: "icon-red",
    tagClass: "tag-red",
  },
  {
    href: "/tasks",
    icon: <CheckSquare />,
    name: "Task Tracker",
    desc: "Track assignments, quizzes, and projects.",
    tag: "Tracker",
    cardClass: "card-cyan",
    iconClass: "icon-cyan",
    tagClass: "tag-cyan",
  },
  {
    href: "/pyqs",
    icon: <BookOpen />,
    name: "Resources",
    desc: "PYQs & playlists.",
    tag: "Practice",
    cardClass: "card-purple",
    iconClass: "icon-purple",
    tagClass: "tag-purple",
  },
  {
    href: "/quizzes",
    icon: <Zap />,
    name: "QuizEngine",
    desc: "Viva Rapid Fire!.",
    tag: "Practice",
    cardClass: "card-yellow",
    iconClass: "icon-yellow",
    tagClass: "tag-yellow",
  },
  {
    href: "/tracker",
    icon: <BookMarked />,
    name: "UG Life Tracker",
    desc: "Reflect on every week of your undergraduate journey.",
    tag: "Tracker",
    cardClass: "card-green",
    iconClass: "icon-green",
    tagClass: "tag-green",
  },
  {
    href: "/projexia",
    icon: <FolderKanban />,
    name: "Projexia",
    desc: "Order projects and assignments.",
    tag: "projects",
    cardClass: "card-green",
    iconClass: "icon-green",
    tagClass: "tag-green",
    comingSoon: true,
  },
];

const whyItems = [
  { icon: <Zap />, title: "Zero distractions", desc: "No ads, no fluff. Just the tools that matter.", className: "why-yellow" },
  { icon: <Construction />, title: "Built for engineers", desc: "No generic stuff, curated materials only.", className: "why-blue" },
  { icon: <Clock />, title: "Saves hours every week", desc: "Stop juggling spreadsheets and random calculators.", className: "why-green" },
  { icon: <Box />, title: "Everything in one place", desc: "Playlists, PYQs, Task Tracker.", className: "why-purple"},
];

export default function HomePage() {
  return (
    <div className="hp-everything">

      <div className="hp-hero">
        <div className="hp-hero-badge">Built for future Engineers.</div>
        <h1>Engineer your<br /><span>Grades.</span></h1>
        <div className="hp-hero-cta">
          <a href="#tools" className="hp-btn-primary"> <Rocket className="hp-btn-icon" /> Explore tools</a>
        </div>
        <div className="hp-trust">
          <div className="hp-stars">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="hp-star-icon" />
            ))}
          </div>
          <span>Trusted by 350+ users. Used during exams, loved after results.</span>
        </div>
      </div>

      <div className="hp-stats-bar">
        <div className="hp-stat-item">
          <div className="hp-stat-num">4+</div>
          <div className="hp-stat-label">Tools Available</div>
        </div>
        <div className="hp-stat-item">
          <div className="hp-stat-num">2+</div>
          <div className="hp-stat-label">Years Covered</div>
        </div>
        <div className="hp-stat-item">
          <div className="hp-stat-num">No ads</div>
          <div className="hp-stat-label">Not now, Not ever</div>
        </div>
      </div>

      <div className="hp-why-section">
        <div className="hp-section-label">Why Edubits?</div>
        <div className="hp-why-grid">
          {whyItems.map((w, i) => (
            <div className="hp-why-card" key={i}>
              <div className={`hp-why-icon ${w.className}`}>
                {w.icon}
              </div>
              <div className="hp-why-text">
                <strong>{w.title}</strong>
                <span>{w.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hp-section" id="tools">
        <div className="hp-section-label">All Tools</div>
        <div className="hp-tools-grid">
          {tools.map((t, i) =>
            t.comingSoon ? (
              <div className={`hp-tool-card ${t.cardClass} hp-tool-card--soon`} key={i}>
                <div className="hp-coming-soon-badge">Coming Soon</div>
                <div className={`hp-tool-icon ${t.iconClass}`}>{t.icon}</div>
                <div className="hp-tool-name">{t.name}</div>
                <div className="hp-tool-desc">{t.desc}</div>
                <div className="hp-tool-footer">
                  <span className={`hp-tool-tag ${t.tagClass}`}>{t.tag}</span>
                </div>
              </div>
            ) : (
              <Link to={t.href} className={`hp-tool-card ${t.cardClass}`} key={i}>
                <div className={`hp-tool-icon ${t.iconClass}`}>{t.icon}</div>
                <div className="hp-tool-name">{t.name}</div>
                <div className="hp-tool-desc">{t.desc}</div>
                <div className="hp-tool-footer">
                  <span className={`hp-tool-tag ${t.tagClass}`}>{t.tag}</span>
                  <span className="hp-arrow">↗</span>
                </div>
              </Link>
            )
          )}
        </div>
      </div>

      <footer className="hp-footer">
        <div className="hp-footer-grid">
          <div className="hp-footer-brand">
            <div className="hp-logo">Edubits</div>
            <p className="hp-tagline">Engineer your grades.</p>
            <p className="hp-sub">Last night's study deserves better tools.</p>
          </div>

          <div className="hp-footer-col">
            <h4>Tools</h4>
            <ul>
              <li><Link to="/sgpa">SGPA Calculator</Link></li>
              <li><Link to="/internal">Internal Marks Calculator</Link></li>
              <li><Link to="/tasks">Task Tracker</Link></li>
              <li><Link to="/pyqs">Resources</Link></li>
            </ul>
          </div>

          <div className="hp-footer-col">
  <h4>Built by:</h4>

  <div className="hp-founders-list">

    <div className="hp-founder-item">
      <img
        src="/images/md.jpg"
        alt="Md Dilshan"
        className="hp-founder-avatar"
      />

      <div className="hp-founder-info">
        <span className="hp-founder-name">Md Dilshan</span>
        <span className="hp-founder-role">
          Founder & Engineer
        </span>
      </div>

      <div className="hp-founder-links">
        <a
          href="https://www.linkedin.com/in/mddilshan"
          target="_blank"
          rel="noreferrer"
          title="LinkedIn"
        >
          <FaLinkedin />
        </a>

        <a
          href="https://github.com/Imdilshan"
          target="_blank"
          rel="noreferrer"
          title="GitHub"
        >
          <FaGithub />
        </a>
      </div>
    </div>

    <div className="hp-founder-item">
      <img
        src="/images/ishita.jpg"
        alt="Ishita Bansal"
        className="hp-founder-avatar"
      />

      <div className="hp-founder-info">
        <span className="hp-founder-name">Ishita Bansal</span>

        <span className="hp-founder-role">
          Design Contributor (UI & UX)
        </span>
      </div>

      <div className="hp-founder-links">
        <a
          href="https://www.linkedin.com/in/ishita-bansal-9112b931a/"
          target="_blank"
          rel="noreferrer"
          title="LinkedIn"
        >
          <FaLinkedin />
        </a>

        <a
          href="https://github.com/ishitabansal08"
          target="_blank"
          rel="noreferrer"
          title="GitHub"
        >
          <FaGithub />
        </a>
      </div>
    </div>

  </div>
</div>

{/* COMMUNITY COLUMN */}

<div className="hp-footer-col hp-community-col">

  <h4>Community</h4>

  <a
    href="https://chat.whatsapp.com/FuB9zkdRlqbEfnlodUoqZA?mode=gi_t"
    target="_blank"
    rel="noopener noreferrer"
    className="hp-community-card"
  >

    <div className="hp-community-icon">
      <MessageCircle size={24} strokeWidth={2.2} />
    </div>

    <div className="hp-community-content">

      <span className="hp-community-title">
        Join Edubits Community
      </span>

      <span className="hp-community-desc">
        Join 350+ engineering students sharing feedback,
        ideas, bugs & feature requests.
      </span>

    </div>

  </a>

</div>


        </div>

        <div className="hp-footer-bottom">
          <p>© 2026 Edubits</p>
          <p className="footer-quote">
            Every child is special, even you… especially you.
            <Heart className="heart-icon" size={16} />
          </p>
        </div>
      </footer>
    </div>
  );
}
