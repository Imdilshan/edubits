import { addWeeks } from "./dateUtils.js";

export const PERIOD_DEFS = [
  { key: "autumn", name: "Autumn Sem", type: "sem", weeks: 17 },
  { key: "winter", name: "Winter Break", type: "break", weeks: 5 },
  { key: "spring", name: "Spring Sem", type: "sem", weeks: 17 },
  { key: "summer", name: "Summer Break", type: "break", weeks: 13 },
];

export function buildStructure(startDate, overrides = {}) {
  const years = [];
  let cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);

  for (let y = 1; y <= 4; y++) {
    const yearStart = new Date(cursor);
    const periods = [];

    for (let pi = 0; pi < PERIOD_DEFS.length; pi++) {
      const def = PERIOD_DEFS[pi];
      const overKey = `y${y}s${pi}`;
      const ov = overrides[overKey];

      let pStart, pEnd;
      if (ov) {
        pStart = new Date(ov.start);
        pEnd = new Date(ov.end);
      } else {
        pStart = new Date(cursor);
        pEnd = addWeeks(pStart, def.weeks);
      }

      const weeks = [];
      let w = new Date(pStart);
      while (w < pEnd) {
        weeks.push(new Date(w));
        w = addWeeks(w, 1);
      }

      periods.push({
        key: overKey,
        defKey: def.key,
        name: def.name,
        type: def.type,
        start: pStart,
        end: pEnd,
        weeks,
      });

      cursor = new Date(pEnd);
    }

    years.push({ year: y, start: yearStart, periods });
  }
  return years;
}
