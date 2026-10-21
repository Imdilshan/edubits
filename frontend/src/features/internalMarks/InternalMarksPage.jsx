import { useState } from "react";
import Hybrid    from "./Hybrid";
import Theory    from "./Theory";
import Practical from "./Practical";
import Aptitude  from "./Aptitude";
import SoftSkill from "./SoftSkill";
import "./InternalMarksPage.css";

import { ClipboardCheck, BookOpen, FlaskConical, Wrench, Brain, Users, GraduationCap, Cpu } from "lucide-react";

const PROGRAM_OPTIONS = [
  { key: "cse", label: "BE CSE", description: "General Computer Science Engineering", icon: GraduationCap },
  { key: "ait", label: "BE CSE (AIT)", description: "Data Science & AIML Specializations", icon: Cpu },
];

const YEAR_OPTIONS = {
  cse: [
    { key: "1", label: "1st Year" },
    { key: "2", label: "2nd Year" },
    { key: "3", label: "3rd Year" },
    { key: "senior", label: "4th Year" },
  ],
  ait: [
    { key: "3", label: "3rd Year (Data Science)" },
    { key: "4", label: "4th Year (AIML)" },
  ],
};

const TAB_CONFIG = {
  cse: {
    "1": [
      { key: "hybrid",    label: "Hybrid",    icon: FlaskConical,    color: "var(--danger)",   desc: "Theory + Practical combined (e.g., Physics, Chemistry)" },
      { key: "theory",    label: "Theory",    icon: BookOpen,        color: "var(--primary)",  desc: "Pure theory subjects (e.g., Mathematics, English)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "Pure lab subjects (e.g., Workshop, Programming Lab)" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "Aptitude/Soft skills (e.g., Communication, Reasoning)" },
    ],
    "2": [
      { key: "hybrid",    label: "Hybrid",    icon: FlaskConical,    color: "var(--danger)",   desc: "Theory + Practical (e.g., Data Structures, DBMS, COA)" },
      { key: "theory",    label: "Theory",    icon: BookOpen,        color: "var(--primary)",  desc: "Pure theory (e.g., Discrete Math, OS Theory)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "Pure lab (e.g., DS Lab, DBMS Lab, OS Lab)" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "Aptitude tests (Quant, Logic, Verbal)" },
    ],
    "3": [
      { key: "hybrid",    label: "Hybrid",    icon: FlaskConical,    color: "var(--danger)",   desc: "Theory + Practical (e.g., CN, SE, ML, Compiler Design)" },
      { key: "theory",    label: "Theory",    icon: BookOpen,        color: "var(--primary)",  desc: "Pure theory (e.g., AI Theory, Cloud Computing)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "Pure lab (e.g., CN Lab, ML Lab, Project Work)" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "Placement prep (Coding, Aptitude, GD/PI)" },
    ],
    "senior": [
      { key: "hybrid",    label: "Hybrid",    icon: FlaskConical,    color: "var(--danger)",   desc: "Theory + Practical (e.g., Electives, Capstone Project)" },
      { key: "theory",    label: "Theory",    icon: BookOpen,        color: "var(--primary)",  desc: "Pure theory electives (e.g., Blockchain, Cybersecurity)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "Capstone project, Internship, Major project" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "Final placement preparation" },
      { key: "softskill", label: "Soft Skill",icon: Users,           color: "var(--primary)",  desc: "Communication, Leadership, Professional ethics" },
    ],
  },
  ait: {
    "3": [
      { key: "hybrid",    label: "Hybrid (DS)", icon: FlaskConical,    color: "var(--danger)",   desc: "Data Science hybrid subjects (e.g., ML + Lab, Big Data + Lab)" },
      { key: "theory",    label: "Theory (DS)", icon: BookOpen,        color: "var(--primary)",  desc: "Data Science theory (Statistics, ML Theory, Deep Learning)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "DS labs (Python/R, TensorFlow, Data Viz)" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "DS interviews (Statistics, ML case studies)" },
    ],
    "4": [
      { key: "hybrid",    label: "Hybrid (AIML)", icon: FlaskConical,    color: "var(--danger)",   desc: "AIML hybrid (Neural Networks + Lab, CV/NLP + Lab)" },
      { key: "theory",    label: "Theory (AIML)", icon: BookOpen,        color: "var(--primary)",  desc: "AIML theory (Transformers, RL, Generative AI)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "AIML labs (PyTorch, Model deployment, MLOps)" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "AI/ML interviews (System design, Model optimization)" },
    ],
  },
};

const SUBJECT_EXAMPLES = {
  hybrid: [
    "Data Structures & Algorithms + Lab",
    "Database Management Systems + Lab",
    "Computer Networks + Lab",
    "Machine Learning + Lab",
    "Operating Systems + Lab",
    "Computer Architecture + Lab",
  ],
  theory: [
    "Discrete Mathematics",
    "Operating Systems (Theory)",
    "Compiler Design",
    "Artificial Intelligence (Theory)",
    "Cryptography & Network Security",
    "Distributed Systems",
  ],
  practical: [
    "Data Structures Lab",
    "DBMS Lab",
    "Computer Networks Lab",
    "Machine Learning Lab",
    "OS Lab / Shell Programming",
    "Project Work / Capstone",
  ],
  aptitude: [
    "Quantitative Aptitude",
    "Logical Reasoning",
    "Verbal Ability",
    "Data Interpretation",
    "Coding Problems (DSA)",
    "Group Discussion / PI Prep",
  ],
  softskill: [
    "Technical Communication",
    "Professional Ethics",
    "Leadership & Teamwork",
    "Resume Building",
    "Mock Interviews",
    "Presentation Skills",
  ],
};

export default function InternalMarksPage() {
  const [program, setProgram] = useState("cse");
  const [year, setYear] = useState("senior");
  const [tab, setTab] = useState("hybrid");

  const switchProgram = (p) => {
    setProgram(p);
    // YEAR_OPTIONS[p] is an array of { key, label }, so take the first key
    setYear((YEAR_OPTIONS[p] || [])[0]?.key);
    setTab("hybrid");
  };

  const tabs = (TAB_CONFIG[program] && TAB_CONFIG[program][year]) || [];

  // Find current tab config for description
  const currentTab = tabs.find(t => t.key === tab);
  const desc = currentTab?.desc;

  return (
    <div className="internal-container">
      <div className="internal-header">
        <h1 className="internal-title">
          <ClipboardCheck size={28} strokeWidth={2.2} /> Internal Marks Calculator
        </h1>
        <p className="internal-subtitle">Calculate Theory, Hybrid, Practical & Aptitude marks for CU engineering</p>
      </div>

      {/* Program Selector */}
      <div className="internal-program-selector">
        <p className="selector-label">Program</p>
        <div className="pill-tabs" role="tablist" aria-label="Program">
          {PROGRAM_OPTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={program === key}
              className={`pill-tab ${program === key ? "active" : ""}`}
              onClick={() => switchProgram(key)}
              style={{ borderColor: program === key ? "var(--primary)" : "var(--border)" }}
            >
              <Icon size={16} style={{ color: program === key ? "inherit" : "var(--muted)" }} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <p className="selector-description">{PROGRAM_OPTIONS.find(p => p.key === program)?.description}</p>
      </div>

      {/* Year Toggle */}
      <div className="internal-year-selector">
        <p className="selector-label">Year</p>
        <div className="pill-tabs" role="tablist" aria-label="Year">
          {(YEAR_OPTIONS[program] || []).map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={year === key}
              className={`pill-tab ${year === key ? "active" : ""}`}
              onClick={() => { setYear(key); setTab("hybrid"); }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="pill-tabs internal-tabs" role="tablist" aria-label="Subject type">
        {tabs.map(({ key, label, icon: Icon, color, desc }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={`pill-tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
            style={{ borderColor: tab === key ? color : "var(--border)", color: tab === key ? color : "var(--text)" }}
            title={desc}
          >
            <Icon size={16} style={{ color: tab === key ? "inherit" : color }} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Subject Type Explanation */}
      {desc && (
        <div className="subject-explanation">
          <span className="explanation-icon">ℹ</span>
          <span>{desc}</span>
        </div>
      )}

      {/* Subject Examples */}
      {SUBJECT_EXAMPLES[tab] && (
        <div className="subject-examples">
          <p className="examples-title">Example {tab} subjects:</p>
          <ul>
            {SUBJECT_EXAMPLES[tab].map((subj, i) => (
              <li key={i}>{subj}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="internal-card card card-panel">
        {tab === "hybrid"    && <Hybrid    year={year} program={program} />}
        {tab === "theory"    && <Theory    year={year} program={program} />}
        {tab === "practical" && <Practical year={year} program={program} />}
        {tab === "aptitude"  && <Aptitude  year={year} program={program} />}
        {tab === "softskill" && <SoftSkill />}
      </div>
    </div>
  );
}