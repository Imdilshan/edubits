import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { CheckCircle2, FileText, ListChecks, Target, XCircle } from "lucide-react";
import { getTopicIcon } from "../utils/topicIcons";
import "../styles/global.css";
import "../styles/quizEngine.css";

export default function HistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get("/quiz/history")
      .then(({ data }) => { setAttempts(data.attempts); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const totalAttempts = attempts.length;
  const passed        = attempts.filter((a) => a.passed).length;
  const avgScore      = totalAttempts
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts)
    : 0;

  return (
    <div className="quiz-shell fade-in" style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: 10 }}>
        <ListChecks size={30} />
        Quiz History
      </h1>
      <p style={{ color: "var(--text-2)", marginBottom: "2rem" }}>Your last {totalAttempts} quiz attempts</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Attempts", value: totalAttempts },
          { label: "Passed",         value: passed, color: "var(--success)" },
          { label: "Avg Score",      value: avgScore, color: "var(--accent)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700, color: color || "var(--text)" }}>{value}</div>
            <div style={{ color: "var(--text-2)", fontSize: "0.82rem" }}>{label}</div>
          </div>
        ))}
      </div>

      {attempts.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <span className="quiz-result-icon">
            <Target size={34} />
          </span>
          <h2 style={{ marginBottom: "0.5rem" }}>No attempts yet</h2>
          <p style={{ color: "var(--text-2)", marginBottom: "1.5rem" }}>Complete your first quiz to see your history here.</p>
          <Link to="/quizzes" className="quiz-action-btn primary">Browse Topics</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {attempts.map((attempt, i) => {
            const topic   = attempt.topic;
            const TopicIcon = getTopicIcon(topic?.name);
            const passColor = attempt.passed ? "var(--success)" : "var(--error)";
            const date    = new Date(attempt.createdAt).toLocaleDateString("en-US", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            });

            return (
              <div
                key={`${attempt.createdAt}-${i}`}
                className="card fade-in"
                style={{ animationDelay: `${i * 0.05}s`, padding: "1rem 1.25rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className="quiz-topic-icon" style={{ width: 42, height: 42 }}>
                      <TopicIcon size={21} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontFamily: "var(--font-display)" }}>
                        {topic?.name || "Unknown Topic"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>{date}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 80 }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "3px", textAlign: "right" }}>
                        {attempt.percentage}%
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${attempt.percentage}%`, background: passColor }}
                        />
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontFamily: "var(--font-display)", fontWeight: 700,
                        fontSize: "1.15rem", color: "var(--accent)",
                      }}>
                        {attempt.score} pts
                      </div>
                      <div style={{ fontSize: "0.78rem", color: passColor, fontWeight: 600 }}>
                        {attempt.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {" "}
                        {attempt.passed ? "Passed" : "Failed"}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-3)", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <FileText size={15} />
                    Questions: <strong style={{ color: "var(--text)" }}>{attempt.answerCount || 0}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
