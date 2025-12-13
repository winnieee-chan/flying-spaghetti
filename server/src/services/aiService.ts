/**
 * AI Service
 * 
 * Provides AI-powered features for candidate analysis, messaging, and decision-making.
 * Extends the LLM service with frontend-specific AI functions.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '../db/db.js';
import type { Job, CandidateScore } from '../types/index.js';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

/**
 * Analyze candidate fit for a job
 */
export const analyzeCandidate = async (
    jobId: string,
    candidateId: string
): Promise<{
    fitScore: number;
    summary: string;
    recommendation: string;
    confidence: number;
}> => {
    const job = db.getJobById(jobId);
    const candidateScore = await db.getCandidateScoreForJob(candidateId, jobId);
    const candidate = await db.getCandidateById(candidateId);

    if (!job || !candidateScore || !candidate) {
        throw new Error('Job or candidate not found');
    }

    // Use LLM to analyze
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `Analyze this candidate's fit for the job and return ONLY a valid JSON object:

{
  "fitScore": number (0-100),
  "summary": "brief summary of candidate fit",
  "recommendation": "reach_out" | "wait" | "archive" | "advance" | "offer" | "reject",
  "confidence": number (0-100)
}

Job: ${job.job_title} at ${job.company_name || 'Company'}
Job Description: ${job.jd_text.substring(0, 500)}
Required Skills: ${job.extracted_keywords.skills.join(', ')}
Experience Required: ${job.extracted_keywords.min_experience_years} years

Candidate: ${candidateScore.full_name}
Headline: ${candidateScore.headline}
Skills Match Score: ${candidateScore.score}
Breakdown: ${JSON.stringify(candidateScore.breakdown_json?.slice(0, 5) || [])}

Return only the JSON object, nothing else.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();

            let jsonText = text;
            if (text.startsWith('```json')) {
                jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            } else if (text.startsWith('```')) {
                jsonText = text.replace(/```\n?/g, '').trim();
            }

            const analysis = JSON.parse(jsonText);

            // Store results
            await db.updateCandidateAIAnalysis(candidateId, jobId, {
                aiFitScore: analysis.fitScore,
                aiSummary: analysis.summary,
                aiRecommendation: analysis.recommendation,
            });

            return analysis;
        } catch (error: any) {
            console.error('[AI] Analysis failed:', error.message);
        }
    }

    // Fallback: Generate based on score
    const fitScore = Math.min(100, candidateScore.score + Math.floor(Math.random() * 10) - 5);
    const recommendation = fitScore >= 80 ? "reach_out" : fitScore >= 60 ? "wait" : "archive";
    const summary = `Candidate has a match score of ${candidateScore.score}. ${fitScore >= 80 ? "Highly recommended." : fitScore >= 60 ? "Worth considering." : "May not be the best fit."}`;

    return {
        fitScore,
        summary,
        recommendation,
        confidence: Math.min(100, fitScore + 10),
    };
};

/**
 * Draft first outreach message
 */
export const draftFirstMessage = async (jobId: string, candidateId: string): Promise<string> => {
    const job = db.getJobById(jobId);
    const candidateScore = await db.getCandidateScoreForJob(candidateId, jobId);

    if (!job || !candidateScore) {
        throw new Error('Job or candidate not found');
    }

    // Always use LLM to draft with the enhanced prompt
    // (Previously cached messages are bypassed to use the improved prompt)
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            // Extract top match reasons from breakdown_json
            const topReasons = candidateScore.breakdown_json
                ?.sort((a, b) => (b.value || 0) - (a.value || 0))
                .slice(0, 5)
                .map(item => `- ${item.signal}: ${item.reason}`)
                .join('\n') || 'No specific breakdown available';

            // Get job description summary (first 400 chars)
            const jobDescriptionSummary = job.jd_text
                ? job.jd_text.substring(0, 400) + (job.jd_text.length > 400 ? '...' : '')
                : 'No job description available';

            // Get required skills
            const requiredSkills = job.extracted_keywords?.skills?.join(', ') || 'Not specified';

            // Build the enhanced prompt
            const prompt = `Draft a first outreach message to a candidate. Use startup energy - be enthusiastic, authentic, and engaging. Avoid corporate jargon.

TONE: Startup energy - enthusiastic, authentic, and engaging. Not formal or corporate.
LENGTH: Keep it brief (100-150 words) - quick and scannable.
EMPHASIS: Highlight growth and learning opportunities in the role.
PERSONALIZATION: Mention key skills and fit reasons (moderate level of detail).

STRUCTURE:
1. Opening hook - enthusiastic, personalized based on their background
2. Value proposition - explain why they're a good fit and emphasize growth opportunities
3. Clear, low-pressure call-to-action

JOB DETAILS:
Title: ${job.job_title}
Company: ${job.company_name || 'Company'}
Description: ${jobDescriptionSummary}
Required Skills: ${requiredSkills}
Experience Required: ${job.extracted_keywords?.min_experience_years || 'Not specified'} years

CANDIDATE DETAILS:
Name: ${candidateScore.full_name}
Headline: ${candidateScore.headline || 'Not available'}
Match Score: ${candidateScore.score}/100
${candidateScore.aiSummary ? `AI Fit Summary: ${candidateScore.aiSummary}` : ''}

WHY THEY'RE A GOOD FIT:
${topReasons}

Return only the message text, no greeting/signature needed.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error('[AI] Draft message failed:', error.message);
        }
    }

    // Fallback
    const firstName = candidateScore.full_name.split(' ')[0];
    return `Hi ${firstName},\n\nI noticed your background and thought you might be interested in our ${job.job_title} role at ${job.company_name || 'our company'}.\n\nWould you be open to a brief conversation?\n\nBest regards`;
};

/**
 * Summarize conversation
 */
export const summarizeConversation = async (jobId: string, candidateId: string): Promise<string> => {
    const candidateScore = await db.getCandidateScoreForJob(candidateId, jobId);
    const conversationHistory = (candidateScore as any)?.conversationHistory || [];

    if (conversationHistory.length === 0) {
        return "No conversation history available.";
    }

    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const conversationText = conversationHistory
                .map((msg: any) => `${msg.from}: ${msg.content}`)
                .join('\n');

            const prompt = `Summarize this conversation in 2-3 sentences:\n\n${conversationText}\n\nReturn only the summary.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error('[AI] Summarize failed:', error.message);
        }
    }

    return "Candidate has shown interest. Next step: schedule technical interview.";
};

/**
 * Suggest next message
 */
export const suggestNextMessage = async (
    jobId: string,
    candidateId: string,
    lastMessage: string
): Promise<string> => {
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `Based on this last message from the candidate, suggest an appropriate response (under 100 words):\n\nCandidate: ${lastMessage}\n\nReturn only the suggested message.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error('[AI] Suggest message failed:', error.message);
        }
    }

    // Fallback
    const lowerMessage = lastMessage.toLowerCase();
    if (lowerMessage.includes('interested') || lowerMessage.includes('yes')) {
        return "Great! Let's schedule a time to chat. Are you available this week?";
    }
    return "Thank you for your interest. Would you like to learn more about the role?";
};

/**
 * Suggest interview times
 */
export const suggestInterviewTimes = async (jobId: string, candidateId: string): Promise<Date[]> => {
    const times: Date[] = [];
    const now = new Date();

    // Generate 6 time slots over the next 3 business days
    for (let i = 1; i <= 3; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) {
            continue;
        }

        // Morning slot
        date.setHours(10, 0, 0, 0);
        times.push(new Date(date));

        // Afternoon slot
        date.setHours(14, 0, 0, 0);
        times.push(new Date(date));
    }

    return times.slice(0, 6);
};

/**
 * Draft offer letter
 */
export const draftOffer = async (
    jobId: string,
    candidateId: string,
    terms?: Record<string, unknown>
): Promise<string> => {
    const job = db.getJobById(jobId);
    const candidateScore = await db.getCandidateScoreForJob(candidateId, jobId);

    if (!job || !candidateScore) {
        throw new Error('Job or candidate not found');
    }

    const salary = (terms?.salary as string) || "$120,000 - $150,000";
    const startDate = (terms?.startDate as string) || "TBD";

    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `Draft a professional offer letter for this candidate:

Job: ${job.job_title} at ${job.company_name || 'Company'}
Candidate: ${candidateScore.full_name}
Salary: ${salary}
Start Date: ${startDate}

Return only the offer letter text.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error('[AI] Draft offer failed:', error.message);
        }
    }

    // Fallback
    return `Dear ${candidateScore.full_name},\n\nWe are excited to extend an offer for the ${job.job_title} position at ${job.company_name || 'our company'}.\n\nSalary: ${salary}\nStart Date: ${startDate}\n\nWe look forward to having you on board.\n\nBest regards`;
};

/**
 * Help negotiate
 */
export const helpNegotiate = async (
    jobId: string,
    candidateId: string,
    request: string
): Promise<string> => {
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `The candidate has requested: "${request}"\n\nSuggest an appropriate negotiation response (under 150 words). Return only the response.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error('[AI] Negotiate failed:', error.message);
        }
    }

    // Fallback
    const lowerRequest = request.toLowerCase();
    if (lowerRequest.includes('salary')) {
        return "We have some flexibility within our range. What are your expectations?";
    }
    if (lowerRequest.includes('remote')) {
        return "We're open to discussing remote work arrangements.";
    }
    return "Let's discuss how we can make this work for both of us.";
};

/**
 * Generate decision summary
 */
export const generateDecisionSummary = async (
    jobId: string,
    candidateId: string,
    decision: "hire" | "reject"
): Promise<string> => {
    const job = db.getJobById(jobId);
    const candidateScore = await db.getCandidateScoreForJob(candidateId, jobId);

    if (!job || !candidateScore) {
        throw new Error('Job or candidate not found');
    }

    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `Generate a brief decision summary for ${decision === "hire" ? "hiring" : "rejecting"} this candidate:

Job: ${job.job_title}
Candidate: ${candidateScore.full_name}
Score: ${candidateScore.score}
Decision: ${decision}

Return only the summary (2-3 sentences).`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error('[AI] Decision summary failed:', error.message);
        }
    }

    // Fallback
    if (decision === "hire") {
        return `Decision: HIRE\n\n${candidateScore.full_name} demonstrated strong technical skills with a match score of ${candidateScore.score}. Recommendation: Extend offer.`;
    }
    return `Decision: REJECT\n\nWhile ${candidateScore.full_name} has relevant experience, there were concerns about fit.`;
};
