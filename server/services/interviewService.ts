import { generateInterviewQuestions } from "../integrations/geminiClient.js";

export interface InterviewPayload {
  jobTitle?: string;
  experienceLevel?: string;
  skills?: string[];
  [key: string]: unknown;
}

export interface InterviewResponse {
  questionsRaw: string;
}

// TODO:
async function createInterviewAndQuestions(payload: InterviewPayload): Promise<InterviewResponse> {
  const prompt = `Generate interview questions as JSON array for: ${JSON.stringify(
    payload
  )}`;

  const raw = await generateInterviewQuestions(prompt);

  // TODO: parse JSON safely + store to DB
  return { questionsRaw: raw };
}

export { createInterviewAndQuestions };

