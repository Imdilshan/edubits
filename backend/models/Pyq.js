const mongoose = require("mongoose");

const pyqSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },

  semester: {
    type: Number,
    required: true,
  },

  pdfUrl: {
    type: String,
    required: true,
  },

  publicId: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Pyq", pyqSchema);