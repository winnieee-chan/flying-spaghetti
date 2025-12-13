import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerSpec, swaggerUi } from "./swagger.js";
import interviewsRouter from "./routes/interviews.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
app.get("/health", (req, res) => res.json({ ok: true }));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/", interviewsRouter);

app.listen(3001, () => {
  console.log("API http://localhost:3001");
  console.log("Swagger UI available at http://localhost:3001/api-docs");
});
