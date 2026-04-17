import { useState } from "react";
import { getNum, validateAll } from "../../utils/marksUtils";

export default function Hybrid() {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const limits = {
    hy_assignment: 10, hy_mst1: 20, hy_mst2: 20, hy_surprise: 12,
    hy_quiz: 4, hy_classperf: 10, hy_attendance: 2, hy_endwritten: 60,
    hy_ws1: 30, hy_ws2: 30, hy_ws3: 30, hy_ws4: 30,
    hy_miniproject: 5, hy_industry: 10, hy_endpractical: 40,
  };

  const handle = (k, v) => setData({ ...data, [k]: v });

  const reset = () => {
    setData({});
    setErrors({});
    setResult(null);
  };


  const handleInput = (key, value, max) => {
  // allow empty (user deleting)
  if (value === "") {
    handle(key, "");
    return;
  }

  const num = Number(value);

  // ❌ invalid → clear input
  if (isNaN(num) || num < 0 || num > max) {
    handle(key, "");
    return;
  }

  // ✅ valid
  handle(key, value);
};

  const calculate = () => {
    const { ok, errors } = validateAll(data, limits);
    setErrors(errors);
    if (!ok) return;

    const mst1 = getNum(data.hy_mst1, 20);
    const mst2 = getNum(data.hy_mst2, 20);
    const a    = getNum(data.hy_assignment, 10);
    const s    = getNum(data.hy_surprise, 12);
    const q    = getNum(data.hy_quiz, 4);
    const at   = getNum(data.hy_attendance, 2);
    const cp   = getNum(data.hy_classperf, 10);

    const ewProvided = data.hy_endwritten !== "" && data.hy_endwritten !== undefined;
    const ew = Number(data.hy_endwritten || 0);

    const ws1  = getNum(data.hy_ws1, 30);
    const ws2  = getNum(data.hy_ws2, 30);
    const ws3  = getNum(data.hy_ws3, 30);
    const ws4  = getNum(data.hy_ws4, 30);
    const mini = getNum(data.hy_miniproject, 5);
    const ind  = getNum(data.hy_industry, 10);

    const epProvided = data.hy_endpractical !== "" && data.hy_endpractical !== undefined;
    const ep = Number(data.hy_endpractical || 0);

    const theory =
      (mst1/20)*5 + (mst2/20)*5 + (cp/10)*5 + (a/10)*2 +
      (q/4)*2 + (s/12)*2 + (at/2)*2 +
      (ewProvided ? (ew/60)*30 : 0);
    const theoryMax = ewProvided ? 53 : 23;

    const practical =
      (ws1/30)*5 + (ws2/30)*5 + (ws3/30)*5 + (ws4/30)*5 +
      (mini/5)*2 + (ind/10)*5 +
      (epProvided ? (ep/40)*20 : 0);
    const practicalMax = epProvided ? 47 : 27;

    const total = theory + practical;
    const totalMax = theoryMax + practicalMax;

    setResult({
      theory, theoryMax, theoryPct: (theory / theoryMax) * 100,
      practical, practicalMax, practicalPct: (practical / practicalMax) * 100,
      total, totalMax, pct: (total / totalMax) * 100,
    });
  };

  const hasErrors = Object.values(errors).some(e => e);

  return (
    <div className="internal-card">
      <div className="hybrid-grid">

        {/* THEORY */}
        <div className="section">
          <h3>Theory Component</h3>

          {[
            ["hy_assignment","Assignment",10],
            ["hy_mst1","MST-1",20],
            ["hy_mst2","MST-2",20],
            ["hy_surprise","Surprise Test",12],
            ["hy_quiz","Quiz",4],
            ["hy_classperf","Class Performance",10],
            ["hy_attendance","Attendance",2],
            ["hy_endwritten","End Sem Written",60],
          ].map(([key, label, max]) => (
            <div className="input-group" key={key}>
              <label>{label} (out of {max})</label>

              <input
                type="number"
                min="0"
                max={max}
                placeholder={`0 - ${max}`}
                value={data[key] ?? ""}
                className={errors[key] ? "invalid" : ""}
                onChange={(e) => handleInput(key, e.target.value, max)}
              />

              {errors[key] && <p className="error-text">{errors[key]}</p>}
            </div>
          ))}
        </div>

        {/* PRACTICAL */}
        <div className="section">
          <h3>Practical Component</h3>

          {[
            ["hy_ws1","Experiment 1",30],
            ["hy_ws2","Experiment 2",30],
            ["hy_ws3","Experiment 3",30],
            ["hy_ws4","Experiment 4",30],
            ["hy_miniproject","Course Project",5],
            ["hy_industry","Industry Aligned Assessment",10],
            ["hy_endpractical","End Sem Practical",40],
          ].map(([key, label, max]) => (
            <div className="input-group" key={key}>
              <label>{label} (out of {max})</label>

              <input
                type="number"
                min="0"
                max={max}
                placeholder={`0 - ${max}`}
                value={data[key] ?? ""}
                className={errors[key] ? "invalid" : ""}
                onChange={(e) => handleInput(key, e.target.value, max)}
              />

              {errors[key] && <p className="error-text">{errors[key]}</p>}
            </div>
          ))}
        </div>

      </div>

      {/* BUTTONS */}
      <div className="bottom-bar">
        <button className="btn-reset" onClick={reset}>Reset</button>
        <button
          className="btn-calc"
          onClick={calculate}
          disabled={hasErrors}
        >
          Calculate Hybrid
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="result-box">
          <div className="result-row">
            <span className="small">Theory</span>
            <span>{result.theory.toFixed(2)} / {result.theoryMax} ({result.theoryPct.toFixed(1)}%)</span>
          </div>

          <div className="result-row">
            <span className="small">Practical</span>
            <span>{result.practical.toFixed(2)} / {result.practicalMax} ({result.practicalPct.toFixed(1)}%)</span>
          </div>

          <div className="result-row highlight">
            <span>Final</span>
            <span>{result.total.toFixed(2)} / {result.totalMax}</span>
          </div>

          <div className="result-row highlight">
            <span>Final %</span>
            <span>{result.pct.toFixed(2)}%</span>
          </div>

          <div className="progress">
            <div style={{ width: `${result.pct}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
