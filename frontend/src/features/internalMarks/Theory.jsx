import { useState, useRef } from "react";
import { getNum } from "../../utils/marksUtils";

/* ── Shared styles ── */
const S = {
  grid:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, alignItems:"start" },
  section: { padding:16, borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:0 },
  h3:      { margin:"0 0 12px 0", fontSize:15, fontWeight:700, color:"#f0f4ff" },
  group:   { display:"flex", flexDirection:"column", gap:4, marginBottom:10 },
  label:   { display:"block", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.5px", lineHeight:1.2 },
  input:   { display:"block", width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.08)", color:"#eef2ff", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", WebkitTextFillColor:"#eef2ff", transition:"border-color 0.15s" },
  hint:    { fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 },
  errorHint: { fontSize:11, color:"#f87171", marginTop:2, fontWeight:600 },
  bottomBar: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20, gridColumn:"1 / -1" },
  btnReset:  { background:"#ef4444", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" },
  btnCalc:   { background:"#22c55e", color:"#03100a", border:"none", borderRadius:8, padding:"10px 20px", fontWeight:800, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" },
  small:     { fontSize:13, color:"#9ca3af" },
  highlight: { fontWeight:800, fontSize:17, color:"#c8fff0" },
  progress:  { height:8, background:"rgba(255,255,255,0.08)", borderRadius:8, marginTop:12, overflow:"hidden" },
};

/* ── shake keyframe injected once ── */
if (typeof document !== "undefined" && !document.getElementById("shake-style")) {
  const el = document.createElement("style");
  el.id = "shake-style";
  el.textContent = `@keyframes im-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
  document.head.appendChild(el);
}

/* ── Validated Field ── */
function Field({ id, label, max, value, onChange }) {
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const shake = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.animation = "none";
    el.offsetHeight; // reflow
    el.style.animation = "im-shake 0.35s ease";
    setTimeout(() => { if (el) el.style.animation = "none"; }, 380);
  };

  const handleChange = (e) => {
    const raw = e.target.value;

    // allow clearing
    if (raw === "") {
      setError("");
      onChange("");
      return;
    }

    const num = parseFloat(raw);

    // block non-numeric
    if (isNaN(num)) return;

    // block negative
    if (num < 0) {
      setError(`Min marks: 0`);
      shake();
      return;
    }

    // clamp to max — update value to max and show brief warning
    if (num > max) {
      setError(`Max marks: ${max}`);
      shake();
      onChange(String(max));
      // clear hint after 1.5s
      setTimeout(() => setError(""), 1500);
      return;
    }

    setError("");
    onChange(raw);
  };

  // also block on keydown for e, E, +, - and digits that would exceed max
  const handleKeyDown = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
      return;
    }

    // If current value is already at max, block any digit key
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
        style={{
          ...S.input,
          borderColor: error ? "#f87171" : "rgba(255,255,255,0.12)",
        }}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => { e.target.style.borderColor = error ? "#f87171" : "#3b82f6"; e.target.style.background = "rgba(255,255,255,0.11)"; }}
        onBlur={(e)  => { e.target.style.borderColor = error ? "#f87171" : "rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
      />
      {error && <span style={S.errorHint}>⚠ {error}</span>}
    </div>
  );
}

/* ── Theory Component ── */
export default function Theory() {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const handle = (k, v) => setData(p => ({ ...p, [k]: v }));
  const reset  = () => { setData({}); setResult(null); };

  const calculate = () => {
    const g = (k, max) => getNum(data[k], max);
    const endProvided = data.t_endwritten !== "" && data.t_endwritten !== undefined;
    const end = Number(data.t_endwritten || 0);
    const total =
      g("t_mst1",20)/20*10 + g("t_mst2",20)/20*10 +
      g("t_assignment",10)/10*10 + g("t_quiz",4)/4*4 +
      g("t_surprise",12)/12*4 + g("t_attendance",2)/2*2 +
      (endProvided ? end/60*60 : 0);
    const max = endProvided ? 100 : 40;
    setResult({ total, max, pct: (total/max)*100 });
  };

  const fields = [
    ["t_assignment","Assignment",10],
    ["t_mst1","MST 1",20],
    ["t_mst2","MST 2",20],
    ["t_surprise","Surprise Test",12],
    ["t_quiz","Quiz",4],
    ["t_attendance","Attendance",2],
    ["t_endwritten","End Sem Written",60],
  ];

  return (
    <div style={S.grid}>
      <div style={S.section}>
        <h3 style={S.h3}>Theory Subject</h3>
        {fields.map(([key, label, max]) => (
          <Field key={key} id={key} label={label} max={max}
            value={data[key] ?? ""}
            onChange={(v) => handle(key, v)}
          />
        ))}
      </div>

      <div style={S.section}>
        <h3 style={S.h3}>Output</h3>
        {result ? (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", color:"#dde8f0", fontSize:14 }}>
              <span style={S.small}>Obtained</span>
              <span style={{ color:"#eef2ff" }}>{result.total.toFixed(2)} / {result.max}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <span style={S.small}>Percentage</span>
              <span style={S.highlight}>{result.pct.toFixed(2)}%</span>
            </div>
            <div style={S.progress}>
              <div style={{ width:`${result.pct}%`, height:"100%", background:"linear-gradient(90deg,#3b82f6,#22c55e)", borderRadius:8, transition:"width 0.4s ease" }} />
            </div>
          </div>
        ) : (
          <p style={{ color:"#6b7280", fontSize:13, margin:0 }}>Fill in marks and click Calculate.</p>
        )}
      </div>

      <div style={S.bottomBar}>
        <button style={S.btnReset} onClick={reset}>Reset</button>
        <button style={S.btnCalc}  onClick={calculate}>Calculate Theory</button>
      </div>
    </div>
  );
}