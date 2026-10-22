import { useState, useRef } from "react";
import { getNum, validateAll } from "../../utils/marksUtils";

const S = {
  grid:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, alignItems:"start" },
  section: { padding:16, borderRadius:12, background:"var(--surface-2)", border:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:0 },
  h3:      { margin:"0 0 12px 0", fontSize:15, fontWeight:600, color:"var(--text)" },
  group:   { display:"flex", flexDirection:"column", gap:4, marginBottom:10 },
  label:   { display:"block", fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.5px", lineHeight:1.2 },
  input:   { display:"block", width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg)", color:"var(--text)", fontSize:14, fontFamily:"var(--font-sans)", outline:"none", WebkitTextFillColor:"var(--text)", transition:"border-color 0.15s" },
  hint:      { fontSize:11, color:"var(--text-tertiary)", marginTop:2 },
  errorHint: { fontSize:11, color:"var(--danger)", marginTop:2, fontWeight:600 },
  bottomBar: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20, gridColumn:"1 / -1" },
  btnReset:  { background:"var(--surface-3)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 20px", fontWeight:600, fontFamily:"var(--font-sans)", cursor:"pointer" },
  btnCalc:   { background:"var(--primary)", color:"var(--on-primary)", border:"none", borderRadius:8, padding:"10px 20px", fontWeight:600, fontFamily:"var(--font-sans)", cursor:"pointer" },
  btnCalcDisabled: { opacity:0.4, cursor:"not-allowed" },
  small:     { fontSize:13, color:"var(--muted)" },
  highlight: { fontWeight:600, fontSize:17, color:"var(--text)" },
  progress:  { height:8, background:"var(--bg)", borderRadius:8, marginTop:12, overflow:"hidden" },
  resultBox: { gridColumn:"1 / -1", marginTop:12, background:"var(--surface-2)", padding:"14px 16px", borderRadius:10 },
  resultRow: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", color:"var(--text-secondary)", fontSize:14, borderTop:"1px solid var(--border)" },
};

if (typeof document !== "undefined" && !document.getElementById("shake-style")) {
  const el = document.createElement("style");
  el.id = "shake-style";
  el.textContent = `@keyframes im-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
  document.head.appendChild(el);
}

function Field({ id, label, max, value, onChange }) {
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const shake = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.animation = "none";
    el.offsetHeight;
    el.style.animation = "im-shake 0.35s ease";
    setTimeout(() => { if (el) el.style.animation = "none"; }, 380);
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === "") { setError(""); onChange(""); return; }
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    if (num < 0) { setError("Min marks: 0"); shake(); return; }
    if (num > max) {
      setError(`Max marks: ${max}`);
      shake();
      onChange(String(max));
      setTimeout(() => setError(""), 1500);
      return;
    }
    setError("");
    onChange(raw);
  };

  const handleKeyDown = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) { e.preventDefault(); return; }
    const currentVal = parseFloat(value || "0");
    if (!isNaN(currentVal) && currentVal >= max && /^\d$/.test(e.key)) {
      e.preventDefault();
      setError(`Max is ${max}`);
      shake();
      setTimeout(() => setError(""), 1200);
    }
  };

  return (
    <div style={S.group}>
      <label htmlFor={id} style={S.label}>{label} (out of {max})</label>
      <input
        ref={inputRef}
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        max={max}
        step="0.5"
        placeholder={`0 – ${max}`}
        value={value}
        style={{ ...S.input, borderColor: error ? "var(--danger)" : "var(--border)" }}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => { e.target.style.borderColor = error ? "var(--danger)" : "var(--primary-focus)"; e.target.style.background = "var(--surface-2)"; }}
        onBlur={(e)  => { e.target.style.borderColor = error ? "var(--danger)" : "var(--border)"; e.target.style.background = "var(--bg)"; }}
      />
      {error && <span style={S.errorHint}>⚠ {error}</span>}
    </div>
  );
}

// ── 1st Year Hybrid ───────────────────────────────────────────────────────────
// PracticalEvals 40→20, Attendance 2→2, MST1 20→5, MST2 20→5,
// PA1 30→7.5, PA2 30→7.5, PA3/Project 30→7.5, CaseStudy 20→5,
// PracticalMidTerm 30→7.5, SurpriseOrQuiz 12→3, Assignment 12→5,
// EndTermTheory 60→25 (optional). Total w/o ET=75, with=100.
function HybridFirstYear() {
  const [data, setData]     = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const limits = {
    h1_praceval:40, h1_attendance:2, h1_mst1:20, h1_mst2:20,
    h1_pa1:30, h1_pa2:30, h1_pa3:30, h1_casestudy:20,
    h1_pmidterm:30, h1_surprise:12, h1_assignment:12, h1_endtheory:60,
  };

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setErrors({}); setResult(null); };

  const calculate = () => {
    const { ok, errors } = validateAll(data, limits);
    setErrors(errors);
    if (!ok) return;

    const g = (k, max) => getNum(data[k], max);
    const etProvided = data.h1_endtheory !== "" && data.h1_endtheory !== undefined;
    const et = Number(data.h1_endtheory || 0);

    const internal =
      g("h1_praceval",   40) / 40 * 20 +
      g("h1_attendance",  2) / 2  * 2  +
      g("h1_mst1",       20) / 20 * 5  +
      g("h1_mst2",       20) / 20 * 5  +
      g("h1_pa1",        30) / 30 * 7.5 +
      g("h1_pa2",        30) / 30 * 7.5 +
      g("h1_pa3",        30) / 30 * 7.5 +
      g("h1_casestudy",  20) / 20 * 5  +
      g("h1_pmidterm",   30) / 30 * 7.5 +
      g("h1_surprise",   12) / 12 * 3  +
      g("h1_assignment", 12) / 12 * 5;
    const internalMax = 75;

    const external = etProvided ? et / 60 * 25 : 0;
    const externalMax = etProvided ? 25 : 0;

    const total    = internal + external;
    const totalMax = internalMax + externalMax;

    setResult({
      internal, internalMax, internalPct: (internal / internalMax) * 100,
      external, externalMax,
      total, totalMax, pct: (total / totalMax) * 100,
    });
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const leftFields = [
    ["h1_praceval",   "Practical Evaluations",           40],
    ["h1_attendance", "Attendance Marks",                 2],
    ["h1_mst1",       "MST-1 Hybrid",                   20],
    ["h1_mst2",       "MST-2 Hybrid",                   20],
    ["h1_pa1",        "Practical Assessment-1",          30],
    ["h1_pa2",        "Practical Assessment-2",          30],
  ];

  const rightFields = [
    ["h1_pa3",        "Practical Assessment-3 / Project",30],
    ["h1_casestudy",  "Case Study / Course Project",     20],
    ["h1_pmidterm",   "Practical Mid Term",              30],
    ["h1_surprise",   "Surprise Test or Quiz",           12],
    ["h1_assignment", "Assignment Mark",                 12],
    ["h1_endtheory",  "End Term Theory Exam",            60],
  ];

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Theory &amp; Practical Components</h3>
        {leftFields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
      </div>

      <div className="internal-calc-section">
        <h3 style={S.h3}>&nbsp;</h3>
        {rightFields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
        <p style={{ ...S.hint, marginTop:4 }}>End Term Theory is optional — leave blank for internal-only result.</p>
      </div>

      {result && (
        <div style={S.resultBox}>
          <div style={{ ...S.resultRow, borderTop:"none" }}>
            <span style={S.small}>Internal (75)</span>
            <span style={{ color:"var(--text)" }}>{result.internal.toFixed(2)} / {result.internalMax} ({result.internalPct.toFixed(1)}%)</span>
          </div>
          {result.externalMax > 0 && (
            <div style={S.resultRow}>
              <span style={S.small}>External Theory (25)</span>
              <span style={{ color:"var(--text)" }}>{result.external.toFixed(2)} / {result.externalMax}</span>
            </div>
          )}
          <div style={S.resultRow}>
            <span style={S.highlight}>Final</span>
            <span style={S.highlight}>{result.total.toFixed(2)} / {result.totalMax}</span>
          </div>
          <div style={S.resultRow}>
            <span style={S.highlight}>Final %</span>
            <span style={S.highlight}>{result.pct.toFixed(2)}%</span>
          </div>
          <div style={S.progress}>
            <div style={{ width:`${result.pct}%`, height:"100%", background:"var(--primary)", borderRadius:8, transition:"width 0.45s ease" }} />
          </div>
        </div>
      )}

      <div style={S.bottomBar}>
        <button style={S.btnReset} onClick={reset}>Reset</button>
        <button
          style={{ ...S.btnCalc, ...(hasErrors ? S.btnCalcDisabled : {}) }}
          onClick={calculate}
          disabled={hasErrors}
        >
          Calculate Hybrid
        </button>
      </div>
    </div>
  );
}

// ── Senior Hybrid (2nd/3rd/4th Year) — unchanged logic ───────────────────────
function HybridSenior() {
  const [data, setData]     = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const limits = {
    hy_assignment:10, hy_mst1:20, hy_mst2:20, hy_surprise:12,
    hy_quiz:4, hy_classperf:10, hy_attendance:2, hy_endwritten:60,
    hy_ws1:30, hy_ws2:30, hy_ws3:30, hy_ws4:30,
    hy_miniproject:5, hy_industry:10, hy_endpractical:40,
  };

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setErrors({}); setResult(null); };

  const calculate = () => {
    const { ok, errors } = validateAll(data, limits);
    setErrors(errors);
    if (!ok) return;

    const g = (k, max) => getNum(data[k], max);
    const ewProvided = data.hy_endwritten  !== "" && data.hy_endwritten  !== undefined;
    const epProvided = data.hy_endpractical !== "" && data.hy_endpractical !== undefined;
    const ew = Number(data.hy_endwritten   || 0);
    const ep = Number(data.hy_endpractical || 0);

    const theory =
      g("hy_mst1",      20) / 20 * 5 + g("hy_mst2",     20) / 20 * 5 +
      g("hy_classperf", 10) / 10 * 5 + g("hy_assignment",10) / 10 * 2 +
      g("hy_quiz",       4) / 4  * 2 + g("hy_surprise",  12) / 12 * 2 +
      g("hy_attendance", 2) / 2  * 2 + (ewProvided ? ew / 60 * 30 : 0);
    const theoryMax = ewProvided ? 53 : 23;

    const practical =
      g("hy_ws1", 30) / 30 * 5 + g("hy_ws2",30) / 30 * 5 +
      g("hy_ws3", 30) / 30 * 5 + g("hy_ws4",30) / 30 * 5 +
      g("hy_miniproject", 5) / 5 * 2 + g("hy_industry",10) / 10 * 5 +
      (epProvided ? ep / 40 * 20 : 0);
    const practicalMax = epProvided ? 47 : 27;

    const total    = theory + practical;
    const totalMax = theoryMax + practicalMax;

    setResult({
      theory, theoryMax, theoryPct: (theory / theoryMax) * 100,
      practical, practicalMax, practicalPct: (practical / practicalMax) * 100,
      total, totalMax, pct: (total / totalMax) * 100,
    });
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const theoryFields = [
    ["hy_assignment", "Assignment",           10],
    ["hy_mst1",       "MST 1",               20],
    ["hy_mst2",       "MST 2",               20],
    ["hy_surprise",   "Surprise Test",        12],
    ["hy_quiz",       "Quiz",                  4],
    ["hy_classperf",  "Class Performance",    10],
    ["hy_attendance", "Attendance",            2],
    ["hy_endwritten", "End Sem Written",      60],
  ];

  const practicalFields = [
    ["hy_ws1",         "Experiment 1",                  30],
    ["hy_ws2",         "Experiment 2",                  30],
    ["hy_ws3",         "Experiment 3",                  30],
    ["hy_ws4",         "Experiment 4",                  30],
    ["hy_miniproject", "Course Project",                 5],
    ["hy_industry",    "Industry Aligned Assessment",   10],
    ["hy_endpractical","End Sem Practical",             40],
  ];

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Theory Component</h3>
        {theoryFields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
      </div>

      <div className="internal-calc-section">
        <h3 style={S.h3}>Practical Component</h3>
        {practicalFields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
      </div>

      {result && (
        <div style={S.resultBox}>
          <div style={{ ...S.resultRow, borderTop:"none" }}>
            <span style={S.small}>Theory</span>
            <span style={{ color:"var(--text)" }}>{result.theory.toFixed(2)} / {result.theoryMax} ({result.theoryPct.toFixed(1)}%)</span>
          </div>
          <div style={S.resultRow}>
            <span style={S.small}>Practical</span>
            <span style={{ color:"var(--text)" }}>{result.practical.toFixed(2)} / {result.practicalMax} ({result.practicalPct.toFixed(1)}%)</span>
          </div>
          <div style={S.resultRow}>
            <span style={S.highlight}>Final</span>
            <span style={S.highlight}>{result.total.toFixed(2)} / {result.totalMax}</span>
          </div>
          <div style={S.resultRow}>
            <span style={S.highlight}>Final %</span>
            <span style={S.highlight}>{result.pct.toFixed(2)}%</span>
          </div>
          <div style={S.progress}>
            <div style={{ width:`${result.pct}%`, height:"100%", background:"var(--primary)", borderRadius:8, transition:"width 0.45s ease" }} />
          </div>
        </div>
      )}

      <div style={S.bottomBar}>
        <button style={S.btnReset} onClick={reset}>Reset</button>
        <button
          style={{ ...S.btnCalc, ...(hasErrors ? S.btnCalcDisabled : {}) }}
          onClick={calculate}
          disabled={hasErrors}
        >
          Calculate Hybrid
        </button>
      </div>
    </div>
  );
}


// ── 3rd Year Hybrid (CSE) ─────────────────────────────────────────────────────────
// Practical Evaluations          40 → 20
// End Term Hybrid Theory         60 → 30
// Attendance Marks               2  → 2
// Surprise Test                  12 → 4
// Practical MST                  10 → 4
// 10 Practical Worksheet/Projects (each 30 → 2) = 20 total
// Quiz                           4  → 4
// Assignment/PBL                 10 → 6
// MST-1 Hybrid                   20 → 5
// MST-2 Hybrid                   20 → 5
// Total: 100 weighted marks (70 internal + 30 optional End Term)
function HybridThirdYearCSE({ program, year }) {
  const [data, setData]     = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const limits = {
    hyb_praceval:40, hyb_endtheory:60, hyb_attendance:2, hyb_surprise:12,
    hyb_pmst:10,
    hyb_ws1:30, hyb_ws2:30, hyb_ws3:30, hyb_ws4:30,
    hyb_ws5:30, hyb_ws6:30, hyb_ws7:30, hyb_ws8:30,
    hyb_ws9:30, hyb_ws10:30,
    hyb_quiz:4, hyb_assignment:10,
    hyb_mst1:20, hyb_mst2:20,
  };

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setErrors({}); setResult(null); };

  const calculate = () => {
    const { ok, errors } = validateAll(data, limits);
    setErrors(errors);
    if (!ok) return;

    const g = (k, max) => getNum(data[k], max);
    const evalProvided = data.hyb_praceval !== "" && data.hyb_praceval !== undefined;
    const endtheoryProvided = data.hyb_endtheory !== "" && data.hyb_endtheory !== undefined;
    const practicalEvaluations = evalProvided ? g("hyb_praceval", 40) / 40 * 20 : 0;
    const endtheory = endtheoryProvided ? g("hyb_endtheory", 60) / 60 * 30 : 0;

    // The remaining non-optional components add up to 50 weighted marks.
    const internal = (
      g("hyb_attendance", 2) / 2 * 2 +
      g("hyb_mst1", 20) / 20 * 5 +
      g("hyb_mst2", 20) / 20 * 5 +
      g("hyb_assignment", 10) / 10 * 6 +
      g("hyb_ws1", 30) / 30 * 2 +
      g("hyb_ws2", 30) / 30 * 2 +
      g("hyb_ws3", 30) / 30 * 2 +
      g("hyb_ws4", 30) / 30 * 2 +
      g("hyb_ws5", 30) / 30 * 2 +
      g("hyb_ws6", 30) / 30 * 2 +
      g("hyb_ws7", 30) / 30 * 2 +
      g("hyb_ws8", 30) / 30 * 2 +
      g("hyb_ws9", 30) / 30 * 2 +
      g("hyb_ws10", 30) / 30 * 2 +
      g("hyb_surprise", 12) / 12 * 4 +
      g("hyb_pmst", 10) / 10 * 4 +
      g("hyb_quiz", 4) / 4 * 4
    );

    const internalMax = 50 + (evalProvided ? 20 : 0);
    const total = internal + practicalEvaluations + endtheory;
    const totalMax = internalMax + (endtheoryProvided ? 30 : 0);

    setResult({
      internal: internal + practicalEvaluations, internalMax,
      internalPct: ((internal + practicalEvaluations) / internalMax) * 100,
      endtheory, endtheoryMax: endtheoryProvided ? 30 : 0,
      total, totalMax, pct: (total / totalMax) * 100,
    });
  };

  const _hasErrors = Object.values(errors).some(Boolean);

  const leftFields = [
    ["hyb_praceval",   "Practical Evaluations (optional)",40],
    ["hyb_attendance", "Attendance Marks",                 2],
    ["hyb_mst1",       "MST-1 Hybrid",                   20],
    ["hyb_mst2",       "MST-2 Hybrid",                   20],
    ["hyb_assignment", "Assignment / PBL",               10],
  ];

  const worksheetFields = [
    ["hyb_ws1",  "Worksheet/Project 1",  30],
    ["hyb_ws2",  "Worksheet/Project 2",  30],
    ["hyb_ws3",  "Worksheet/Project 3",  30],
    ["hyb_ws4",  "Worksheet/Project 4",  30],
    ["hyb_ws5",  "Worksheet/Project 5",  30],
    ["hyb_ws6",  "Worksheet/Project 6",  30],
    ["hyb_ws7",  "Worksheet/Project 7",  30],
    ["hyb_ws8",  "Worksheet/Project 8",  30],
    ["hyb_ws9",  "Worksheet/Project 9",  30],
    ["hyb_ws10", "Worksheet/Project 10", 30],
  ];

  const rightFields = [
    ["hyb_surprise",   "Surprise Test",          12],
    ["hyb_pmst",       "Practical MST",          10],
    ["hyb_quiz",       "Quiz",                    4],
    ["hyb_assignment", "Assignment / PBL",       10],
    ["hyb_mst1",       "MST-1 Hybrid",           20],
    ["hyb_mst2",       "MST-2 Hybrid",           20],
    ["hyb_endtheory",  "End Term Hybrid Theory (optional)", 60],
  ];
  const courseLabel = program === "ait"
    ? year === "3-aiml" ? "3rd Year AIT (AIML)" : "3rd Year AIT (Data Science)"
    : "3rd Year CSE";

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Practical Evaluations & Theory</h3>
        {leftFields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
      </div>

      <div className="internal-calc-section">
        <h3 style={S.h3}>Practical Worksheets / Projects (10 × 30 max → 2 weighted each)</h3>
        {worksheetFields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
      </div>

      <div className="internal-calc-section">
        <h3 style={S.h3}>Surprise Test, MSTs, Quiz, Assignment, End Term</h3>
        {rightFields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
        <p style={{ ...S.hint, marginTop:4 }}>Practical Evaluations and End Term Hybrid Theory are optional. Blank optional components are excluded from the available total.</p>
      </div>

      {result && (
        <div style={S.resultBox}>
          <div style={{ ...S.resultRow, borderTop:"none" }}>
            <span style={S.small}>Internal ({result.internalMax})</span>
            <span style={{ color:"var(--text)" }}>{result.internal.toFixed(2)} / {result.internalMax} ({result.internalPct.toFixed(1)}%)</span>
          </div>
          {result.endtheoryMax > 0 && (
            <div style={S.resultRow}>
              <span style={S.small}>End Term Hybrid Theory (30)</span>
              <span style={{ color:"var(--text)" }}>{result.endtheory.toFixed(2)} / {result.endtheoryMax}</span>
            </div>
          )}
          <div style={S.resultRow}>
            <span style={S.highlight}>Final</span>
            <span style={S.highlight}>{result.total.toFixed(2)} / {result.totalMax}</span>
          </div>
          <div style={S.resultRow}>
            <span style={S.highlight}>Final %</span>
            <span style={S.highlight}>{result.pct.toFixed(2)}%</span>
          </div>
          <div style={S.progress}>
            <div style={{ width:`${result.pct}%`, height:"100%", background:"var(--primary)", borderRadius:8, transition:"width 0.45s ease" }} />
          </div>
        </div>
      )}

      <div style={S.bottomBar}>
        <button style={S.btnReset} onClick={reset}>Reset</button>
        <button
          style={{ ...S.btnCalc, ...(_hasErrors ? S.btnCalcDisabled : {}) }}
          onClick={calculate}
          disabled={_hasErrors}
        >
          Calculate Hybrid ({courseLabel})
        </button>
      </div>
    </div>
  );
}

export default function Hybrid({ year, program }) {
  if (year === "3" || year === "3-ds" || year === "3-aiml") {
    return <HybridThirdYearCSE program={program} year={year} />;
  }
  return year === "1" ? <HybridFirstYear /> : <HybridSenior />;
}
