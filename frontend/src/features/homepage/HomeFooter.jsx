import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { featuredTools, otherTools } from "./homeData";

const productLinks = [...featuredTools, ...otherTools];

const legalLinks = ["Privacy", "Terms", "Cookies"];

export default function HomeFooter() {
  return (
    <footer className="hp-footer">
      <div className="hp-footer-grid">
        <div className="hp-footer-brand">
          <span className="hp-footer-logo">Edubits</span>
          <p className="hp-footer-desc">Built by students, for students at Chandigarh University.</p>
        </div>
        <nav className="hp-footer-nav">
          <h4>Product</h4>
          <ul>
            {productLinks.map((tool) => (
              <li key={tool.href}><Link to={tool.href}>{tool.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav className="hp-footer-nav">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/people">People</Link></li>
          </ul>
        </nav>
        <nav className="hp-footer-nav">
          <h4>Legal</h4>
          <ul>
            {legalLinks.map((label) => (
              <li key={label}><a href="#" target="_blank" rel="noopener noreferrer">{label}</a></li>
            ))}
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