import { useState, useEffect, useCallback, useRef } from "react";
import { fetchProgress, updateProgress } from "../../../services/resourceService";

export function useProgress() {
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const progressRef = useRef(progressMap);

  useEffect(() => { progressRef.current = progressMap; }, [progressMap]);

  const loadProgress = useCallback(async () => {
    try {
      const { data } = await fetchProgress();
      if (data.success) {
        const map = {};
        data.progress.forEach((p) => {
          map[p.paperKey] = { attempted: p.attempted, notes: p.notes };
        });
        progressRef.current = map;
        setProgressMap(map);
      }
    } catch {
      console.error("Failed to load progress");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const saveProgress = useCallback(async (paperKey, patch) => {
    const existing = progressRef.current[paperKey] ?? { paperKey, attempted: false, notes: "" };
    const next = { ...progressRef.current, [paperKey]: { ...existing, ...patch } };
    progressRef.current = next;
    setProgressMap(next);

    try {
      await updateProgress(paperKey, patch);
      return true;
    } catch (err) {
      const current = progressRef.current[paperKey] || existing;
      const reverted = { ...current };
      Object.entries(patch).forEach(([key, value]) => {
        if (current[key] === value) reverted[key] = existing[key];
      });
      const rollback = { ...progressRef.current, [paperKey]: reverted };
      progressRef.current = rollback;
      setProgressMap(rollback);
      throw err;
    }
  }, []);

  const updateLocalProgress = useCallback((paperKey, patch) => {
    const existing = progressRef.current[paperKey] ?? { paperKey, attempted: false, notes: "" };
    const next = { ...progressRef.current, [paperKey]: { ...existing, ...patch } };
    progressRef.current = next;
    setProgressMap(next);
  }, []);

  return { progressMap, saveProgress, updateLocalProgress, loading, refresh: loadProgress };
}
