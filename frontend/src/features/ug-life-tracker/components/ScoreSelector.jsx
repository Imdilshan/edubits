import { SCORE_LABELS } from "../utils/constants.js";

export default function ScoreSelector({ currentScore, onScore }) {
  const scoreColors = ["", "#c8dfc0", "#7dba6e", "#4a9e3c", "#2d7a24", "#145014"];
  const scoreText = ["", "#1a3d0a", "#1a3d0a", "#fff", "#fff", "#fff"];

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onScore(s)}
          style={{
            width: 52,
            height: 60,
            borderRadius: 6,
            border: currentScore === s ? "2px solid var(--text)" : "none",
            cursor: "pointer",
            background: scoreColors[s],
            color: scoreText[s],
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 20,
            fontWeight: 500,
            transform: currentScore === s ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.12s ease, border 0.12s ease",
            outline: "none",
          }}
        >
          {s}
          <span style={{
            fontSize: 8,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}>
            {SCORE_LABELS[s]}
          </span>
        </button>
      ))}
    </div>
  );
}
