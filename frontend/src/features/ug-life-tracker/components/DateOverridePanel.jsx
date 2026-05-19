import { useState, useEffect } from "react";

export default function DateOverridePanel({ calendarData, overrides, onSave, onClear }) {
  const [localOverrides, setLocalOverrides] = useState({});

  useEffect(() => {
    if (!calendarData) return;
    const init = {};
    for (const yr of calendarData) {
      for (const p of yr.periods) {
        init[p.key] = {
          start: p.start.toISOString().split("T")[0],
          end: p.end.toISOString().split("T")[0],
        };
      }
    }
    setLocalOverrides(init);
  }, [calendarData]);

  if (!calendarData) return null;

  const inputStyle = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "4px 6px",
    color: "var(--text)",
    outline: "none",
    width: 110,
  };

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "20px 24px",
      marginBottom: 12,
    }}>
      <div style={{
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginBottom: 16,
      }}>
        Override individual semester dates
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 16,
      }}>
        {calendarData.map((yr) => (
          <div key={yr.year}>
            <div style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 10,
              opacity: 0.6,
            }}>
              Year {yr.year}
            </div>
            {yr.periods.map((p) => (
              <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ fontSize: 9, color: "var(--muted)", width: 68, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {p.name.split(" ")[0]}
                </div>
                <input
                  type="date"
                  value={localOverrides[p.key]?.start || ""}
                  onChange={(e) => setLocalOverrides(prev => ({
                    ...prev,
                    [p.key]: { ...prev[p.key], start: e.target.value }
                  }))}
                  style={inputStyle}
                />
                <span style={{ color: "var(--muted)", opacity: 0.4 }}>–</span>
                <input
                  type="date"
                  value={localOverrides[p.key]?.end || ""}
                  onChange={(e) => setLocalOverrides(prev => ({
                    ...prev,
                    [p.key]: { ...prev[p.key], end: e.target.value }
                  }))}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => {
            const newOverrides = {};
            for (const [key, val] of Object.entries(localOverrides)) {
              if (val.start && val.end) {
                newOverrides[key] = {
                  start: new Date(val.start),
                  end: new Date(val.end),
                };
              }
            }
            onSave(newOverrides);
          }}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.06em",
            background: "var(--text)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 4,
            padding: "8px 16px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          Save & Rebuild →
        </button>
        <button
          onClick={onClear}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            background: "transparent",
            color: "var(--muted)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "8px 14px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          Clear all overrides
        </button>
      </div>
    </div>
  );
}
