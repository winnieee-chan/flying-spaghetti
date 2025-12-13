/**
 * Elasticsearch Database Implementation
 */

import { getElasticsearchClient } from '../services/elasticsearchService.js';
import { getElasticsearchConfig } from '../config/elasticsearch.js';
import type { Job, Candidate, CandidateScore, JobUpdate } from '../types/index.js';

const getIndex = () => getElasticsearchConfig().index;

export const elasticsearchDb = {
    // 1. CRUD: Save Job (Jobs still use JSON for now)
    saveNewJob: (newJob: Job): void => {
        // Jobs are not stored in Elasticsearch yet
        throw new Error('Jobs are not stored in Elasticsearch. Use JSON DB.');
    },

    // 2. CRUD: Get Job
    getJobById: (jobId: string): Job | undefined => {
        // Jobs are not stored in Elasticsearch yet
        throw new Error('Jobs are not stored in Elasticsearch. Use JSON DB.');
    },

    // 3. CRUD: Update Job
    updateJob: (jobId: string, updates: JobUpdate): Job | null => {
        // Jobs are not stored in Elasticsearch yet
        throw new Error('Jobs are not stored in Elasticsearch. Use JSON DB.');
    },

    // 4. Read: Get Candidates Scored for Job
    getCandidatesByJobId: async (jobId: string): Promise<CandidateScore[]> => {
        const client = getElasticsearchClient();
        
        const response = await client.search({
            index: getIndex(),
            body: {
                query: {
                    nested: {
                        path: 'scores',
                        query: {
                            term: {
                                'scores.job_id': jobId,
                            },
                        },
                    },
                },
            },
            size: 10000, // Adjust as needed
        });

        return response.hits.hits.map((hit: any) => {
            const candidate = hit._source as Candidate;
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
                enrichment: candidate.enrichment,
            };

            if (scoreData.pipelineStage) {
                result.pipelineStage = scoreData.pipelineStage;
            }
            if (scoreData.conversationHistory) {
                result.conversationHistory = scoreData.conversationHistory;
            }
            if (scoreData.aiFitScore !== undefined) {
                result.aiFitScore = scoreData.aiFitScore;
            }
            if (scoreData.aiSummary) {
                result.aiSummary = scoreData.aiSummary;
            }
            if (scoreData.aiRecommendation) {
                result.aiRecommendation = scoreData.aiRecommendation;
            }

            return result;
        }).filter((c): c is CandidateScore => c !== null);
    },

    // 5. Read: Get Specific Candidate Score Data
    getCandidateScoreForJob: async (candidateId: string, jobId: string): Promise<CandidateScore | null> => {
        const client = getElasticsearchClient();
        
        try {
            const response = await client.get({
                index: getIndex(),
                id: candidateId,
            });

            const candidate = response._source as Candidate;
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
                enrichment: candidate.enrichment,
            };

            if (scoreData.pipelineStage) {
                result.pipelineStage = scoreData.pipelineStage;
            }
            if (scoreData.conversationHistory) {
                result.conversationHistory = scoreData.conversationHistory;
            }
            if (scoreData.aiFitScore !== undefined) {
                result.aiFitScore = scoreData.aiFitScore;
            }
            if (scoreData.aiSummary) {
                result.aiSummary = scoreData.aiSummary;
            }
            if (scoreData.aiRecommendation) {
                result.aiRecommendation = scoreData.aiRecommendation;
            }

            return result;
        } catch (error: any) {
            if (error.statusCode === 404) {
                return null;
            }
            throw error;
        }
    },

    // 6. Read: Get Candidate by ID
    getCandidateById: async (candidateId: string): Promise<Candidate | undefined> => {
        const client = getElasticsearchClient();
        
        try {
            const response = await client.get({
                index: getIndex(),
                id: candidateId,
            });

            return response._source as Candidate;
        } catch (error: any) {
            if (error.statusCode === 404) {
                return undefined;
            }
            throw error;
        }
    },

    // 7. Update: Update candidate pipeline stage for a job
    updateCandidatePipelineStage: async (candidateId: string, jobId: string, stage: string): Promise<boolean> => {
        const client = getElasticsearchClient();
        
        try {
            // Get current candidate
            const candidate = await elasticsearchDb.getCandidateById(candidateId);
            if (!candidate) return false;

            // Update or create score entry
            if (!candidate.scores) {
                candidate.scores = [];
            }

            let scoreEntry = candidate.scores.find((s: any) => s.job_id === jobId);
            if (!scoreEntry) {
                scoreEntry = { job_id: jobId, score: 0, breakdown_json: [] };
                candidate.scores.push(scoreEntry);
            }

            (scoreEntry as any).pipelineStage = stage;

            // Update document
            await client.update({
                index: getIndex(),
                id: candidateId,
                body: {
                    doc: candidate,
                },
            });

            return true;
        } catch (error: any) {
            if (error.statusCode === 404) {
                return false;
            }
            throw error;
        }
    },

    // 8. Update: Batch update candidate pipeline stages
    batchUpdateCandidateStages: async (jobId: string, candidateIds: string[], stage: string): Promise<number> => {
        const client = getElasticsearchClient();
        let updated = 0;

        // Use bulk update
        const operations: any[] = [];

        for (const candidateId of candidateIds) {
            try {
                const candidate = await elasticsearchDb.getCandidateById(candidateId);
                if (!candidate) continue;

                if (!candidate.scores) {
                    candidate.scores = [];
                }

                let scoreEntry = candidate.scores.find((s: any) => s.job_id === jobId);
                if (!scoreEntry) {
                    scoreEntry = { job_id: jobId, score: 0, breakdown_json: [] };
                    candidate.scores.push(scoreEntry);
                }

                (scoreEntry as any).pipelineStage = stage;

                operations.push({
                    update: {
                        _index: getIndex(),
                        _id: candidateId,
                    },
                });
                operations.push({
                    doc: candidate,
                });

                updated++;
            } catch (error) {
                console.error(`[Elasticsearch] Error updating candidate ${candidateId}:`, error);
            }
        }

        if (operations.length > 0) {
            await client.bulk({ body: operations });
        }

        return updated;
    },

    // 9. Update: Add message to conversation history
    addMessageToConversation: async (candidateId: string, jobId: string, message: {
        id: string;
        from: "founder" | "candidate";
        content: string;
        timestamp: string;
        aiDrafted?: boolean;
    }): Promise<boolean> => {
        const client = getElasticsearchClient();
        
        try {
            const candidate = await elasticsearchDb.getCandidateById(candidateId);
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

            await client.update({
                index: getIndex(),
                id: candidateId,
                body: {
                    doc: candidate,
                },
            });

            return true;
        } catch (error: any) {
            if (error.statusCode === 404) {
                return false;
            }
            throw error;
        }
    },

    // 10. Update: Store AI analysis results
    updateCandidateAIAnalysis: async (candidateId: string, jobId: string, analysis: {
        aiFitScore?: number;
        aiSummary?: string;
        aiRecommendation?: string;
    }): Promise<boolean> => {
        const client = getElasticsearchClient();
        
        try {
            const candidate = await elasticsearchDb.getCandidateById(candidateId);
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

            await client.update({
                index: getIndex(),
                id: candidateId,
                body: {
                    doc: candidate,
                },
            });

            return true;
        } catch (error: any) {
            if (error.statusCode === 404) {
                return false;
            }
            throw error;
        }
    },

    // 11. Read: Get all jobs (Jobs still use JSON)
    getAllJobs: (): Job[] => {
        throw new Error('Jobs are not stored in Elasticsearch. Use JSON DB.');
    },

    // Elasticsearch-specific: Index a candidate
    indexCandidate: async (candidate: Candidate): Promise<void> => {
        const client = getElasticsearchClient();
        
        await client.index({
            index: getIndex(),
            id: candidate._id,
            body: candidate,
        });
    },

    // Elasticsearch-specific: Bulk index candidates
    bulkIndexCandidates: async (candidates: Candidate[]): Promise<void> => {
        const client = getElasticsearchClient();
        
        const operations: any[] = [];
        
        for (const candidate of candidates) {
            operations.push({
                index: {
                    _index: getIndex(),
                    _id: candidate._id,
                },
            });
            operations.push(candidate);
        }

        if (operations.length > 0) {
            await client.bulk({ body: operations });
        }
    },

    // Elasticsearch-specific: Search candidates
    searchCandidates: async (query: string, filters?: {
        skills?: string[];
        location?: string;
        minExperience?: number;
        openToWork?: boolean;
    }): Promise<Candidate[]> => {
        const client = getElasticsearchClient();
        
        const mustQueries: any[] = [];

        // Full-text search
        if (query) {
            mustQueries.push({
                multi_match: {
                    query,
                    fields: ['full_name^2', 'bio', 'headline^2', 'keywords.skills', 'github_username'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                },
            });
        }

        // Filters
        if (filters) {
            if (filters.skills && filters.skills.length > 0) {
                mustQueries.push({
                    terms: {
                        'keywords.skills': filters.skills,
                    },
                });
            }

            if (filters.location) {
                mustQueries.push({
                    term: {
                        'keywords.location': filters.location,
                    },
                });
            }

            if (filters.minExperience !== undefined) {
                mustQueries.push({
                    range: {
                        'keywords.years_of_experience': {
                            gte: filters.minExperience,
                        },
                    },
                });
            }

            if (filters.openToWork !== undefined) {
                mustQueries.push({
                    term: {
                        open_to_work: filters.openToWork,
                    },
                });
            }
        }

        const searchQuery: any = {
            index: getIndex(),
            body: {
                query: mustQueries.length > 0 ? { bool: { must: mustQueries } } : { match_all: {} },
            },
            size: 1000,
        };

        const response = await client.search(searchQuery);

        return response.hits.hits.map((hit: any) => hit._source as Candidate);
    },
};
