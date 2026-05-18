const Topic = require("../models/Topic");
const User = require("../models/User");
const { topologicalSort, getTopicsWithStatus } = require("../algorithms/graph");

const getTopics = async (req, res) => {
  try {

    const topics = await Topic.find()
      .populate("prerequisites", "_id name")
      .lean();

    const sortedIds = topologicalSort(
      topics.map(t => ({
        _id: t._id.toString(),
        prerequisites: t.prerequisites.map(p => p._id.toString())
      }))
    );

    const topicMap = new Map(
      topics.map(t => [t._id.toString(), t])
    );

    const orderedTopics = sortedIds
      .map(id => topicMap.get(id))
      .filter(Boolean);

    let result = orderedTopics;

    if (req.user) {
      const user = await User.findById(req.user._id);

      result = orderedTopics.map(topic => {
        const topicId = topic._id.toString();
        const progress = user.progress.get(topicId);
        const completed = progress?.completed || false;
        const prereqIds = topic.prerequisites.map(p => p._id.toString());

        const unlocked = prereqIds.every(pid => {
          const p = user.progress.get(pid);
          return p?.completed === true;
        });

        return {
          ...topic,
          unlocked,
          completed,
          bestScore: progress?.bestScore || 0,
        };
      });
    }

    res.json({ topics: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate("prerequisites");
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    res.json({ topic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTopic = async (req, res) => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).json({ topic });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    res.json({ topic });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    res.json({ message: "Topic deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTopics, getTopic, createTopic, updateTopic, deleteTopic };
