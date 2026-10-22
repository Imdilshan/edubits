import { useState, useRef } from "react";
import { getNum, validateAll } from "../../utils/marksUtils";
import "./InternalMarksPage.css";

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
  small:     { fontSize:13, color:"var(--muted)" },
  highlight: { fontWeight:600, fontSize:17, color:"var(--text)" },
  progress:  { height:8, background:"var(--bg)", borderRadius:8, marginTop:12, overflow:"hidden" },
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

// ── 1st Year Practical ────────────────────────────────────────────────────────
// ExternalViva 40→40 (optional), PA1 30→15, PA2 30→15, PA3/Project 30→15,
// Practical MST 30→15. Total w/o viva = 60, with = 100.
function PracticalFirstYear() {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setResult(null); };

  const calculate = () => {
    const g = (k, max) => getNum(data[k], max);
    const vivaProvided = data.p1_viva !== "" && data.p1_viva !== undefined;
    const viva = Number(data.p1_viva || 0);
    const total =
      g("p1_pa1",  30) / 30 * 15 +
      g("p1_pa2",  30) / 30 * 15 +
      g("p1_pa3",  30) / 30 * 15 +
      g("p1_pmst", 30) / 30 * 15 +
      (vivaProvided ? viva / 40 * 40 : 0);
    const max = vivaProvided ? 100 : 60;
    setResult({ total, max, pct: (total / max) * 100 });
  };

  const fields = [
    ["p1_pa1",  "Practical Assessment 1",             30],
    ["p1_pa2",  "Practical Assessment 2",             30],
    ["p1_pa3",  "Practical Assessment 3 / Project",   30],
    ["p1_pmst", "Practical MST",                      30],
    ["p1_viva", "External Viva / Voce",               40],
  ];

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Practical Subject</h3>
        {fields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
        <p style={{ ...S.hint, marginTop:4 }}>External Viva is optional — leave blank for internal-only result.</p>
      </div>

      <div className="internal-calc-section">
        <h3 style={S.h3}>Output</h3>
        {result ? (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", color:"var(--text-secondary)", fontSize:14 }}>
              <span style={S.small}>Obtained</span>
              <span style={{ color:"var(--text)" }}>{result.total.toFixed(2)} / {result.max}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderTop:"1px solid var(--border)" }}>
              <span style={S.small}>Percentage</span>
              <span style={S.highlight}>{result.pct.toFixed(2)}%</span>
            </div>
            <div style={S.progress}>
              <div style={{ width:`${result.pct}%`, height:"100%", background:"var(--primary)", borderRadius:8, transition:"width 0.4s ease" }} />
            </div>
          </div>
        ) : (
          <p style={{ color:"var(--muted)", fontSize:13, margin:0 }}>Fill in marks and click Calculate.</p>
        )}
      </div>

      <div style={S.bottomBar}>
        <button style={S.btnReset} onClick={reset}>Reset</button>
        <button style={S.btnCalc}  onClick={calculate}>Calculate Practical</button>
      </div>
    </div>
  );
}

// ── Senior Practical (2nd/3rd/4th Year) — unchanged logic ────────────────────
function PracticalSenior() {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setResult(null); };

  const calculate = () => {
    const g = (k, max) => getNum(data[k], max);
    const endProvided = data.pr_endpractical !== "" && data.pr_endpractical !== undefined;
    const end = Number(data.pr_endpractical || 0);
    const total =
      g("pr_ws1",        30) / 30 * 10 +
      g("pr_ws2",        30) / 30 * 10 +
      g("pr_ws3",        30) / 30 * 10 +
      g("pr_ws4",        30) / 30 * 10 +
      g("pr_classperf",  10) / 10 * 5  +
      g("pr_miniproject", 5) / 5  * 5  +
      g("pr_industry",   10) / 10 * 10 +
      (endProvided ? end / 40 * 40 : 0);
    const max = endProvided ? 100 : 60;
    setResult({ total, max, pct: (total / max) * 100 });
  };

  const fields = [
    ["pr_ws1",         "Experiment 1",                  30],
    ["pr_ws2",         "Experiment 2",                  30],
    ["pr_ws3",         "Experiment 3",                  30],
    ["pr_ws4",         "Experiment 4",                  30],
    ["pr_classperf",   "Class Performance",             10],
    ["pr_miniproject", "Course Project",                 5],
    ["pr_industry",    "Industry Aligned Assessment",   10],
    ["pr_endpractical","End Sem Practical",             40],
  ];

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Practical Subject</h3>
        {fields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
      </div>

      <div className="internal-calc-section">
        <h3 style={S.h3}>Output</h3>
        {result ? (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", color:"var(--text-secondary)", fontSize:14 }}>
              <span style={S.small}>Obtained</span>
              <span style={{ color:"var(--text)" }}>{result.total.toFixed(2)} / {result.max}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderTop:"1px solid var(--border)" }}>
              <span style={S.small}>Percentage</span>
              <span style={S.highlight}>{result.pct.toFixed(2)}%</span>
            </div>
            <div style={S.progress}>
              <div style={{ width:`${result.pct}%`, height:"100%", background:"var(--primary)", borderRadius:8, transition:"width 0.4s ease" }} />
            </div>
          </div>
        ) : (
          <p style={{ color:"var(--muted)", fontSize:13, margin:0 }}>Fill in marks and click Calculate.</p>
        )}
      </div>

      <div style={S.bottomBar}>
        <button style={S.btnReset} onClick={reset}>Reset</button>
        <button style={S.btnCalc}  onClick={calculate}>Calculate Practical</button>
      </div>
    </div>
  );
}

// ── 3rd Year Practical (CSE) ────────────────────────────────────────────────────
// External Viva/Voce          40 → 40
// Experiment-1                30 → 4.5
// Experiment-2                30 → 4.5
// Experiment-3                30 → 4.5
// Experiment-3                30 → 4.5
// Experiment-4                30 → 4.5
// Experiment-5                30 → 4.5
// Experiment-6                30 → 4.5
// Experiment-7                30 → 4.5
// Experiment-8                30 → 4.5
// Experiment-9                30 → 4.5
// Experiment-10               30 → 4.5
// Mid-Term Test               15 → 15
// Total: 100 weighted marks
function PracticalThirdYearCSE({ program, year }) {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const limits = {
    prc_viva:40,
    prc_exp1:30, prc_exp2:30, prc_exp3:30, prc_exp4:30,
    prc_exp5:30, prc_exp6:30, prc_exp7:30, prc_exp8:30,
    prc_exp9:30, prc_exp10:30,
    prc_midterm:15,
  };

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setResult(null); };

  const calculate = () => {
    const { ok } = validateAll(data, limits);
    if (!ok) return;

    const g = (k, max) => getNum(data[k], max);

    const vivaProvided = data.prc_viva !== "" && data.prc_viva !== undefined;
    // EST Practical is the scheme's External Viva / Voce component (optional).
    const viva = vivaProvided ? g("prc_viva", 40) : 0;

    // 10 Experiments: each 30 max → 4.5 weighted
    const exp1  = g("prc_exp1", 30) / 30 * 4.5;
    const exp2  = g("prc_exp2", 30) / 30 * 4.5;
    const exp3  = g("prc_exp3", 30) / 30 * 4.5;
    const exp4  = g("prc_exp4", 30) / 30 * 4.5;
    const exp5  = g("prc_exp5", 30) / 30 * 4.5;
    const exp6  = g("prc_exp6", 30) / 30 * 4.5;
    const exp7  = g("prc_exp7", 30) / 30 * 4.5;
    const exp8  = g("prc_exp8", 30) / 30 * 4.5;
    const exp9  = g("prc_exp9", 30) / 30 * 4.5;
    const exp10 = g("prc_exp10", 30) / 30 * 4.5;

    // Mid-Term Test: 15 max → 15 weighted
    const midterm = g("prc_midterm", 15) / 15 * 15;

    const experiments = exp1 + exp2 + exp3 + exp4 + exp5 + exp6 + exp7 + exp8 + exp9 + exp10;
    const total = viva + experiments + midterm;
    const totalMax = 60 + (vivaProvided ? 40 : 0);

    setResult({ total, max: totalMax, pct: (total / totalMax) * 100, viva, vivaProvided, experiments, midterm });
  };

  const fields = [
    ["prc_viva", "External Viva / Voce (optional)", 40],
    ["prc_exp1", "Experiment-1", 30],
    ["prc_exp2", "Experiment-2", 30],
    ["prc_exp3", "Experiment-3", 30],
    ["prc_exp4", "Experiment-4", 30],
    ["prc_exp5", "Experiment-5", 30],
    ["prc_exp6", "Experiment-6", 30],
    ["prc_exp7", "Experiment-7", 30],
    ["prc_exp8", "Experiment-8", 30],
    ["prc_exp9", "Experiment-9", 30],
    ["prc_exp10", "Experiment-10", 30],
    ["prc_midterm", "Mid-Term Test", 15],
  ];
  const courseLabel = program === "ait"
    ? year === "3-aiml" ? "3rd Year AIT (AIML)" : "3rd Year AIT (Data Science)"
    : "3rd Year CSE";

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Practical Subject ({courseLabel})</h3>
        {fields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
        <p style={{ ...S.hint, marginTop:4 }}>External Viva / Voce (EST Practical) is optional. Blank optional marks are excluded from the available total.</p>
      </div>

      <div className="internal-calc-section">
        <h3 style={S.h3}>Output</h3>
        {result ? (
          <div>
            {result.vivaProvided && (
              <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", color:"var(--text-secondary)", fontSize:14 }}>
                <span style={S.small}>External Viva/Voce (40)</span>
                <span style={{ color:"var(--text)" }}>{result.viva.toFixed(2)} / 40</span>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderTop:"1px solid var(--border)" }}>
              <span style={S.small}>Experiments 1-10 (4.5 each = 45)</span>
              <span style={{ color:"var(--text)" }}>{result.experiments.toFixed(2)} / 45</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderTop:"1px solid var(--border)" }}>
              <span style={S.small}>Mid-Term Test (15)</span>
              <span style={{ color:"var(--text)" }}>{result.midterm.toFixed(2)} / 15</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderTop:"1px solid var(--border)" }}>
              <span style={S.highlight}>Final</span>
              <span style={S.highlight}>{result.total.toFixed(2)} / {result.max}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderTop:"1px solid var(--border)" }}>
              <span style={S.small}>Percentage</span>
              <span style={S.highlight}>{result.pct.toFixed(2)}%</span>
            </div>
            <div style={S.progress}>
              <div style={{ width:`${result.pct}%`, height:"100%", background:"var(--primary)", borderRadius:8, transition:"width 0.4s ease" }} />
            </div>
          </div>
        ) : (
          <p style={{ color:"var(--muted)", fontSize:13, margin:0 }}>Fill in marks and click Calculate.</p>
        )}
      </div>

      <div style={S.bottomBar}>
        <button style={S.btnReset} onClick={reset}>Reset</button>
        <button style={S.btnCalc} onClick={calculate}>Calculate Practical ({courseLabel})</button>
      </div>
    </div>
  );
}

export default function Practical({ year, program }) {
  // General CSE and AIT share the documented third-year assessment model.
  if (year === "3" || year === "3-ds" || year === "3-aiml") {
    return <PracticalThirdYearCSE program={program} year={year} />;
  }
  // For other years/programs, use the original logic
  return year === "1" ? <PracticalFirstYear /> : <PracticalSenior />;
}
