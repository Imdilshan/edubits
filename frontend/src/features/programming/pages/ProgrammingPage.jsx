import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import ProgrammingGraph from "../components/Graph/ProgrammingGraph";
import { fetchTopicsAPI } from "../services/programmingService";
import { useAuth } from "../../../context/authValue";
import "../styles/programming.css";

export default function ProgrammingPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadTopics = useCallback(async () => {
    try {
      const data = await fetchTopicsAPI();
      setTopics(data.topics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTopics(); }, [loadTopics]);

  const handleTopicClick = (topic) => {
    navigate(`/programming/${topic._id}`, { state: { topic } });
  };

  if (loading) return <div className="spinner" />;
  if (error) return <p className="prog-error">{error}</p>;

  if (!topics.length) {
    return (
      <div className="prog-shell fade-in">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h1 className="prog-page-title" style={{ margin: 0 }}>Programming</h1>
          {user?.role === "admin" && <AdminButton navigate={navigate} />}
        </div>
        <p className="prog-empty">No topics yet. Add one via the API to get started.</p>
      </div>
    );
  }

  return (
    <div className="prog-shell fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 className="prog-page-title" style={{ margin: 0 }}>Programming</h1>
        {user?.role === "admin" && <AdminButton navigate={navigate} />}
      </div>
      <ProgrammingGraph topics={topics} onTopicClick={handleTopicClick} />
    </div>
  );
}

function AdminButton({ navigate }) {
  return (
    <button
      onClick={() => navigate("/programming/admin")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 16px",
        borderRadius: 8,
        border: "1px solid rgba(74,144,226,0.35)",
        background: "rgba(74,144,226,0.1)",
        color: "var(--primary)",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(74,144,226,0.2)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(74,144,226,0.1)"}
    >
      <Settings size={15} />
      Admin
    </button>
  );
}