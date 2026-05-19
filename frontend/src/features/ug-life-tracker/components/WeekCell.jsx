import { memo } from "react";
import { isBeforeWeek, isSameWeek, isAfterWeek, fmtWeekRange } from "../utils/dateUtils.js";

const WeekCell = memo(function WeekCell({ week, weekIndex, period, yearNum, score, note, onOpen }) {
  const now = new Date();
  const isPast = isBeforeWeek(week, now) && !isSameWeek(week, now);
  const isThis = isSameWeek(week, now);
  const isFuture = isAfterWeek(week, now) && !isThis;
  const isBreak = period.type === "break";
  const isClickable = isPast || (isBreak && isPast) || isThis;

  const getCellStyle = () => {
    const base = {
      width: 16,
      height: 16,
      borderRadius: 2,
      flexShrink: 0,
      cursor: isClickable ? "pointer" : "default",
      transition: "transform 0.12s ease, opacity 0.12s ease",
      position: "relative",
    };

    if (isThis) {
      return { ...base, background: "var(--text)", outline: "2px solid var(--muted)", outlineOffset: 1 };
    }
    if (score) {
      const greens = ["", "#c8dfc0", "#7dba6e", "#4a9e3c", "#2d7a24", "#145014"];
      return { ...base, background: greens[score] };
    }
    if (isBreak) {
      if (isPast) return { ...base, background: "#93b5c8", border: "1px dashed #5a8aaa" };
      return { ...base, background: "#b8d0e0", border: "1px dashed #7aaccc", opacity: 0.6 };
    }
    if (isFuture) return { ...base, background: "#2e3749", opacity: 0.35 };
    return { ...base, background: "#374151" };
  };

  const handleClick = () => {
    if (!isClickable) return;
    onOpen({ period, weekIndex, week, yearNum, score, note });
  };

  const hasNote = note?.note;

  return (
    <div
      style={getCellStyle()}
      onClick={handleClick}
      title={fmtWeekRange(week)}
      onMouseEnter={(e) => {
        if (isClickable) e.currentTarget.style.transform = "scale(1.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {hasNote && (
        <div style={{
          position: "absolute",
          top: -1,
          right: -1,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#818cf8",
        }} />
      )}
    </div>
  );
});

export default WeekCell;
