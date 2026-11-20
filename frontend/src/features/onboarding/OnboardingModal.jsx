import React, { useState, useEffect, useRef } from "react";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useAuth } from "../../context/authValue";
import { API_URL } from "../../config/api";

const MotionDiv = motion.div;
import {
  Sparkles,
  Upload,
  ArrowRight,
  Check,
  BookOpen,
  Brain,
  Calculator,
  ListTodo,
  GraduationCap,
} from "lucide-react";
import "./OnboardingModal.css";

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function OnboardingModal({ isOpen, onClose }) {
  const { user, setUser, completeOnboarding } = useAuth();

  const [step, setStep] = useState(0); // 0: Profile, 1: Year, 2: Study Focus, 3: Tool Deck, 4: Welcome
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [academicProgram, setAcademicProgram] = useState(() => {
    try {
      return localStorage.getItem("edubits_academic_program") || user?.academicProgram || "cse";
    } catch {
      return "cse";
    }
  });
  const [academicYear, setAcademicYear] = useState(() => {
    try {
      return localStorage.getItem("edubits_academic_year") || user?.academicYear || "2nd_year";
    } catch {
      return "2nd_year";
    }
  });
  const [studyFocus, setStudyFocus] = useState("exam_prep");
  const [toolDeck, setToolDeck] = useState("resources");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.name && !username) {
      setUsername(user.name);
    }
    if (user?.avatar && !avatar) {
      setAvatar(user.avatar);
    }
  }, [user, username, avatar]);

  // Trigger celebratory confetti when reaching the final welcome step
  useEffect(() => {
    if (step === 4) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3e9b8f", "#5cc2b4", "#115d62", "#ffffff"],
        });
      } catch (e) {
        console.warn("Confetti error:", e);
      }
    }
  }, [step]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatar(previewUrl);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. If avatar changed with a local file, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append("avatar", selectedFile);
        await fetch(`${API_URL}/auth/upload-avatar`, {
          method: "POST",
          credentials: "include",
          body: formData,
        }).catch((err) => console.warn("Avatar upload notice:", err));
      }

      // 2. If name changed, update profile
      if (username && username !== user?.name) {
        await fetch(`${API_URL}/auth/profile`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: username }),
        }).catch((err) => console.warn("Profile update notice:", err));
      }

      const academicResponse = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academicYear, academicProgram }),
      });
      if (!academicResponse.ok) throw new Error("Could not save academic details");
      // 3. Mark onboarding complete in backend
      await fetch(`${API_URL}/auth/onboarding/complete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).catch((err) => console.warn("Onboarding complete notice:", err));

      // 4. Update local user state
      try {
        localStorage.setItem("edubits_academic_year", academicYear);
        localStorage.setItem("edubits_academic_program", academicProgram);
      } catch (e) {
        console.warn("Could not persist academic year/program:", e);
      }
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          name: username || prev?.name,
          avatar: avatar || prev?.avatar,
          onboardingCompleted: true,
          academicYear,
          academicProgram,
          studyFocus,
          toolDeck,
        }));
      }

      completeOnboarding();
      toast.success("Welcome to Edubits! Your workspace is ready.");
      onClose();
    } catch (err) {
      console.error("Onboarding error:", err);
      completeOnboarding();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer.Root
      shouldScaleBackground
      open={isOpen}
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="onboarding-drawer-overlay" />
        <Drawer.Content className="onboarding-drawer-content">
          <div className="sr-only">
            <Drawer.Title>Edubits Onboarding</Drawer.Title>
            <Drawer.Description>Academic profile & preferences walkthrough</Drawer.Description>
          </div>

          {/* Top Left Step Counter (x/x) */}
          <div className="onboarding-step-counter">
            {step + 1}/5
          </div>

          {/* Drag Handle Bar */}
          <div className="onboarding-drawer-handle" />

          <div className="onboarding-drawer-scroll">
            <div className="onboarding-inner-wrapper">
              <AnimatePresence mode="wait">
          {/* STEP 0: SETUP PROFILE */}
          {step === 0 && (
            <MotionDiv
              key="step-0-profile"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              transition={{ duration: 0.2 }}
            >
              <div className="onboarding-header">
                <div className="onboarding-icon-badge">
                  <Sparkles size={22} />
                </div>
                <h2 className="onboarding-title">Setup Profile</h2>
                <p className="onboarding-subtitle">
                  Choose your photo and how your name appears in Edubits.
                </p>
              </div>

              {/* Avatar Uploader */}
              <div
                className="onboarding-avatar-uploader"
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload profile photo"
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="onboarding-avatar-preview" />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <Upload size={20} color="#8a8f98" />
                    <span style={{ fontSize: 10, color: "#8a8f98", fontWeight: 600 }}>Upload</span>
                  </div>
                )}
                <div className="onboarding-avatar-overlay">Change</div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/png, image/jpeg"
                onChange={handleFileSelect}
              />

              {/* Username Input */}
              <div className="onboarding-input-group">
                <label className="onboarding-label">Student Name / Username</label>
                <input
                  type="text"
                  className="onboarding-input"
                  placeholder="e.g. Ranbir Singh"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </div>

              <button
                type="button"
                className="onboarding-action-btn"
                onClick={() => setStep(1)}
              >
                Continue <ArrowRight size={16} />
              </button>
            </MotionDiv>
          )}

          {/* STEP 1: ACADEMIC PROFILE (PROGRAM & YEAR) */}
          {step === 1 && (
            <MotionDiv
              key="step-1-academic"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              transition={{ duration: 0.2 }}
            >
              <div className="onboarding-header">
                <div className="onboarding-icon-badge">
                  <GraduationCap size={22} />
                </div>
                <h2 className="onboarding-title">Academic Profile</h2>
                <p className="onboarding-subtitle">
                  Select your engineering program and current academic year.
                </p>
              </div>

              {/* Program Selector */}
              <div style={{ marginBottom: 18 }}>
                <label className="onboarding-label" style={{ marginBottom: 8, display: "block" }}>
                  Engineering Program
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { id: "cse", label: "BE CSE(General)", icon: "🎓" },
                    { id: "ait", label: "BE CSE (AIT)", icon: "⚙️" },
                  ].map((p) => (
                    <div
                      key={p.id}
                      className={`onboarding-option-card ${academicProgram === p.id ? "selected" : ""}`}
                      style={{ padding: "12px 14px", minHeight: "auto", cursor: "pointer" }}
                      onClick={() => {
                        setAcademicProgram(p.id);
                        try {
                          localStorage.setItem("edubits_academic_program", p.id);
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      <div className="onboarding-option-content" style={{ gap: 10 }}>
                        <div className="onboarding-option-icon" style={{ width: 28, height: 28, fontSize: 14 }}>
                          {p.icon}
                        </div>
                        <div className="onboarding-option-info">
                          <span className="onboarding-option-label" style={{ fontSize: 13, fontWeight: 600 }}>
                            {p.label}
                          </span>
                        </div>
                      </div>
                      {academicProgram === p.id && (
                        <div className="onboarding-check-badge">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Year Selector */}
              <div>
                <label className="onboarding-label" style={{ marginBottom: 8, display: "block" }}>
                  Current Year
                </label>
                <div className="onboarding-options-list">
                  {[
                    { id: "1st_year", label: "1st Year (Fresher)", icon: "🌱", desc: "Common Engineering Curriculum" },
                    { id: "2nd_year", label: "2nd Year (Sophomore)", icon: "⚡", desc: "Department Core & Coding" },
                    { id: "3rd_year", label: "3rd Year (Junior)", icon: "🎯", desc: "Advanced Labs, Electives & NPTEL" },
                    { id: "4th_year", label: "4th Year (Senior)", icon: "🚀", desc: "Major Projects, Capstone & Viva" },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className={`onboarding-option-card ${academicYear === item.id ? "selected" : ""}`}
                      onClick={() => {
                        setAcademicYear(item.id);
                        try {
                          localStorage.setItem("edubits_academic_year", item.id);
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      <div className="onboarding-option-content">
                        <div className="onboarding-option-icon">{item.icon}</div>
                        <div className="onboarding-option-info">
                          <span className="onboarding-option-label">{item.label}</span>
                          <span className="onboarding-option-desc">{item.desc}</span>
                        </div>
                      </div>
                      {academicYear === item.id && (
                        <div className="onboarding-check-badge">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="onboarding-action-btn"
                style={{ marginTop: 20 }}
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight size={16} />
              </button>
            </MotionDiv>
          )}

          {/* STEP 2: PRIMARY STUDY FOCUS */}
          {step === 2 && (
            <MotionDiv
              key="step-2-focus"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              transition={{ duration: 0.2 }}
            >
              <div className="onboarding-header">
                <div className="onboarding-icon-badge">
                  <BookOpen size={22} />
                </div>
                <h2 className="onboarding-title">Study Preference</h2>
                <p className="onboarding-subtitle">
                  What is your primary academic goal this semester?
                </p>
              </div>

              <div className="onboarding-options-list">
                {[
                  {
                    id: "exam_prep",
                    label: "Exam Prep First",
                    desc: "Past question papers, teacher notes & solutions",
                    icon: <BookOpen size={18} />,
                  },
                  {
                    id: "quiz_mcq",
                    label: "Viva & MCQ Practice",
                    desc: "Timed tests, QuizEngine & NPTEL Viva prep",
                    icon: <Brain size={18} />,
                  },
                  {
                    id: "gpa_track",
                    label: "GPA Strategy & Planning",
                    desc: "SGPA/CGPA grade simulator & targets",
                    icon: <Calculator size={18} />,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`onboarding-option-card ${studyFocus === item.id ? "selected" : ""}`}
                    onClick={() => setStudyFocus(item.id)}
                  >
                    <div className="onboarding-option-content">
                      <div className="onboarding-option-icon">{item.icon}</div>
                      <div className="onboarding-option-info">
                        <span className="onboarding-option-label">{item.label}</span>
                        <span className="onboarding-option-desc">{item.desc}</span>
                      </div>
                    </div>
                    {studyFocus === item.id && (
                      <div className="onboarding-check-badge">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="onboarding-action-btn"
                onClick={() => setStep(3)}
              >
                Continue <ArrowRight size={16} />
              </button>
            </MotionDiv>
          )}

          {/* STEP 3: QUICK-ACCESS TOOL DECK */}
          {step === 3 && (
            <MotionDiv
              key="step-3-tools"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              transition={{ duration: 0.2 }}
            >
              <div className="onboarding-header">
                <div className="onboarding-icon-badge">
                  <ListTodo size={22} />
                </div>
                <h2 className="onboarding-title">Quick Access Tool</h2>
                <p className="onboarding-subtitle">
                  Choose your default shortcut on the navigation dock.
                </p>
              </div>

              <div className="onboarding-options-list">
                {[
                  { id: "resources", label: "Study Resources & PYQs", icon: <BookOpen size={18} />, desc: "Notes, papers & video playlists" },
                  { id: "quiz", label: "QuizEngine Practice", icon: <Brain size={18} />, desc: "Interactive MCQs with scoring" },
                  { id: "deck", label: "Tool Deck & GPA Calculators", icon: <Calculator size={18} />, desc: "Unified tasks, subject notes & GPA calculators" },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`onboarding-option-card ${toolDeck === item.id ? "selected" : ""}`}
                    onClick={() => setToolDeck(item.id)}
                  >
                    <div className="onboarding-option-content">
                      <div className="onboarding-option-icon">{item.icon}</div>
                      <div className="onboarding-option-info">
                        <span className="onboarding-option-label">{item.label}</span>
                        <span className="onboarding-option-desc">{item.desc}</span>
                      </div>
                    </div>
                    {toolDeck === item.id && (
                      <div className="onboarding-check-badge">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="onboarding-action-btn"
                onClick={() => setStep(4)}
              >
                Continue <ArrowRight size={16} />
              </button>
            </MotionDiv>
          )}

          {/* STEP 4: WELCOME SCREEN */}
          {step === 4 && (
            <MotionDiv
              key="step-4-welcome"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              transition={{ duration: 0.2 }}
              style={{ textAlign: "center" }}
            >
              <div className="onboarding-welcome-avatar-wrap">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="onboarding-welcome-avatar" />
                ) : (
                  <div
                    className="onboarding-welcome-avatar"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 32,
                      fontWeight: 800,
                      color: "#ffffff",
                    }}
                  >
                    {(username?.[0] || "U").toUpperCase()}
                  </div>
                )}
                <div className="onboarding-welcome-role-tag">
                  <Sparkles size={11} />
                  <span>Student</span>
                </div>
              </div>

              <h2 className="onboarding-title" style={{ fontSize: 22 }}>
                Welcome, {username || "Student"}!
              </h2>
              <p className="onboarding-subtitle" style={{ marginBottom: 20 }}>
                Your engineering workspace is ready.
              </p>

              <div className="onboarding-perk-card">
                <div className="onboarding-perk-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="onboarding-perk-title">Full Access to Edubits 2.0</h4>
                  <p className="onboarding-perk-desc">
                    All semester PYQs, verified notes, SGPA grade simulator, and QuizEngine are unlocked for your profile.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="onboarding-action-btn"
                onClick={handleFinish}
                disabled={loading}
              >
                {loading ? "Setting up..." : "Get Started"} <ArrowRight size={16} />
              </button>
            </MotionDiv>
          )}
        </AnimatePresence>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
