/**
 * Database Factory
 * Selects the appropriate database implementation based on feature flag
 */

import { getElasticsearchConfig } from '../config/elasticsearch.js';
import { jsonDb } from './jsonDb.js';
import { elasticsearchDb } from './elasticsearchDb.js';
import type { Job, Candidate, CandidateScore, JobUpdate } from '../types/index.js';

// Helper to make async methods compatible
const makeAsync = <T extends (...args: any[]) => any>(
    fn: T
): T extends (...args: infer A) => infer R
    ? R extends Promise<any>
        ? T
        : (...args: A) => Promise<R>
    : T => {
    return ((...args: any[]) => {
        const result = fn(...args);
        return result instanceof Promise ? result : Promise.resolve(result);
    }) as any;
};

// Create async-compatible versions
const asyncJsonDb = {
    ...jsonDb,
    getCandidatesByJobId: makeAsync(jsonDb.getCandidatesByJobId),
    getCandidateScoreForJob: makeAsync(jsonDb.getCandidateScoreForJob),
    getCandidateById: makeAsync(jsonDb.getCandidateById),
    updateCandidatePipelineStage: makeAsync(jsonDb.updateCandidatePipelineStage),
    batchUpdateCandidateStages: makeAsync(jsonDb.batchUpdateCandidateStages),
    addMessageToConversation: makeAsync(jsonDb.addMessageToConversation),
    updateCandidateAIAnalysis: makeAsync(jsonDb.updateCandidateAIAnalysis),
};

export const getDb = () => {
    const config = getElasticsearchConfig();
    
    if (config.enabled) {
        return elasticsearchDb;
    }
    
    return asyncJsonDb;
};

// Export the selected database
const db = getDb();

export default db;
