const STORAGE_KEY = "edubits_ugTracker_v1";

export const trackerStorage = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        startDate: parsed.startDate ? new Date(parsed.startDate) : null,
        scores: parsed.scores || {},
        notes: parsed.notes || {},
        overrides: Object.fromEntries(
          Object.entries(parsed.overrides || {}).map(([k, v]) => [
            k,
            { start: new Date(v.start), end: new Date(v.end) },
          ])
        ),
      };
    } catch {
      return null;
    }
  },

  save(state) {
    try {
      const serialized = {
        version: 1,
        startDate: state.startDate?.toISOString() ?? null,
        scores: state.scores,
        notes: state.notes,
        overrides: Object.fromEntries(
          Object.entries(state.overrides).map(([k, v]) => [
            k,
            { start: v.start.toISOString(), end: v.end.toISOString() },
          ])
        ),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
      return true;
    } catch {
      return false;
    }
  },

  exportJSON(state) {
    return JSON.stringify(state, null, 2);
  },
};
