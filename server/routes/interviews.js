const express = require("express");
const router = express.Router();
const { createInterviewAndQuestions } = require("../services/interviewService");

router.post("/interviews", async (req, res, next) => {
  try {
    const result = await createInterviewAndQuestions(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/interviews/:token", async (req, res) => {
  res.json({ token: req.params.token, questions: [] }); // TODO:
});

router.post("/interviews/:token/submit", async (req, res) => {
  res.status(200).json({ ok: true }); //: TODO:
});

module.exports = router;
