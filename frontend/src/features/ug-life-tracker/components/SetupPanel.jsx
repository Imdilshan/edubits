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
      padding: "24px 28px",
      marginBottom: 16,
    }}>
      <div style={{
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginBottom: 14,
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        First Day of Your UG
      </div>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 14,
      }}>
        <p style={{
          fontSize: 12,
          color: "var(--muted)",
          lineHeight: 1.7,
          margin: 0,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          All 4 years and 8 semesters are calculated from this one date.<br />
          You can override individual semester dates below if needed.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          <input
            type="date"
            value={dateVal}
            onChange={(e) => setDateVal(e.target.value)}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "8px 12px",
              color: "var(--text)",
              outline: "none",
            }}
          />
          <button
            onClick={() => {
              if (!dateVal) return;
              onBuild(new Date(dateVal));
            }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
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
            }}
          >
            Build My Calendar →
          </button>
        </div>
      </div>
    </div>
  );
}
