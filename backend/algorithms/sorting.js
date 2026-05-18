
const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 };

function sortLeaderboard(entries) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });
}

function sortQuestionsByDifficulty(questions) {
  return [...questions].sort((a, b) => {
    const diff = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
    if (diff !== 0) return diff;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

function dynamicSort(array, sortDescriptors) {
  return [...array].sort((a, b) => {
    for (const { field, order } of sortDescriptors) {
      const dir = order === "desc" ? -1 : 1;
      if (a[field] < b[field]) return -1 * dir;
      if (a[field] > b[field]) return  1 * dir;
    }
    return 0;
  });
}

module.exports = { sortLeaderboard, sortQuestionsByDifficulty, dynamicSort, DIFFICULTY_ORDER };
