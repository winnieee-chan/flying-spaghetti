/**
 * Analytics Service
 * Provides analytics and aggregations using Elasticsearch
 */

import { getElasticsearchClient } from './elasticsearchService.js';
import { getElasticsearchConfig } from '../config/elasticsearch.js';
import db from '../db/db.js';

const getIndex = () => getElasticsearchConfig().index;

export interface AnalyticsResult {
    totalCandidates: number;
    locationStats: Array<{ location: string; count: number }>;
    skillStats: Array<{ skill: string; count: number }>;
    experienceStats: Array<{ range: string; count: number }>;
    openToWorkStats: {
        open: number;
        notOpen: number;
        percentage: number;
    };
    scoreDistribution?: {
        average: number;
        min: number;
        max: number;
        ranges: Array<{ range: string; count: number }>;
    };
}

/**
 * Get analytics for entire talent pool
 */
export const getTalentPoolAnalytics = async (): Promise<AnalyticsResult> => {
    const config = getElasticsearchConfig();
    
    if (!config.enabled) {
        // Fallback to JSON for basic stats
        return getTalentPoolAnalyticsFromJson();
    }

    const client = getElasticsearchClient();

    const response = await client.search({
        index: getIndex(),
        body: {
            size: 0,
            aggs: {
                locations: {
                    terms: {
                        field: 'keywords.location',
                        size: 20,
                    },
                },
                skills: {
                    terms: {
                        field: 'keywords.skills',
                        size: 20,
                    },
                },
                experience: {
                    range: {
                        field: 'keywords.years_of_experience',
                        ranges: [
                            { key: '0-2', to: 2.1 },
                            { key: '3-5', from: 3, to: 5.1 },
                            { key: '6-8', from: 6, to: 8.1 },
                            { key: '9+', from: 9 },
                        ],
                    },
                },
                open_to_work: {
                    terms: {
                        field: 'open_to_work',
                    },
                },
            },
        },
    });

    const aggs = response.aggregations as any;
    // Use hits.total.value instead of aggregation (can't aggregate on _id field)
    const totalCandidates = (response.hits.total as any)?.value || response.hits.total || 0;
    const openToWorkBuckets = aggs.open_to_work?.buckets || [];
    // Elasticsearch returns booleans as 1/0 in aggregations
    const openCount = openToWorkBuckets.find((b: any) => b.key === 1 || b.key === true || b.key_as_string === "true")?.doc_count || 0;
    const notOpenCount = openToWorkBuckets.find((b: any) => b.key === 0 || b.key === false || b.key_as_string === "false")?.doc_count || 0;

    return {
        totalCandidates,
        locationStats: (aggs.locations?.buckets || []).map((b: any) => ({
            location: b.key,
            count: b.doc_count,
        })),
        skillStats: (aggs.skills?.buckets || []).map((b: any) => ({
            skill: b.key,
            count: b.doc_count,
        })),
        experienceStats: (aggs.experience?.buckets || []).map((b: any) => ({
            range: b.key,
            count: b.doc_count,
        })),
        openToWorkStats: {
            open: openCount,
            notOpen: notOpenCount,
            percentage: totalCandidates > 0 ? Math.round((openCount / totalCandidates) * 100) : 0,
        },
    };
};

/**
 * Get analytics for a specific job
 */
export const getJobAnalytics = async (jobId: string): Promise<AnalyticsResult & { scoreDistribution: NonNullable<AnalyticsResult['scoreDistribution']> }> => {
    const config = getElasticsearchConfig();
    
    if (!config.enabled) {
        return getJobAnalyticsFromJson(jobId);
    }

    const client = getElasticsearchClient();

    // Get candidates with scores for this job
    const response = await client.search({
        index: getIndex(),
        body: {
            size: 0,
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
            aggs: {
                locations: {
                    terms: {
                        field: 'keywords.location',
                        size: 20,
                    },
                },
                skills: {
                    terms: {
                        field: 'keywords.skills',
                        size: 20,
                    },
                },
                experience: {
                    range: {
                        field: 'keywords.years_of_experience',
                        ranges: [
                            { key: '0-2', to: 2.1 },
                            { key: '3-5', from: 3, to: 5.1 },
                            { key: '6-8', from: 6, to: 8.1 },
                            { key: '9+', from: 9 },
                        ],
                    },
                },
                open_to_work: {
                    terms: {
                        field: 'open_to_work',
                    },
                },
                scores: {
                    nested: {
                        path: 'scores',
                    },
                    aggs: {
                        score_stats: {
                            filter: {
                                term: {
                                    'scores.job_id': jobId,
                                },
                            },
                            aggs: {
                                stats: {
                                    stats: {
                                        field: 'scores.score',
                                    },
                                },
                                ranges: {
                                    range: {
                                        field: 'scores.score',
                                        ranges: [
                                            { key: '0-20', to: 20.1 },
                                            { key: '21-40', from: 21, to: 40.1 },
                                            { key: '41-60', from: 41, to: 60.1 },
                                            { key: '61-80', from: 61, to: 80.1 },
                                            { key: '81-100', from: 81 },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const aggs = response.aggregations as any;
    // Use hits.total.value instead of aggregation (can't aggregate on _id field)
    const totalCandidates = (response.hits.total as any)?.value || response.hits.total || 0;
    const openToWorkBuckets = aggs.open_to_work?.buckets || [];
    // Elasticsearch returns booleans as 1/0 in aggregations
    const openCount = openToWorkBuckets.find((b: any) => b.key === 1 || b.key === true || b.key_as_string === "true")?.doc_count || 0;
    const notOpenCount = openToWorkBuckets.find((b: any) => b.key === 0 || b.key === false || b.key_as_string === "false")?.doc_count || 0;
    const scoreStats = aggs.scores?.score_stats?.stats || {};
    const scoreRanges = aggs.scores?.score_stats?.ranges?.buckets || [];

    return {
        totalCandidates,
        locationStats: (aggs.locations?.buckets || []).map((b: any) => ({
            location: b.key,
            count: b.doc_count,
        })),
        skillStats: (aggs.skills?.buckets || []).map((b: any) => ({
            skill: b.key,
            count: b.doc_count,
        })),
        experienceStats: (aggs.experience?.buckets || []).map((b: any) => ({
            range: b.key,
            count: b.doc_count,
        })),
        openToWorkStats: {
            open: openCount,
            notOpen: notOpenCount,
            percentage: totalCandidates > 0 ? Math.round((openCount / totalCandidates) * 100) : 0,
        },
        scoreDistribution: {
            average: scoreStats.avg || 0,
            min: scoreStats.min || 0,
            max: scoreStats.max || 0,
            ranges: scoreRanges.map((b: any) => ({
                range: b.key,
                count: b.doc_count,
            })),
        },
    };
};

/**
 * Fallback: Get analytics from JSON (when Elasticsearch is disabled)
 */
async function getTalentPoolAnalyticsFromJson(): Promise<AnalyticsResult> {
    const candidates = await db.searchCandidates('');
    
    const locationMap = new Map<string, number>();
    const skillMap = new Map<string, number>();
    const experienceRanges = {
        '0-2': 0,
        '3-5': 0,
        '6-8': 0,
        '9+': 0,
    };
    let openCount = 0;

    candidates.forEach(c => {
        // Locations
        const loc = c.keywords.location;
        locationMap.set(loc, (locationMap.get(loc) || 0) + 1);

        // Skills
        c.keywords.skills.forEach(skill => {
            skillMap.set(skill, (skillMap.get(skill) || 0) + 1);
        });

        // Experience
        const exp = c.keywords.years_of_experience;
        if (exp < 3) experienceRanges['0-2']++;
        else if (exp < 6) experienceRanges['3-5']++;
        else if (exp < 9) experienceRanges['6-8']++;
        else experienceRanges['9+']++;

        // Open to work
        if (c.open_to_work) openCount++;
    });

    return {
        totalCandidates: candidates.length,
        locationStats: Array.from(locationMap.entries())
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count),
        skillStats: Array.from(skillMap.entries())
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20),
        experienceStats: Object.entries(experienceRanges).map(([range, count]) => ({ range, count })),
        openToWorkStats: {
            open: openCount,
            notOpen: candidates.length - openCount,
            percentage: candidates.length > 0 ? Math.round((openCount / candidates.length) * 100) : 0,
        },
    };
}

/**
 * Fallback: Get job analytics from JSON
 */
async function getJobAnalyticsFromJson(jobId: string): Promise<AnalyticsResult & { scoreDistribution: NonNullable<AnalyticsResult['scoreDistribution']> }> {
    const candidateScores = await db.getCandidatesByJobId(jobId);
    const candidates = await Promise.all(
        candidateScores.map(cs => db.getCandidateById(cs.candidateId))
    );
    const validCandidates = candidates.filter((c): c is NonNullable<typeof c> => c !== undefined);

    const locationMap = new Map<string, number>();
    const skillMap = new Map<string, number>();
    const experienceRanges = {
        '0-2': 0,
        '3-5': 0,
        '6-8': 0,
        '9+': 0,
    };
    const scoreRanges = {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0,
    };
    let openCount = 0;
    let totalScore = 0;
    let minScore = 100;
    let maxScore = 0;

    candidateScores.forEach((cs, idx) => {
        const candidate = validCandidates[idx];
        if (!candidate) return;

        // Locations
        const loc = candidate.keywords.location;
        locationMap.set(loc, (locationMap.get(loc) || 0) + 1);

        // Skills
        candidate.keywords.skills.forEach(skill => {
            skillMap.set(skill, (skillMap.get(skill) || 0) + 1);
        });

        // Experience
        const exp = candidate.keywords.years_of_experience;
        if (exp < 3) experienceRanges['0-2']++;
        else if (exp < 6) experienceRanges['3-5']++;
        else if (exp < 9) experienceRanges['6-8']++;
        else experienceRanges['9+']++;

        // Open to work
        if (candidate.open_to_work) openCount++;

        // Scores
        const score = cs.score;
        totalScore += score;
        minScore = Math.min(minScore, score);
        maxScore = Math.max(maxScore, score);

        if (score <= 20) scoreRanges['0-20']++;
        else if (score <= 40) scoreRanges['21-40']++;
        else if (score <= 60) scoreRanges['41-60']++;
        else if (score <= 80) scoreRanges['61-80']++;
        else scoreRanges['81-100']++;
    });

    return {
        totalCandidates: candidateScores.length,
        locationStats: Array.from(locationMap.entries())
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count),
        skillStats: Array.from(skillMap.entries())
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20),
        experienceStats: Object.entries(experienceRanges).map(([range, count]) => ({ range, count })),
        openToWorkStats: {
            open: openCount,
            notOpen: validCandidates.length - openCount,
            percentage: validCandidates.length > 0 ? Math.round((openCount / validCandidates.length) * 100) : 0,
        },
        scoreDistribution: {
            average: candidateScores.length > 0 ? Math.round(totalScore / candidateScores.length) : 0,
            min: minScore === 100 ? 0 : minScore,
            max: maxScore,
            ranges: Object.entries(scoreRanges).map(([range, count]) => ({ range, count })),
        },
    };
}
