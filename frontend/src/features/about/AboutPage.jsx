import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Code2,
  GitBranch,
  Layers3,
  Lightbulb,
  MessageSquareHeart,
  Sparkles,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import "./about.css";

const featureCards = [
  "SGPA + CGPA prediction",
  "Internal marks calculation",
  "PYQs, notes, playlists, and resources",
  "Task tracking",
  "QuizEngine for viva prep",
  "Engineering Tracker",
];

const techStack = ["React", "Vite", "React Router", "CSS Modules", "Node.js", "MongoDB"];

const sections = [
  {
    id: "backstory",
    icon: <Sparkles />,
    eyebrow: "Backstory",
    title: "It started on result night.",
    body: [
      "I still remember the night our Semester 1 results were released.",
      "The website crashed, like it always does during results. After hours of refreshing pages and waiting, the result finally opened. But there was still no SGPA, just marks and grades scattered across a table. The calculator websites students were sharing around had crashed too.",
      "That night stayed with me. Not because calculating SGPA was difficult, but because everything around engineering always felt unnecessarily confusing. No proper tools. No organized resources. No clarity.",
    ],
    meme: "Insert \"Everything is Fine\" meme here",
  },
  {
    id: "struggle-implementation",
    icon: <Lightbulb />,
    eyebrow: "The Struggle & Implementation",
    title: "One useful tool quietly became many.",
    body: [
      "So during my second semester break, I made a simple static SGPA + CGPA calculator for myself. Nothing serious. Just something that worked.",
      "I shared it with a few friends, they shared it with others, and I moved on. I had not even added analytics back then. Later, during fourth semester, before Edubits was officially launched, I found out through conversations with friends that the calculator had quietly spread far beyond my circle. Their friends were using it. Their friends were sharing it again.",
      "The same thing happened with the Internal Marks Calculator I built during third semester. Back then, proper tools for calculating hybrid, theory, and practical internals simply did not exist.",
      "Most of the groundwork and research happened during third semester. Then during fourth semester, in the middle of EST exams, everything was finally integrated and deployed publicly.",
      "I originally wanted to release it after exams. But I thought maybe it could help someone immediately.",
      "And Just before DAA exam, I received few messages from students saying the playlists, PYQs, and resources genuinely helped them during exams, one of them while admitted in a hospital.",
      "That was probably the moment Edubits started feeling bigger than just a personal project.",
    ],
    meme: "Insert second meme here",
  },
  {
    id: "future-plans",
    icon: <GitBranch />,
    eyebrow: "The Future",
    title: "Still evolving, slowly and intentionally.",
    body: [
      "Today, More than 350+ students use Edubits, and it is still evolving slowly.",
      "I believe in: \"First make it work. Then improve it.\"",
      "So yes, there is still a lot left to refine. Better systems. Better collaboration. More features. More ways students can help other students instead of struggling alone.",
      "Because engineering already feels difficult enough.",
      "And maybe Edubits can make it feel a little less confusing for the next student.",
    ],
    meme: "Insert third meme here",
  },
];

function MemeSlot({ label }) {
  return (
    <div className="about-meme-slot" aria-label={label}>
      <MessageSquareHeart size={18} />
      <span>{label}</span>
    </div>
  );
}

function AboutSection({ section, index }) {
  return (
    <article className="about-story-card" style={{ "--about-delay": `${index * 70}ms` }}>
      <div className="about-card-icon">{section.icon}</div>
      <div>
        <p className="about-eyebrow">{section.eyebrow}</p>
        <h2>{section.title}</h2>
        <div className="about-story-copy">
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {section.meme && <MemeSlot label={section.meme} />}
      </div>
    </article>
  );
}

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero-copy">
          <p className="about-eyebrow">About EduBits</p>
          <h1 id="about-title">
            A student-built workspace for making engineering feel less confusing.
          </h1>
          <p>
            EduBits began as one tiny calculator made during semester break. It slowly
            became a set of tools for grades, internals, resources, tasks, viva prep,
            and reflecting on the engineering journey.
          </p>
          <div className="about-hero-actions" aria-label="About page actions">
            <Link to="/" className="about-primary-link">
              Explore tools <ArrowUpRight size={16} />
            </Link>
            <a
              href="https://github.com/Imdilshan"
              className="about-secondary-link"
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub size={16} /> GitHub
            </a>
          </div>
        </div>

        <div className="about-hero-panel" aria-label="EduBits overview">
          <div className="about-panel-orbit" />
          <div className="about-panel-card">
            <Sparkles size={22} />
            <span>Every tool exists because I needed it first</span>
          </div>
          <div className="about-panel-grid">
            <div>
              <strong>6+</strong>
              <span>Core tools</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Study support</span>
            </div>
            <div>
              <strong>2026</strong>
              <span>Active build</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-story-grid" aria-label="EduBits story">
        {sections.map((section, index) => (
          <AboutSection key={section.id} section={section} index={index} />
        ))}
      </section>

      <section className="about-section" aria-labelledby="features-title">
        <div className="about-section-header">
          <p className="about-eyebrow">Features</p>
          <h2 id="features-title">The tools that grew out of real student problems.</h2>
          <p>
            Slowly, one tool became many. Each feature started from a moment where
            engineering felt more complicated than it needed to be.
          </p>
        </div>
        <div className="about-feature-grid">
          {featureCards.map((feature, index) => (
            <article className="about-feature-card" key={feature} style={{ "--about-delay": `${index * 45}ms` }}>
              <Layers3 size={18} />
              <h3>{feature}</h3>
              <p>Built to remove friction from a workflow students already face.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-split" aria-labelledby="tech-title">
        <div className="about-section-header">
          <p className="about-eyebrow">Tech Stack</p>
          <h2 id="tech-title">Built with a modern React stack.</h2>
          <p>
            EduBits is a full-stack project with a React + Vite frontend, routed product
            surfaces, reusable styling, and backend APIs for the tools that need stored data.
          </p>
        </div>
        <div className="about-tech-list">
          {techStack.map((tech) => (
            <span key={tech}>
              <Code2 size={15} />
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="about-section about-split" aria-labelledby="design-title">
        <div className="about-section-header">
          <p className="about-eyebrow">Design Decisions</p>
          <h2 id="design-title">First make it work. Then improve it.</h2>
          <p>
            The product stays dark, focused, and direct because most students open these
            tools when they are already under pressure. The goal is clarity first, polish
            that supports it second.
          </p>
        </div>
        <blockquote className="about-quote">
          First make it work. Then improve it.
        </blockquote>
      </section>

      <section className="about-cta" aria-labelledby="about-cta-title">
        <div>
          <p className="about-eyebrow">Footer CTA / GitHub</p>
          <h2 id="about-cta-title">Want to follow the build?</h2>
          <p>
            Edubits is still being shaped by students, feedback, and the small problems
            that show up during real semesters.
          </p>
          <p className="about-signature">- highfive, first user of Edubits.</p>
        </div>
        <a
          href="https://github.com/Imdilshan"
          className="about-primary-link"
          target="_blank"
          rel="noreferrer"
        >
          <FaGithub size={17} /> View GitHub
        </a>
      </section>
    </main>
  );
}
