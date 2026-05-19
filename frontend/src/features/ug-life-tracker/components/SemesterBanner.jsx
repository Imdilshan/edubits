import { findCurrentPeriod, computeOverallWeek } from "../utils/statsUtils.js";
import { isSameWeek, fmtShortDate } from "../utils/dateUtils.js";

export default function SemesterBanner({ calendarData }) {
  const now = new Date();
  const { year, period } = findCurrentPeriod(calendarData);
  const weekInSem = period.weeks.findIndex((w) => isSameWeek(w, now));
  const ow = computeOverallWeek(calendarData);

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "20px 28px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    }}>
      <div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.8rem",
          fontWeight: 700,
          color: "var(--text)",
          margin: 0,
          marginBottom: 4,
        }}>
          {period.name}
        </h2>
        <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em" }}>
          {period.name} · Year {year} · Week {weekInSem >= 0 ? weekInSem + 1 : "?"} of {period.weeks.length}
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
        <div>Today: <span style={{ color: "var(--text)", fontWeight: 500 }}>{fmtShortDate(now)}</span></div>
        <div>Overall week {ow.current} of {ow.total}</div>
      </div>
    </div>
  );
}
