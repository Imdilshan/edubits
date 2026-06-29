import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Star, ExternalLink, FileText } from "lucide-react";
import { fetchProblemsAPI } from "../services/programmingService";
import ProblemModal from "../components/ProblemModal/ProblemModal";
import "../styles/programming.css";

export default function TopicProblemsPage() {
  const { topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const topicName = location.state?.topic?.name;

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProblem, setActiveProblem] = useState(null);

  const loadProblems = useCallback(async () => {
    try {
      const data = await fetchProblemsAPI(topicId);
      setProblems(data.problems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => { loadProblems(); }, [loadProblems]);

  if (loading) return <div className="spinner" />;
  if (error) return <p className="prog-error">{error}</p>;

  return (
    <div className="prog-shell fade-in">
      <button className="prog-back-btn" onClick={() => navigate("/programming")}>
        ← Back to roadmap
      </button>

      <h1 className="prog-page-title">{topicName || "Topic"}</h1>
      <p className="prog-progress-label">
        {problems.filter((p) => p.status === "done").length} / {problems.length} solved
      </p>

      {!problems.length ? (
        <p className="prog-empty">No problems added for this topic yet.</p>
      ) : (
        <table className="prog-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Star</th>
              <th>Problem</th>
              <th>Difficulty</th>
              <th>Solution</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
            
              <tr
                key={problem._id}
                className="prog-table-row"
                onClick={() => setActiveProblem(problem)}
              >
                <td>
                  <input type="checkbox" checked={problem.status === "done"} readOnly />
                </td>
                <td>
                  <Star size={16} fill={problem.starred ? "currentColor" : "none"} />
                </td>
                <td className="prog-problem-title">
                  {problem.title}
                  {problem.originalProblemUrl && (
                    <a
                      href={problem.originalProblemUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </td>
                <td className={`prog-difficulty prog-difficulty-${problem.difficulty}`}>
                  {problem.difficulty}
                </td>
                <td>
                  <FileText size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeProblem && (
        <ProblemModal problem={activeProblem} onClose={() => setActiveProblem(null)} />
      )}
    </div>
  );
}