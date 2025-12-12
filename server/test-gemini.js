import dotenv from "dotenv";
dotenv.config();

import { generateInterviewQuestions } from "./integrations/geminiClient.js";

try {
  const res = await generateInterviewQuestions("Reply with OK");
  console.log("Gemini response:");
  console.log(res);
  process.exit(0);
} catch (err) {
  console.error("Gemini failed:");
  console.error(err);
  process.exit(1);
}
