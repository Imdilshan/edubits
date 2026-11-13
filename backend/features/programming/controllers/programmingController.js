const mongoose = require("mongoose");
const ProgrammingTopic = require("../models/ProgrammingTopic");
const ProgrammingProblem = require("../models/ProgrammingProblem");
const ProgrammingProgress = require("../models/ProgrammingProgress");

// ---------- Topics ----------

const getTopics = async (req, res) => {
  try {
    const topics = await ProgrammingTopic.find()
      .populate("parentTopic", "_id name")
      .sort({ order: 1 })
      .lean();

    res.json({ topics });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

const getTopic = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid topic id" });
    }

    const topic = await ProgrammingTopic.findById(req.params.id).populate(
      "parentTopic"
    );

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    res.json({ topic });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

const createTopic = async (req, res) => {
  try {
    const topic = await ProgrammingTopic.create(req.body);
    res.status(201).json({ topic });
  } catch (err) {
    res.status(400).json({ error: "Request failed" });
  }
};

const updateTopic = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid topic id" });
    }

    const topic = await ProgrammingTopic.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    res.json({ topic });
  } catch (err) {
    res.status(400).json({ error: "Request failed" });
  }
};

const deleteTopic = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid topic id" });
    }

    const topic = await ProgrammingTopic.findByIdAndDelete(req.params.id);

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    // Cascade delete problems
    await ProgrammingProblem.deleteMany({ topic: topic._id });

    res.json({ message: "Topic deleted" });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

// ---------- Problems ----------

const getProblems = async (req, res) => {
  try {
    const { topicId, difficulty } = req.query;

    const filter = {};

    if (topicId) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.status(400).json({
          error: "Invalid topic id",
        });
      }

      filter.topic = topicId;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const problems = await ProgrammingProblem.find(filter).lean();

    res.json({
      problems,
      count: problems.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

const getProblem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid problem id" });
    }

    const problem = await ProgrammingProblem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.json({ problem });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

const createProblem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.topic)) {
      return res.status(400).json({ error: "Invalid topic id" });
    }

    const topicExists = await ProgrammingTopic.exists({
      _id: req.body.topic,
    });

    if (!topicExists) {
      return res.status(404).json({ error: "Topic not found" });
    }

    const problem = await ProgrammingProblem.create(req.body);

    res.status(201).json({ problem });
  } catch (err) {
    res.status(400).json({ error: "Request failed" });
  }
};

const updateProblem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid problem id" });
    }

    if (
      req.body.topic &&
      !mongoose.Types.ObjectId.isValid(req.body.topic)
    ) {
      return res.status(400).json({ error: "Invalid topic id" });
    }

    const problem = await ProgrammingProblem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.json({ problem });
  } catch (err) {
    res.status(400).json({ error: "Request failed" });
  }
};

const deleteProblem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid problem id" });
    }

    const problem = await ProgrammingProblem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.json({ message: "Problem deleted" });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

// ---------- Progress (per-user) ----------

const getMyProgress = async (req, res) => {
  try {
    const { topicId } = req.query;

    const filter = { user: req.user._id };

    if (topicId) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.status(400).json({ error: "Invalid topic id" });
      }

      const problemIds = await ProgrammingProblem.find({ topic: topicId }).distinct("_id");
      filter.problem = { $in: problemIds };
    }

    const progress = await ProgrammingProgress.find(filter)
      .select("problem status starred createdAt updatedAt")
      .lean();

    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
};

const toggleProgress = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid problem id" });
    }

    const problemExists = await ProgrammingProblem.exists({ _id: req.params.id });

    if (!problemExists) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const update = {};
    if (req.body.status !== undefined) update.status = req.body.status;
    if (req.body.starred !== undefined) update.starred = req.body.starred;

    const progress = await ProgrammingProgress.findOneAndUpdate(
      { user: req.user._id, problem: req.params.id },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    ).select("problem status starred createdAt updatedAt");

    res.json({ progress });
  } catch (err) {
    res.status(400).json({ error: "Request failed" });
  }
};

module.exports = {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  getMyProgress,
  toggleProgress,
};
