
function fisherYatesShuffle(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function pickRandom(array, count) {
  const shuffled = fisherYatesShuffle(array);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
module.exports = { fisherYatesShuffle, pickRandom };
