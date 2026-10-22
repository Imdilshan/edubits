import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { formatTime } from "../utils/algorithms";
import { trackEvent } from "../../../utils/analytics";
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
  Square,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
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
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [, setAnswers] = useState([]);
  const [error, setError] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const answersRef = useRef([]);

  const isMultiSelect = (question) => {
    return question?.isMultiSelect === true;
  };

  const recordAnswer = useCallback((answer) => {
    setAnswers((prev) => {
      const next = [...prev, answer];
      answersRef.current = next;
      return next;
    });
  }, []);

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
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load quiz.");
      setPhase("error");
    }
  }, [topicId]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  useEffect(() => {
    if (phase !== "question" || revealed) return;

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
  }, [phase, current, revealed]);

  const handleTimeout = () => {
    if (revealed) return;
    clearInterval(timerRef.current);

    setRevealed(true);
    setSelected([]);

    recordAnswer({
      questionId: questions[current]._id,
      selectedOptions: [],
      timedOut: true,
      timeTakenSeconds: questions[current]?.timeLimitSeconds || 30,
    });
  };

  const handleToggleOption = (optIndex) => {
    if (revealed) return;

    const q = questions[current];
    const multi = isMultiSelect(q);

    if (multi) {
      setSelected((prev) => {
        const next = prev.includes(optIndex)
          ? prev.filter((i) => i !== optIndex)
          : [...prev, optIndex];
        return next;
      });
    } else {
      // Single select: radio button behavior
      setSelected(prev => prev[0] === optIndex ? [] : [optIndex]);
    }
  };

  const handleConfirmAnswer = () => {
    if (revealed) return;
    clearInterval(timerRef.current);

    const q = questions[current];
    const multi = isMultiSelect(q);
    const timeTaken = (q.timeLimitSeconds || 30) - timeLeft;

    // For single-select, require an answer; for multi-select, allow empty
    if (!multi && selected.length === 0) return;

    setRevealed(true);

    recordAnswer({
      questionId: q._id,
      selectedOptions: selected,
      timedOut: false,
      timeTakenSeconds: timeTaken,
    });
  };

  const handleNext = () => {
    setSelected([]);
    setRevealed(false);

    if (current + 1 >= questions.length) {
      submitQuiz(answersRef.current);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const submitQuiz = async (submittedAnswers = answersRef.current) => {
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

      trackEvent("quiz_complete", {
        topic_name: topic?.name,
        topic_id: topic?._id,
        score: data.score,
        percentage: data.percentage,
        passed: data.passed,
        duration_seconds: totalTime,
        duration_minutes: Math.round(totalTime / 60),
        question_count: questions.length,
      });

      updateScore(data.newTotalScore);
      navigate("/quizzes/results", {
        state: { result: data, topic, questions },
      });
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      setError(err.response?.data?.error || "Failed to submit quiz.");
      setPhase("question");
    }
  };

  if (phase === "loading" || phase === "submitting") {
    return <div className="quiz-ready-card">Loading...</div>;
  }

  if (phase === "error") {
    return (
      <div className="quiz-ready-card card card-mini">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={startQuiz}>
          <RotateCcw size={17} /> Retry
        </button>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="quiz-shell quiz-stage-shell fade-in">
        <button className="quiz-back-link" onClick={() => navigate("/quizzes")}>
          <ArrowLeft size={17} />
          All topics
        </button>

        <section className="quiz-launch-card card">
          <div className="quiz-launch-icon"><BookOpen size={27} /></div>
          <span className="quiz-launch-eyebrow">QUIZ PREVIEW</span>
          <h1>{topic?.name}</h1>
          <p className="quiz-launch-description">
            You’re about to start a focused practice round. Take your time and read each question carefully.
          </p>

          <div className="quiz-launch-facts">
            <div><CheckCircle2 size={18} /><span><strong>{questions.length}</strong> questions</span></div>
            <div><Clock3 size={18} /><span><strong>Timed</strong> questions</span></div>
          </div>

          <div className="quiz-launch-tip">
            <Info size={17} />
            Correct answers and explanations appear after you submit the quiz.
          </div>

          <button
            className="btn btn-primary quiz-launch-button"
            onClick={() => {
              trackEvent("quiz_start", {
                topic_name: topic?.name,
                topic_id: topic?._id,
                question_count: questions.length,
              });

              startTimeRef.current = Date.now();
              setPhase("question");
            }}
          >
            Start Quiz
            <ArrowRight size={18} />
          </button>
          <span className="quiz-launch-footnote">The timer starts when you begin.</span>
        </section>
      </div>
    );
  }

  const q = questions[current];
  const multi = isMultiSelect(q);

  return (
    <div className="quiz-shell quiz-stage-shell fade-in">
      <div className="quiz-play-card card card-panel">
        <div className="quiz-play-header">
          <div className="quiz-question-progress">
            <div className="quiz-progress-text">
              <CheckCircle2 size={18} />
              <span>{topic?.name}</span>
            </div>
            <span className="quiz-question-count">Question {current + 1} <span>/ {questions.length}</span></span>
          </div>

          <div className={`quiz-timer ${timeLeft <= 10 ? "is-urgent" : ""}`}>
            <Clock3 size={18} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div
          className="quiz-progress-track"
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={current + 1}
        >
          <span style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>

        <h2 className="quiz-question-title">{q.text}</h2>
        {multi && (
          <div className="quiz-multi-hint">
            Multiple correct answers possible. Select all that apply.
          </div>
        )}
        {error && (
          <div className="quiz-error">
            <Info size={18} />
            {error}
          </div>
        )}
        <div className="quiz-options-grid">
          {q.options.map((opt, i) => {
            const isSelected = selected.includes(i);
            return (
              <button
                key={i}
                onClick={() => handleToggleOption(i)}
                disabled={revealed}
                className={`quiz-option ${multi ? "is-multi" : ""} ${!revealed && isSelected ? "is-selected" : ""}`}
              >
                <span className={`quiz-option-indicator ${multi ? "checkbox" : "radio"}`}>
                  {isSelected ? <Check size={16} /> : multi ? <Square size={16} /> : null}
                </span>
                <span className="quiz-option-letter">{["A", "B", "C", "D"][i]}</span>
                <span style={{ flex: 1 }}>{opt}</span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="quiz-explanation">
            <Info size={18} />
            Answer recorded. Correct answers and explanations will appear in your results.
          </div>
        )}

        {revealed && (
          <button
            className="btn btn-primary"
            style={{ marginTop: "var(--space-lg)", width: "100%" }}
            onClick={handleNext}
          >
            {current + 1 >= questions.length ? "Submit" : "Next"}
            {current + 1 >= questions.length ? <Send size={18} /> : <ArrowRight size={18} />}
          </button>
        )}

        {!revealed && (
          <button
            className="btn btn-primary"
            style={{ marginTop: "var(--space-lg)", width: "100%" }}
            onClick={handleConfirmAnswer}
            disabled={!multi && selected.length === 0}
          >
            {multi ? "Submit Answer" : "Confirm"}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function isMultiSelect(question) {
  return question?.isMultiSelect === true;
}
