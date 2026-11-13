import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Star, ExternalLink, FileText } from "lucide-react";
import { fetchProblemsAPI, fetchProgressAPI, toggleProgressAPI } from "../services/programmingService";
import ProblemModal from "../components/ProblemModal/ProblemModal";
import SolutionModal from "../components/ProblemModal/SolutionModal";
import "../styles/programming.css";

export default function TopicProblemsPage() {
  const { topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const topicName = location.state?.topic?.name;

  const [problems, setProblems] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProblem, setActiveProblem] = useState(null);
  const [activeSolution, setActiveSolution] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [problemsData, progressData] = await Promise.all([
        fetchProblemsAPI(topicId),
        fetchProgressAPI(topicId),
      ]);
      setProblems(problemsData.problems);

      const map = {};
      progressData.progress.forEach((p) => {
        map[p.problem] = { status: p.status, starred: p.starred };
      });
      setProgressMap(map);
    } catch {
      setError("Failed to load problems. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => { loadData(); }, [loadData]);

  const getProgress = (problemId) =>
    progressMap[problemId] || { status: "todo", starred: false };

  const handleToggleStatus = async (e, problemId) => {
    e.stopPropagation();
    const current = getProgress(problemId);
    const nextStatus = current.status === "done" ? "todo" : "done";

    setProgressMap((prev) => ({
      ...prev,
      [problemId]: { ...current, status: nextStatus },
    }));

    try {
      await toggleProgressAPI(problemId, { status: nextStatus });
    } catch {
      setProgressMap((prev) => ({
        ...prev,
        [problemId]: { ...current, status: current.status },
      }));
    }
  };

  const handleToggleStar = async (e, problemId) => {
    e.stopPropagation();
    const current = getProgress(problemId);
    const nextStarred = !current.starred;

    setProgressMap((prev) => ({
      ...prev,
      [problemId]: { ...current, starred: nextStarred },
    }));

    try {
      await toggleProgressAPI(problemId, { starred: nextStarred });
    } catch {
      setProgressMap((prev) => ({
        ...prev,
        [problemId]: { ...current, starred: current.starred },
      }));
    }
  };

  if (loading) return <div className="spinner" />;
  if (error) return <p className="prog-error">{error}</p>;

  const solvedCount = problems.filter((p) => getProgress(p._id).status === "done").length;

  return (
    <div className="prog-shell fade-in">
      <button className="prog-back-btn" onClick={() => navigate("/programming")}>
        ← Back to roadmap
      </button>

      <h1 className="prog-page-title">{topicName || "Topic"}</h1>
      <p className="prog-progress-label">
        {solvedCount} / {problems.length} solved
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
            {problems.map((problem) => {
              const progress = getProgress(problem._id);
              return (
                <tr
                  key={problem._id}
                  className="prog-table-row"
                  onClick={() => setActiveProblem(problem)}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={progress.status === "done"}
                      onChange={(e) => handleToggleStatus(e, problem._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td onClick={(e) => handleToggleStar(e, problem._id)}>
                    <Star size={16} fill={progress.starred ? "currentColor" : "none"} />
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
                  <td onClick={(e) => { e.stopPropagation(); setActiveSolution(problem); }}>
                    <FileText size={16} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {activeProblem && (
        <ProblemModal problem={activeProblem} onClose={() => setActiveProblem(null)} />
      )}

      {activeSolution && (
        <SolutionModal problem={activeSolution} onClose={() => setActiveSolution(null)} />
      )}
    </div>
  );
}
