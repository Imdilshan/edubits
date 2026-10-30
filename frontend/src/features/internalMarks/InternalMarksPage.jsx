import { useState } from "react";
import Hybrid    from "./Hybrid";
import Theory    from "./Theory";
import Practical from "./Practical";
import Aptitude  from "./Aptitude";
import SoftSkill from "./SoftSkill";
import "./InternalMarksPage.css";

import { ClipboardCheck, BookOpen, FlaskConical, Wrench, Brain, Users, GraduationCap, Cpu } from "lucide-react";

const PROGRAM_OPTIONS = [
  { key: "cse", label: "BE CSE(General)", description: "", icon: GraduationCap },
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
    { key: "3-ds", label: "3rd Year (Data Science)" },
    { key: "3-aiml", label: "3rd Year (AIML)" },
  ],
};

const TAB_CONFIG = {
  cse: {
    "1": [
      { key: "hybrid",    label: "Hybrid",    icon: FlaskConical,    color: "var(--danger)",   desc: "" },
      { key: "theory",    label: "Theory",    icon: BookOpen,        color: "var(--primary)",  desc: "Pure theory subjects (e.g., Mathematics, English)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "Pure lab subjects (e.g., Workshop, Programming Lab)" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "Aptitude/Soft skills (e.g., Communication, Reasoning)" },
    ],
    "2": [
      { key: "hybrid",    label: "Hybrid",    icon: FlaskConical,    color: "var(--danger)",   desc: "" },
      { key: "theory",    label: "Theory",    icon: BookOpen,        color: "var(--primary)",  desc: "Pure theory (e.g., Discrete Math, OS Theory)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "Pure lab (e.g., DS Lab, DBMS Lab, OS Lab)" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "Aptitude tests (Quant, Logic, Verbal)" },
      { key: "softskill", label: "Soft Skill", icon: Users,           color: "var(--primary)",  desc: "Communication, Leadership, Professional ethics" },
    ],
    "3": [
      { key: "hybrid",    label: "Hybrid",    icon: FlaskConical,    color: "var(--danger)",   desc: "" },
      { key: "theory",    label: "Theory",    icon: BookOpen,        color: "var(--primary)",  desc: "Pure theory (e.g., AI Theory, Cloud Computing)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "Pure lab (e.g., CN Lab, ML Lab, Project Work)" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "Placement prep (Coding, Aptitude, GD/PI)" },
      { key: "softskill", label: "Soft Skill", icon: Users,           color: "var(--primary)",  desc: "Communication, Leadership, Professional ethics" },
    ],
    "senior": [
      { key: "hybrid",    label: "Hybrid",    icon: FlaskConical,    color: "var(--danger)",   desc: "" },
      { key: "theory",    label: "Theory",    icon: BookOpen,        color: "var(--primary)",  desc: "Pure theory electives (e.g., Blockchain, Cybersecurity)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "Capstone project, Internship, Major project" },
    ],
  },
  ait: {
    "3-ds": [
      { key: "hybrid",    label: "Hybrid",    icon: FlaskConical,    color: "var(--danger)",   desc: "" },
      { key: "theory",    label: "Theory",    icon: BookOpen,        color: "var(--primary)",  desc: "Pure theory subjects (e.g., Statistics, Deep Learning, Transformers)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "Pure lab subjects (e.g., Python/R, TensorFlow, PyTorch, Data Visualization)" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "Aptitude uses the 2nd-year marking scheme." },
      { key: "softskill", label: "Soft Skill", icon: Users,           color: "var(--primary)",  desc: "Communication, Leadership, Professional ethics" },
    ],
    "3-aiml": [
      { key: "hybrid",    label: "Hybrid",    icon: FlaskConical,    color: "var(--danger)",   desc: "" },
      { key: "theory",    label: "Theory",    icon: BookOpen,        color: "var(--primary)",  desc: "Pure theory subjects (e.g., Statistics, Deep Learning, Transformers)" },
      { key: "practical", label: "Practical", icon: Wrench,          color: "var(--success)",  desc: "Pure lab subjects (e.g., Python/R, TensorFlow, PyTorch, Data Visualization)" },
      { key: "aptitude",  label: "Aptitude",  icon: Brain,           color: "var(--warning)",  desc: "Aptitude uses the 2nd-year marking scheme." },
      { key: "softskill", label: "Soft Skill", icon: Users,           color: "var(--primary)",  desc: "Communication, Leadership, Professional ethics" },
    ],
  },
};

const SUBJECT_EXAMPLES = {
  "1": {
    hybrid: ["Engineering physics", "Logical Thinking & Problem Solving (LTPS)"],
    theory: ["biology", "maths"],
    practical: ["Python Programming", "Emerging and Distruptive Technology(EDT)"],
  },
  "2": {
    hybrid: ["Data Base Management System (DBMS)", "Design & Analysis of Algorithms (DAA)"],
    theory: ["Computer Organization & Arhitecture(COA)", "Operating System(OS)"],
    practical: ["Competitive Coding(CC)", "Full Stack Development(FSD)"],
  },
  "3": {
    hybrid: ["Project Based Learning in Java (PBLJ)"],
    theory: ["Computer Networks (CN)", "Probability & Statistics(P&S)"],
    practical: ["Competitive Coding(CC)", "Full Stack Development(FSD)"],
  },
  senior: {
    hybrid: ["Final Year Project", "Industry Capstone Project"],
    theory: ["Cloud Computing", "Information Security", "Professional Electives"],
    practical: ["Major Project", "Internship", "Project Demonstration"],
  },
};

export default function InternalMarksPage() {
  const [program, setProgram] = useState("cse");
  const [year, setYear] = useState("3");
  const [tab, setTab] = useState("hybrid");

  const switchProgram = (p) => {
    setProgram(p);
    // YEAR_OPTIONS[p] is an array of { key, label }, so take the first key
    setYear((YEAR_OPTIONS[p] || [])[0]?.key);
    setTab("hybrid");
  };

  const tabs = (TAB_CONFIG[program] && TAB_CONFIG[program][year]) || [];
  const exampleYear = year.startsWith("3-") ? "3" : year;

  return (
    <div className="internal-container">
      <div className="internal-header">
        <h1 className="internal-title">
          <ClipboardCheck size={28} strokeWidth={2.2} /> Internal Marks Calculator
        </h1>
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
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        {PROGRAM_OPTIONS.find(p => p.key === program)?.description && (
          <p className="selector-description">{PROGRAM_OPTIONS.find(p => p.key === program)?.description}</p>
        )}
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
        {tabs.map(({ key, label, icon: Icon, desc }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={`pill-tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
            title={desc}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Subject Examples */}
      {SUBJECT_EXAMPLES[exampleYear]?.[tab] && (
        <div className="subject-examples">
          <p className="examples-title">Example {tab} subjects:</p>
          <ul>
            {SUBJECT_EXAMPLES[exampleYear][tab].map((subj, i) => (
              <li key={i}>{subj}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="internal-card">
        {tab === "hybrid"    && <Hybrid    year={year} program={program} />}
        {tab === "theory"    && <Theory    year={year} program={program} />}
        {tab === "practical" && <Practical year={year} program={program} />}
        {tab === "aptitude"  && <Aptitude  year={year} program={program} />}
        {tab === "softskill" && <SoftSkill />}
      </div>
    </div>
  );
}
