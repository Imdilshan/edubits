const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const Pyq = require("../models/Pyq");

router.post(
  "/upload",
  upload.single("file"),

  async (req, res) => {

    try {

      console.log(req.file);

      const { title, subject, semester } = req.body;

      const file = req.file;

      const newPyq = await Pyq.create({

        title,
        subject,
        semester,

        pdfUrl: file.path,
        publicId: file.filename,

      });

      res.status(201).json({
        success: true,
        pyq: newPyq,
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
        message: "Upload failed",
      });
    }
  }
);

module.exports = router;