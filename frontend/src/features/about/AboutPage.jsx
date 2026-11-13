import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Code2,
  GitBranch,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import "./about.css";

const sections = [
  {
    id: "backstory",
    icon: <Sparkles />,
    eyebrow: "The beginning",
    title: "It started on result night.",
    body: [
      "I still remember the night our Semester 1 results were released.",
      "The website crashed, like it always does during results. After hours of refreshing, the result finally opened. But there was still no SGPA, just marks and grades scattered across a table. The calculator sites students were sharing had crashed too.",
      "That night stayed with me. Not because calculating SGPA was difficult, but because everything around engineering felt unnecessarily confusing. No proper tools. No organized resources. No clarity.",
    ],
  },
  {
    id: "building",
    icon: <Lightbulb />,
    eyebrow: "Building it",
    title: "One useful tool quietly became many.",
    body: [
      "During my second semester break, I made a simple SGPA and CGPA calculator for myself. Nothing serious. Just something that worked.",
      "I shared it with a few friends, they shared it with others, and I moved on. Later, I found out through conversations that the calculator had quietly spread far beyond my circle.",
      "The same thing happened with the Internal Marks Calculator. I did more research and groundwork, then brought the tools and resources together and launched EduBits during fourth semester.",
      "Just before a DAA exam, I received messages from students saying the playlists, PYQs, and resources helped them prepare, including one student who was in hospital. That was when EduBits started feeling bigger than a personal project.",
    ],
  },
  {
    id: "future",
    icon: <GitBranch />,
    eyebrow: "What’s next",
    title: "Still evolving, slowly and intentionally.",
    body: [
      "EduBits is still growing. There is plenty to refine: better systems, more useful features, and more ways for students to help one another instead of struggling alone.",
      "I believe in: “First make it work. Then improve it.” Engineering already feels difficult enough. Maybe EduBits can make it a little less confusing for the next student.",
    ],
  },
];

const features = [
  { icon: <Calculator />, title: "Grade calculators", description: "Estimate SGPA and CGPA without wrestling with a spreadsheet." },
  { icon: <BookOpen />, title: "Study resources", description: "Find notes, previous papers, and playlists in one place." },
  { icon: <Sparkles />, title: "Tools for the semester", description: "Track tasks, prepare for vivas, and make sense of internals." },
];

const techStack = ["React", "Vite", "React Router", "Express", "MongoDB", "Mongoose", "Cloudinary"];

function AboutSection({ section, index }) {
  return (
    <article className="about-story-card" style={{ "--about-delay": `${index * 70}ms` }}>
      <div className="about-card-icon" aria-hidden="true">{section.icon}</div>
      <div>
        <p className="about-eyebrow">{section.eyebrow}</p>
        <h2>{section.title}</h2>
        <div className="about-story-copy">
          {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </article>
  );
}

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="about-container">
        <section className="about-hero" aria-labelledby="about-title">
          <div className="about-hero-copy">
            <p className="about-eyebrow"><span className="about-status-dot" /> About EduBits</p>
            <h1 id="about-title">A student-built workspace for making engineering feel less confusing.</h1>
            <p className="about-intro">
              EduBits began as one tiny calculator made during semester break. It grew into a set of practical tools for grades, resources, tasks, and viva prep.
            </p>
            <div className="about-hero-actions" aria-label="About page actions">
              <Link to="/" className="about-primary-link">Explore EduBits <ArrowRight size={16} /></Link>
              <a href="https://github.com/Imdilshan" className="about-secondary-link" target="_blank" rel="noreferrer">
                <FaGithub size={16} /> GitHub <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          <div className="about-hero-visual">
            <div className="about-visual-caption"><span>Made for the student journey</span><Sparkles size={15} /></div>
            <img src="/images/homepage/Resources.png" alt="EduBits study resources interface" />
            <div className="about-visual-note"><span className="about-note-icon"><BookOpen size={16} /></span><span><strong>Useful things, together.</strong><small>Tools and resources made around real student needs.</small></span></div>
          </div>
        </section>

        <section className="about-section about-story" aria-label="The EduBits story">
          <div className="about-section-heading">
            <p className="about-eyebrow">The story</p>
            <h2>Built one real problem at a time.</h2>
          </div>
          <div className="about-story-grid">
            {sections.map((section, index) => <AboutSection key={section.id} section={section} index={index} />)}
          </div>
        </section>

        <section className="about-section" aria-labelledby="features-title">
          <div className="about-section-heading about-section-heading-row">
            <div><p className="about-eyebrow">Inside EduBits</p><h2 id="features-title">Small tools for the everyday grind.</h2></div>
            <p>Each feature started with a moment where engineering felt more complicated than it needed to be.</p>
          </div>
          <div className="about-feature-grid">
            {features.map((feature) => (
              <article className="about-feature-card" key={feature.title}>
                <span className="about-feature-icon" aria-hidden="true">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-stack" aria-labelledby="tech-title">
          <div><p className="about-eyebrow">Under the hood</p><h2 id="tech-title">Built with a modern web stack.</h2><p>EduBits pairs a React and Vite frontend with an Express API and MongoDB for features that need stored data.</p></div>
          <div className="about-tech-list">{techStack.map((tech) => <span key={tech}><Code2 size={14} />{tech}</span>)}</div>
        </section>

        <section className="about-cta" aria-labelledby="about-cta-title">
          <div><p className="about-eyebrow">Follow the project</p><h2 id="about-cta-title">Want to follow the build?</h2><p>EduBits keeps taking shape through student feedback and the small problems that show up during real semesters.</p></div>
          <a href="https://github.com/Imdilshan" className="about-secondary-link" target="_blank" rel="noreferrer"><FaGithub size={16} /> View GitHub <ArrowUpRight size={14} /></a>
        </section>
      </div>
    </main>
  );
}
