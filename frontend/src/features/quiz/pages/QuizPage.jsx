import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { formatTime } from "../utils/algorithms";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";

import GradientASCII from "../../../components/ui/GradientASCII";
import WarmTooltip from "../../../components/ui/WarmTooltip";
import { useAuth } from "../../../context/authValue";
import { recordRecentActivity } from "../../../utils/recentActivity";
import "./QuizPage.css";

const QUESTION_COUNT = 10;

export default function QuizPage() {
  const { topicId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { updateScore } = useAuth();

  const [phase, setPhase] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState(state?.topic || null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState([]);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [, setAnswers] = useState([]);
  const [error, setError] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  const timerRef = useRef(null);
  const advancingTimeoutRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const answersRef = useRef([]);

  // Clear pending timeout on unmount or question change
  useEffect(() => {
    return () => {
      if (advancingTimeoutRef.current) {
        clearTimeout(advancingTimeoutRef.current);
      }
    };
  }, [current]);

  // Manage disabled sidebar when quiz is live
  useEffect(() => {
    const isLive = phase === "question" || phase === "submitting";
    if (isLive) {
      document.body.classList.add("quiz-is-live");
    } else {
      document.body.classList.remove("quiz-is-live");
    }

    return () => {
      document.body.classList.remove("quiz-is-live");
    };
  }, [phase]);

  const isMultiSelect = (question) => {
    return question?.isMultiSelect === true;
  };

  const startQuiz = useCallback(async () => {
    setPhase("loading");
    setError("");
    setAnswers([]);
    setSessionToken("");
    answersRef.current = [];
    setCurrent(0);

    try {
      const { data } = await api.post("/quiz/start", {
        topicId,
        count: QUESTION_COUNT,
      });

      setQuestions(data.questions);
      setSessionToken(data.sessionToken);
      setTopic({ ...data.topic, _id: data.topic._id || data.topic.id });
      setPhase("ready");

      if (data.topic?.name) {
        recordRecentActivity({
          id: `quiz-${topicId}`,
          type: "quiz",
          title: data.topic.name,
          subtitle: "QuizEngine • Practice",
          href: `/quizzes/${topicId}`,
          icon: "BrainCircuit",
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load quiz.");
      setPhase("error");
    }
  }, [topicId]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const submitQuiz = useCallback(
    async (submittedAnswers = answersRef.current) => {
      setPhase("submitting");
      setError("");

      try {
        const totalTime = Math.round(
          (Date.now() - startTimeRef.current) / 1000
        );

        const { data } = await api.post("/quiz/submit", {
          topicId,
          answers: submittedAnswers,
          timeTakenSeconds: totalTime,
          sessionToken,
        });

        updateScore(data.newTotalScore);
        navigate("/quizzes/results", {
          state: { result: data, topic, questions },
        });
      } catch (err) {
        console.error("Failed to submit quiz");
        setError(err.response?.data?.error || "Failed to submit quiz.");
        setPhase("question");
      }
    },
    [topicId, sessionToken, updateScore, navigate, topic, questions]
  );

  const advanceToNext = useCallback(
    (submittedAnswers = answersRef.current) => {
      if (advancingTimeoutRef.current) {
        clearTimeout(advancingTimeoutRef.current);
        advancingTimeoutRef.current = null;
      }
      setSelected([]);
      setIsAdvancing(false);

      if (current + 1 >= questions.length) {
        submitQuiz(submittedAnswers);
      } else {
        setCurrent((c) => c + 1);
      }
    },
    [current, questions.length, submitQuiz]
  );

  const handleTimeout = useCallback(() => {
    if (isAdvancing) return;
    clearInterval(timerRef.current);

    setIsAdvancing(true);
    setSelected([]);

    const answerRecord = {
      questionId: questions[current]?._id,
      selectedOptions: [],
      timedOut: true,
      timeTakenSeconds: questions[current]?.timeLimitSeconds || 30,
    };

    const nextAnswers = [...answersRef.current, answerRecord];
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);

    advancingTimeoutRef.current = setTimeout(() => {
      advanceToNext(nextAnswers);
    }, 400);
  }, [isAdvancing, questions, current, advanceToNext]);

  useEffect(() => {
    if (phase !== "question" || isAdvancing) return;

    const limit = questions[current]?.timeLimitSeconds || 30;
    setTimeLeft(limit);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, current, isAdvancing, questions, handleTimeout]);

  const handleToggleOption = (optIndex) => {
    if (isAdvancing) return;

    const q = questions[current];
    const multi = isMultiSelect(q);

    if (multi) {
      setSelected((prev) => {
        const next = prev.includes(optIndex)
          ? prev.filter((i) => i !== optIndex)
          : [...prev, optIndex];
        return next;
      });
      return;
    }

    // Single-choice: Select option, auto-save answer, and auto-advance after brief visual feedback
    setSelected([optIndex]);
    clearInterval(timerRef.current);
    setIsAdvancing(true);

    const timeTaken = (q.timeLimitSeconds || 30) - timeLeft;
    const answerRecord = {
      questionId: q._id,
      selectedOptions: [optIndex],
      timedOut: false,
      timeTakenSeconds: Math.max(1, timeTaken),
    };

    const nextAnswers = [...answersRef.current, answerRecord];
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);

    advancingTimeoutRef.current = setTimeout(() => {
      advanceToNext(nextAnswers);
    }, 320);
  };

  const handleManualNext = () => {
    if (isAdvancing) return;
    clearInterval(timerRef.current);

    const q = questions[current];
    const multi = isMultiSelect(q);
    if (!multi && selected.length === 0) return;

    const timeTaken = (q.timeLimitSeconds || 30) - timeLeft;
    const answerRecord = {
      questionId: q._id,
      selectedOptions: selected,
      timedOut: false,
      timeTakenSeconds: Math.max(1, timeTaken),
    };

    const nextAnswers = [...answersRef.current, answerRecord];
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    setIsAdvancing(true);
    advanceToNext(nextAnswers);
  };

  // Shared ASCII Background component
  const asciiBackground = (
    <div className="quiz-ascii-bg" aria-hidden="true">
      <GradientASCII
        shape="horizon"
        colors={["#115d62", "#1f7771", "#3e9b8f", "#5cc2b4"]}
        density={0.7}
        glyphOpacity={0.5}
        glow={0.3}
        flicker={0.12}
        mouseInteraction={false}
        intro={false}
      />
    </div>
  );

  if (phase === "loading" || phase === "submitting") {
    return (
      <div className="quiz-stage-shell">
        {asciiBackground}
        <div className="quiz-stage-canvas quiz-center-canvas">
          <div className="quiz-loading-spinner" />
          <p className="quiz-loading-text">
            {phase === "submitting" ? "Submitting your answers..." : "Loading quiz questions..."}
          </p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="quiz-stage-shell">
        {asciiBackground}
        <div className="quiz-stage-canvas quiz-center-canvas">
          <div className="quiz-status-icon error">
            <Info size={28} />
          </div>
          <h2 className="quiz-feedback-title">Unable to Start Quiz</h2>
          <p className="quiz-feedback-desc">{error}</p>
          <button className="btn btn-primary" onClick={startQuiz}>
            <RotateCcw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="quiz-stage-shell">
        {asciiBackground}

        <div className="quiz-stage-canvas quiz-launch-canvas">
          <WarmTooltip content="Return to all topics" side="bottom">
            <button className="quiz-nav-back" onClick={() => navigate("/quizzes")}>
              <ArrowLeft size={16} />
              <span>All topics</span>
            </button>
          </WarmTooltip>

          <div className="quiz-launch-hero">
            <div className="quiz-pill-badge">
              <Sparkles size={13} />
              <span>PRACTICE QUIZ</span>
            </div>

            <h1 className="quiz-launch-title">{topic?.name}</h1>

            <p className="quiz-launch-subtitle">
              {topic?.description ||
                "Practice your conceptual grasp with focused timed multiple-choice questions. Explanations will appear after submission."}
            </p>

            <div className="quiz-meta-strip">
              <WarmTooltip content="Total questions in this quiz" side="top">
                <div className="quiz-meta-tag">
                  <CheckCircle2 size={15} />
                  <span><strong>{questions.length}</strong> Questions</span>
                </div>
              </WarmTooltip>
              <WarmTooltip content="30 seconds per question timer" side="top">
                <div className="quiz-meta-tag">
                  <Clock3 size={15} />
                  <span><strong>30s</strong> Per Question</span>
                </div>
              </WarmTooltip>
            </div>

            <div className="quiz-launch-actions">
              <WarmTooltip content="Begin timed quiz session" side="top">
                <button
                  className="quiz-cta-button"
                  onClick={() => {
                    startTimeRef.current = Date.now();
                    setPhase("question");
                  }}
                >
                  <span>Start Quiz</span>
                  <ArrowRight size={17} />
                </button>
              </WarmTooltip>
              <span className="quiz-launch-hint">Timer starts as soon as you begin</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const multi = isMultiSelect(q);
  const progressPercent = ((current + 1) / questions.length) * 100;

  return (
    <div className="quiz-stage-shell">
      {asciiBackground}

      <div className="quiz-stage-canvas">
        {/* Top Header Row (Back, Topic, Question Counter, Timer) */}
        <div className="quiz-top-bar">
          <div className="quiz-top-left">
            <WarmTooltip content="Leave quiz and return to topics list" side="bottom">
              <button className="quiz-nav-back" onClick={() => navigate("/quizzes")}>
                <ArrowLeft size={15} />
                <span className="quiz-nav-topic-name">{topic?.name}</span>
              </button>
            </WarmTooltip>
            <span className="quiz-top-divider">/</span>
            <span className="quiz-step-indicator">
              Question <strong>{current + 1}</strong> of {questions.length}
            </span>
          </div>

          <WarmTooltip content="Time remaining on this question" side="bottom">
            <div className={`quiz-timer-pill ${timeLeft <= 10 ? "is-urgent" : ""}`}>
              <Clock3 size={14} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </WarmTooltip>
        </div>

        {/* Minimal Progress Line */}
        <div
          className="quiz-progress-line"
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={current + 1}
        >
          <div
            className="quiz-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Area - Single flat layer */}
        <div className="quiz-main-stage">
          <div className="quiz-question-header">
            {multi && (
              <span className="quiz-multi-pill">
                Multi-select · Select all that apply
              </span>
            )}
            <h2 className="quiz-question-heading">{q.text}</h2>
          </div>

          {error && (
            <div className="quiz-inline-error">
              <Info size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Options: flat single layer */}
          <div className="quiz-options-grid">
            {q.options.map((opt, i) => {
              const isSelected = selected.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleToggleOption(i)}
                  disabled={isAdvancing}
                  className={`quiz-single-option ${isSelected ? "is-selected" : ""} ${isAdvancing ? "is-advancing" : ""}`}
                >
                  <span className="quiz-option-key">
                    {["A", "B", "C", "D", "E"][i]}
                  </span>
                  <span className="quiz-option-label">{opt}</span>
                  <span className="quiz-option-indicator">
                    {isSelected && <Check size={14} strokeWidth={2.5} />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="quiz-bottom-actions">
            <div className="quiz-bottom-meta">
              {multi ? (
                <span>{selected.length} option{selected.length === 1 ? "" : "s"} selected</span>
              ) : (
                <span>
                  {isAdvancing
                    ? "Saving & advancing..."
                    : selected.length > 0
                    ? "Option selected"
                    : "Select an answer"}
                </span>
              )}
            </div>

            <div className="quiz-bottom-cta">
              <WarmTooltip
                content={
                  selected.length === 0
                    ? "Select an option first"
                    : current + 1 >= questions.length
                    ? "Submit quiz answers"
                    : "Proceed to next question"
                }
                side="top"
              >
                <button
                  className="quiz-cta-button"
                  onClick={multi ? handleManualNext : () => advanceToNext(answersRef.current)}
                  disabled={selected.length === 0 || isAdvancing}
                >
                  <span>
                    {isAdvancing
                      ? current + 1 >= questions.length
                        ? "Submitting..."
                        : "Next..."
                      : current + 1 >= questions.length
                      ? "Submit Quiz"
                      : "Next Question"}
                  </span>
                  {current + 1 >= questions.length ? (
                    <Send size={16} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              </WarmTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
