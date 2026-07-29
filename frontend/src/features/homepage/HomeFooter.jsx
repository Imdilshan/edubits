import { FaGithub, FaLinkedin } from "react-icons/fa";

const CONTRIBUTORS = [
  { name: "Md Dilshan", github: "Imdilshan" },
  { name: "Ishita Bansal", github: "ishitabansal08" },
  { name: "Rahul Raj", github: "Rahul130405" },
  { name: "Chetan Raj", github: "Rajchetan16" },
  { name: "Ranbir Khurana", github: "DevRanbir" },
  { name: "Subhayu Mukherjee", github: "subhayu18" },
  { name: "Kajal", github: "Kajal-RKR" },
];

export default function HomeFooter() {
  return (
    <footer className="hp-footer">
      <div className="hp-footer-grid">
        <div className="hp-footer-col">
          <h4>Built by:</h4>

          <div className="hp-founders-list">
            <div className="hp-founder-item">
              <img
                src="/images/md.jpeg"
                alt="Md Dilshan"
                className="hp-founder-avatar"
                loading="lazy"
                decoding="async"
                width="52"
                height="52"
              />
              <div className="hp-founder-info">
                <span className="hp-founder-name">Md Dilshan</span>
                <span className="hp-founder-role">Founder & Engineer</span>
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
                loading="lazy"
                decoding="async"
                width="52"
                height="52"
              />
              <div className="hp-founder-info">
                <span className="hp-founder-name">Ishita Bansal</span>
                <span className="hp-founder-role">UI & UX Engineer</span>
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

            <div className="hp-founder-item">
              <img
                src="/images/rahul.jpg"
                alt="Rahul Raj"
                className="hp-founder-avatar"
                loading="lazy"
                decoding="async"
                width="52"
                height="52"
              />
              <div className="hp-founder-info">
                <span className="hp-founder-name">Rahul Raj Jaiswal</span>
                <span className="hp-founder-role">Growth & Operations Lead</span>
              </div>
              <div className="hp-founder-links">
                <a
                  href="https://www.linkedin.com/in/rahulrajjaiswal/"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                >
                  <FaLinkedin />
                </a>
                <a
                  href="https://github.com/Rahul130405"
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

        <div className="hp-footer-col hp-contributors-col">
          <h4>Hall of Contributors</h4>

          <div className="hp-contributors-grid">
            {CONTRIBUTORS.map((c) => (
              <a
                key={c.github}
                href={`https://github.com/${c.github}`}
                target="_blank"
                rel="noreferrer"
                className="hp-contributor-item"
                title={c.name}
              >
                <img
                  src={`https://github.com/${c.github}.png?size=64`}
                  alt={c.name}
                  className="hp-contributor-avatar"
                  loading="lazy"
                  width="48"
                  height="48"
                />
                <span className="hp-contributor-name">{c.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}