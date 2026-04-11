import { useState, useEffect } from "react";
import { clamp } from "../../utils/helpers";

export default function SGPA({ setSgpaList }) {
  const [subjects, setSubjects] = useState(() => {
    try {
      const saved = localStorage.getItem("subjects");
      return saved ? JSON.parse(saved) : [{ name: "", credit: "", grade: "" }];
    } catch {
      return [{ name: "", credit: "", grade: "" }];
    }
  });

  const [result, setResult] = useState(null);

  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = () => {
    setSubjects((prev) => [...prev, { name: "", credit: "", grade: "" }]);
  };

  const deleteSubject = (index) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    setSubjects((prev) =>
      prev.map((sub, i) => {
        if (i !== index) return sub;
        if (field === "name" || field === "grade") return { ...sub, [field]: value };
        if (value === "") return { ...sub, [field]: "" };
        const num = Number(value);
        if (isNaN(num) || num < 0) return sub;
        if (field === "credit" && num > 10) return sub;
        return { ...sub, [field]: String(num) };
      })
    );
  };

  const calculateSGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach((sub) => {
      const credit = clamp(Number(sub.credit), 0, 10);
      const grade = Number(sub.grade);
      totalPoints += credit * grade;
      totalCredits += credit;
    });

    if (totalCredits === 0) {
      setResult("Invalid input");
      return;
    }

    const sgpa = (totalPoints / totalCredits).toFixed(2);
    setResult(sgpa);

    // Push to CGPA list using a unique ID based on time
    setSgpaList((prev) => [
      ...prev,
      { id: Date.now(), sgpa, credits: totalCredits },
    ]);
  };

  const clearSubjects = () => {
    setSubjects([{ name: "", credit: "", grade: "" }]);
    setResult(null);
    localStorage.removeItem("subjects");
  };

  return (
    <div className="card sgpa-card">
      <h2 className="card-title">SGPA Calculator</h2>

      {subjects.map((sub, index) => (
        <div className="sgpa-row" key={index}>
          <input
            className="input"
            placeholder="Subject Name"
            value={sub.name}
            onChange={(e) => handleChange(index, "name", e.target.value)}
          />
          <input
            className="input"
            type="number"
            min="0"
            max="10"
            step="1"
            placeholder="Credit"
            value={sub.credit ?? ""}
            onChange={(e) => handleChange(index, "credit", e.target.value)}
          />
          <select
            className="input"
            value={sub.grade}
            onChange={(e) => handleChange(index, "grade", e.target.value)}
          >
            <option value="">Grade</option>
            <option value="10">A+</option>
            <option value="9">A</option>
            <option value="8">B+</option>
            <option value="7">B</option>
            <option value="6">C+</option>
            <option value="5">C</option>
            <option value="4">D</option>
            <option value="0">E/F/I</option>
          </select>
          <button className="btn btn-danger" onClick={() => deleteSubject(index)}>
            Delete
          </button>
        </div>
      ))}

      <div className="sgpa-actions">
        <button className="btn btn-primary" onClick={addSubject}>+ Add Subject</button>
        <button className="btn btn-success" onClick={calculateSGPA}>Calculate SGPA</button>
        <button className="btn btn-danger" onClick={clearSubjects}>Clear All</button>
      </div>

      {result && (
        <div className="result">
          SGPA: <strong>{result}</strong>
        </div>
      )}
    </div>
  );
}
