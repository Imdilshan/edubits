import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { formatTime } from "../utils/algorithms";
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
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

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
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const answersRef = useRef([]);

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
    setSelected(null);

    recordAnswer({
      questionId: questions[current]._id,
      selectedOption: null,
      timedOut: true,
      timeTakenSeconds: questions[current]?.timeLimitSeconds || 30,
    });
  };

  const handleSelect = (optIndex) => {
    if (revealed) return;
    clearInterval(timerRef.current);

    const q = questions[current];
    const timeTaken = (q.timeLimitSeconds || 30) - timeLeft;

    setSelected(optIndex);

    setTimeout(() => {
      setRevealed(true);

      recordAnswer({
        questionId: q._id,
        selectedOption: optIndex,
        timedOut: false,
        timeTakenSeconds: timeTaken,
      });
    }, 200);
  };

  const handleNext = () => {
    setSelected(null);
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
        {error && (
          <div className="quiz-error">
            <Info size={18} />
            {error}
          </div>
        )}
        <div className="quiz-options-grid">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;

            const isCorrect =
              revealed && selected !== null && i === q.correctAnswer;

            const isWrong =
              revealed &&
              selected === i &&
              selected !== q.correctAnswer;

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={revealed}
                className={`quiz-option ${!revealed && isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
              >
                <span className="quiz-option-letter">{["A", "B", "C", "D"][i]}</span>
                <span style={{ flex: 1 }}>{opt}</span>

                {isCorrect && <Check size={18} />}
                {isWrong && <X size={18} />}
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
      </div>
    </div>
  );
}
