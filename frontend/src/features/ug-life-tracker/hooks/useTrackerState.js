import { useState, useMemo, useEffect, useCallback } from "react";
import { trackerStorage } from "../storage/trackerStorage.js";
import { buildStructure } from "../utils/calendarBuilder.js";
import { computeStats } from "../utils/statsUtils.js";

export function useTrackerState() {
  const [state, setState] = useState(() => {
    const saved = trackerStorage.load();
    return {
      startDate: saved?.startDate ?? null,
      scores: saved?.scores ?? {},
      notes: saved?.notes ?? {},
      overrides: saved?.overrides ?? {},
    };
  });

  const calendarData = useMemo(() => {
    if (!state.startDate) return null;
    return buildStructure(state.startDate, state.overrides);
  }, [state.startDate, state.overrides]);

  const stats = useMemo(() => {
    if (!calendarData) return null;
    return computeStats(calendarData, state.scores);
  }, [calendarData, state.scores]);

  useEffect(() => {
    trackerStorage.save(state);
  }, [state]);

  const handleBuild = useCallback((date) => {
    setState((prev) => ({ ...prev, startDate: date }));
  }, []);

  const handleScore = useCallback((scoreKey, score) => {
    setState((prev) => ({
      ...prev,
      scores: { ...prev.scores, [scoreKey]: score },
    }));
  }, []);

  const handleClearScore = useCallback((scoreKey) => {
    setState((prev) => {
      const scores = { ...prev.scores };
      delete scores[scoreKey];
      return { ...prev, scores };
    });
  }, []);

  const handleNoteChange = useCallback((scoreKey, entry) => {
    setState((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [scoreKey]: {
          ...entry,
          createdAt: prev.notes[scoreKey]?.createdAt || new Date().toISOString(),
        },
      },
    }));
  }, []);

  const handleSaveOverrides = useCallback((overrides) => {
    setState((prev) => ({ ...prev, overrides }));
  }, []);

  const handleClearOverrides = useCallback(() => {
    setState((prev) => ({ ...prev, overrides: {} }));
  }, []);

  return {
    state,
    calendarData,
    stats,
    handleBuild,
    handleScore,
    handleClearScore,
    handleNoteChange,
    handleSaveOverrides,
    handleClearOverrides,
  };
}
