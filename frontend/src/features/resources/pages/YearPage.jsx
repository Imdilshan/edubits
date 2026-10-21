import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, FolderOpen, FileText, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { fetchResources } from "../../../services/resourceService";
import { useProgress } from "../hooks/useProgress";
import "./Resources.css";

const SUBJECT_IMAGES = {
  "Mathematics-I": "/images/maths2.svg",
  "Digital Electronics": "/images/fede.svg",
  "Engineering Physics": "/images/ep.svg",
  "LTPS": "/images/dsa.svg",
  "Biology": "/images/bio.svg",
  "COA": "/images/coa.svg",
  "DBMS": "/images/dbms.svg",
  "ADSA": "/images/daa.svg",
  "Java": "/images/java.svg",
  "Software Engineering": "/images/se.svg",
  "Operating System": "/images/os.svg",
  "Machine Learning": "/images/ml.svg",
  "Probability & Statistics": "/images/pns.svg",
  "PBL_Java": "/images/java.svg",
  "Computer Networks": "/images/coa.svg",
  "Web Development Fundamentals": "/images/daa.svg",
  "Business Analytics": "/images/business.svg",
  "Ethical Hacking": "/images/java.svg",
  "Mathematics-II": "/images/maths2.svg",
  "OOPS Using Java": "/images/java.svg",
};

export default function YearPage() {
  const { year } = useParams();
  const decodedYear = decodeURIComponent(year);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { progressMap } = useProgress();

  useEffect(() => {
    loadSubjects();
  }, [decodedYear]);

  const loadSubjects = async () => {
    try {
      const resources = await fetchResources({ type: "pyqs", year: decodedYear });
      const subjectCounts = {};
      resources.forEach((r) => {
        if (r.subject && r.variant === "questions") {
          if (!subjectCounts[r.subject]) {
            subjectCounts[r.subject] = { total: 0, attempted: 0 };
          }
          subjectCounts[r.subject].total++;
          if (progressMap[r.paperKey]?.attempted) {
            subjectCounts[r.subject].attempted++;
          }
        }
      });
      const subjectList = Object.entries(subjectCounts)
        .map(([subject, counts]) => ({
          subject,
          total: counts.total,
          attempted: counts.attempted,
          image: SUBJECT_IMAGES[subject] || "/images/daa.svg",
        }))
        .sort((a, b) => a.subject.localeCompare(b.subject));
      setSubjects(subjectList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="resources-loading"><Loader2 className="spin" size={32} /> Loading subjects…</div>;
  if (error) return <div className="resources-error"><AlertCircle size={32} /> {error}</div>;

  return (
    <div className="resources-page">
      <header className="resources-header">
        <Link to="/resources" className="back-link">
          <ArrowLeft size={20} /> Back
        </Link>
        <div>
          <h1><BookOpen size={28} /> {decodedYear}</h1>
          <p className="resources-subtitle">Select a subject</p>
        </div>
      </header>

      <div className="resources-grid subjects-grid">
        {subjects.map(({ subject, total, attempted, image }) => (
          <Link
            key={subject}
            to={`/resources/${encodeURIComponent(decodedYear)}/${encodeURIComponent(subject)}`}
            className="resource-card subject-card"
          >
            <div className="resource-card-image">
              <img src={image} alt={subject} />
            </div>
            <div className="resource-card-content">
              <h3 className="resource-card-title">{subject}</h3>
              <p className="resource-card-meta">
                {attempted} / {total} attempted
              </p>
              <div className="progress-mini">
                <div className="progress-mini-track">
                  <div
                    className="progress-mini-fill"
                    style={{ width: total > 0 ? `${(attempted / total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
        {subjects.length === 0 && (
          <div className="resources-empty">
            <AlertCircle size={48} />
            <p>No subjects found for this year</p>
          </div>
        )}
      </div>
    </div>
  );
}