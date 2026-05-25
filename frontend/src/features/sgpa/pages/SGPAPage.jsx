import { useState, useEffect } from "react";
import SGPA from "../SGPA";
import CGPA from "../../cgpa/CGPA";
import "./Sgpapage.css";
import html2pdf from "html2pdf.js";
import { Calculator } from "lucide-react";

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

  const exportPDF = () => {
    const element = document.querySelector(".app-container");
    document.body.classList.add("pdf-mode");
    const opt = {
      margin: [0.5, 0.3, 0.5, 0.3],
      filename: "edubits-gpa.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#0b0c10", windowWidth: element.scrollWidth },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
    document.body.classList.remove("pdf-mode");
  };

  return (
    <>
      <div className="top-actions">
        <button className="btn btn-export" onClick={exportPDF}>
          Export PDF
        </button>
      </div>

      <div className="app-container">
        <h1
          className="main-title"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", lineHeight: 1 }}
        >
          <Calculator size={28} />
          SGPA + CGPA Calculator
        </h1>

        <SGPA setSgpaList={setSgpaList} />
        <CGPA sgpaList={sgpaList} removeSGPA={removeSGPA} />
      </div>
    </>
  );
}