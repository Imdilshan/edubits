import { useState } from "react";
import { clamp } from "../../utils/helpers";
import "./cgpa.css";


export default function CGPA({ sgpaList, removeSGPA }) {
  const [manualSems, setManualSems] = useState([
    { sgpa: "", credits: "" },
  ]);

  const [result, setResult] = useState(null);

  const addManual = () => {
    setManualSems([...manualSems, { sgpa: "", credits: "" }]);
  };

  const deleteManual = (index) => {
    setManualSems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleManualChange = (index, field, value) => {
    const updated = [...manualSems];
    updated[index][field] = value;
    setManualSems(updated);
  };

  const allSemesters = [
  ...sgpaList.map((s) => ({ ...s, auto: true })),
  ...manualSems.map((s, i) => ({
    ...s,
    auto: false,
    originalIndex: i
  })),
];

  const calculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    allSemesters.forEach((sem) => {
      const sgpa = clamp(Number(sem.sgpa), 0, 10);
      const credits = clamp(Number(sem.credits), 0, 50);

      totalPoints += sgpa * credits;
      totalCredits += credits;
    });

    if (totalCredits === 0) {
      setResult("Invalid input");
      return;
    }

    const cgpa = (totalPoints / totalCredits).toFixed(2);
    setResult(cgpa);
  };

  return (
    <div className="card cgpa-card">
      <h2 className="card-title">CGPA Calculator</h2>

      {allSemesters.map((sem) => {
        const isAuto = sem.auto;

        return (
          <div
            className="cgpa-row"
            key={
              isAuto
                ? `auto-${sem.originalIndex}`
                : `manual-${sem.originalIndex}`
            }
          >
            {/* SGPA */}
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="SGPA"
              value={sem.sgpa}
              readOnly={isAuto}
              onChange={(e) =>
                !isAuto &&
                handleManualChange(
                  sem.originalIndex,
                  "sgpa",
                  e.target.value
                )
              }
            />

            {/* Credits */}
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              placeholder="Credits"
              value={sem.credits}
              readOnly={isAuto}
              onChange={(e) =>
                !isAuto &&
                handleManualChange(
                  sem.originalIndex,
                  "credits",
                  e.target.value
                )
              }
            />

            {/* Ghost column */}
            <div className="ghost-field"></div>

            {/* Delete */}
            <button
              className="btn btn-danger"
              onClick={() => {
                if (isAuto) {
                  removeSGPA(sem.id);
                } else {
                  deleteManual(sem.originalIndex);
                }
              }}
            >
              Delete
            </button>
          </div>
        );
      })}

      <div className="cgpa-actions">
        <button className="btn btn-primary" onClick={addManual}>
          + Add Previous Semester
        </button>

        <button className="btn btn-success" onClick={calculateCGPA}>
          Calculate CGPA
        </button>
      </div>

      {result && (
        <div className="result">
          CGPA: <strong>{result}</strong>
        </div>
      )}
    </div>
  );
}
