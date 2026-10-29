import { useState, useEffect, useRef } from "react";
import "./cgpa.css";
import { Trash2, Plus, Calculator, RotateCcw, X, BarChart2, Eraser } from "lucide-react";

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

function BarChart({ data }) {
  if (!data || data.length === 0) return null;

  const W = 700;
  const H = 220;
  const PAD_L = 48;
  const PAD_R = 16;
  const PAD_T = 24;
  const PAD_B = 40;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const maxVal = 10;
  const barW = Math.min(52, (chartW / data.length) * 0.55);
  const gap = chartW / data.length;

  const yTicks = [0, 2, 4, 6, 8, 10];

  const barColor = (v) =>
    v >= 9 ? "var(--success)" :
    v >= 8 ? "var(--success)" :
    v >= 7 ? "var(--primary)" :
    v >= 6 ? "var(--warning)" : "var(--danger)";

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className="bar-chart-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {yTicks.map((t) => {
        const y = PAD_T + chartH - (t / 10) * (H - 24 - 40);
        return (
          <g key={t}>
            <line
              x1={48} y1={y} x2={W - 16} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            />
            <text
              x={40} y={y + 4}
              textAnchor="end" fontSize="11"
              fill="rgba(255,255,255,0.3)"
            >{t}</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const maxVal = 10;
        const chartH = 220 - 24 - 40;
        const chartW = 700 - 48 - 16;
        const barW = Math.min(52, (chartW / data.length) * 0.55);
        const gap = chartW / data.length;
        const bh = (d.sgpa / 10) * chartH;
        const x = 48 + gap * i + gap / 2 - barW / 2;
        const y = 24 + chartH - bh;
        const color = barColor(d.sgpa);

        return (
          <g key={i}>
            <rect
              x={x + 2} y={y + 4}
              width={barW} height={bh}
              rx="5" fill={color} opacity="0.12"
            />
            <rect
              x={x} y={y}
              width={barW} height={bh}
              rx="5" fill={color} opacity="0.85"
            />
            <text
              x={x + barW / 2} y={y - 7}
              textAnchor="middle" fontSize="11"
              fontWeight="600" fill={color}
            >{d.sgpa.toFixed(2)}</text>
            <text
              x={x + barW / 2} y={24 + chartH + 18}
              textAnchor="middle" fontSize="11"
              fill="rgba(255,255,255,0.4)"
            >{d.label}</text>
          </g>
        );
      })}

      <line
        x1={48} y1={24 + (220 - 24 - 40)}
        x2={700 - 16} y2={24 + (220 - 24 - 40)}
        stroke="rgba(255,255,255,0.1)" strokeWidth="1"
      />
      <line
        x1={48} y1={24}
        x2={48} y2={24 + (220 - 24 - 40)}
        stroke="rgba(255,255,255,0.1)" strokeWidth="1"
      />
    </svg>
  );
}

function Insight({ history }) {
  if (!history || history.length === 0) return null;
  const vals = history.map((h) => h.sgpa);
  const last = vals[vals.length - 1];
  const prev = vals[vals.length - 2];
  const trend =
    vals.length >= 3 &&
    vals[vals.length - 1] > vals[vals.length - 2] &&
    vals[vals.length - 2] > vals[vals.length - 3];

  let msg = "";
  if (trend) msg = "Consistent upward trend — keep going.";
  else if (prev !== undefined && last > prev) msg = `Up +${(last - prev).toFixed(2)} from last semester.`;
  else if (prev !== undefined && last < prev) msg = `Down ${(prev - last).toFixed(2)} from last semester.`;
  else if (last === Math.max(...vals)) msg = "Best semester so far.";

  if (!msg) return null;
  return <p className="insight-text">{msg}</p>;
}

function TargetSimulator() {
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem("simForm");
      return saved ? JSON.parse(saved) : {
        currentCGPA: "7.8",
        completedCredits: "80",
        targetCGPA: "8.2",
        nextCredits: "22",
      };
    } catch {
      return {
        currentCGPA: "7.8",
        completedCredits: "80",
        targetCGPA: "8.2",
        nextCredits: "22",
      };
    }
  });

  const [result, setResult] = useState(null);

  const set = (k, v) => setForm((f) => {
    const next = { ...f, [k]: v };
    localStorage.setItem("simForm", JSON.stringify(next));
    return next;
  });

  const calculate = () => {
    const cc = parseFloat(form.currentCGPA);
    const tc = parseFloat(form.completedCredits);
    const tg = parseFloat(form.targetCGPA);
    const nc = parseFloat(form.nextCredits);
    if ([cc, tc, tg, nc].some(isNaN) || tc <= 0 || nc <= 0) {
      setResult({ error: "Please fill all fields with valid numbers." });
      return;
    }
    const required = (tg * (tc + nc) - cc * tc) / nc;
    setResult({ required: parseFloat(required.toFixed(2)) });
  };

  const getInsight = (req) => {
    if (req > 10) return { text: "Target not achievable — consider a revised goal.", cls: "insight-hard" };
    if (req >= 9.5) return { text: "Very ambitious — requires near-perfect performance.", cls: "insight-hard" };
    if (req >= 8.5) return { text: "Challenging but achievable with focused effort.", cls: "insight-medium" };
    if (req >= 7.5) return { text: "Achievable with consistent performance.", cls: "insight-easy" };
    return { text: "Very achievable — you have room to breathe.", cls: "insight-easy" };
  };

  return (
    <div className="simulator-card card card-panel">
      <div className="card-header">
        <div>
          <h3 className="text-headline">CGPA Predictor</h3>
          <p className="text-body-sm" style={{ color: "var(--muted)" }}>Find out the SGPA required to achieve your target CGPA.</p>
        </div>
      </div>

      <div className="sim-grid">
        <div className="sim-field">
          <label className="form-label">Current CGPA</label>
          <input className="form-input" type="number" step="0.01" min="0" max="10"
            placeholder="e.g. 7.8" value={form.currentCGPA || ""}
            onChange={(e) => set("currentCGPA", e.target.value)} />
        </div>
        <div className="sim-field">
          <label className="form-label">Completed Credits</label>
          <input className="form-input" type="number" step="1" min="0"
            placeholder="e.g. 80" value={form.completedCredits || ""}
            onChange={(e) => set("completedCredits", e.target.value)} />
        </div>
        <div className="sim-field">
          <label className="form-label">Target CGPA</label>
          <input className="form-input" type="number" step="0.01" min="0" max="10"
            placeholder="e.g. 8.2" value={form.targetCGPA || ""}
            onChange={(e) => set("targetCGPA", e.target.value)} />
        </div>
        <div className="sim-field">
          <label className="form-label">Next Semester Credits</label>
          <input className="form-input" type="number" step="1" min="0"
            placeholder="e.g. 22" value={form.nextCredits || ""}
            onChange={(e) => set("nextCredits", e.target.value)} />
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: "var(--space-sm)" }} onClick={calculate}>
        <Calculator size={16} /> Calculate Required SGPA
      </button>

      {result && (
        <div className="sim-result card card-mini">
          {result.error ? (
            <p className="sim-error" style={{ color: "var(--danger)", margin: 0 }}>{result.error}</p>
          ) : (
            <>
              <div className="sim-result-row">
                <span className="sim-result-label">Required SGPA</span>
                <span className={`sim-result-value ${result.required > 10 ? "sim-impossible" : ""}`}>
                  {result.required > 10 ? "Not possible" : result.required.toFixed(2)}
                </span>
              </div>
              {result.required <= 10 && (
                <p className={`sim-insight ${getInsight(result.required).cls}`}>
                  {getInsight(result.required).text}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function CGPA({ sgpaList, removeSGPA }) {
  const [manualSems, setManualSems] = useState(() => {
    try {
      const saved = localStorage.getItem("manualSems");
      return saved ? JSON.parse(saved) : [
        { sgpa: "7.2", credits: "21" },
        { sgpa: "8.4", credits: "22" },
      ];
    } catch {
      return [
        { sgpa: "7.2", credits: "21" },
        { sgpa: "8.4", credits: "22" },
      ];
    }
  });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("semHistory") || "[]"); }
    catch { return []; }
  });
  const [animResult, setAnimResult] = useState(false);
  const prevCGPA = useRef(null);

  useEffect(() => {
    localStorage.setItem("manualSems", JSON.stringify(manualSems));
  }, [manualSems]);

  useEffect(() => {
    localStorage.setItem("semHistory", JSON.stringify(history));
  }, [history]);

  const addManual = () =>
    setManualSems((p) => [...p, { sgpa: "", credits: "" }]);

  const deleteManual = (i) =>
    setManualSems((p) => {
      const next = p.filter((_, idx) => idx !== i);
      return next.length === 0 ? [{ sgpa: "", credits: "" }] : next;
    });

  const handleManualChange = (i, field, val) =>
    setManualSems((p) => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const allSemesters = [
    ...manualSems.map((s, i) => ({ ...s, auto: false, originalIndex: i, label: `Sem ${i + 1}` })),
    ...sgpaList.map((s, i) => ({ ...s, auto: true, label: `Sem ${manualSems.length + i + 1}` })),
  ];

  const calculateCGPA = () => {
    let totalPoints = 0, totalCredits = 0;
    allSemesters.forEach((sem) => {
      const sgpa    = clamp(Number(sem.sgpa), 0, 10);
      const credits = clamp(Number(sem.credits), 0, 200);
      if (sgpa > 0 && credits > 0) {
        totalPoints  += sgpa * credits;
        totalCredits += credits;
      }
    });
    if (totalCredits === 0) { setResult("invalid"); return; }

    const cgpa = parseFloat((totalPoints / totalCredits).toFixed(2));
    setResult(cgpa);

    if (cgpa !== prevCGPA.current) {
      setAnimResult(true);
      setTimeout(() => setAnimResult(false), 700);
      prevCGPA.current = cgpa;
    }

    const newHistory = allSemesters
      .filter((s) => Number(s.sgpa) > 0 && Number(s.credits) > 0)
      .map((s, i) => ({
        label: s.label || `Sem ${i + 1}`,
        sgpa: parseFloat(Number(s.sgpa).toFixed(2)),
      }));
    setHistory(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("semHistory");
  };

  const cgpaRating =
    !result || result === "invalid" ? null :
    result >= 9 ? "Outstanding" :
    result >= 8 ? "Excellent"   :
    result >= 7 ? "Good"        :
    result >= 6 ? "Average"     : "Needs work";

  return (
    <div className="cgpa-outer">
      <div className="cgpa-card card card-panel">
        <div className="card-header">
          <div>
            <h2 className="text-headline">Add SGPA and total credits for each semester</h2>
          </div>
        </div>

        <div className="cgpa-table-head">
          <span>Semester</span>
          <span>SGPA</span>
          <span>Credits</span>
          <span></span>
        </div>

        {allSemesters.map((sem) => {
          const isAuto = sem.auto;
          return (
            <div
              className="cgpa-row"
              key={isAuto ? `auto-${sem.id}` : `manual-${sem.originalIndex}`}
            >
              <span className="cgpa-sem-label">{sem.label}</span>

              <input
                className="form-input"
                type="number" min="0" max="10" step="0.01"
                placeholder="SGPA"
                value={sem.sgpa}
                readOnly={isAuto}
                onChange={(e) =>
                  !isAuto && handleManualChange(sem.originalIndex, "sgpa", e.target.value)
                }
              />

              <input
                className="form-input"
                type="number"
                min="0"
                step="1"
                placeholder="Credits"
                value={sem.credits}
                readOnly={isAuto}
                onChange={(e) =>
                  !isAuto && handleManualChange(sem.originalIndex, "credits", e.target.value)
                }
              />

              <button
                className="btn-icon-delete"
                onClick={() => isAuto ? removeSGPA(sem.id) : deleteManual(sem.originalIndex)}
                title="Remove" aria-label="Remove semester"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}

        <div className="cgpa-actions flex gap-sm flex-wrap">
          <button className="btn btn-primary btn-add-semester" onClick={addManual}>
            <Plus size={16} /> Add Next Semester
          </button>
          <button className="btn btn-success" onClick={calculateCGPA}>
            <Calculator size={16} /> Calculate CGPA
          </button>
          <button className="btn btn-danger" onClick={() => {
            setManualSems([{ sgpa: "", credits: "" }]);
            setResult(null);
            setHistory([]);
            localStorage.removeItem("manualSems");
            localStorage.removeItem("semHistory");
          }}>
            <Eraser size={16} /> Clear All
          </button>
        </div>

        {result && (
          <div className={`cgpa-result-card card card-mini ${animResult ? "result-pop" : ""}`}>
            {result === "invalid" ? (
              <p className="cgpa-error" style={{ color: "var(--danger)", margin: 0 }}>
                Please enter valid SGPA and credits for at least one semester.
              </p>
            ) : (
              <>
                <div className="result-row">
                  <div className="result-main">
                    <span className="result-label">CGPA</span>
                    <span className={`result-value cgpa-grade-${cgpaRating?.toLowerCase().replace(" ", "-")}`}>
                      {result.toFixed(2)}
                    </span>
                  </div>
                  <span className={`result-badge cgpa-badge-${cgpaRating?.toLowerCase().replace(" ", "-")}`}>
                    {cgpaRating}
                  </span>
                </div>
                <Insight history={history} />
              </>
            )}
          </div>
        )}

        {history.length >= 1 && result && result !== "invalid" && (
          <div className="bar-chart-wrap card card-mini" style={{ marginTop: "var(--space-lg)" }}>
            <div className="bar-chart-header">
              <span className="bar-chart-title">SGPA per Semester</span>
              <button className="btn btn-tertiary btn-sm" onClick={clearHistory}>
                <RotateCcw size={14} /> Clear
              </button>
            </div>
            <BarChart data={history} />
          </div>
        )}

        <TargetSimulator />
      </div>
    </div>
  );
}
