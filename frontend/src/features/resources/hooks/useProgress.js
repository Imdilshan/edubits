import { useState, useEffect, useCallback } from "react";
import { fetchProgress, updateProgress } from "../../../services/resourceService";

export function useProgress() {
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = useCallback(async () => {
    try {
      const { data } = await fetchProgress();
      if (data.success) {
        const map = {};
        data.progress.forEach((p) => {
          map[p.paperKey] = { attempted: p.attempted, notes: p.notes };
        });
        setProgressMap(map);
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProgress = useCallback(async (paperKey, patch) => {
    setProgressMap((prev) => {
      const existing = prev[paperKey] ?? { paperKey, attempted: false, notes: "" };
      const updated = { ...existing, ...patch };
      const next = { ...prev, [paperKey]: updated };
      return next;
    });

    try {
      await updateProgress(paperKey, patch);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, []);

  return { progressMap, saveProgress, loading, refresh: loadProgress };
}