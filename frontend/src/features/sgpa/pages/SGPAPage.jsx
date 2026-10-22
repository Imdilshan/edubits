import { useState, useEffect } from "react";
import SGPA from "../SGPA";
import CGPA from "../../cgpa/CGPA";
import "./Sgpapage.css";

export default function SGPAPage() {
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
            <h1>SGPA + CGPA Calculator</h1>
            <p>Track your semester grades and estimate your cumulative GPA.</p>
          </div>
        </div>
      </div>

      <div className="gpa-calculators">
        <SGPA setSgpaList={setSgpaList} sgpaCount={sgpaList.length} />
        <CGPA sgpaList={sgpaList} removeSGPA={removeSGPA} />
      </div>
    </main>
  );
}
