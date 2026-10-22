import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Layers, Loader2, AlertCircle } from "lucide-react";
import { fetchResourcesSummary } from "../../../services/resourceService";
import "./Resources.css";
import "./ResourcesHome.css";

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
  const loadYears = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { years: yearCounts = {} } = await fetchResourcesSummary();
      const yearList = YEAR_ORDER.map((year) => ({
        year,
        count: yearCounts[year] || 0,
        image: YEAR_IMAGES[year],
      }));
      setYears(yearList);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadYears(); }, [loadYears]);

  if (loading) return <div className="resources-loading"><Loader2 className="spin" size={32} /> Loading years…</div>;
  if (error) return <div className="resources-error"><AlertCircle size={32} /> {error} <button onClick={loadYears}>Retry</button></div>;

    return (
    <div className="res-home">

      <header className="res-home-header">
        <h1 className="res-home-title">
          <span className="res-home-badge"><Layers size={22} /></span>
          <span className="res-home-title-text">Resources</span>
        </h1>
      </header>

      <div className="res-home-grid">
        {years.map(({ year, image }, i) => (
          <Link
            key={year}
            to={`/resources/${encodeURIComponent(year)}`}
            className="res-thumb-card"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="res-thumb-img-wrap">
              <img src={image} alt={year} className="res-thumb-img" />
            </div>
            <div className="res-thumb-title">{year}</div>
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
