export const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const addWeeks = (d, n) => addDays(d, n * 7);

export const startOfWeek = (d) => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - r.getDay());
  return r;
};

export const isSameWeek = (a, b) =>
  startOfWeek(a).getTime() === startOfWeek(b).getTime();

export const isBeforeWeek = (a, b) => startOfWeek(a) < startOfWeek(b);
export const isAfterWeek = (a, b) => startOfWeek(a) > startOfWeek(b);

export const fmtDate = (d) =>
  d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const fmtMonYr = (d) =>
  d
    .toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
    .toUpperCase();

export const fmtShortDate = (d) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const fmtWeekRange = (start) => {
  const end = addDays(start, 6);
  const s = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const e = end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${s} – ${e}`;
};
