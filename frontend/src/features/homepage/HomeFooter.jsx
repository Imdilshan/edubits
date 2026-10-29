import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { featuredTools, otherTools } from "./homeData";

const productLinks = [...featuredTools, ...otherTools];
const featureLabels = {
  "/quizzes": "Quiz",
  "/sgpa": "Sgpa",
  "/internal": "Internals",
};

export default function HomeFooter() {
  return (
    <footer className="hp-footer">
      <div className="hp-footer-grid">
        <div className="hp-footer-brand">
          <Link to="/" className="hp-footer-brand-link" aria-label="Edubits home">
            <img src="/images/favicon.png" alt="" width="36" height="36" />
            <span className="hp-footer-logo">Edubits</span>
          </Link>
          <p className="hp-footer-desc">Education in bits.</p>
        </div>
        <nav className="hp-footer-nav">
          <h4>Features</h4>
          <ul>
            {productLinks.map((tool) => (
              <li key={tool.href}><Link to={tool.href}>{featureLabels[tool.href] || tool.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav className="hp-footer-nav">
          <h4>Background</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/people">People</Link></li>
          </ul>
        </nav>
      </div>
      <div className="hp-footer-bottom">
        <p>&copy; {new Date().getFullYear()} Edubits. All rights reserved.</p>
        <a
          href="https://chat.whatsapp.com/FuB9zkdRlqbEfnlodUoqZA?mode=gi_t"
          target="_blank"
          rel="noopener noreferrer"
          className="hp-contact-link"
        >
          <MessageCircle size={16} />
          Join our WhatsApp community
        </a>
      </div>
    </footer>
  );
}
