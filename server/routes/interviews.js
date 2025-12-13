import express from "express";
import { createInterviewAndQuestions } from "../services/interviewService.js";

const router = express.Router();

/**
 * @swagger
 * /interviews:
 *   post:
 *     summary: Create a new interview with questions
 *     tags: [Interviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InterviewRequest'
 *     responses:
 *       201:
 *         description: Interview created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/interviews", async (req, res, next) => {
  try {
    const result = await createInterviewAndQuestions(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /interviews/{token}:
 *   get:
 *     summary: Get interview by token
 *     tags: [Interviews]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview token
 *     responses:
 *       200:
 *         description: Interview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Interview'
 *       404:
 *         description: Interview not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/interviews/:token", async (req, res) => {
  res.json({ token: req.params.token, questions: [] }); // TODO:
});

/**
 * @swagger
 * /interviews/{token}/submit:
 *   post:
 *     summary: Submit interview answers
 *     tags: [Interviews]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Interview submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmitResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/interviews/:token/submit", async (req, res) => {
  res.status(200).json({ ok: true }); //: TODO:
});

export default router;
