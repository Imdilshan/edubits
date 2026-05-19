import { memo } from "react";
import WeekCell from "./WeekCell.jsx";
import { fmtMonYr } from "../utils/dateUtils.js";

const SemesterRow = memo(function SemesterRow({ period, yearNum, scores, notes, onOpenWeek }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
      <div style={{ width: 96, flexShrink: 0 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text)",
          lineHeight: 1.3,
          opacity: 0.7,
        }}>
          {period.name}
        </div>
        <div style={{
          fontSize: 9,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginTop: 2,
        }}>
          {fmtMonYr(period.start)}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, flex: 1 }}>
        {period.weeks.map((week, wi) => {
          const scoreKey = `${period.key}-${wi}`;
          return (
            <WeekCell
              key={scoreKey}
              week={week}
              weekIndex={wi}
              period={period}
              yearNum={yearNum}
              score={scores[scoreKey]}
              note={notes[scoreKey]}
              onOpen={onOpenWeek}
            />
          );
        })}
      </div>
    </div>
  );
});

export default SemesterRow;
