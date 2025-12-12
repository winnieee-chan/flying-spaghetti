import { GoogleGenAI } from "@google/genai";

import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function generateInterviewQuestions(prompt) {
  const res = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return res.text;
}
