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

// ── 1st Year Theory ──────────────────────────────────────────────────────────
// Attendance 2→2, MST1 20→10, MST2 20→10, ExtTheory 60→50 (optional),
// Assignment 12→12, Surprise/Quiz 12→6, Case Study 20→10. Total w/o ET=50, with=100.
function TheoryFirstYear() {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setResult(null); };

  const calculate = () => {
    const g = (k, max) => getNum(data[k], max);
    const etProvided = data.t1_exttheory !== "" && data.t1_exttheory !== undefined;
    const et = Number(data.t1_exttheory || 0);
    const total =
      g("t1_attendance",  2)  / 2  * 2  +
      g("t1_mst1",       20)  / 20 * 10 +
      g("t1_mst2",       20)  / 20 * 10 +
      g("t1_assignment", 12)  / 12 * 12 +
      g("t1_surprise",   12)  / 12 * 6  +
      g("t1_casestudy",  20)  / 20 * 10 +
      (etProvided ? et / 60 * 50 : 0);
    const max = etProvided ? 100 : 50;
    setResult({ total, max, pct: (total / max) * 100 });
  };

  const fields = [
    ["t1_attendance",  "Attendance Marks",          2],
    ["t1_mst1",        "Mid-Semester Test-1",       20],
    ["t1_mst2",        "Mid-Semester Test-2",       20],
    ["t1_assignment",  "Assignment",                12],
    ["t1_surprise",    "Surprise Test / Quiz",      12],
    ["t1_casestudy",   "Case Study / Course Project",20],
    ["t1_exttheory",   "External Theory",           60],
  ];

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Theory Subject</h3>
        {fields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
        <p style={{ ...S.hint, marginTop:4 }}>External Theory is optional — leave blank for internal-only result.</p>
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
        <button style={S.btnCalc}  onClick={calculate}>Calculate Theory</button>
      </div>
    </div>
  );
}

// ── Senior Theory (2nd/3rd/4th Year) — unchanged logic ──────────────────────
// Assignment 10→10, MST1 20→10, MST2 20→10, Surprise 12→4, Quiz 4→4,
// Attendance 2→2, EndWritten 60→60 (optional). Total w/o ESW=40, with=100.
function TheorySenior() {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setResult(null); };

  const calculate = () => {
    const g = (k, max) => getNum(data[k], max);
    const endProvided = data.t_endwritten !== "" && data.t_endwritten !== undefined;
    const end = Number(data.t_endwritten || 0);
    const total =
      g("t_mst1",       20) / 20 * 10 +
      g("t_mst2",       20) / 20 * 10 +
      g("t_assignment", 10) / 10 * 10 +
      g("t_quiz",        4) / 4  * 4  +
      g("t_surprise",   12) / 12 * 4  +
      g("t_attendance",  2) / 2  * 2  +
      (endProvided ? end / 60 * 60 : 0);
    const max = endProvided ? 100 : 40;
    setResult({ total, max, pct: (total / max) * 100 });
  };

  const fields = [
    ["t_assignment",  "Assignment",       10],
    ["t_mst1",        "MST 1",            20],
    ["t_mst2",        "MST 2",            20],
    ["t_surprise",    "Surprise Test",    12],
    ["t_quiz",        "Quiz",              4],
    ["t_attendance",  "Attendance",        2],
    ["t_endwritten",  "End Sem Written",  60],
  ];

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Theory Subject</h3>
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
        <button style={S.btnCalc}  onClick={calculate}>Calculate Theory</button>
      </div>
    </div>
  );
}

// ── 3rd Year Theory (CSE) ──────────────────────────────────────────────────────
// External Theory           60 → 60
// Assignment/PBL            10 → 10
// Attendance Marks          2  → 2
// Mid-Semester Test-1        20 → 10
// Quiz                       4  → 4
// Surprise Test             12 → 4
// Mid-Semester Test-2        20 → 10
// Total: 100 weighted marks
function TheoryThirdYearCSE({ program, year }) {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const limits = {
    thy_exttheory:60, thy_assignment:10, thy_attendance:2, thy_mst1:20,
    thy_quiz:4, thy_surprise:12, thy_mst2:20,
  };

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setResult(null); };

  const calculate = () => {
    const { ok } = validateAll(data, limits);
    if (!ok) return;

    const g = (k, max) => getNum(data[k], max);
    const externalProvided = data.thy_exttheory !== "" && data.thy_exttheory !== undefined;
    const components = [
      { label: "Assignment / PBL", score: g("thy_assignment", 10) / 10 * 10, max: 10 },
      { label: "Attendance", score: g("thy_attendance", 2) / 2 * 2, max: 2 },
      { label: "MST-1", score: g("thy_mst1", 20) / 20 * 10, max: 10 },
      { label: "Quiz", score: g("thy_quiz", 4), max: 4 },
      { label: "Surprise Test", score: g("thy_surprise", 12) / 12 * 4, max: 4 },
      { label: "MST-2", score: g("thy_mst2", 20) / 20 * 10, max: 10 },
    ];
    if (externalProvided) {
      components.unshift({ label: "External Theory", score: g("thy_exttheory", 60), max: 60 });
    }
    const total = components.reduce((sum, component) => sum + component.score, 0);
    const totalMax = components.reduce((sum, component) => sum + component.max, 0);

    setResult({ total, max: totalMax, pct: (total / totalMax) * 100, components });
  };

  const fields = [
    ["thy_exttheory", "External Theory (optional)", 60],
    ["thy_assignment", "Assignment / PBL", 10],
    ["thy_attendance", "Attendance Marks", 2],
    ["thy_mst1", "Mid-Semester Test-1", 20],
    ["thy_quiz", "Quiz", 4],
    ["thy_surprise", "Surprise Test", 12],
    ["thy_mst2", "Mid-Semester Test-2", 20],
  ];
  const courseLabel = program === "ait"
    ? year === "3-aiml" ? "3rd Year AIT (AIML)" : "3rd Year AIT (Data Science)"
    : "3rd Year CSE";

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Theory Subject ({courseLabel})</h3>
        {fields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
        <p style={{ ...S.hint, marginTop:4 }}>External Theory is optional. Leave it blank until marks are available.</p>
      </div>

      <div className="internal-calc-section">
        <h3 style={S.h3}>Output</h3>
        {result ? (
          <div>
            {result.components.map((component) => (
              <div key={component.label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderTop:"1px solid var(--border)" }}>
                <span style={S.small}>{component.label} ({component.max})</span>
                <span style={{ color:"var(--text)" }}>{component.score.toFixed(2)} / {component.max}</span>
              </div>
            ))}
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
        <button style={S.btnCalc} onClick={calculate}>Calculate Theory ({courseLabel})</button>
      </div>
    </div>
  );
}

export default function Theory({ year, program }) {
  // General CSE and AIT share the documented third-year assessment model.
  if (year === "3" || year === "3-ds" || year === "3-aiml") {
    return <TheoryThirdYearCSE program={program} year={year} />;
  }
  // For other years/programs, use the original logic
  return year === "1" ? <TheoryFirstYear /> : <TheorySenior />;
}
