export function fisherYatesShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class ScoreEngine {
  constructor() {
    this.totalScore = 0;
    this.history = [];
  }

  record(isCorrect, timedOut = false) {
    let change = 0;

    if (timedOut) {
      change = 0;
    } else if (isCorrect) {
      change = 4;
    } else {
      // Wrong answer: 0 points (no negative scoring)
      change = 0;
    }

    this.totalScore = Math.max(0, this.totalScore + change);

    const record = {
      isCorrect,
      timedOut,
      scoreChange: change,
      totalScore: this.totalScore,
    };

    this.history.push(record);
    return record;
  }

  getState() {
    return {
      totalScore: this.totalScore,
      history: this.history,
    };
  }
}

const DIFF_ORDER = { easy: 0, medium: 1, hard: 2 };

export function sortByDifficulty(questions) {
  return [...questions].sort(
    (a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]
  );
}

export function sortLeaderboard(entries) {
  return [...entries].sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.name?.localeCompare(b.name)
  );
}
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
export const DIFFICULTY_COLORS = {
  easy:   "#22c55e",
  medium: "#f59e0b",
  hard:   "#ef4444",
};