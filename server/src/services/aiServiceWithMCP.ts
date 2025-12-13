/**
 * AI Service with MCP Integration
 * 
 * Enhanced AI service that uses MCP to query talent pool for better context
 * This is an optional enhancement - the regular aiService works without MCP
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '../db/db.js';
import type { Job, CandidateScore } from '../types/index.js';
import { 
    searchCandidatesViaMCP, 
    getCandidatesForJobViaMCP,
    getCandidateByIdViaMCP 
} from './mcpClient.js';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
const useMCP = process.env.USE_MCP_CONTEXT === 'true';

/**
 * Enhanced analyze candidate with MCP context
 */
export const analyzeCandidateWithMCP = async (
    jobId: string,
    candidateId: string
): Promise<{
    fitScore: number;
    summary: string;
    recommendation: string;
    confidence: number;
    mcpContext?: {
        similarCandidatesCount: number;
        marketPosition: string;
    };
}> => {
    const job = db.getJobById(jobId);
    const candidateScore = await db.getCandidateScoreForJob(candidateId, jobId);
    const candidate = await db.getCandidateById(candidateId);

    if (!job || !candidateScore || !candidate) {
        throw new Error('Job or candidate not found');
    }

    let mcpContext: { similarCandidatesCount: number; marketPosition: string } | undefined;

    // Use MCP to get talent pool context if enabled
    if (useMCP) {
        try {
            // Find similar candidates
            const similarCandidates = await searchCandidatesViaMCP(
                candidate.keywords.skills.slice(0, 2).join(' '),
                {
                    skills: candidate.keywords.skills.slice(0, 3),
                    location: candidate.keywords.location,
                }
            );

            // Get market position for this job
            const jobCandidates = await getCandidatesForJobViaMCP(jobId);
            const avgScore = jobCandidates.count > 0
                ? jobCandidates.candidates.reduce((sum, c) => sum + c.score, 0) / jobCandidates.count
                : candidateScore.score;

            mcpContext = {
                similarCandidatesCount: similarCandidates.count,
                marketPosition: candidateScore.score >= avgScore ? 'above_average' : 'below_average',
            };
        } catch (error) {
            console.log('[AI+MCP] Context unavailable, continuing without it');
        }
    }

    // Use LLM to analyze
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            let contextNote = '';
            if (mcpContext) {
                contextNote = `\n\nTALENT POOL INSIGHT: Found ${mcpContext.similarCandidatesCount} similar candidates. This candidate's score is ${mcpContext.marketPosition === 'above_average' ? 'above' : 'below'} the job's average.`;
            }

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
Breakdown: ${JSON.stringify(candidateScore.breakdown_json?.slice(0, 5) || [])}${contextNote}

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

            return {
                ...analysis,
                mcpContext,
            };
        } catch (error: any) {
            console.error('[AI] Analysis failed:', error.message);
        }
    }

    // Fallback
    const fitScore = Math.min(100, candidateScore.score + Math.floor(Math.random() * 10) - 5);
    const recommendation = fitScore >= 80 ? "reach_out" : fitScore >= 60 ? "wait" : "archive";
    const summary = `Candidate has a match score of ${candidateScore.score}. ${fitScore >= 80 ? "Highly recommended." : fitScore >= 60 ? "Worth considering." : "May not be the best fit."}`;

    return {
        fitScore,
        summary,
        recommendation,
        confidence: Math.min(100, fitScore + 10),
        mcpContext,
    };
};
