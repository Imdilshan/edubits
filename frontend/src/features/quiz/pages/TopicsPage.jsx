import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import TopicGraph from "../components/Graph/TopicGraph";
import TopicCard from "../components/Graph/TopicCard";
import { CheckCircle2, GalleryVerticalEnd, GitBranch, Layers3, Unlock } from "lucide-react";
import { Zap} from "lucide-react";

export default function TopicsPage() {
  const [topics,  setTopics]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState("cards");
  const navigate = useNavigate();
  const orderedTopics = useMemo(
    () => [...topics].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [topics]
  );

  const fetchTopics = useCallback(async () => {
    try {
      const { data } = await api.get("/topics");
      setTopics(data.topics);
    } catch (err) {
      console.error("Failed to load topics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const handleStart = (topic) => {
    if (!topic.unlocked) return;
    navigate(`/quizzes/${topic._id}`, { state: { topic } });
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="quiz-shell fade-in">
      <div className="quiz-page-header">
        <div>
          <h1
            className="quiz-page-title"
            style={{
              color: "#f7c44f",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              lineHeight: 1,

              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            <Zap
              size={34}
              strokeWidth={2.4}
              style={{
                color: "#f7c44f",
              }}
            />
            QuizEngine
          </h1>
          
          <p
            className="quiz-page-subtitle"
            style={{
              color: "#f7c44f",
              opacity: 0.9,
            }}
          >
            Be prepared for Viva RapidFire!!
          </p>
        </div>
        <div className="quiz-view-toggle" aria-label="Topic view">
          <button className={`quiz-toggle-btn ${view === "cards" ? "is-active" : ""}`} onClick={() => setView("cards")}>
            <GalleryVerticalEnd size={18} />
            Cards
          </button>
          <button className={`quiz-toggle-btn ${view === "graph" ? "is-active" : ""}`} onClick={() => setView("graph")}>
            <GitBranch size={18} />
            Graph
          </button>
        </div>
      </div>

      <div className="quiz-stats-grid">
        {[
          { label: "Total Topics", value: orderedTopics.length, icon: Layers3 },
          { label: "Unlocked", value: orderedTopics.filter((t) => t.unlocked).length, icon: Unlock },
          { label: "Completed", value: orderedTopics.filter((t) => t.completed).length, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="quiz-stat-card">
            <span className="quiz-stat-icon"><Icon size={21} /></span>
            <div>
              <div className="quiz-stat-value">{value}</div>
              <div className="quiz-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {view === "cards" && (
        <div className="quiz-topic-grid">
          {orderedTopics.map((topic, i) => (
            <TopicCard
              key={topic._id}
              topic={topic}
              onStart={handleStart}
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </div>
      )}

      {view === "graph" && (
        <div className="quiz-graph-panel">
          <TopicGraph topics={orderedTopics} onTopicClick={handleStart} />
        </div>
      )}
    </div>
  );
}
