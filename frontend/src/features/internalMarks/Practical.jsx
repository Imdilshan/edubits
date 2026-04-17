import { useState } from "react";
import { getNum } from "../../utils/marksUtils";

export default function Practical() {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  const limits = {
    pr_ws1: 30, pr_ws2: 30, pr_ws3: 30, pr_ws4: 30,
    pr_classperf: 10, pr_miniproject: 5, pr_industry: 10, pr_endpractical: 40,
  };

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
    const ws1  = getNum(data.pr_ws1, 30);
    const ws2  = getNum(data.pr_ws2, 30);
    const ws3  = getNum(data.pr_ws3, 30);
    const ws4  = getNum(data.pr_ws4, 30);
    const cp   = getNum(data.pr_classperf, 10);
    const mini = getNum(data.pr_miniproject, 5);
    const ind  = getNum(data.pr_industry, 10);

    const endProvided = data.pr_endpractical !== "" && data.pr_endpractical !== undefined;
    const end = Number(data.pr_endpractical || 0);

    const total =
      (ws1/30)*10 + (ws2/30)*10 + (ws3/30)*10 + (ws4/30)*10 +
      (cp/10)*5 + (mini/5)*5 + (ind/10)*10 +
      (endProvided ? (end/40)*40 : 0);

    const max = endProvided ? 100 : 60;

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
          <h3>Practical Subject</h3>

          {[
            ["pr_ws1", "Experiment 1", 30],
            ["pr_ws2", "Experiment 2", 30],
            ["pr_ws3", "Experiment 3", 30],
            ["pr_ws4", "Experiment 4", 30],
            ["pr_classperf", "Class Performance", 10],
            ["pr_miniproject", "Course Project", 5],
            ["pr_industry", "Industry Aligned Assessment", 10],
            ["pr_endpractical", "End Sem Practical", 40],
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
          Calculate Practical
        </button>
      </div>
    </div>
  );
}