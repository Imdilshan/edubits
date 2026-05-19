import { isBeforeWeek, isSameWeek } from "./dateUtils.js";

export function computeStats(years, scores) {
  const now = new Date();
  let totalWeeks = 0, elapsed = 0, remaining = 0;
  let scoredCount = 0, scoreSum = 0;

  for (const yr of years) {
    for (const p of yr.periods) {
      for (let wi = 0; wi < p.weeks.length; wi++) {
        const wDate = p.weeks[wi];
        totalWeeks++;
        const key = `${p.key}-${wi}`;
        const sc = scores[key];

        if (isBeforeWeek(wDate, now) && !isSameWeek(wDate, now)) {
          elapsed++;
          if (sc) { scoredCount++; scoreSum += sc; }
        } else {
          remaining++;
        }
      }
    }
  }

  return {
    totalWeeks,
    elapsed,
    remaining,
    scored: scoredCount,
    avg: scoredCount > 0 ? (scoreSum / scoredCount).toFixed(1) : "—",
  };
}

export function findCurrentPeriod(years) {
  const now = new Date();
  for (const yr of years) {
    for (const p of yr.periods) {
      if (now >= p.start && now < p.end) {
        return { year: yr.year, period: p };
      }
    }
  }
  const lastYr = years[years.length - 1];
  return { year: lastYr.year, period: lastYr.periods[lastYr.periods.length - 1] };
}

export function computeOverallWeek(years) {
  const now = new Date();
  let idx = 1, total = 0;
  for (const yr of years) {
    for (const p of yr.periods) {
      total += p.weeks.length;
      for (let wi = 0; wi < p.weeks.length; wi++) {
        if (isSameWeek(p.weeks[wi], now)) return { current: idx + wi, total };
        idx++;
      }
    }
  }
  return { current: total, total };
}
