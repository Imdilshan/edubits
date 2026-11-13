import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Layers, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { fetchResourcesSummary } from "../../../services/resourceService";
import { useResourcesProgress } from "../resourcesProgressContext";
import "./Resources.css";
import "./ResourcesHome.css";

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

const SUBJECTS_BY_YEAR = {
  "1st Year": ["Mathematics-I", "Digital Electronics", "Engineering Physics", "LTPS", "Biology"],
  "2nd Year": ["COA", "DBMS", "ADSA", "Java", "Software Engineering", "Operating System", "Machine Learning", "Probability & Statistics"],
  "3rd Year": ["PBL_Java", "Computer Networks", "Probability & Statistics"],
  "4th Year": ["Ethical Hacking"],
};

export default function YearPage() {
  const { year } = useParams();
  const decodedYear = decodeURIComponent(year);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { progressMap, loading: progressLoading } = useResourcesProgress();

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchResourcesSummary();
      setSummary(data.subjects?.[decodedYear] || []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Could not load subjects.");
    } finally {
      setLoading(false);
    }
  }, [decodedYear]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const subjects = useMemo(() => {
    const uploaded = new Map(summary.map(({ subject, count, paperKeys = [] }) => [subject, { count, paperKeys }]));
    return (SUBJECTS_BY_YEAR[decodedYear] || []).map((subject) => {
      const { count = 0, paperKeys = [] } = uploaded.get(subject) || {};
      return {
        subject,
        total: count,
        attempted: paperKeys.filter((paperKey) => progressMap[paperKey]?.attempted).length,
        image: SUBJECT_IMAGES[subject] || "/images/daa.svg",
      };
    });
  }, [decodedYear, summary, progressMap]);

  if (loading || progressLoading) return <div className="resources-loading"><Loader2 className="spin" size={32} /> Loading subjects…</div>;
  if (error) return <div className="resources-error"><AlertCircle size={32} /> {error} <button onClick={loadSummary}>Retry</button></div>;

    return (
    <div className="res-home">
      <header className="res-home-header res-home-header--column">
        <h1 className="res-home-title">
          <Layers size={27} />
          {decodedYear}
        </h1>

        <Link to="/resources" className="back-link">
          <ArrowLeft size={16} />
          Back
        </Link>
      </header>

      <div className="res-home-grid res-home-grid--subjects">
        {subjects.map(({ subject, total, attempted, image }, i) => (
          <Link
            key={subject}
            to={`/resources/${encodeURIComponent(decodedYear)}/${encodeURIComponent(subject)}`}
            className="res-thumb-card"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="res-thumb-img-wrap">
              <img src={image} alt={subject} className="res-thumb-img" />
            </div>
            <div className="res-thumb-title">{subject}</div>
            <div className="res-thumb-sub">{attempted}/{total} attempted</div>
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
