/**
 * Database Abstraction Layer
 * Uses factory pattern to select between JSON and Elasticsearch implementations
 * All methods are async-compatible (JSON methods return resolved promises)
 */

import { getDb } from './dbFactory.js';
import { jsonDb } from './jsonDb.js';
import type { Job, Candidate, CandidateScore, JobUpdate } from '../types/index.js';

const db = getDb();

// Export a unified interface that handles both sync (JSON) and async (Elasticsearch) operations
export default {
    // Jobs (always use JSON for now)
    saveNewJob: (newJob: Job): void => {
        jsonDb.saveNewJob(newJob);
    },

    getJobById: (jobId: string): Job | undefined => {
        return jsonDb.getJobById(jobId);
    },

    updateJob: (jobId: string, updates: JobUpdate): Job | null => {
        return jsonDb.updateJob(jobId, updates);
    },

    getAllJobs: (): Job[] => {
        return jsonDb.getAllJobs();
    },

    // Candidates (async-compatible, works with both JSON and Elasticsearch)
    getCandidatesByJobId: async (jobId: string): Promise<CandidateScore[]> => {
        return await db.getCandidatesByJobId(jobId);
    },

    getCandidateScoreForJob: async (candidateId: string, jobId: string): Promise<CandidateScore | null> => {
        return await db.getCandidateScoreForJob(candidateId, jobId);
    },

    getCandidateById: async (candidateId: string): Promise<Candidate | undefined> => {
        return await db.getCandidateById(candidateId);
    },

    updateCandidatePipelineStage: async (candidateId: string, jobId: string, stage: string): Promise<boolean> => {
        return await db.updateCandidatePipelineStage(candidateId, jobId, stage);
    },

    batchUpdateCandidateStages: async (jobId: string, candidateIds: string[], stage: string): Promise<number> => {
        return await db.batchUpdateCandidateStages(jobId, candidateIds, stage);
    },

    addMessageToConversation: async (candidateId: string, jobId: string, message: {
        id: string;
        from: "founder" | "candidate";
        content: string;
        timestamp: string;
        aiDrafted?: boolean;
    }): Promise<boolean> => {
        return await db.addMessageToConversation(candidateId, jobId, message);
    },

    updateCandidateAIAnalysis: async (candidateId: string, jobId: string, analysis: {
        aiFitScore?: number;
        aiSummary?: string;
        aiRecommendation?: string;
    }): Promise<boolean> => {
        return await db.updateCandidateAIAnalysis(candidateId, jobId, analysis);
    },

    // Search candidates
    searchCandidates: async (query: string, filters?: {
        skills?: string[];
        location?: string;
        minExperience?: number;
        openToWork?: boolean;
    }): Promise<Candidate[]> => {
        return await db.searchCandidates(query, filters);
    },
};
