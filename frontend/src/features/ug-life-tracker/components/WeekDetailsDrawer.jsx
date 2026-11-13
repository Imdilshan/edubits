import { useEffect, useRef } from "react";
import ScoreSelector from "./ScoreSelector.jsx";
import ReflectionEditor from "./ReflectionEditor.jsx";
import { isSameWeek, fmtWeekRange } from "../utils/dateUtils.js";

export default function WeekDetailsDrawer({ ctx, scores, notes, onScore, onNoteChange, onClearScore, onClose }) {
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!ctx) return null;

  const { period, weekIndex, week, yearNum } = ctx;
  const scoreKey = `${period.key}-${weekIndex}`;
  const currentScore = scores[scoreKey];
  const currentNote = notes[scoreKey];
  const weekNum = weekIndex + 1;
  const now = new Date();
  const isThis = isSameWeek(week, now);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 50,
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        ref={drawerRef}
        style={{
          position: "fixed",
          top: 65,
          right: 0,
          bottom: 0,
          /* On narrow phones use full width minus a small gap */
          width: "min(460px, 100vw)",
          background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          zIndex: 51,
          overflowY: "auto",
          /* Tighter padding on mobile */
          padding: "clamp(16px, 5vw, 32px) clamp(16px, 5vw, 28px)",
          fontFamily: "var(--font-sans)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 6,
            }}>
              Year {yearNum} · {fmtWeekRange(week)}
            </div>
            <h3 style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1.1rem, 5vw, 1.4rem)",
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}>
              {period.name}
            </h3>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              Week {weekNum} of {period.weeks.length}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--muted)",
              cursor: "pointer",
              padding: "6px 10px",
              fontSize: 16,
              lineHeight: 1,
              outline: "none",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          {isThis && (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface-2)",
              color: "var(--text)",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 99,
              border: "1px solid var(--muted)",
              opacity: 0.8,
            }}>
              ● Current week
            </div>
          )}
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 12,
          }}>
            How productive and meaningful was this week?
          </div>

          <ScoreSelector
            currentScore={currentScore}
            onScore={(s) => onScore(scoreKey, s)}
          />

          {currentScore && (
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                onClick={() => onClearScore(scoreKey)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  color: "var(--muted)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "4px 12px",
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Clear score
              </button>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginBottom: 24 }}>
          <div style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 14,
          }}>
            Reflection
          </div>

          <ReflectionEditor
            entry={currentNote}
            onChange={(entry) => onNoteChange(scoreKey, entry)}
          />
        </div>

        {currentNote?.createdAt && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ fontSize: 9, color: "var(--muted)", lineHeight: 1.8, opacity: 0.5 }}>
              <div>Created: {new Date(currentNote.createdAt).toLocaleString()}</div>
              {currentNote.updatedAt && currentNote.updatedAt !== currentNote.createdAt && (
                <div>Updated: {new Date(currentNote.updatedAt).toLocaleString()}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
