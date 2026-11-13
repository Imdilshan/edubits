import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Users, Award, Star } from "lucide-react";
import { FOUNDERS, CONTRIBUTORS } from "./peopleData";
import "./people.css";

export default function PeoplePage() {
  return (
    <main className="people-page">
      <section className="people-hero" aria-labelledby="people-title">
        <div className="people-hero-content">
          <p className="people-eyebrow">The Team</p>
          <h1 id="people-title">People behind Edubits</h1>
          <p className="people-subtitle">
            Built by students, for students at Chandigarh University.
            Every tool exists because we needed it first.
          </p>
        </div>
      </section>

      <section className="people-section" aria-labelledby="founders-title">
        <div className="people-container">
          <div className="people-section-header">
            <div className="people-section-icon">
              <Award size={24} />
            </div>
            <div>
              <p className="people-eyebrow">Core Team</p>
              <h2 id="founders-title">Founders & Leads</h2>
              <p className="people-section-desc">
                The core team that built and runs Edubits day-to-day.
              </p>
            </div>
          </div>

          <div className="people-grid founders-grid">
            {FOUNDERS.map((founder) => (
              <article key={founder.name} className="people-card founder-card">
                <div className="people-card-avatar-wrap">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="people-card-avatar"
                    loading="lazy"
                    decoding="async"
                    width="80"
                    height="80"
                  />
                  <span className="people-card-badge">
                    <Star size={14} />
                  </span>
                </div>
                <div className="people-card-info">
                  <h3 className="people-card-name">{founder.name}</h3>
                  <p className="people-card-role">{founder.role}</p>
                  {(founder.linkedin || founder.github) && (
                    <div className="people-card-links">
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="people-card-link"
                          aria-label={`${founder.name} on LinkedIn`}
                        >
                          <FaLinkedin size={16} />
                        </a>
                      )}
                      {founder.github && (
                        <a
                          href={founder.github}
                          target="_blank"
                          rel="noreferrer"
                          className="people-card-link"
                          aria-label={`${founder.name} on GitHub`}
                        >
                          <FaGithub size={16} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="people-section contributors-section" aria-labelledby="contributors-title">
        <div className="people-container">
          <div className="people-section-header">
            <div className="people-section-icon">
              <Users size={24} />
            </div>
            <div>
              <p className="people-eyebrow">Community</p>
              <h2 id="contributors-title">Hall of Contributors</h2>
              <p className="people-section-desc">
                Amazing people who have contributed code, ideas, feedback, and support
                to make Edubits better for everyone.
              </p>
            </div>
          </div>

          <div className="people-grid contributors-grid">
            {CONTRIBUTORS.map((contributor) => (
              <a
                key={contributor.github}
                href={`https://github.com/${contributor.github}`}
                target="_blank"
                rel="noreferrer"
                className="people-card contributor-card"
                aria-label={`${contributor.name} on GitHub`}
              >
                <div className="people-card-avatar-wrap">
                  <img
                    src={`https://github.com/${contributor.github}.png?size=128`}
                    alt={contributor.name}
                    className="people-card-avatar"
                    loading="lazy"
                    width="72"
                    height="72"
                  />
                </div>
                <div className="people-card-info">
                  <h3 className="people-card-name">{contributor.name}</h3>
                  <p className="people-card-role">Contributor</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="people-cta" aria-labelledby="cta-title">
        <div className="people-container">
          <div className="people-cta-content">
            <h2 id="cta-title">Want to contribute?</h2>
            <p>
              Edubits is open to students who want to build tools that make engineering
              life easier. Whether it's fixing a bug, adding a feature, or improving docs
              — every contribution counts.
            </p>
            <a
              href="https://github.com/Imdilshan/edubits"
              target="_blank"
              rel="noreferrer"
              className="people-cta-link"
            >
              <FaGithub size={18} />
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
