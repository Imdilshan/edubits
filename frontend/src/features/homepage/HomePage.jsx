import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import "./homepage.css";

import { Calculator, ClipboardCheck, CheckSquare, BookOpen, FolderKanban, BookMarked } from "lucide-react";
import { Zap } from "lucide-react";
import { Rocket } from "lucide-react";
import { Star } from "lucide-react";

const HomeFooter = lazy(() => import("./HomeFooter"));

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
    name: "Engineering Tracker",
    desc: "Track Engineering Life",
    tag: "Tracker",
    cardClass: "card-green",
    iconClass: "icon-green",
    tagClass: "tag-green",
  },
  {
    href: "/projexia",
    icon: <FolderKanban />,
    name: "Projexia",
    desc: "Get help in projects and assignments.",
    tag: "projects",
    cardClass: "card-green",
    iconClass: "icon-green",
    tagClass: "tag-green",
    comingSoon: true,
  },
];

export default function HomePage() {
  return (
    <div className="hp-everything">

      <div className="hp-hero">
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

      <Suspense fallback={null}>
        <HomeFooter />
      </Suspense>
    </div>
  );
}
