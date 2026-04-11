import { useState } from "react";
import Hybrid from "./Hybrid";
import Theory from "./Theory";
import Practical from "./Practical";
import "../../styles/internalMarks.css";

export default function InternalMarksPage() {
  const [tab, setTab] = useState("hybrid");

  return (
    <div className="internal-container">
      <h1 className="internal-title">Internal Marks Calculator</h1>

      <div className="internal-tabs">
        <button
          className={`tab-btn hybrid ${tab === "hybrid" ? "active" : ""}`}
          onClick={() => setTab("hybrid")}
        >
          Hybrid Subject
        </button>

        <button
          className={`tab-btn theory ${tab === "theory" ? "active" : ""}`}
          onClick={() => setTab("theory")}
        >
          Theory Subject
        </button>

        <button
          className={`tab-btn practical ${tab === "practical" ? "active" : ""}`}
          onClick={() => setTab("practical")}
        >
          Practical Subject
        </button>
      </div>

      <div className="internal-card">
        {tab === "hybrid" && <Hybrid />}
        {tab === "theory" && <Theory />}
        {tab === "practical" && <Practical />}
      </div>
    </div>
  );
}