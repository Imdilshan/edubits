import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {BrainCircuit, Layers3, Unlock, CheckCircle2 } from "lucide-react";
import { GraduationCap, BookOpen } from "lucide-react";
import "./TopicsPage.css";

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState("viva");
  const navigate = useNavigate();

  const orderedTopics = useMemo(
    () => [...topics].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [topics]
  );

  const filteredTopics = useMemo(
    () => orderedTopics.filter((t) => t.mode === activeMode),
    [orderedTopics, activeMode]
  );

  const fetchTopics = useCallback(async () => {
    try {
      const { data } = await api.get("/topics");
      setTopics(data.topics);
    } catch {
      console.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleStart = (topic) => {
    if (!topic.unlocked) return;
    navigate(`/quizzes/${topic._id}`, { state: { topic } });
  };

  const modeStats = useMemo(() => {
    const viva = orderedTopics.filter((t) => t.mode === "viva");
    const nptel = orderedTopics.filter((t) => t.mode === "nptel");
    return {
      viva: {
        total: viva.length,
        unlocked: viva.filter((t) => t.unlocked).length,
        completed: viva.filter((t) => t.completed).length,
      },
      nptel: {
        total: nptel.length,
        unlocked: nptel.filter((t) => t.unlocked).length,
        completed: nptel.filter((t) => t.completed).length,
      },
    };
  }, [orderedTopics]);

  if (loading) return <div className="spinner" />;

  const stats = modeStats[activeMode];

  return (
    <div className="quiz-shell fade-in">
      <div className="quiz-page-header">
        <div>
          <h1 className="quiz-page-title">
            <BrainCircuit size={34} strokeWidth={2} />
            QuizEngine
          </h1>
        </div>
        <div className="quiz-mode-toggle" role="tablist" aria-label="Quiz category">
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "viva"}
            className={`quiz-mode-btn ${activeMode === "viva" ? "active" : ""}`}
            onClick={() => setActiveMode("viva")}
          >
            <GraduationCap size={17} strokeWidth={1.8} />
            <span className="mode-label">College Viva</span>
            <span className="mode-count">{modeStats.viva.total}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "nptel"}
            className={`quiz-mode-btn ${activeMode === "nptel" ? "active" : ""}`}
            onClick={() => setActiveMode("nptel")}
          >
            <BookOpen size={17} strokeWidth={1.8} />
            <span className="mode-label">NPTEL Prep</span>
            <span className="mode-count">{modeStats.nptel.total}</span>
          </button>
        </div>

      </div>

      <div className="quiz-stats-grid">
        {[
          { label: "Total Topics", value: stats.total, icon: <Layers3 size={21} /> },
          { label: "Unlocked", value: stats.unlocked, icon: <Unlock size={21} /> },
          { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={21} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="quiz-stat-card">
            <span className="quiz-stat-icon">{icon}</span>
            <div>
              <div className="quiz-stat-value">{value}</div>
              <div className="quiz-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="quiz-topic-grid">
        {filteredTopics.length === 0 ? (
          <div className="quiz-empty-state">
            <p>No topics available for {activeMode === "viva" ? "College Viva" : "NPTEL Prep"} mode.</p>
            <p className="hint">Topics will appear here after admin adds them via the dashboard.</p>
          </div>
        ) : (
          filteredTopics.map((topic, i) => (
            <TopicPhotoCard
              key={topic._id}
              topic={topic}
              onStart={handleStart}
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TopicPhotoCard({ topic, onStart, style }) {
  const isLocked = !topic.unlocked;
  const isCompleted = topic.completed;

  return (
    <article
      className={`quiz-photo-card ${isLocked ? "locked" : ""} ${isCompleted ? "completed" : ""}`}
      style={style}
      onClick={() => !isLocked && onStart(topic)}
    >
      <div className="photo-card-image">
        {topic.image ? (
          <img src={topic.image} alt={topic.name} loading="lazy" />
        ) : (
          <div className="photo-placeholder">
            <span className="photo-icon">{topic.icon || "📚"}</span>
          </div>
        )}
        {isLocked && <div className="photo-lock"><Unlock size={24} /></div>}
        {isCompleted && <div className="photo-check"><CheckCircle2 size={24} /></div>}
      </div>
      <div className="photo-card-content">
        <h3 className="photo-card-title">{topic.name}</h3>
        <p className="photo-card-desc">{topic.description || "No description"}</p>
        {!isLocked && (
          <button className="photo-card-start" onClick={(e) => { e.stopPropagation(); onStart(topic); }}>
            {isCompleted ? "Retake Quiz" : "Start Quiz"}
          </button>
        )}
        {isLocked && (
          <div className="photo-card-locked">
            Complete prerequisites to unlock
          </div>
        )}
      </div>
    </article>
  );
}
