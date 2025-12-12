const { generateInterviewQuestions } = require("../integrations/geminiClient");

// TODO:
async function createInterviewAndQuestions(payload) {
  const prompt = `Generate interview questions as JSON array for: ${JSON.stringify(
    payload
  )}`;

  const raw = await generateInterviewQuestions(prompt);

  // TODO: parse JSON safely + store to DB
  return { questionsRaw: raw };
}

module.exports = { createInterviewAndQuestions };
