import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";
import "../styles/global.css";
import "../styles/quizEngine.css";
import "./ResultsPage.css";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.result) {
    return (
      <main className="quiz-results-page quiz-shell fade-in">
        <section className="results-empty card">
          <div className="results-empty-icon"><Info size={24} /></div>
          <h1>No result to show</h1>
          <p>Finish a quiz first, then your score and answer review will appear here.</p>
          <Link to="/quizzes" className="btn btn-primary results-primary-link">
            Browse topics <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );
  }

  const { result, topic, questions = [] } = state;
  const {
    score = 0,
    maxPossibleScore = 0,
    percentage = 0,
    passed = false,
    correctCount = 0,
    wrongCount = 0,
    history = [],
  } = result;
  const normalizedPercentage = Math.max(0, Math.min(100, Number(percentage) || 0));
  const questionMap = new Map(questions.map((question) => [String(question._id), question]));
  const timedOutCount = history.filter((answer) => answer.result === "timeout").length;
  const topicName = topic?.name || "Quiz";

  const stats = [
    { label: "Points", value: `${score} / ${maxPossibleScore}`, tone: "points" },
    { label: "Correct", value: correctCount, tone: "correct" },
    { label: "Incorrect", value: wrongCount, tone: "incorrect" },
    { label: "Unanswered", value: timedOutCount, tone: "unanswered" },
  ];

  return (
    <main className="quiz-results-page quiz-shell fade-in">
      <button className="results-back-link" onClick={() => navigate("/quizzes")}>
        <ArrowLeft size={17} />
        All topics
      </button>

      <section className="results-overview card">
        <div className="results-overview-topline">
          <span className="results-eyebrow">QUIZ COMPLETE</span>
          <span className={`results-status ${passed ? "is-passed" : "is-failed"}`}>
            {passed ? <CheckCircle2 size={15} /> : <RotateCcw size={15} />}
            {passed ? "Passed" : "Keep practising"}
          </span>
        </div>

        <div className="results-hero">
          <div className="results-message">
            <div className={`results-trophy ${passed ? "is-passed" : "is-failed"}`}>
              <Trophy size={27} />
            </div>
            <h1>{passed ? "Nice work!" : "A good start."}</h1>
            <p className="results-topic-name">{topicName}</p>
            <p className="results-message-copy">
              {passed
                ? "You passed this round. Keep building on what you know."
                : "Review the answers below, then try the topic again when you’re ready."}
            </p>
          </div>

          <div
            className="results-score-ring"
            style={{ "--score-angle": `${normalizedPercentage * 3.6}deg` }}
            role="img"
            aria-label={`Score: ${normalizedPercentage}%`}
          >
            <div className="results-score-ring-inner">
              <strong>{normalizedPercentage}%</strong>
              <span>Score</span>
            </div>
          </div>
        </div>

        <div className="results-stats-grid">
          {stats.map(({ label, value, tone }) => (
            <div className={`results-stat ${tone}`} key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="results-actions">
          <button
            className="btn btn-primary results-retake-button"
            onClick={() => navigate(`/quizzes/${topic?._id || ""}`, { state: { topic } })}
          >
            <RotateCcw size={17} />
            Retake Quiz
          </button>
          <Link to="/quizzes" className="results-secondary-link">
            Choose another topic <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {history.length > 0 && (
        <section className="results-review-section">
          <div className="results-review-heading">
            <div>
              <span className="results-eyebrow">YOUR ATTEMPT</span>
              <h2>Answer review</h2>
            </div>
            <span className="results-review-count">{history.length} questions</span>
          </div>

          <div className="results-review-list">
            {history.map((answer, index) => {
              const question = questionMap.get(String(answer.questionId)) || {};
              const isCorrect = answer.result === "correct";
              const isTimeout = answer.result === "timeout";
              const correctIndices = answer.correctAnswer ?? question.correctAnswer ?? [];
              const correctOptions = Array.isArray(correctIndices) ? correctIndices : [correctIndices];
              const selectedOptions = answer.selectedOptions?.length
                ? answer.selectedOptions
                : answer.selectedOption !== undefined && answer.selectedOption !== null
                  ? [answer.selectedOption]
                  : [];
              const reviewTone = isCorrect ? "is-correct" : isTimeout ? "is-timeout" : "is-incorrect";

              return (
                <article className={`results-review-card ${reviewTone}`} key={answer.questionId || index}>
                  <div className="results-review-card-top">
                    <span className="results-question-number">Question {String(index + 1).padStart(2, "0")}</span>
                    <div className="results-review-tags">
                      {question.difficulty && (
                        <span className={`results-difficulty ${question.difficulty.toLowerCase()}`}>
                          {question.difficulty}
                        </span>
                      )}
                      <span className={`results-answer-status ${reviewTone}`}>
                        {isCorrect ? <Check size={14} /> : isTimeout ? <Clock3 size={14} /> : <X size={14} />}
                        {isCorrect ? "Correct" : isTimeout ? "Timed out" : "Incorrect"}
                      </span>
                    </div>
                  </div>

                  <h3>{answer.questionText || question.text || "Question unavailable"}</h3>

                  {question.options?.length > 0 ? (
                    <div className="results-answer-options">
                      {question.options.map((option, optionIndex) => {
                        const isAnswerCorrect = correctOptions.includes(optionIndex);
                        const wasSelected = selectedOptions.includes(optionIndex);
                        const optionTone = isAnswerCorrect
                          ? "is-answer-correct"
                          : wasSelected
                            ? "is-answer-wrong"
                            : "";

                        return (
                          <div className={`results-answer-option ${optionTone}`} key={optionIndex}>
                            <span className="results-option-letter">{LETTERS[optionIndex]}</span>
                            <span className="results-option-text">{option}</span>
                            {isAnswerCorrect && <span className="results-option-label">Correct answer</span>}
                            {wasSelected && !isAnswerCorrect && <span className="results-option-label">Your answer</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="results-answer-summary">
                      <span><strong>Correct:</strong> {formatAnswerLetters(correctOptions)}</span>
                      <span><strong>Your answer:</strong> {formatAnswerLetters(selectedOptions)}</span>
                    </div>
                  )}

                  {answer.explanation && (
                    <div className="results-explanation">
                      <Info size={16} />
                      <p>{answer.explanation}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

function formatAnswerLetters(indices) {
  if (!indices?.length) return "No answer";
  return indices.map((index) => LETTERS[index] || "?").join(", ");
}
