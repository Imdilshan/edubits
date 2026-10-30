import { useState, useRef } from "react";
import { getNum } from "../../utils/marksUtils";

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

function AptitudeFirstYear() {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setResult(null); };

  const calculate = () => {
    const g = (k, max) => getNum(data[k], max);
    const etProvided = data.a1_exttheory !== "" && data.a1_exttheory !== undefined;
    const et = Number(data.a1_exttheory || 0);
    const total =
      g("a1_attendance", 2)  / 2  * 2  +
      g("a1_mst1",      20)  / 20 * 10 +
      g("a1_quiz",       4)  / 4  * 4  +
      g("a1_mst2",      20)  / 20 * 10 +
      g("a1_assignment", 12) / 12 * 12 +
      g("a1_surprise",   12) / 12 * 12 +
      (etProvided ? et / 60 * 50 : 0);
    const max = etProvided ? 100 : 50;
    setResult({ total, max, pct: (total / max) * 100 });
  };

  const fields = [
    ["a1_attendance", "Attendance Marks",    2],
    ["a1_mst1",       "Mid-Semester Test-1", 20],
    ["a1_mst2",       "Mid-Semester Test-2", 20],
    ["a1_quiz",       "Quiz",                4],
    ["a1_assignment", "Assignment Marks",    12],
    ["a1_surprise",   "Surprise Test Marks", 12],
    ["a1_exttheory",  "External Theory",     60],
  ];

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Aptitude Subject</h3>
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
        <button style={S.btnCalc}  onClick={calculate}>Calculate Aptitude</button>
      </div>
    </div>
  );
}

function AptitudeSenior() {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setResult(null); };

  const calculate = () => {
    const g = (k, max) => getNum(data[k], max);
    const total =
      g("as_exttheory",  60) / 60 * 60 +
      g("as_assignment", 12) / 12 * 6  +
      g("as_attendance",  4) / 4  * 4  +
      g("as_mst1",       20) / 20 * 10 +
      g("as_surprise",   12) / 12 * 4  +
      g("as_mst2",       20) / 20 * 10 +
      g("as_quiz",        6) / 6  * 6;
    setResult({ total, max: 100, pct: total });
  };

  const fields = [
    ["as_attendance", "Attendance Marks",    4],
    ["as_assignment", "Assignment / PBL",   12],
    ["as_mst1",       "Mid-Semester Test-1",20],
    ["as_mst2",       "Mid-Semester Test-2",20],
    ["as_surprise",   "Surprise Test",      12],
    ["as_quiz",       "Quiz",                6],
    ["as_exttheory",  "External Theory",    60],
  ];

  return (
    <div className="internal-calc-grid">
      <div className="internal-calc-section">
        <h3 style={S.h3}>Aptitude Subject</h3>
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
        <button style={S.btnCalc}  onClick={calculate}>Calculate Aptitude</button>
      </div>
    </div>
  );
}

export default function Aptitude({ year }) {
  // Second-year's scheme is the senior variant used for AIT third year as well.
  return year === "1" ? <AptitudeFirstYear /> : <AptitudeSenior />;
}
