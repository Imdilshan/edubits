import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ProgrammingGraph from "../components/Graph/ProgrammingGraph";
import { fetchTopicsAPI } from "../services/programmingService";
import "../styles/programming.css";

export default function ProgrammingPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        <h1 className="prog-page-title">Programming</h1>
        <p className="prog-empty">No topics yet. Add one via the API to get started.</p>
      </div>
    );
  }

  return (
    <div className="prog-shell fade-in">
      <h1 className="prog-page-title">Programming</h1>
      <ProgrammingGraph topics={topics} onTopicClick={handleTopicClick} />
    </div>
  );
}