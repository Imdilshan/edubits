import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BookOpen,
  FileText,
  ListVideo,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageCircle,
  Search,
} from "lucide-react";
import { API_URL } from "../../config/api";
import { GoogleIcon } from "./BrandIcons";
import GradientASCII from "../../components/ui/GradientASCII";
import WarmTooltip from "../../components/ui/WarmTooltip";
import "./landingParentSquare.css";

gsap.registerPlugin(ScrollTrigger);

const CURRICULUM_DATA = {
  "1st Year": [
    { name: "Mathematics-I", pyqs: 6, notes: 4, playlists: 3, img: "/images/maths2.svg", slots: ["MST 1", "MST 2", "EST"] },
    { name: "Digital Electronics", pyqs: 5, notes: 3, playlists: 2, img: "/images/fede.svg", slots: ["MST 1", "IMP MST 2", "EST"] },
    { name: "Engineering Physics", pyqs: 4, notes: 3, playlists: 2, img: "/images/ep.svg", slots: ["MST 1", "MST 2", "EST"] },
    { name: "LTPS", pyqs: 4, notes: 2, playlists: 2, img: "/images/dsa.svg", slots: ["MST 1", "EST"] },
  ],
  "2nd Year": [
    { name: "DBMS", pyqs: 7, notes: 4, playlists: 4, img: "/images/dbms.svg", slots: ["MST 1", "IMP MST 2", "EST"] },
    { name: "Operating System", pyqs: 6, notes: 3, playlists: 3, img: "/images/os.svg", slots: ["MST 1", "MST 2", "IMP EST"] },
    { name: "ADSA", pyqs: 8, notes: 5, playlists: 4, img: "/images/daa.svg", slots: ["IMP MST 1", "MST 2", "EST"] },
    { name: "COA", pyqs: 5, notes: 3, playlists: 2, img: "/images/coa.svg", slots: ["MST 1", "MST 2", "EST"] },
    { name: "Machine Learning", pyqs: 4, notes: 3, playlists: 3, img: "/images/ml.svg", slots: ["MST 1", "EST"] },
  ],
  "3rd Year": [
    { name: "PBL_Java", pyqs: 3, notes: 1, playlists: 3, img: "/images/java.svg", slots: ["IMP MST 1", "IMP MST 2", "IMP EST"] },
    { name: "Computer Networks", pyqs: 9, notes: 1, playlists: 4, img: "/images/coa.svg", slots: ["MST 1", "IMP MST 2", "IMP EST"] },
    { name: "Probability & Statistics", pyqs: 3, notes: 1, playlists: 3, img: "/images/pns.svg", slots: ["MST 1", "MST 2", "EST"] },
  ],
  "4th Year": [
    { name: "Ethical Hacking", pyqs: 3, notes: 2, playlists: 2, img: "/images/java.svg", slots: ["MST 1", "EST"] },
  ],
};

const SAMPLE_QUIZZES = [
  {
    id: "java",
    topic: "Java",
    category: "College Viva",
    question: "Which mechanism lets a subclass provide a specific implementation of a superclass method at runtime?",
    options: [
      "Method Overloading",
      "Method Overriding",
      "Constructor Chaining",
      "Static Binding",
    ],
    answer: 1,
    explanation: "Method overriding enables runtime polymorphism via dynamic method dispatch on the actual object type.",
  },
  {
    id: "os",
    topic: "Operating Systems",
    category: "NPTEL Prep",
    question: "Which of the following is NOT one of the four Coffman necessary conditions for deadlock?",
    options: [
      "Mutual Exclusion",
      "Hold and Wait",
      "Preemption Allowed",
      "Circular Wait",
    ],
    answer: 2,
    explanation: "Deadlock requires No Preemption. Allowing preemption breaks the deadlock cycle.",
  },
  {
    id: "cn",
    topic: "Computer Networks",
    category: "College Viva",
    question: "Which transport layer protocol provides connectionless, low-overhead datagram delivery without retransmission?",
    options: [
      "TCP",
      "SCTP",
      "UDP",
      "HTTP/2",
    ],
    answer: 2,
    explanation: "UDP skips handshakes and acknowledgments, making it ideal for DNS, VoIP, and real-time streams.",
  },
];

const GRADE_POINTS = {
  "A+": 10,
  A: 9,
  "B+": 8,
  B: 7,
  "C+": 6,
  C: 5,
};

const INITIAL_SGPA_COURSES = [
  { id: 1, name: "Data Structures", credits: 4, grade: "A" },
  { id: 2, name: "DBMS", credits: 3, grade: "B+" },
  { id: 3, name: "Computer Networks", credits: 3, grade: "B" },
];

export default function LandingParentSquare() {
  const rootRef = useRef(null);
  const heroStageRef = useRef(null);
  const inspectorRef = useRef(null);

  // Interactive Curriculum Explorer State
  const [selectedYear, setSelectedYear] = useState("3rd Year");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("PBL_Java");

  // Interactive Quiz Sandbox State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [answeredIds, setAnsweredIds] = useState({});
  const [quizViewMode, setQuizViewMode] = useState("live"); // "live" | "screen"

  // Interactive Calculators State
  const [calcMode, setCalcMode] = useState("sgpa"); // "sgpa" | "internals" | "screen"
  const [courses, setCourses] = useState(INITIAL_SGPA_COURSES);
  const [internals, setInternals] = useState({
    mst1: 16,
    mst2: 18,
    assignment: 9,
    attendance: 4,
  });

  const yearSubjects = CURRICULUM_DATA[selectedYear] || [];
  const filteredSubjects = yearSubjects.filter((s) =>
    s.name.toLowerCase().includes(subjectQuery.trim().toLowerCase())
  );
  const activeSubject =
    filteredSubjects.find((s) => s.name === selectedSubjectName) ||
    filteredSubjects[0] ||
    yearSubjects[0];

  const currentQuiz = SAMPLE_QUIZZES[quizIndex];

  // Derived Live SGPA Calculation
  const totalCredits = courses.reduce((sum, c) => sum + Number(c.credits), 0);
  const weightedPoints = courses.reduce(
    (sum, c) => sum + Number(c.credits) * (GRADE_POINTS[c.grade] || 0),
    0
  );
  const liveSgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : "0.00";
  const sgpaPercent = Math.min(100, (Number(liveSgpa) / 10) * 100);

  // Derived Live Internal Marks Calculation (out of 40)
  const mstWeighted = ((Number(internals.mst1) + Number(internals.mst2)) / 40) * 25;
  const totalInternal = Math.min(
    40,
    mstWeighted + Number(internals.assignment) + Number(internals.attendance)
  );
  const internalPercent = (totalInternal / 40) * 100;

  // GSAP + ScrollTrigger choreography
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Hero initial entrance
      gsap.from(".ps-hero-reveal", {
        y: 20,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "all",
      });

      // Desktop Pinned 2-Panel Hero Scroll Morph (ParentSquare choreography)
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const heroEl = heroStageRef.current;
        if (!heroEl) return;

        const morphCard = heroEl.querySelector(".ps-hero-morph-card");
        const ghostEl = heroEl.querySelector(".ps-hero-ghost");
        const targetEl = heroEl.querySelector(".ps-panel2-target");
        const panel1Copy = heroEl.querySelector(".ps-panel1-copy");
        const panel2El = heroEl.querySelector(".ps-panel2");
        const proofItems = heroEl.querySelectorAll(".ps-proof-item");

        if (!morphCard || !ghostEl || !targetEl || !panel1Copy || !panel2El) return;

        const syncMorphStart = () => {
          const stageRect = heroEl.getBoundingClientRect();
          const ghostRect = ghostEl.getBoundingClientRect();
          gsap.set(panel1Copy, { pointerEvents: "auto", opacity: 1 });
          gsap.set(panel2El, { pointerEvents: "none" });
          gsap.set(morphCard, {
            x: 0,
            y: 0,
            left: ghostRect.left - stageRect.left,
            top: ghostRect.top - stageRect.top,
            width: ghostRect.width,
            height: ghostRect.height,
          });
        };

        syncMorphStart();

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroEl,
            start: "top top",
            end: "+=165%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              gsap.set(morphCard, { clearProps: "x,y,width,height" });
              gsap.set(panel1Copy, { pointerEvents: "auto" });
              gsap.set(panel2El, { pointerEvents: "none" });
              syncMorphStart();
            },
          },
        });

        tl.to(
          panel1Copy,
          {
            opacity: 0,
            filter: "blur(12px)",
            scale: 0.92,
            transformOrigin: "left center",
            duration: 1,
            ease: "power2.inOut",
          },
          0
        );
        tl.set(panel1Copy, { pointerEvents: "none" }, 0.85);

        tl.fromTo(
          panel2El,
          {
            opacity: 0,
            filter: "blur(12px)",
            scale: 1.07,
            pointerEvents: "none",
          },
          {
            opacity: 1,
            autoAlpha: 1,
            filter: "blur(0px)",
            scale: 1,
            pointerEvents: "auto",
            duration: 1,
            transformOrigin: "center center",
            ease: "power2.inOut",
          },
          0
        );

        tl.to(
          morphCard,
          {
            x: () => {
              const prevScale = gsap.getProperty(panel2El, "scale");
              gsap.set(panel2El, { scale: 1 });
              const cRect = morphCard.getBoundingClientRect();
              const tRect = targetEl.getBoundingClientRect();
              const currX = Number(gsap.getProperty(morphCard, "x")) || 0;
              gsap.set(panel2El, { scale: prevScale });
              return tRect.left - cRect.left + currX;
            },
            y: () => {
              const prevScale = gsap.getProperty(panel2El, "scale");
              gsap.set(panel2El, { scale: 1 });
              const cRect = morphCard.getBoundingClientRect();
              const tRect = targetEl.getBoundingClientRect();
              const currY = Number(gsap.getProperty(morphCard, "y")) || 0;
              gsap.set(panel2El, { scale: prevScale });
              return tRect.top - cRect.top + currY;
            },
            width: () => {
              const prevScale = gsap.getProperty(panel2El, "scale");
              gsap.set(panel2El, { scale: 1 });
              const w = targetEl.offsetWidth;
              gsap.set(panel2El, { scale: prevScale });
              return w;
            },
            height: () => {
              const prevScale = gsap.getProperty(panel2El, "scale");
              gsap.set(panel2El, { scale: 1 });
              const h = targetEl.offsetHeight;
              gsap.set(panel2El, { scale: prevScale });
              return h;
            },
            duration: 1,
            ease: "power2.inOut",
          },
          0
        );

        tl.from(
          proofItems,
          {
            y: 22,
            opacity: 0,
            stagger: 0.1,
            duration: 0.45,
            ease: "power2.out",
          },
          0.55
        );
      });

      // Scroll-triggered reveals for interactive bands
      gsap.utils.toArray(".ps-band-reveal").forEach((band) => {
        gsap.from(band, {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: band,
            start: "top 82%",
            once: true,
          },
        });
      });
    }, rootRef);

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      ctx.revert();
    };
  }, []);

  // Subtle state-transition motion when inspecting a different subject
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !inspectorRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        inspectorRef.current,
        { opacity: 0.4, y: 6 },
        { opacity: 1, y: 0, duration: 0.24, ease: "power2.out" }
      );
    }, inspectorRef);

    return () => ctx.revert();
  }, [activeSubject?.name, selectedYear]);

  const handleYearSwitch = (yr) => {
    setSelectedYear(yr);
    setSubjectQuery("");
    const first = CURRICULUM_DATA[yr]?.[0];
    if (first) setSelectedSubjectName(first.name);
  };

  const handleOptionSelect = (optionIdx) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQuiz.answer;
    if (isCorrect && !answeredIds[currentQuiz.id]) {
      setQuizScore((s) => s + 1);
    }
    setAnsweredIds((prev) => ({ ...prev, [currentQuiz.id]: optionIdx }));
  };

  const handleSelectQuizTopic = (idx) => {
    setQuizIndex(idx);
    const prevChoice = answeredIds[SAMPLE_QUIZZES[idx].id];
    setSelectedOption(prevChoice !== undefined ? prevChoice : null);
  };

  const handleResetQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setAnsweredIds({});
  };

  const updateCourse = (id, field, value) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  return (
    <div ref={rootRef} className="ps-landing-root">
      {/* Ambient GradientASCII background (same dashboard settings, dialed subtly lower) */}
      <div className="ps-landing-ascii-bg" aria-hidden="true">
        <GradientASCII
          shape="horizon"
          colors={["#115d62", "#1f7771", "#3e9b8f", "#5cc2b4"]}
          density={0.7}
          glyphOpacity={0.65}
          glow={0.3}
          flicker={0.12}
          mouseInteraction={true}
        />
      </div>

      {/* Floating Top-Right Auth Layer */}
      <div className="ps-floating-auth">
        <WarmTooltip content="Sign in to your account" side="bottom">
          <Link to="/login" className="ps-btn-secondary ps-btn-compact ps-float-login">
            Log in
          </Link>
        </WarmTooltip>
        <WarmTooltip content="Create free account" side="bottom">
          <Link to="/register" className="ps-btn-primary ps-btn-compact">
            Get started
          </Link>
        </WarmTooltip>
      </div>

      <main className="ps-main">
        {/* 2. Pinned 2-Panel GSAP Morph Hero with Fresh v2 Screenshots */}
        <section ref={heroStageRef} className="ps-hero-stage" aria-label="Introduction">
          <div className="ps-panel1">
            <div className="ps-panel1-copy">
              <h1 className="ps-hero-headline ps-hero-reveal">
                Engineering made <span className="ps-accent">easier.</span>
              </h1>

              <p className="ps-hero-sub ps-hero-reveal">
                Get PYQs, Notes, Playlists, Sgpa Calculator &amp; more.
              </p>

              <div className="ps-hero-actions ps-hero-reveal">
                <Link to="/register" className="ps-btn-primary">
                  Get started
                </Link>
                <a href={`${API_URL}/auth/google`} className="ps-btn-secondary">
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </a>
              </div>

              <p className="ps-login-line ps-hero-reveal">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>

            <div className="ps-hero-ghost-wrap">
              <div className="ps-hero-ghost" aria-hidden="true" />
            </div>
          </div>

          {/* Single-Border Clean v2 UI Screenshot Frame (Flies into Panel 2 center slot) */}
          <div className="ps-hero-morph-card">
            <img
              src="/images/homepage/Resources.png"
              alt="Edubits v2 Resources workspace"
              className="ps-screen-img"
            />
          </div>

          {/* PANEL 2: Flat 3-Screen v2 Panorama (Zero Card-in-Card Nesting) + Proof Strip */}
          <div className="ps-panel2">
            <div className="ps-panel2-inner">
              <div className="ps-panel2-heading-wrap">
                <p className="ps-eyebrow">Growing with every semester</p>
                <h2 className="ps-panel2-title">
                  Real tools across every year of your degree.
                </h2>
              </div>

              <div className="ps-screen-trio">
                <figure className="ps-screen-item">
                  <div className="ps-screen-slot">
                    <img
                      src="/images/homepage/ToolDeck.png"
                      alt="Edubits v2 Tool Deck SGPA calculator"
                      className="ps-screen-img"
                    />
                  </div>
                  <figcaption className="ps-screen-caption">Tool Deck &amp; Calculators</figcaption>
                </figure>

                <figure className="ps-screen-item ps-screen-item--center">
                  <div className="ps-screen-slot ps-panel2-target">
                    <img
                      src="/images/homepage/Resources.png"
                      alt="Edubits v2 Resources workspace"
                      className="ps-screen-img ps-mobile-fallback-img"
                    />
                  </div>
                  <figcaption className="ps-screen-caption">Subject Workspaces &amp; PYQs</figcaption>
                </figure>

                <figure className="ps-screen-item">
                  <div className="ps-screen-slot">
                    <img
                      src="/images/homepage/Quiz.png"
                      alt="Edubits v2 QuizEngine interface"
                      className="ps-screen-img"
                    />
                  </div>
                  <figcaption className="ps-screen-caption">QuizEngine for Viva &amp; NPTEL</figcaption>
                </figure>
              </div>

              <div className="ps-proof-strip" aria-label="Edubits reach">
                <div className="ps-proof-item">
                  <span className="ps-proof-value">750+</span>
                  <span className="ps-proof-label">students using Edubits</span>
                </div>
                <div className="ps-proof-item">
                  <span className="ps-proof-value">~6K</span>
                  <span className="ps-proof-label">visits in an average month</span>
                </div>
                <div className="ps-proof-item">
                  <span className="ps-proof-value ps-accent">~10K</span>
                  <span className="ps-proof-label">visits last end sem</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. LIVE INTERACTIVE CURRICULUM EXPLORER (Resources: PYQs, Notes & Playlists) */}
        <section id="resources" className="ps-section ps-band-reveal">
          <div className="ps-container">
            <div className="ps-section-top">
              <h2 className="ps-display-md">PYQs, Notes &amp; Playlists</h2>
              <p className="ps-body-lead">
                Previous year papers with and without solutions, plus notes and playlists, sorted by
                year and subject.
              </p>
            </div>

            <div className="ps-explorer-shell">
              {/* Top Command Bar: Year Tabs + Live Search */}
              <div className="ps-explorer-bar">
                <div className="ps-pill-group" role="tablist" aria-label="Academic year">
                  {Object.keys(CURRICULUM_DATA).map((yr) => (
                    <WarmTooltip key={yr} content={`Browse ${yr} curriculum`} side="bottom">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={selectedYear === yr}
                        onClick={() => handleYearSwitch(yr)}
                        className={`ps-pill-tab ${selectedYear === yr ? "active" : ""}`}
                      >
                        {yr}
                      </button>
                    </WarmTooltip>
                  ))}
                </div>

                <label className="ps-search-box" aria-label="Filter subjects">
                  <Search size={15} strokeWidth={1.75} className="ps-search-icon" />
                  <input
                    type="text"
                    value={subjectQuery}
                    onChange={(e) => setSubjectQuery(e.target.value)}
                    placeholder="Filter subjects..."
                    className="ps-search-input"
                  />
                </label>
              </div>

              {/* Interactive Split Body: Subject List + Live Inspector */}
              <div className="ps-explorer-body">
                <div className="ps-subject-list" role="listbox" aria-label="Subjects">
                  {filteredSubjects.length === 0 ? (
                    <div className="ps-empty-inline">
                      No matching subjects in {selectedYear}. Try another year.
                    </div>
                  ) : (
                    filteredSubjects.map((subj) => {
                      const isSelected = activeSubject?.name === subj.name;
                      return (
                        <button
                          key={subj.name}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => setSelectedSubjectName(subj.name)}
                          className={`ps-subject-row ${isSelected ? "active" : ""}`}
                        >
                          <div className="ps-subject-row-main">
                            <span className="ps-subject-row-name">{subj.name}</span>
                            <span className="ps-subject-row-meta">
                              {subj.pyqs} PYQs · {subj.notes} {subj.notes === 1 ? "Note" : "Notes"} ·{" "}
                              {subj.playlists} Playlists
                            </span>
                          </div>
                          <ArrowRight size={15} strokeWidth={1.75} className="ps-subject-row-arrow" />
                        </button>
                      );
                    })
                  )}
                </div>

                {activeSubject && (
                  <div ref={inspectorRef} className="ps-subject-inspector">
                    <div className="ps-inspector-head">
                      <div>
                        <span className="ps-meta-tag">{selectedYear}</span>
                        <h3 className="ps-headline">{activeSubject.name}</h3>
                      </div>
                      <Link to="/resources" className="ps-btn-primary ps-btn-compact">
                        <span>Explore Resources</span>
                        <ArrowRight size={14} strokeWidth={1.75} />
                      </Link>
                    </div>

                    <div className="ps-inspector-metrics">
                      <div className="ps-mini-stat">
                        <FileText size={16} strokeWidth={1.75} className="ps-accent" />
                        <span>{activeSubject.pyqs} PYQ Papers</span>
                      </div>
                      <div className="ps-mini-stat">
                        <BookOpen size={16} strokeWidth={1.75} className="ps-accent" />
                        <span>{activeSubject.notes} Unit Notes</span>
                      </div>
                      <div className="ps-mini-stat">
                        <ListVideo size={16} strokeWidth={1.75} className="ps-accent" />
                        <span>{activeSubject.playlists} Playlists</span>
                      </div>
                    </div>

                    <div className="ps-slot-strip">
                      <span className="ps-slot-label">Included exam slots</span>
                      <div className="ps-slot-pills">
                        {activeSubject.slots.map((slot) => (
                          <span key={slot} className="ps-slot-chip">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="ps-inspector-art-wrap">
                      <img
                        src={activeSubject.img}
                        alt=""
                        className="ps-inspector-art"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. LIVE PLAYABLE QUIZENGINE SANDBOX (Practice for NPTEL & College Viva) */}
        <section id="quiz" className="ps-section ps-section--bordered ps-band-reveal">
          <div className="ps-container">
            <div className="ps-quiz-layout">
              <div className="ps-quiz-intro">
                <h2 className="ps-display-md">Practice for NPTEL and college viva</h2>
                <p className="ps-body-lead">
                  Take quizzes by topic, review your results and history, and see where you rank on
                  the leaderboard.
                </p>

                <div className="ps-quiz-topic-picker" role="tablist" aria-label="Sample quiz topics">
                  {SAMPLE_QUIZZES.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      role="tab"
                      aria-selected={quizIndex === idx}
                      onClick={() => {
                        setQuizViewMode("live");
                        handleSelectQuizTopic(idx);
                      }}
                      className={`ps-topic-btn ${
                        quizViewMode === "live" && quizIndex === idx ? "active" : ""
                      }`}
                    >
                      <span>{q.topic}</span>
                      <span className="ps-topic-sub">{q.category}</span>
                    </button>
                  ))}
                </div>

                <div className="ps-quiz-intro-actions">
                  <WarmTooltip content="Launch full QuizEngine dashboard" side="top">
                    <Link to="/quizzes" className="ps-btn-primary">
                      <span>Open QuizEngine</span>
                      <ArrowRight size={15} strokeWidth={1.75} />
                    </Link>
                  </WarmTooltip>
                  <WarmTooltip content="Toggle between live test sandbox & UI screenshot" side="top">
                    <button
                      type="button"
                      onClick={() =>
                        setQuizViewMode((m) => (m === "live" ? "screen" : "live"))
                      }
                      className="ps-btn-secondary"
                    >
                      {quizViewMode === "live" ? "Preview full screen" : "Try live question"}
                    </button>
                  </WarmTooltip>
                </div>
              </div>

              <div className="ps-quiz-workbench">
                {quizViewMode === "screen" ? (
                  <div className="ps-screen-slot ps-screen-slot--tall">
                    <img
                      src="/images/homepage/Quiz.png"
                      alt="Edubits v2 QuizEngine topics screen"
                      className="ps-screen-img"
                    />
                  </div>
                ) : (
                  <div className="ps-live-quiz-panel">
                    <div className="ps-quiz-panel-top">
                      <span className="ps-meta-tag">
                        {currentQuiz.topic} · Question {quizIndex + 1} of {SAMPLE_QUIZZES.length}
                      </span>
                      <div className="ps-quiz-score-wrap">
                        <span className="ps-tabular">
                          Score: {quizScore}/{SAMPLE_QUIZZES.length}
                        </span>
                        {Object.keys(answeredIds).length > 0 && (
                          <WarmTooltip content="Reset sandbox quiz" side="left">
                            <button
                              type="button"
                              onClick={handleResetQuiz}
                              className="ps-reset-btn"
                              title="Reset sample quiz"
                            >
                              <RotateCcw size={14} strokeWidth={1.75} />
                            </button>
                          </WarmTooltip>
                        )}
                      </div>
                    </div>

                    <p className="ps-quiz-question">{currentQuiz.question}</p>

                    <div className="ps-quiz-options">
                      {currentQuiz.options.map((opt, idx) => {
                        const isPicked = selectedOption === idx;
                        const isCorrect = idx === currentQuiz.answer;
                        let stateClass = "";
                        if (selectedOption !== null) {
                          if (isCorrect) stateClass = "correct";
                          else if (isPicked) stateClass = "wrong";
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={selectedOption !== null}
                            onClick={() => handleOptionSelect(idx)}
                            className={`ps-quiz-option ${stateClass}`}
                          >
                            <span className="ps-option-key">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="ps-option-text">{opt}</span>
                            {selectedOption !== null && isCorrect && (
                              <CheckCircle2 size={16} strokeWidth={1.75} className="ps-opt-icon" />
                            )}
                            {selectedOption !== null && isPicked && !isCorrect && (
                              <XCircle size={16} strokeWidth={1.75} className="ps-opt-icon" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedOption !== null && (
                      <div className="ps-quiz-feedback">
                        <p>{currentQuiz.explanation}</p>
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectQuizTopic((quizIndex + 1) % SAMPLE_QUIZZES.length)
                          }
                          className="ps-text-link"
                        >
                          <span>Next question</span>
                          <ArrowRight size={14} strokeWidth={1.75} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 5. LIVE INTERACTIVE CALCULATORS SANDBOX (SGPA & Internal Marks) */}
        <section id="calculators" className="ps-section ps-band-reveal">
          <div className="ps-container">
            <div className="ps-calc-header">
              <div>
                <p className="ps-eyebrow">Useful Calculators</p>
                <h2 className="ps-display-md">Try the calculators right here</h2>
              </div>

              <div className="ps-pill-group" role="tablist" aria-label="Calculator mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={calcMode === "sgpa"}
                  onClick={() => setCalcMode("sgpa")}
                  className={`ps-pill-tab ${calcMode === "sgpa" ? "active" : ""}`}
                >
                  GPA Calculator
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={calcMode === "internals"}
                  onClick={() => setCalcMode("internals")}
                  className={`ps-pill-tab ${calcMode === "internals" ? "active" : ""}`}
                >
                  Internal Marks Calculator
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={calcMode === "screen"}
                  onClick={() => setCalcMode("screen")}
                  className={`ps-pill-tab ${calcMode === "screen" ? "active" : ""}`}
                >
                  Tool Deck UI
                </button>
              </div>
            </div>

            {calcMode === "screen" ? (
              <div className="ps-screen-slot ps-screen-slot--wide">
                <img
                  src="/images/homepage/ToolDeck.png"
                  alt="Edubits v2 Tool Deck SGPA Calculator"
                  className="ps-screen-img"
                />
              </div>
            ) : calcMode === "sgpa" ? (
              <div className="ps-calc-workbench">
                <div className="ps-calc-inputs">
                  <div className="ps-calc-table-head">
                    <span>Subject</span>
                    <span>Credits</span>
                    <span>Grade</span>
                  </div>

                  {courses.map((course) => (
                    <div key={course.id} className="ps-calc-row">
                      <span className="ps-calc-subject">{course.name}</span>

                      <select
                        aria-label={`${course.name} credits`}
                        value={course.credits}
                        onChange={(e) => updateCourse(course.id, "credits", Number(e.target.value))}
                        className="ps-select"
                      >
                        {[1, 2, 3, 4, 5, 6].map((cr) => (
                          <option key={cr} value={cr}>
                            {cr} cr
                          </option>
                        ))}
                      </select>

                      <select
                        aria-label={`${course.name} grade`}
                        value={course.grade}
                        onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                        className="ps-select"
                      >
                        {Object.keys(GRADE_POINTS).map((g) => (
                          <option key={g} value={g}>
                            {g} ({GRADE_POINTS[g]} pts)
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="ps-calc-readout">
                  <span className="ps-meta-tag">Live SGPA Preview</span>
                  <div className="ps-big-score ps-tabular">
                    {liveSgpa}
                    <span className="ps-score-denom"> / 10</span>
                  </div>
                  <div className="ps-meter">
                    <div className="ps-meter-fill" style={{ width: `${sgpaPercent}%` }} />
                  </div>
                  <p className="ps-calc-note">
                    Calculate SGPA &amp; CGPA across all semesters inside Tool Deck ({totalCredits}{" "}
                    credits active).
                  </p>
                  <Link to="/tasks?tab=sgpa" className="ps-btn-primary ps-btn-compact">
                    <span>Open GPA Calculator</span>
                    <ArrowRight size={14} strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="ps-calc-workbench">
                <div className="ps-calc-inputs ps-sliders-grid">
                  <label className="ps-slider-field">
                    <div className="ps-slider-top">
                      <span>MST 1</span>
                      <span className="ps-tabular">{internals.mst1} / 20</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={internals.mst1}
                      onChange={(e) =>
                        setInternals((prev) => ({ ...prev, mst1: Number(e.target.value) }))
                      }
                      className="ps-range"
                    />
                  </label>

                  <label className="ps-slider-field">
                    <div className="ps-slider-top">
                      <span>MST 2</span>
                      <span className="ps-tabular">{internals.mst2} / 20</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={internals.mst2}
                      onChange={(e) =>
                        setInternals((prev) => ({ ...prev, mst2: Number(e.target.value) }))
                      }
                      className="ps-range"
                    />
                  </label>

                  <label className="ps-slider-field">
                    <div className="ps-slider-top">
                      <span>Assignments &amp; Quiz</span>
                      <span className="ps-tabular">{internals.assignment} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={internals.assignment}
                      onChange={(e) =>
                        setInternals((prev) => ({ ...prev, assignment: Number(e.target.value) }))
                      }
                      className="ps-range"
                    />
                  </label>

                  <label className="ps-slider-field">
                    <div className="ps-slider-top">
                      <span>Attendance</span>
                      <span className="ps-tabular">{internals.attendance} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={internals.attendance}
                      onChange={(e) =>
                        setInternals((prev) => ({ ...prev, attendance: Number(e.target.value) }))
                      }
                      className="ps-range"
                    />
                  </label>
                </div>

                <div className="ps-calc-readout">
                  <span className="ps-meta-tag">Estimated Internals</span>
                  <div className="ps-big-score ps-tabular">
                    {totalInternal.toFixed(1)}
                    <span className="ps-score-denom"> / 40</span>
                  </div>
                  <div className="ps-meter">
                    <div className="ps-meter-fill" style={{ width: `${internalPercent}%` }} />
                  </div>
                  <p className="ps-calc-note">
                    Calculate internal marks for each subject and track exam targets.
                  </p>
                  <Link to="/tasks?tab=internals" className="ps-btn-primary ps-btn-compact">
                    <span>Open Internal Marks Calculator</span>
                    <ArrowRight size={14} strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 6. Closing CTA Banner */}
        <section className="ps-section ps-cta-section ps-band-reveal">
          <div className="ps-container">
            <div className="ps-cta-banner">
              <h2 className="ps-display-md">
                Make engineering <span className="ps-accent">easier.</span>
              </h2>
              <p className="ps-body-lead">
                Create an account to access everything for <span className="ps-accent">free.</span>
              </p>

              <div className="ps-hero-actions ps-hero-actions--center">
                <Link to="/register" className="ps-btn-primary">
                  Get started
                </Link>
                <a href={`${API_URL}/auth/google`} className="ps-btn-secondary">
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </a>
              </div>

              <p className="ps-login-line">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </section>

        {/* 7. Authentic Edubits Footer */}
        <footer id="about" className="ps-footer">
          <div className="ps-container">
            <div className="ps-footer-grid">
              <div className="ps-footer-brand">
                <Link to="/" className="ps-brand">
                  <img src="/images/favicon.png" alt="" width="28" height="28" className="ps-brand-logo" />
                  <span className="ps-brand-text">Edubits</span>
                </Link>
                <p className="ps-footer-tagline">Education in bits.</p>
              </div>

              <div className="ps-footer-col">
                <h4>Features</h4>
                <ul>
                  <li><Link to="/resources">Resources</Link></li>
                  <li><Link to="/quizzes">Quiz</Link></li>
                  <li><Link to="/sgpa">Sgpa</Link></li>
                  <li><Link to="/internal">Internals</Link></li>
                </ul>
              </div>

              <div className="ps-footer-col">
                <h4>Background</h4>
                <ul>
                  <li><Link to="/about">About</Link></li>
                </ul>
              </div>
            </div>

            <div className="ps-footer-bottom">
              <p>&copy; 2026 Edubits. All rights reserved.</p>
              <a
                href="https://chat.whatsapp.com/FuB9zkdRlqbEfnlodUoqZA?mode=gi_t"
                target="_blank"
                rel="noopener noreferrer"
                className="ps-whatsapp-link"
              >
                <MessageCircle size={15} strokeWidth={1.75} />
                <span>Join our WhatsApp community</span>
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
