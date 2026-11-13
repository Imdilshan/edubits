import { useState } from "react";
import { API_URL } from "../../config/api";
import { ChevronRight, Sparkles, BookOpen, Zap, Calculator, CheckSquare, Target } from "lucide-react";
import "./OnboardingModal.css";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Edubits!",
    subtitle: "Your all-in-one academic toolkit for CU engineering",
    illustration: <Sparkles size={64} className="onboarding-icon" />,
    cta: "Get Started",
  },
  {
    id: "resources",
    title: "Exam Prep Resources",
    subtitle: "PYQs with solutions, playlists & notes — all in one place",
    illustration: <BookOpen size={64} className="onboarding-icon" />,
    cta: "Next",
  },
  {
    id: "quiz",
    title: "QuizEngine",
    subtitle: "Viva & NPTEL prep with timed MCQs and progress tracking",
    illustration: <Zap size={64} className="onboarding-icon" />,
    cta: "Next",
  },
  {
    id: "calculators",
    title: "Grade Calculators",
    subtitle: "SGPA, CGPA & Internal Marks calculators with Qualified grade support",
    illustration: <Calculator size={64} className="onboarding-icon" />,
    cta: "Next",
  },
  {
    id: "tasks",
    title: "Task Tracker",
    subtitle: "Deadline-first task management with Kanban view",
    illustration: <CheckSquare size={64} className="onboarding-icon" />,
    cta: "Next",
  },
  {
    id: "goals",
    title: "Set Your Target",
    subtitle: "Use the CGPA simulator to plan your semester goals",
    illustration: <Target size={64} className="onboarding-icon" />,
    cta: "Enter Edubits",
  },
];

export default function OnboardingModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return <OnboardingFlow onClose={onClose} />;
}

function OnboardingFlow({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = async () => {
    if (animating) return;
    setAnimating(true);
    
    // Small delay for animation
    await new Promise(r => setTimeout(r, 150));
    
    if (isLastStep) {
      // Mark onboarding as complete
      try {
        await fetch(`${API_URL}/auth/onboarding/complete`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch {
        console.error("Failed to complete onboarding");
      }
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
    setAnimating(false);
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="onboarding-overlay" onClick={handleSkip}>
      <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
        <button className="onboarding-skip" onClick={handleSkip}>
          Skip
        </button>

        <div className="onboarding-progress">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`onboarding-step-dot ${i <= currentStep ? "completed" : ""} ${i === currentStep ? "active" : ""}`}
            />
          ))}
        </div>

        <div className="onboarding-content">
          <div
            className={`onboarding-illustration ${animating ? "animating" : ""}`}
            style={{ animationDelay: "0ms" }}
          >
            {step.illustration}
          </div>

          <div className="onboarding-text" style={{ animationDelay: "100ms" }}>
            <h2>{step.title}</h2>
            <p>{step.subtitle}</p>
          </div>
        </div>

        <div className="onboarding-actions">
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={animating}
          >
            {step.cta}
            {!isLastStep && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
