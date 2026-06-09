import { useState } from "react";
import Hybrid    from "./Hybrid";
import Theory    from "./Theory";
import Practical from "./Practical";
import Aptitude  from "./Aptitude";
import SoftSkill from "./SoftSkill";
import "../../styles/internalMarks.css";

import { ClipboardCheck } from "lucide-react";

const YEAR_BTN = {
  base: {
    padding: "7px 20px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  active: {
    background: "#ef4444",
    color: "#fff",
    border: "1px solid #ef4444",
  },
  inactive: {
    background: "transparent",
    color: "rgba(255,255,255,0.55)",
  },
};

export default function InternalMarksPage() {
  const [year, setYear] = useState("senior"); // "1" | "senior"
  const [tab,  setTab]  = useState("hybrid");

  const switchYear = (y) => {
    setYear(y);
    setTab("hybrid"); // reset tab on year switch
  };

  // Tabs vary by year
  const tabs = year === "1"
    ? [
        { key: "hybrid",    label: "Hybrid Subject"    },
        { key: "theory",    label: "Theory Subject"    },
        { key: "practical", label: "Practical Subject" },
        { key: "aptitude",  label: "Aptitude"          },
      ]
    : [
        { key: "hybrid",    label: "Hybrid Subject"    },
        { key: "theory",    label: "Theory Subject"    },
        { key: "practical", label: "Practical Subject" },
        { key: "aptitude",  label: "Aptitude"          },
        { key: "softskill", label: "Soft Skill"        },
      ];

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
        <ClipboardCheck size={30} strokeWidth={2.3} style={{ color: "#ef4444" }} />
        Internal Marks Calculator
      </h1>

      {/* ── Year Toggle ── */}
      <div style={{ display:"flex", justifyContent:"center", gap:8, margin:"12px 0 20px" }}>
        <button
          style={{ ...YEAR_BTN.base, ...(year === "1" ? YEAR_BTN.active : YEAR_BTN.inactive) }}
          onClick={() => switchYear("1")}
        >
          1st Year
        </button>
        <button
          style={{ ...YEAR_BTN.base, ...(year === "senior" ? YEAR_BTN.active : YEAR_BTN.inactive) }}
          onClick={() => switchYear("senior")}
        >
          2nd / 3rd / 4th Year
        </button>
      </div>

      {/* ── Subject Tabs ── */}
      <div className="internal-tabs">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn ${key} ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="internal-card">
        {tab === "hybrid"    && <Hybrid    year={year} />}
        {tab === "theory"    && <Theory    year={year} />}
        {tab === "practical" && <Practical year={year} />}
        {tab === "aptitude"  && <Aptitude  year={year} />}
        {tab === "softskill" && <SoftSkill />}
      </div>

    </div>
  );
}
