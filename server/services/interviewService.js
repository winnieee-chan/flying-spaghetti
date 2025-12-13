import { generateInterviewQuestions } from "../integrations/geminiClient.js";

// TODO:
async function createInterviewAndQuestions(payload) {
  const prompt = `Generate interview questions as JSON array for: ${JSON.stringify(
    payload
  )}`;

  const raw = await generateInterviewQuestions(prompt);

  // TODO: parse JSON safely + store to DB
  return { questionsRaw: raw };
}

export { createInterviewAndQuestions };
