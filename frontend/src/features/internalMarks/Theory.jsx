import { useState } from "react";
import { getNum, validateAll } from "../../utils/marksUtils";

export default function Theory() {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const limits = {
    t_assignment: 10, t_mst1: 20, t_mst2: 20,
    t_surprise: 12, t_quiz: 4, t_attendance: 2, t_endwritten: 60,
  };

  const handle = (k, v) => setData({ ...data, [k]: v });

  const reset = () => { setData({}); setErrors({}); setResult(null); };

  const calculate = () => {
    const { ok, errors } = validateAll(data, limits);
    setErrors(errors);
    if (!ok) return;

    const m1 = getNum(data.t_mst1, 20);
    const m2 = getNum(data.t_mst2, 20);
    const a  = getNum(data.t_assignment, 10);
    const q  = getNum(data.t_quiz, 4);
    const s  = getNum(data.t_surprise, 12);
    const at = getNum(data.t_attendance, 2);

    const endProvided = data.t_endwritten !== "" && data.t_endwritten !== undefined;
    const end = Number(data.t_endwritten || 0);

    const total =
      (m1 / 20) * 10 + (m2 / 20) * 10 + (a / 10) * 10 +
      (q / 4) * 4 + (s / 12) * 4 + (at / 2) * 2 +
      (endProvided ? (end / 60) * 60 : 0);

    const max = endProvided ? 100 : 40;
    setResult({ total, max, pct: (total / max) * 100 });
  };

  return (
    <div className="internal-card">
      <div className="hybrid-grid">
        <div className="section">
          <h3>Theory Subject</h3>
          {[
            ["t_assignment", "Assignment (out of 10)"],
            ["t_mst1", "MST 1 (out of 20)"],
            ["t_mst2", "MST 2 (out of 20)"],
            ["t_surprise", "Surprise Test (out of 12)"],
            ["t_quiz", "Quiz (out of 4)"],
            ["t_attendance", "Attendance (out of 2)"],
            ["t_endwritten", "End Sem Written (out of 60)"],
          ].map(([key, label]) => (
            <div className="input-group" key={key}>
              <label>{label}</label>
              <input
                type="number"
                value={data[key] ?? ""}
                className={errors[key] ? "invalid" : ""}
                onChange={(e) => handle(key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="section">
          <h3>Output</h3>
          {result && (
            <div className="result-box">
              <div className="result-row">
                <span className="small">Obtained</span>
                <span>{result.total.toFixed(2)} / {result.max}</span>
              </div>
              <div className="result-row">
                <span className="small">Percentage</span>
                <span className="highlight">{result.pct.toFixed(2)}%</span>
              </div>
              <div className="progress"><div style={{ width: `${result.pct}%` }}></div></div>
            </div>
          )}
        </div>
      </div>
      <div className="bottom-bar">
        <button className="btn-reset" onClick={reset}>Reset</button>
        <button className="btn-calc" onClick={calculate}>Calculate Theory</button>
      </div>
    </div>
  );
}
