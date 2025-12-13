/**
 * MCP Server for Talent Pool
 * Exposes Elasticsearch candidate data as MCP resources and tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getElasticsearchClient } from '../services/elasticsearchService.js';
import { getElasticsearchConfig } from '../config/elasticsearch.js';
import type { Candidate } from '../types/index.js';

const server = new Server(
    {
        name: 'talent-pool-server',
        version: '1.0.0',
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    }
);

// List available resources (candidates)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: 'talent-pool://candidates',
                name: 'All Candidates',
                description: 'Access to all candidates in the talent pool',
                mimeType: 'application/json',
            },
            {
                uri: 'talent-pool://candidates/search',
                name: 'Search Candidates',
                description: 'Search interface for candidates',
                mimeType: 'application/json',
            },
        ],
    };
});

// Read a resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    if (uri === 'talent-pool://candidates') {
        const client = getElasticsearchClient();
        const config = getElasticsearchConfig();

        const response = await client.search({
            index: config.index,
            body: {
                query: { match_all: {} },
            },
            size: 100,
        });

        const candidates = response.hits.hits.map((hit: any) => hit._source);

        return {
            contents: [
                {
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(candidates, null, 2),
                },
            ],
        };
    }

    throw new Error(`Unknown resource: ${uri}`);
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'search_candidates',
                description: 'Search candidates by query, skills, location, or experience',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Full-text search query (searches name, bio, headline, skills)',
                        },
                        skills: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Filter by skills',
                        },
                        location: {
                            type: 'string',
                            description: 'Filter by location',
                        },
                        minExperience: {
                            type: 'number',
                            description: 'Minimum years of experience',
                        },
                        openToWork: {
                            type: 'boolean',
                            description: 'Filter by open to work status',
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of results (default: 10)',
                            default: 10,
                        },
                    },
                },
            },
            {
                name: 'get_candidate_by_id',
                description: 'Get a specific candidate by their ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        candidateId: {
                            type: 'string',
                            description: 'The candidate ID',
                        },
                    },
                    required: ['candidateId'],
                },
            },
            {
                name: 'get_candidates_for_job',
                description: 'Get all candidates scored for a specific job',
                inputSchema: {
                    type: 'object',
                    properties: {
                        jobId: {
                            type: 'string',
                            description: 'The job ID',
                        },
                        minScore: {
                            type: 'number',
                            description: 'Minimum match score (0-100)',
                        },
                    },
                    required: ['jobId'],
                },
            },
        ],
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const client = getElasticsearchClient();
    const config = getElasticsearchConfig();

    try {
        switch (name) {
            case 'search_candidates': {
                const {
                    query,
                    skills,
                    location,
                    minExperience,
                    openToWork,
                    limit = 10,
                } = args as any;

                const mustQueries: any[] = [];

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

                if (skills && Array.isArray(skills) && skills.length > 0) {
                    mustQueries.push({
                        terms: {
                            'keywords.skills': skills,
                        },
                    });
                }

                if (location) {
                    mustQueries.push({
                        term: {
                            'keywords.location': location,
                        },
                    });
                }

                if (minExperience !== undefined) {
                    mustQueries.push({
                        range: {
                            'keywords.years_of_experience': {
                                gte: minExperience,
                            },
                        },
                    });
                }

                if (openToWork !== undefined) {
                    mustQueries.push({
                        term: {
                            open_to_work: openToWork,
                        },
                    });
                }

                const searchQuery: any = {
                    index: config.index,
                    body: {
                        query: mustQueries.length > 0 ? { bool: { must: mustQueries } } : { match_all: {} },
                    },
                    size: limit,
                };

                const response = await client.search(searchQuery);
                const candidates = response.hits.hits.map((hit: any) => hit._source);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    count: candidates.length,
                                    candidates,
                                },
                                null,
                                2
                            ),
                        },
                    ],
                };
            }

            case 'get_candidate_by_id': {
                const { candidateId } = args as any;

                const response = await client.get({
                    index: config.index,
                    id: candidateId,
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response._source, null, 2),
                        },
                    ],
                };
            }

            case 'get_candidates_for_job': {
                const { jobId, minScore } = args as any;

                const nestedQuery: any = {
                    nested: {
                        path: 'scores',
                        query: {
                            term: {
                                'scores.job_id': jobId,
                            },
                        },
                    },
                };

                if (minScore !== undefined) {
                    nestedQuery.nested.query = {
                        bool: {
                            must: [
                                { term: { 'scores.job_id': jobId } },
                                { range: { 'scores.score': { gte: minScore } } },
                            ],
                        },
                    };
                }

                const response = await client.search({
                    index: config.index,
                    body: {
                        query: nestedQuery,
                    },
                    size: 1000,
                });

                const candidates = response.hits.hits.map((hit: any) => {
                    const candidate = hit._source as Candidate;
                    const scoreData = candidate.scores?.find((s: any) => s.job_id === jobId);
                    return {
                        candidate: {
                            id: candidate._id,
                            full_name: candidate.full_name,
                            email: candidate.email,
                            headline: candidate.headline,
                            skills: candidate.keywords.skills,
                            location: candidate.keywords.location,
                            experience: candidate.keywords.years_of_experience,
                        },
                        score: scoreData?.score,
                        pipelineStage: scoreData?.pipelineStage,
                    };
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    jobId,
                                    count: candidates.length,
                                    candidates,
                                },
                                null,
                                2
                            ),
                        },
                    ],
                };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error: any) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Talent Pool Server running on stdio');
}

main().catch(console.error);
