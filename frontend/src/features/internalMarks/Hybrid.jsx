import { useState, useRef } from "react";
import { getNum, validateAll } from "../../utils/marksUtils";

const S = {
  grid:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, alignItems:"start" },
  section: { padding:16, borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:0 },
  h3:      { margin:"0 0 12px 0", fontSize:15, fontWeight:700, color:"#f0f4ff" },
  group:   { display:"flex", flexDirection:"column", gap:4, marginBottom:10 },
  label:   { display:"block", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.5px", lineHeight:1.2 },
  input:   { display:"block", width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.08)", color:"#eef2ff", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", WebkitTextFillColor:"#eef2ff", transition:"border-color 0.15s" },
  hint:      { fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 },
  errorHint: { fontSize:11, color:"#f87171", marginTop:2, fontWeight:600 },
  bottomBar: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20, gridColumn:"1 / -1" },
  btnReset:  { background:"#ef4444", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" },
  btnCalc:   { background:"#22c55e", color:"#03100a", border:"none", borderRadius:8, padding:"10px 20px", fontWeight:800, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" },
  btnCalcDisabled: { opacity:0.4, cursor:"not-allowed" },
  small:     { fontSize:13, color:"#9ca3af" },
  highlight: { fontWeight:800, fontSize:17, color:"#c8fff0" },
  progress:  { height:8, background:"rgba(255,255,255,0.08)", borderRadius:8, marginTop:12, overflow:"hidden" },
  resultBox: { gridColumn:"1 / -1", marginTop:12, background:"rgba(0,20,25,0.65)", padding:"14px 16px", borderRadius:10 },
  resultRow: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", color:"#dde8f0", fontSize:14, borderTop:"1px solid rgba(255,255,255,0.06)" },
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
        style={{ ...S.input, borderColor: error ? "#f87171" : "rgba(255,255,255,0.12)" }}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => { e.target.style.borderColor = error ? "#f87171" : "#3b82f6"; e.target.style.background = "rgba(255,255,255,0.11)"; }}
        onBlur={(e)  => { e.target.style.borderColor = error ? "#f87171" : "rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
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
    <div style={S.grid}>
      <div style={S.section}>
        <h3 style={S.h3}>Theory &amp; Practical Components</h3>
        {leftFields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
      </div>

      <div style={S.section}>
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
            <span style={{ color:"#eef2ff" }}>{result.internal.toFixed(2)} / {result.internalMax} ({result.internalPct.toFixed(1)}%)</span>
          </div>
          {result.externalMax > 0 && (
            <div style={S.resultRow}>
              <span style={S.small}>External Theory (25)</span>
              <span style={{ color:"#eef2ff" }}>{result.external.toFixed(2)} / {result.externalMax}</span>
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
            <div style={{ width:`${result.pct}%`, height:"100%", background:"linear-gradient(90deg,#3b82f6,#22c55e)", borderRadius:8, transition:"width 0.45s ease" }} />
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
    <div style={S.grid}>
      <div style={S.section}>
        <h3 style={S.h3}>Theory Component</h3>
        {theoryFields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
      </div>

      <div style={S.section}>
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
            <span style={{ color:"#eef2ff" }}>{result.theory.toFixed(2)} / {result.theoryMax} ({result.theoryPct.toFixed(1)}%)</span>
          </div>
          <div style={S.resultRow}>
            <span style={S.small}>Practical</span>
            <span style={{ color:"#eef2ff" }}>{result.practical.toFixed(2)} / {result.practicalMax} ({result.practicalPct.toFixed(1)}%)</span>
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
            <div style={{ width:`${result.pct}%`, height:"100%", background:"linear-gradient(90deg,#3b82f6,#22c55e)", borderRadius:8, transition:"width 0.45s ease" }} />
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

export default function Hybrid({ year }) {
  return year === "1" ? <HybridFirstYear /> : <HybridSenior />;
}
