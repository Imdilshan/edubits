import { useState } from "react";
import Hybrid    from "./Hybrid";
import Theory    from "./Theory";
import Practical from "./Practical";
import "../../styles/internalMarks.css";

import { ClipboardCheck } from "lucide-react";

export default function InternalMarksPage() {
  const [tab, setTab] = useState("hybrid");

  return (
    <div className="internal-container">

      <h1
        className="internal-title"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          lineHeight: 1,

          color: "#ef4444",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        <ClipboardCheck
          size={30}
          strokeWidth={2.3}
          style={{
            color: "#ef4444",
          }}
        />

        Internal Marks Calculator
      </h1>

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
        {tab === "hybrid"    && <Hybrid />}
        {tab === "theory"    && <Theory />}
        {tab === "practical" && <Practical />}
      </div>
    </div>
  );
}