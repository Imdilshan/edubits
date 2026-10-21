import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FolderOpen, FileText, Loader2, AlertCircle } from "lucide-react";
import { fetchResources } from "../../../services/resourceService";
import { useProgress } from "../hooks/useProgress";
import "./Resources.css";

const YEAR_ORDER = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const YEAR_IMAGES = {
  "1st Year": "/images/1st.svg",
  "2nd Year": "/images/2nd.svg",
  "3rd Year": "/images/3rd.svg",
  "4th Year": "/images/4th.svg",
};

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

export default function ResourcesPage() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { progressMap, loading: progressLoading } = useProgress();

  useEffect(() => {
    loadYears();
  }, []);

  const loadYears = async () => {
    try {
      const resources = await fetchResources({ type: "pyqs" });
      const yearCounts = {};
      resources.forEach((r) => {
        if (r.year && r.variant === "questions") {
          yearCounts[r.year] = (yearCounts[r.year] || 0) + 1;
        }
      });
      const yearList = YEAR_ORDER.filter((y) => yearCounts[y])
        .map((y) => ({ year: y, count: yearCounts[y], image: YEAR_IMAGES[y] }));
      setYears(yearList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="resources-loading"><Loader2 className="spin" size={32} /> Loading years…</div>;
  if (error) return <div className="resources-error"><AlertCircle size={32} /> {error}</div>;

  return (
    <div className="resources-page">
      <header className="resources-header">
        <h1><BookOpen size={28} /> Resources</h1>
        <p className="resources-subtitle">Exam prep: PYQs, Playlists & Notes</p>
      </header>

      <div className="resources-grid years-grid">
        {years.map(({ year, count, image }) => (
          <Link
            key={year}
            to={`/resources/${encodeURIComponent(year)}`}
            className="resource-card year-card"
          >
            <div className="resource-card-image">
              <img src={image} alt={year} />
            </div>
            <div className="resource-card-content">
              <h3 className="resource-card-title">{year}</h3>
              <p className="resource-card-meta">{count} papers</p>
            </div>
          </Link>
        ))}
        {years.length === 0 && (
          <div className="resources-empty">
            <AlertCircle size={48} />
            <p>No resources found</p>
          </div>
        )}
      </div>
    </div>
  );
}