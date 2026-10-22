import { useState } from "react";

export default function SetupPanel({ startDate, onBuild }) {
  const [dateVal, setDateVal] = useState(
    startDate ? startDate.toISOString().split("T")[0] : ""
  );

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "20px",
      marginBottom: 16,
      boxSizing: "border-box",
      width: "100%",
    }}>
      <div style={{
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginBottom: 14,
        fontFamily: "var(--font-sans)",
      }}>
        First Day of Your UG
      </div>
      <p style={{
        fontSize: 12,
        color: "var(--muted)",
        lineHeight: 1.7,
        margin: "0 0 16px 0",
        fontFamily: "var(--font-sans)",
      }}>
        All 4 years and 8 semesters are calculated from this one date.<br />
        You can override individual semester dates below if needed.
      </p>
      {/* Stack vertically on mobile */}
      <div style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
      }}>
        <input
          type="date"
          value={dateVal}
          onChange={(e) => setDateVal(e.target.value)}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "8px 12px",
            color: "var(--text)",
            outline: "none",
            minWidth: 0,
            flex: "1 1 140px",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={() => { if (!dateVal) return; onBuild(new Date(dateVal)); }}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.06em",
            background: "var(--text)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 4,
            padding: "9px 18px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            outline: "none",
            flex: "0 0 auto",
          }}
        >
          Build My Calendar →
        </button>
      </div>
    </div>
  );
}