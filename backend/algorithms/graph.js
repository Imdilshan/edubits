function isTopicUnlocked(topicId, prereqIds, userProgress) {
  if (!prereqIds || prereqIds.length === 0) return true;
  return prereqIds.every((pid) => {
    const progress = userProgress instanceof Map
      ? userProgress.get(pid.toString())
      : userProgress[pid.toString()];
    return progress?.completed === true;
  });
}

function buildAdjacencyList(topics) {
  const adj = new Map();
  topics.forEach((t) => {
    const id = t._id.toString();
    if (!adj.has(id)) adj.set(id, []);
  });
  topics.forEach((t) => {
    const childId = t._id.toString();
    (t.prerequisites || []).forEach((prereqId) => {
      const pid = prereqId.toString();
      if (!adj.has(pid)) adj.set(pid, []);
      adj.get(pid).push(childId);
    });
  });
  return adj;
}

function topologicalSort(topics) {
  const inDegree = new Map();
  const adj = buildAdjacencyList(topics);
  topics.forEach((t) => inDegree.set(t._id.toString(), (t.prerequisites || []).length));
  const queue = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });
  const sorted = [];
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);
    (adj.get(current) || []).forEach((neighbor) => {
      const newDegree = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    });
  }
  if (sorted.length < topics.length) {
    console.warn("⚠️  Cycle detected in topic graph — check prerequisites");
  }
  return sorted;
}

function getTopicsWithStatus(topics, userProgress) {
  return topics.map((topic) => {
    const prereqIds = (topic.prerequisites || []).map((p) => p.toString());
    const unlocked = isTopicUnlocked(topic._id.toString(), prereqIds, userProgress);
    const progressEntry = userProgress instanceof Map
      ? userProgress.get(topic._id.toString())
      : userProgress[topic._id.toString()];
    return {
      ...topic.toObject?.() ?? topic,
      unlocked,
      completed: progressEntry?.completed ?? false,
      bestScore: progressEntry?.bestScore ?? 0,
      attempts: progressEntry?.attempts ?? 0,
    };
  });
}

module.exports = {
  isTopicUnlocked,
  buildAdjacencyList,
  topologicalSort,
  getTopicsWithStatus,
};
