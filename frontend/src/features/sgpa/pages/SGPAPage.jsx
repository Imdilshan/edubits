import { useState, useEffect } from "react";
import { ArrowLeft, Calculator, TrendingUp } from "lucide-react";
import SGPA from "../SGPA";
import CGPA from "../../cgpa/CGPA";
import "./Sgpapage.css";

export default function SGPAPage() {
  const [activeTool, setActiveTool] = useState(null);
  const [sgpaList, setSgpaList] = useState(() => {
    try {
      const saved = localStorage.getItem("sgpaList");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const removeSGPA = (id) => setSgpaList((prev) => prev.filter((s) => s.id !== id));

  useEffect(() => {
    localStorage.setItem("sgpaList", JSON.stringify(sgpaList));
  }, [sgpaList]);

  return (
    <main className="gpa-page">
      <div className="gpa-page-header">
        <div className="gpa-page-heading">
          <div>
            <h1>{activeTool === "sgpa" ? "SGPA Calculator" : activeTool === "cgpa" ? "CGPA Calculator" : "Grade Calculators"}</h1>
            {!activeTool && (
              <p>
                Choose a calculator to get started.
              </p>
            )}
          </div>
        </div>
        {activeTool && (
          <button className="gpa-tool-back" type="button" onClick={() => setActiveTool(null)}>
            <ArrowLeft size={17} /> Back
          </button>
        )}
      </div>

      {activeTool ? (
        <div className="gpa-calculators">
          {activeTool === "sgpa" ? (
            <SGPA setSgpaList={setSgpaList} sgpaCount={sgpaList.length} />
          ) : (
            <CGPA sgpaList={sgpaList} removeSGPA={removeSGPA} />
          )}
        </div>
      ) : (
        <div className="gpa-tool-grid">
          <button className="gpa-tool-card" type="button" onClick={() => setActiveTool("sgpa")}>
            <span className="gpa-tool-icon"><Calculator size={24} /></span>
            <span className="gpa-tool-card-copy">
              <span className="gpa-tool-title">SGPA Calculator</span>
              <span className="gpa-tool-description">Calculate your semester GPA from subject credits and grades.</span>
            </span>
            <span className="gpa-tool-arrow" aria-hidden="true">→</span>
          </button>
          <button className="gpa-tool-card gpa-tool-card--cgpa" type="button" onClick={() => setActiveTool("cgpa")}>
            <span className="gpa-tool-icon"><TrendingUp size={24} /></span>
            <span className="gpa-tool-card-copy">
              <span className="gpa-tool-title">CGPA Calculator</span>
              <span className="gpa-tool-description">Combine semesters, calculate your CGPA, or predict the SGPA you need.</span>
            </span>
            <span className="gpa-tool-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </main>
  );
}
