import { memo } from "react";
import SemesterRow from "./SemesterRow.jsx";

const YearSection = memo(function YearSection({ yearData, scores, notes, onOpenWeek }) {
  const startYear = yearData.start.getFullYear();

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "16px",
      marginBottom: 10,
      boxSizing: "border-box",
      width: "100%",
      overflow: "hidden",
    }}>
      <div style={{
        textAlign: "center",
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginBottom: 18,
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        — Year {yearData.year} · {startYear}–{startYear + 1} —
      </div>

      {yearData.periods.map((period) => (
        <SemesterRow
          key={period.key}
          period={period}
          yearNum={yearData.year}
          scores={scores}
          notes={notes}
          onOpenWeek={onOpenWeek}
        />
      ))}
    </div>
  );
});

export default YearSection;
