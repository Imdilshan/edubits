import { useState } from "react";
import { getNum } from "../../utils/marksUtils";

export default function Theory() {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const handle = (k, v) => setData({ ...data, [k]: v });

  // 🔥 strict input handler
  const handleInput = (key, value, max) => {
    if (value === "") {
      handle(key, "");
      return;
    }

    const num = Number(value);

    if (isNaN(num) || num < 0 || num > max) {
      handle(key, ""); // ❌ clear invalid
      return;
    }

    handle(key, value);
  };

  const reset = () => {
    setData({});
    setResult(null);
  };

  const calculate = () => {
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

    setResult({
      total,
      max,
      pct: (total / max) * 100
    });
  };

  return (
    <div className="internal-card">
      <div className="hybrid-grid">

        {/* INPUT */}
        <div className="section">
          <h3>Theory Subject</h3>

          {[
            ["t_assignment", "Assignment", 10],
            ["t_mst1", "MST 1", 20],
            ["t_mst2", "MST 2", 20],
            ["t_surprise", "Surprise Test", 12],
            ["t_quiz", "Quiz", 4],
            ["t_attendance", "Attendance", 2],
            ["t_endwritten", "End Sem Written", 60],
          ].map(([key, label, max]) => (
            <div className="input-group" key={key}>
              <label>{label} (out of {max})</label>

              <input
                type="number"
                min="0"
                max={max}
                placeholder={`0 - ${max}`}
                value={data[key] ?? ""}
                onChange={(e) => handleInput(key, e.target.value, max)}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* OUTPUT */}
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

              <div className="progress">
                <div style={{ width: `${result.pct}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="bottom-bar">
        <button className="btn-reset" onClick={reset}>Reset</button>
        <button className="btn-calc" onClick={calculate}>
          Calculate Theory
        </button>
      </div>
    </div>
  );
}