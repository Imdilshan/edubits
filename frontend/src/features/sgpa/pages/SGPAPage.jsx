import { useState, useEffect } from "react";
import SGPA from "../SGPA";
import CGPA from "../../cgpa/CGPA";
import html2pdf from "html2pdf.js";

export default function SGPAPage() {
  const [sgpaList, setSgpaList] = useState(() => {
    try {
      const saved = localStorage.getItem("sgpaList");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleTheme = () => {
    document.body.classList.toggle("light");
  };

  const removeSGPA = (id) => {
    setSgpaList((prev) => prev.filter((sem) => sem.id !== id));
  };

  useEffect(() => {
    localStorage.setItem("sgpaList", JSON.stringify(sgpaList));
  }, [sgpaList]);

  const exportPDF = () => {
    const element = document.querySelector(".app-container");

    const opt = {
      margin: 0.3,
      filename: "edubits.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0b0c10"
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait"
      }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <>
      <div className="top-actions">
        {/* <button className="btn btn-primary" onClick={toggleTheme}>
          Toggle Theme
        </button> */}

        <button className="btn btn-danger" onClick={exportPDF}>
          Export PDF
        </button>
      </div>

      <div className="app-container">
        <h1 className="main-title">SGPA + CGPA Calculator</h1>

        <SGPA setSgpaList={setSgpaList} />

        <CGPA 
          sgpaList={sgpaList} 
          removeSGPA={removeSGPA} 
        />
      </div>
    </>
  );
}