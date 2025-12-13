/**
 * MCP Client
 * Allows AI services to query the talent pool through MCP tools
 * This is a simplified client that directly calls the MCP server logic
 */

import { getElasticsearchClient } from './elasticsearchService.js';
import { getElasticsearchConfig } from '../config/elasticsearch.js';
import db from '../db/db.js';
import type { Candidate } from '../types/index.js';

const getIndex = () => getElasticsearchConfig().index;

/**
 * Search candidates using MCP-compatible interface
 * This mirrors the MCP server's search_candidates tool
 */
export const searchCandidatesViaMCP = async (
    query: string,
    filters?: {
        skills?: string[];
        location?: string;
        minExperience?: number;
        openToWork?: boolean;
    }
): Promise<{
    count: number;
    candidates: Array<{
        id: string;
        name: string;
        headline?: string;
        skills: string[];
        location: string;
        experience: number;
        openToWork: boolean;
    }>;
}> => {
    const candidates = await db.searchCandidates(query, filters);

    return {
        count: candidates.length,
        candidates: candidates.map(c => ({
            id: c._id,
            name: c.full_name,
            headline: c.headline,
            skills: c.keywords.skills,
            location: c.keywords.location,
            experience: c.keywords.years_of_experience,
            openToWork: c.open_to_work,
        })),
    };
};

/**
 * Get candidates for a job using MCP-compatible interface
 */
export const getCandidatesForJobViaMCP = async (
    jobId: string,
    minScore?: number
): Promise<{
    jobId: string;
    count: number;
    candidates: Array<{
        candidate: {
            id: string;
            name: string;
            headline?: string;
            skills: string[];
            location: string;
            experience: number;
        };
        score: number;
        pipelineStage?: string;
    }>;
}> => {
    const candidateScores = await db.getCandidatesByJobId(jobId);

    let filtered = candidateScores;
    if (minScore !== undefined) {
        filtered = candidateScores.filter(cs => cs.score >= minScore);
    }

    const candidates = await Promise.all(
        filtered.map(async cs => {
            const candidate = await db.getCandidateById(cs.candidateId);
            if (!candidate) return null;

            return {
                candidate: {
                    id: candidate._id,
                    name: candidate.full_name,
                    headline: candidate.headline,
                    skills: candidate.keywords.skills,
                    location: candidate.keywords.location,
                    experience: candidate.keywords.years_of_experience,
                },
                score: cs.score,
                pipelineStage: cs.pipelineStage,
            };
        })
    );

    return {
        jobId,
        count: candidates.filter(c => c !== null).length,
        candidates: candidates.filter((c): c is NonNullable<typeof c> => c !== null),
    };
};

/**
 * Get a specific candidate by ID using MCP-compatible interface
 */
export const getCandidateByIdViaMCP = async (candidateId: string): Promise<{
    id: string;
    name: string;
    email: string;
    headline?: string;
    bio: string;
    skills: string[];
    location: string;
    experience: number;
    openToWork: boolean;
    githubUsername: string;
} | null> => {
    const candidate = await db.getCandidateById(candidateId);
    if (!candidate) return null;

    return {
        id: candidate._id,
        name: candidate.full_name,
        email: candidate.email,
        headline: candidate.headline,
        bio: candidate.bio,
        skills: candidate.keywords.skills,
        location: candidate.keywords.location,
        experience: candidate.keywords.years_of_experience,
        openToWork: candidate.open_to_work,
        githubUsername: candidate.github_username,
    };
};
