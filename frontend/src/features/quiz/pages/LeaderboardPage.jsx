import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Trophy } from "lucide-react";
import "../styles/global.css";
import "../styles/quizEngine.css";

export default function LeaderboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/leaderboard")
      .then(({ data }) => setSummary(data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="quiz-shell fade-in" style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: 10 }}>
        <Trophy size={30} />
        Your Leaderboard Position
      </h1>
      <p style={{ color: "var(--text-2)", marginBottom: "2rem" }}>
        Your rank is calculated privately. Other learners’ names and scores are not shown.
      </p>

      {!summary ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          Could not load your leaderboard position.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {[
            { label: "Your Rank", value: summary.rank ? `#${summary.rank}` : "—" },
            { label: "Your Score", value: summary.score ?? 0 },
            { label: "Participants", value: summary.participantCount ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700, color: "var(--accent)" }}>{value}</div>
              <div style={{ color: "var(--text-2)", fontSize: "0.82rem" }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
