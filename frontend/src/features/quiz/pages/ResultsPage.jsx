import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Check, Clock3, RotateCcw, Trophy, X } from "lucide-react";

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.result) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p>No results found.</p>
        <Link to="/quizzes" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Back to Topics
        </Link>
      </div>
    );
  }

  const { result, topic, questions } = state;
  const {
    score,
    maxPossibleScore,
    percentage,
    passed,
    correctCount,
    wrongCount,
    history,
  } = result;

  const questionMap = new Map((questions || []).map((q) => [q._id, q]));

  const gradeColor =
    percentage >= 80 ? "var(--success)" :
    percentage >= 60 ? "var(--warning)" :
    "var(--error)";

  const gradeLabel =
    percentage >= 80 ? "Excellent!" :
    percentage >= 60 ? "Good job!" :
    "Keep practising";

  return (
    <div className="quiz-shell fade-in" style={{ maxWidth: 760 }}>
      <div className="card" style={{ textAlign: "center", marginBottom: "1.5rem", padding: "2.5rem" }}>
        <span className="quiz-result-icon" style={{ color: gradeColor }}>
          <Trophy size={34} />
        </span>

        <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem", color: gradeColor }}>
          {gradeLabel}
        </h1>

        <p style={{ color: "var(--text-2)", marginBottom: "2rem" }}>
          {topic?.name || "Quiz"} complete
        </p>

        <div style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: `8px solid var(--bg-3)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 2rem",
          background: `conic-gradient(${gradeColor} ${percentage * 3.6}deg, var(--bg-3) 0deg)`
        }}>
          <span style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: gradeColor
          }}>
            {percentage}%
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {[
            { label: "Score", value: `${score} / ${maxPossibleScore}`, color: gradeColor },
            { label: "Correct", value: correctCount, color: "var(--success)" },
            { label: "Wrong", value: wrongCount, color: "var(--error)" },
            { label: "Result", value: passed ? "PASSED" : "FAILED", color: passed ? "var(--success)" : "var(--error)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "var(--bg-3)",
              borderRadius: "var(--radius-sm)",
              padding: "0.9rem",
              border: "1px solid var(--border)"
            }}>
              <div style={{ color, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: "0.78rem" }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.75rem" }}>
          <button
            className="quiz-action-btn"
            onClick={() => navigate(`/quizzes/${topic?._id || ""}`, { state: { topic } })}
          >
            <RotateCcw size={17} />
            Retake Quiz
          </button>
        </div>
      </div>

      {history && history.length > 0 && (
        <div className="card">
          <h2>Question Breakdown</h2>

          {history.map((h, i) => {
            const q = questionMap.get(h.questionId) || {};
            const isCorrect = h.result === "correct";
            const isTimeout = h.result === "timeout";

            return (
              <div key={i} style={{ marginBottom: "1rem" }}>
                <div>
                  Q{i + 1} • {q.difficulty}
                </div>

                <div>
                  {h.questionText || q.text}
                </div>

                <div>
                  {isCorrect ? <Check size={16} /> : isTimeout ? <Clock3 size={16} /> : <X size={16} />}
                  {h.scoreChange > 0 ? "+" : ""}{h.scoreChange}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
