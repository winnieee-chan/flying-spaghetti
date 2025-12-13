/**
 * JSON File-based Database Implementation
 * This is the existing implementation extracted from db.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Job, Candidate, CandidateScore, JobUpdate } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_FILE = path.join(__dirname, '../data/jobs.json');
const CANDIDATES_FILE = path.join(__dirname, '../data/candidates.json');

// --- File I/O Helpers ---
const readJobsFile = (): Job[] => {
    try {
        const data = fs.readFileSync(JOBS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn("jobs.json not found. Creating empty array.");
            return [];
        }
        console.error("Error reading jobs.json:", error);
        return [];
    }
};

const writeJobsFile = (jobs: Job[]): void => {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf8');
};

const readCandidatesFile = (): Candidate[] => {
    try {
        const data = fs.readFileSync(CANDIDATES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn("candidates.json not found. Creating empty array.");
            return [];
        }
        console.error("Error reading candidates.json:", error);
        return [];
    }
};

const writeCandidatesFile = (candidates: Candidate[]): void => {
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(candidates, null, 2), 'utf8');
};

export const jsonDb = {
    // 1. CRUD: Save Job
    saveNewJob: (newJob: Job): void => {
        const jobs = readJobsFile();
        jobs.push(newJob);
        writeJobsFile(jobs);
    },

    // 2. CRUD: Get Job
    getJobById: (jobId: string): Job | undefined => {
        const jobs = readJobsFile();
        return jobs.find(job => job.jobId === jobId);
    },

    // 3. CRUD: Update Job
    updateJob: (jobId: string, updates: JobUpdate): Job | null => {
        const jobs = readJobsFile();
        const index = jobs.findIndex(job => job.jobId === jobId);

        if (index === -1) {
            return null;
        }

        Object.assign(jobs[index], updates);
        writeJobsFile(jobs);
        return jobs[index];
    },

    // 4. Read: Get Candidates Scored for Job
    getCandidatesByJobId: (jobId: string): CandidateScore[] => {
        const candidates = readCandidatesFile();
        return candidates
            .map(candidate => {
                const scoreData = candidate.scores?.find((s: any) => s.job_id === jobId);
                if (!scoreData) return null;
                
                const result: any = {
                    candidateId: candidate._id,
                    full_name: candidate.full_name,
                    headline: candidate.headline || '',
                    github_username: candidate.github_username,
                    open_to_work: candidate.open_to_work,
                    score: scoreData.score,
                    breakdown_json: scoreData.breakdown_json,
                    enrichment: candidate.enrichment
                };

                // Include new fields if they exist
                if ((scoreData as any).pipelineStage) {
                    result.pipelineStage = (scoreData as any).pipelineStage;
                }
                if ((scoreData as any).conversationHistory) {
                    result.conversationHistory = (scoreData as any).conversationHistory;
                }
                if ((scoreData as any).aiFitScore !== undefined) {
                    result.aiFitScore = (scoreData as any).aiFitScore;
                }
                if ((scoreData as any).aiSummary) {
                    result.aiSummary = (scoreData as any).aiSummary;
                }
                if ((scoreData as any).aiRecommendation) {
                    result.aiRecommendation = (scoreData as any).aiRecommendation;
                }

                return result;
            })
            .filter((c): c is CandidateScore => c !== null);
    },

    // 5. Read: Get Specific Candidate Score Data
    getCandidateScoreForJob: (candidateId: string, jobId: string): CandidateScore | null => {
        const candidates = readCandidatesFile();
        const candidate = candidates.find(c => c._id === candidateId);
        if (!candidate) return null;
        
        const scoreData = candidate.scores?.find((s: any) => s.job_id === jobId);
        if (!scoreData) return null;

        const result: any = {
            candidateId: candidate._id,
            full_name: candidate.full_name,
            headline: candidate.headline || '',
            github_username: candidate.github_username,
            open_to_work: candidate.open_to_work,
            score: scoreData.score,
            breakdown_json: scoreData.breakdown_json,
            outreach_messages: scoreData.outreach_messages,
            enrichment: candidate.enrichment
        };

        // Include new fields if they exist
        if ((scoreData as any).pipelineStage) {
            result.pipelineStage = (scoreData as any).pipelineStage;
        }
        if ((scoreData as any).conversationHistory) {
            result.conversationHistory = (scoreData as any).conversationHistory;
        }
        if ((scoreData as any).aiFitScore !== undefined) {
            result.aiFitScore = (scoreData as any).aiFitScore;
        }
        if ((scoreData as any).aiSummary) {
            result.aiSummary = (scoreData as any).aiSummary;
        }
        if ((scoreData as any).aiRecommendation) {
            result.aiRecommendation = (scoreData as any).aiRecommendation;
        }

        return result;
    },

    // 6. Read: Get Candidate by ID (without job context)
    getCandidateById: (candidateId: string): Candidate | undefined => {
        const candidates = readCandidatesFile();
        return candidates.find(c => c._id === candidateId);
    },

    // 7. Update: Update candidate pipeline stage for a job
    updateCandidatePipelineStage: (candidateId: string, jobId: string, stage: string): boolean => {
        const candidates = readCandidatesFile();
        const candidate = candidates.find(c => c._id === candidateId);
        if (!candidate) return false;

        if (!candidate.scores) {
            candidate.scores = [];
        }

        let scoreEntry = candidate.scores.find((s: any) => s.job_id === jobId);
        if (!scoreEntry) {
            scoreEntry = { job_id: jobId, score: 0, breakdown_json: [] };
            candidate.scores.push(scoreEntry);
        }

        (scoreEntry as any).pipelineStage = stage;
        writeCandidatesFile(candidates);
        return true;
    },

    // 8. Update: Batch update candidate pipeline stages
    batchUpdateCandidateStages: (jobId: string, candidateIds: string[], stage: string): number => {
        const candidates = readCandidatesFile();
        let updated = 0;

        candidates.forEach(candidate => {
            if (candidateIds.includes(candidate._id)) {
                if (!candidate.scores) {
                    candidate.scores = [];
                }

                let scoreEntry = candidate.scores.find((s: any) => s.job_id === jobId);
                if (!scoreEntry) {
                    scoreEntry = { job_id: jobId, score: 0, breakdown_json: [] };
                    candidate.scores.push(scoreEntry);
                }

                (scoreEntry as any).pipelineStage = stage;
                updated++;
            }
        });

        if (updated > 0) {
            writeCandidatesFile(candidates);
        }
        return updated;
    },

    // 9. Update: Add message to conversation history
    addMessageToConversation: (candidateId: string, jobId: string, message: {
        id: string;
        from: "founder" | "candidate";
        content: string;
        timestamp: string;
        aiDrafted?: boolean;
    }): boolean => {
        const candidates = readCandidatesFile();
        const candidate = candidates.find(c => c._id === candidateId);
        if (!candidate) return false;

        if (!candidate.scores) {
            candidate.scores = [];
        }

        let scoreEntry = candidate.scores.find((s: any) => s.job_id === jobId);
        if (!scoreEntry) {
            scoreEntry = { job_id: jobId, score: 0, breakdown_json: [] };
            candidate.scores.push(scoreEntry);
        }

        if (!(scoreEntry as any).conversationHistory) {
            (scoreEntry as any).conversationHistory = [];
        }

        (scoreEntry as any).conversationHistory.push(message);
        writeCandidatesFile(candidates);
        return true;
    },

    // 10. Update: Store AI analysis results
    updateCandidateAIAnalysis: (candidateId: string, jobId: string, analysis: {
        aiFitScore?: number;
        aiSummary?: string;
        aiRecommendation?: string;
    }): boolean => {
        const candidates = readCandidatesFile();
        const candidate = candidates.find(c => c._id === candidateId);
        if (!candidate) return false;

        if (!candidate.scores) {
            candidate.scores = [];
        }

        let scoreEntry = candidate.scores.find((s: any) => s.job_id === jobId);
        if (!scoreEntry) {
            scoreEntry = { job_id: jobId, score: 0, breakdown_json: [] };
            candidate.scores.push(scoreEntry);
        }

        if (analysis.aiFitScore !== undefined) {
            (scoreEntry as any).aiFitScore = analysis.aiFitScore;
        }
        if (analysis.aiSummary !== undefined) {
            (scoreEntry as any).aiSummary = analysis.aiSummary;
        }
        if (analysis.aiRecommendation !== undefined) {
            (scoreEntry as any).aiRecommendation = analysis.aiRecommendation;
        }

        writeCandidatesFile(candidates);
        return true;
    },

    // 11. Read: Get all jobs
    getAllJobs: (): Job[] => {
        return readJobsFile();
    }
};
