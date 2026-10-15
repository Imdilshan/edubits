import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { formatTime } from "../utils/algorithms";
import { trackEvent } from "../../../utils/analytics";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  RotateCcw,
  Send,
  Trophy,
  X,
  Square,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import "../styles/global.css";
import "../styles/quizEngine.css";

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

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const answersRef = useRef([]);

  const isMultiSelect = (question) => {
    return question?.correctAnswer && Array.isArray(question.correctAnswer) && question.correctAnswer.length > 1;
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
    answersRef.current = [];
    setCurrent(0);

    try {
      const { data } = await api.post("/quiz/start", {
        topicId,
        count: QUESTION_COUNT,
      });

      setQuestions(data.questions);
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
      <div className="quiz-ready-card">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="quiz-action-btn" onClick={startQuiz}>
          <RotateCcw size={17} />
          Retry
        </button>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="quiz-ready-card">
        <span className="quiz-result-icon">
          <Trophy size={34} />
        </span>
        <h1>{topic?.name}</h1>
        <button
          className="quiz-action-btn primary"

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
      </div>
    );
  }

  const q = questions[current];
  const multi = isMultiSelect(q);

  return (
    <div className="quiz-shell">
      <div className="quiz-play-card">
        <div className="quiz-play-header">
          <div className="quiz-progress-text">
            <CheckCircle2 size={18} />
            Question {current + 1} / {questions.length}
          </div>

          <div className="quiz-timer">
            <Clock3 size={18} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <h2 className="quiz-question-title">{q.text}</h2>
        {multi && (
          <div className="quiz-multi-hint" style={{ fontSize: "0.85rem", color: "var(--text-2)", marginBottom: "12px" }}>
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
            const isMulti = isMultiSelect(q);

           const correctSet = new Set([].concat(q.correctAnswer ?? []));
           const isCorrect = revealed && correctSet.has(i);
           const isWrong = revealed && isSelected && !correctSet.has(i);

            return (
              <button
                key={i}
                onClick={() => handleToggleOption(i)}
                disabled={revealed}
                className={`quiz-option ${isMulti ? "is-multi" : ""} ${!revealed && isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
              >
                <span className={`quiz-option-indicator ${isMulti ? "checkbox" : "radio"}`}>
                  {isSelected ? <Check size={16} /> : isMulti ? <Square size={16} /> : null}
                </span>
                <span className="quiz-option-letter">{["A", "B", "C", "D"][i]}</span>
                <span style={{ flex: 1 }}>{opt}</span>

                {isCorrect && <Check size={18} style={{ color: "var(--success)" }} />}
                {isWrong && <X size={18} style={{ color: "var(--danger)" }} />}
              </button>
            );
          })}
        </div>

        {revealed && q.explanation && (
          <div className="quiz-explanation">
            <Info size={18} />
            {q.explanation}
          </div>
        )}

        {revealed && (
          <button
            className="quiz-action-btn primary"
            style={{ marginTop: "20px" }}
            onClick={handleNext}
          >
            {current + 1 >= questions.length ? "Submit" : "Next"}
            {current + 1 >= questions.length ? <Send size={18} /> : <ArrowRight size={18} />}
          </button>
        )}

        {!revealed && (
          <button
            className="quiz-action-btn primary"
            style={{ marginTop: "20px" }}
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
