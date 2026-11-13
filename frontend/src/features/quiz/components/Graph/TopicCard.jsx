import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  RotateCcw,
  Trophy,
  Unlock,
} from "lucide-react";
import { getTopicIcon } from "../../utils/topicIcons";

export default function TopicCard({ topic, onStart, style }) {
  const { name, description, color, unlocked, completed, bestScore, attempts, prerequisites } = topic;

  const topicIcon = getTopicIcon(name);
  const StatusIcon = completed ? CheckCircle2 : unlocked ? Unlock : Lock;
  const statusLabel = completed ? "Completed" : unlocked ? "Unlocked" : "Locked";

  return (
    <div
      className={`quiz-topic-card fade-in ${unlocked ? "is-unlocked" : "is-locked"} ${completed ? "is-complete" : ""}`}
      style={{
        ...style,
        "--topic-color": color || "var(--primary)",
      }}
      onClick={() => onStart(topic)}
    >
      <div className="quiz-topic-top">
        <span className="quiz-topic-icon">
          {topicIcon}
        </span>
        <span className={`quiz-status-pill ${completed ? "is-complete" : unlocked ? "is-unlocked" : ""}`}>
          <StatusIcon size={14} />
          {statusLabel}
        </span>
      </div>

      <h3 className="quiz-topic-title">{name}</h3>
      <p className="quiz-topic-desc">{description}</p>

      <div className="quiz-topic-meta">
        {attempts > 0 && (
          <>
            <span><Trophy size={15} /> Best: <strong style={{ color: "var(--text)" }}>{bestScore}</strong></span>
            <span><RotateCcw size={15} /> Tries: <strong style={{ color: "var(--text)" }}>{attempts}</strong></span>
          </>
        )}
      </div>

      {!unlocked && prerequisites?.length > 0 && (
        <div className="quiz-topic-meta" style={{ marginTop: "0.75rem" }}>
          Requires: {prerequisites.map((p) => p.name || "prerequisite").join(", ")}
        </div>
      )}

      {unlocked && (
        <div className="quiz-topic-cta">
          {completed ? "Retake Quiz" : "Start Quiz"}
          <ArrowRight size={18} />
        </div>
      )}
    </div>
  );
}
