import { useState } from "react";
import { REFLECTION_PROMPTS } from "../utils/constants.js";

import {
  Smile,
  Meh,
  Frown,
  Zap,
  Brain,
  Target,
  Flame,
  TrendingUp,
} from "lucide-react";

const SIGNALS = [
  { id: "good", icon: Smile, label: "Good Week" },
  { id: "neutral", icon: Meh, label: "Neutral Week" },
  { id: "difficult", icon: Frown, label: "Difficult Week" },
  { id: "productive", icon: Zap, label: "Productive" },
  { id: "learning", icon: Brain, label: "Learning" },
  { id: "focused", icon: Target, label: "Focused" },
  { id: "momentum", icon: Flame, label: "Momentum" },
  { id: "growth", icon: TrendingUp, label: "Growth" },
];

export default function ReflectionEditor({ entry, onChange }) {
  const [activePrompt, setActivePrompt] = useState(null);

  const handleNoteChange = (val) => onChange({ ...entry, note: val, updatedAt: new Date().toISOString() });
  const handleMoodChange = (mood) => onChange({ ...entry, mood, updatedAt: new Date().toISOString() });

  const insertPrompt = (prompt) => {
    const current = entry?.note || "";
    const newNote = current
      ? `${current}\n\n${prompt}\n`
      : `${prompt}\n`;
    onChange({ ...entry, note: newNote, updatedAt: new Date().toISOString() });
    setActivePrompt(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 8,
        }}>
          Week Signals
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {SIGNALS.map((signal) => {
            const Icon = signal.icon;
            const active = entry?.mood === signal.id;

            return (
              <button
                key={signal.id}
                title={signal.label}
                onClick={() =>
                  handleMoodChange(active ? undefined : signal.id)
                }
                style={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  background: active
                    ? "rgba(74, 222, 128, 0.12)"
                    : "transparent",
                  border: active
                    ? "1px solid #4ade80"
                    : "1px solid var(--border)",
                  color: active
                    ? "#4ade80"
                    : "var(--muted)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  outline: "none",
                }}
              >
                <Icon size={18} strokeWidth={2} />
              </button>
            );
          })}
        </div>

      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 6,
        }}>
          Reflection prompts
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {REFLECTION_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => insertPrompt(p)}
              style={{
                fontSize: 10,
                color: "var(--muted)",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "4px 8px",
                cursor: "pointer",
                transition: "all 0.12s",
                outline: "none",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--muted)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={entry?.note || ""}
        onChange={(e) => handleNoteChange(e.target.value)}
        placeholder="Write your reflection here. Be honest — this record is yours alone."
        rows={6}
        style={{
          width: "100%",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "12px 14px",
          color: "var(--text)",
          fontSize: 13,
          fontFamily: "'IBM Plex Mono', monospace",
          lineHeight: 1.7,
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--muted)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
      />

      {entry?.updatedAt && (
        <div style={{
          fontSize: 9,
          color: "var(--muted)",
          marginTop: 6,
          textAlign: "right",
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: "0.06em",
          opacity: 0.6,
        }}>
          Last saved {new Date(entry.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
