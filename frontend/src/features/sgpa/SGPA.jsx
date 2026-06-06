import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "./sgpa.css";
import { ArrowRight } from "lucide-react";

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const gradeOptions = [
  { value: 10, label: "A+", points: 10 },
  { value: 9,  label: "A",  points: 9  },
  { value: 8,  label: "B+", points: 8  },
  { value: 7,  label: "B",  points: 7  },
  { value: 6,  label: "C+", points: 6  },
  { value: 5,  label: "C",  points: 5  },
  { value: 4,  label: "D",  points: 4  },
  { value: 0,  label: "F", points: 0 },
];

const EXAMPLE_SUBJECTS = [
  { name: "Data Structures", credit: "4", grade: 9 },
  { name: "DBMS",            credit: "3", grade: 8 },
  { name: "Computer Networks", credit: "3", grade: 7 },
];

function computeSGPA(subjects) {
  let totalPoints = 0;
  let totalCredits = 0;
  subjects.forEach((sub) => {
    const credit = clamp(Number(sub.credit), 0, 10);
    const grade = Number(sub.grade);
    if (!isNaN(credit) && !isNaN(grade) && sub.grade !== "") {
      totalPoints += credit * grade;
      totalCredits += credit;
    }
  });
  if (totalCredits === 0) return null;
  return parseFloat((totalPoints / totalCredits).toFixed(2));
}

function SGPADisplay({ value, animate }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === null) { setDisplayed(null); return; }
    const start = prevRef.current ?? value;
    prevRef.current = value;
    if (start === value) { setDisplayed(value); return; }
    let frame;
    let startTime = null;
    const duration = 600;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const prog = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      const cur = parseFloat((start + (value - start) * eased).toFixed(2));
      setDisplayed(cur);
      if (prog < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  if (displayed === null) return null;

  const rating =
    displayed >= 9   ? { label: "Outstanding",   cls: "grade-outstanding" } :
    displayed >= 8   ? { label: "Excellent",      cls: "grade-excellent"   } :
    displayed >= 7   ? { label: "Good",           cls: "grade-good"        } :
    displayed >= 6   ? { label: "Average",        cls: "grade-average"     } :
                       { label: "Needs work",     cls: "grade-poor"        };

  return (
    <div className={`sgpa-result-card ${animate ? "result-pop" : ""}`}>
      <div className="result-row">
        <div className="result-main">
          <span className="result-label">SGPA</span>
          <span className={`result-value ${rating.cls}`}>{displayed.toFixed(2)}</span>
        </div>
        <span className={`result-badge ${rating.cls}`}>{rating.label}</span>
      </div>
      <div className="result-bar-wrap">
        <div className="result-bar-track">
          <div
            className={`result-bar-fill ${rating.cls}`}
            style={{ width: `${(displayed / 10) * 100}%` }}
          />
        </div>
        <span className="result-bar-max">/ 10</span>
      </div>
    </div>
  );
}

export default function SGPA({ setSgpaList }) {
  // const [isExample, setIsExample] = useState(false);
  // const [subjects, setSubjects] = useState(() => {
  //   try {
  //     const saved = localStorage.getItem("subjects");
  //     if (saved) return JSON.parse(saved);
  //   } catch {}
  //   return [{ name: "", credit: "", grade: "" }];
  // });

  const [isExample, setIsExample] = useState(() => {
  try {
    return !localStorage.getItem("subjects");
  } catch { return true; }
});
const [subjects, setSubjects] = useState(() => {
  try {
    const saved = localStorage.getItem("subjects");
    if (saved) return JSON.parse(saved);
  } catch {}
  return EXAMPLE_SUBJECTS;
});


  const [saved, setSaved] = useState(false);
  const [animResult, setAnimResult] = useState(false);
  const prevSGPA = useRef(null);

  const liveResult = computeSGPA(subjects);

  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
    if (liveResult !== prevSGPA.current) {
      setAnimResult(true);
      const t = setTimeout(() => setAnimResult(false), 700);
      prevSGPA.current = liveResult;
      return () => clearTimeout(t);
    }
  }, [subjects]);

  const loadExample = () => {
    setSubjects(EXAMPLE_SUBJECTS);
    setIsExample(true);
    setSaved(false);
  };

  const clearExample = () => {
    setSubjects([{ name: "", credit: "", grade: "" }]);
    setIsExample(false);
  };

  const addSubject = () => {
    setIsExample(false);
    setSubjects((prev) => [...prev, { name: "", credit: "", grade: "8" }]);
  };

  const deleteSubject = (index) => {
    setSubjects((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [{ name: "", credit: "", grade: "8" }] : next;
    });
    setIsExample(false);
  };

  const handleChange = (index, field, value) => {
    setIsExample(false);
    setSubjects((prev) =>
      prev.map((sub, i) => {
        if (i !== index) return sub;
        if (field === "name") return { ...sub, name: value };
        if (field === "grade") return { ...sub, grade: value };
        if (value === "") return { ...sub, credit: "" };
        const num = Number(value);
        if (isNaN(num) || num < 0 || num > 10) return sub;
        return { ...sub, credit: String(num) };
      })
    );
  };

  const saveSemester = () => {
    if (!liveResult) return;
    const totalCredits = subjects.reduce((acc, s) => acc + clamp(Number(s.credit), 0, 10), 0);
    setSgpaList((prev) => [
      ...prev,
      {
        id: Date.now(),
        sgpa: liveResult,
        credits: totalCredits,
        label: `Semester ${prev.length + 1}`,
      },
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAll = () => {
    setSubjects([{ name: "", credit: "", grade: "" }]);
    setIsExample(false);
    localStorage.removeItem("subjects");
  };

  const formatGradeOption = (opt) => (
    <div className="grade-option">
      <span>{opt.label}</span>
      <span className="grade-points">{opt.points} pts</span>
    </div>
  );

  const isEmpty = subjects.every(s => !s.name && !s.credit && s.grade === "");

  return (
    <div className="card sgpa-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">SGPA Calculator</h2>
          <p className="card-hint">Enter your subjects, credits, and grades to calculate instantly.</p>
        </div>
      </div>

      {isExample && (
        <div className="example-banner">
          <span>Showing example data</span>
          <button className="btn-ghost-small" onClick={clearExample}>Clear example</button>
        </div>
      )}

      <div className="subjects-table-head">
        <span>Subject</span>
        <span>Credits</span>
        <span>Grade</span>
        <span></span>
      </div>

      {subjects.map((sub, index) => (
        <div className="sgpa-row" key={index}>
          <input
            className="input"
            placeholder="e.g. Data Structures"
            value={sub.name}
            onChange={(e) => handleChange(index, "name", e.target.value)}
          />
          <input
            className="input"
            type="number"
            min="0"
            max="10"
            step="1"
            placeholder="3 or 4"
            value={sub.credit ?? ""}
            onChange={(e) => handleChange(index, "credit", e.target.value)}
          />
          <Select
            options={gradeOptions}
            value={gradeOptions.find((opt) => opt.value === Number(sub.grade)) || null}
            onChange={(selected) =>
              handleChange(index, "grade", selected ? selected.value : "")
            }
            placeholder="Select grade"
            formatOptionLabel={formatGradeOption}
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <button
            className="btn-icon-delete"
            onClick={() => deleteSubject(index)}
            title="Remove subject"
            aria-label="Delete subject"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="sgpa-actions">
        <button className="btn btn-primary" onClick={addSubject}>+ Add Subject</button>
        <button className="btn btn-save" onClick={saveSemester} disabled={!liveResult}>
          {saved ? "✓ Saved to CGPA" : "Save Semester"}
        </button>
        <button className="btn btn-outline-danger" onClick={clearAll}>Clear All</button>
      </div>

      {liveResult !== null && (
        <SGPADisplay value={liveResult} animate={animResult} />
      )}
    </div>
  );
}