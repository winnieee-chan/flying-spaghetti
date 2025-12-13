/**
 * Elasticsearch Service
 * Handles connection and index management
 */

import { Client } from '@elastic/elasticsearch';
import { getElasticsearchConfig } from '../config/elasticsearch.js';

let client: Client | null = null;

export const getElasticsearchClient = (): Client => {
  if (!client) {
    const config = getElasticsearchConfig();
    
    const clientConfig: any = {
      node: config.node,
    };

    if (config.username && config.password) {
      clientConfig.auth = {
        username: config.username,
        password: config.password,
      };
    }

    client = new Client(clientConfig);
  }

  return client;
};

/**
 * Check if Elasticsearch is available
 */
export const checkElasticsearchHealth = async (): Promise<boolean> => {
  try {
    const esClient = getElasticsearchClient();
    const health = await esClient.cluster.health();
    return health.status === 'green' || health.status === 'yellow';
  } catch (error) {
    console.error('[Elasticsearch] Health check failed:', error);
    return false;
  }
};

/**
 * Create index with mappings if it doesn't exist
 */
export const ensureIndexExists = async (): Promise<void> => {
  const esClient = getElasticsearchClient();
  const config = getElasticsearchConfig();

  const indexExists = await esClient.indices.exists({ index: config.index });

    if (!indexExists) {
        await esClient.indices.create({
            index: config.index,
            mappings: {
                properties: {
                    full_name: {
            type: 'text',
            fields: {
              keyword: { type: 'keyword' },
            },
          },
          email: { type: 'keyword' },
          bio: { type: 'text' },
          github_username: { type: 'keyword' },
          open_to_work: { type: 'boolean' },
          headline: {
            type: 'text',
            fields: {
              keyword: { type: 'keyword' },
            },
          },
          keywords: {
            properties: {
              role: { type: 'keyword' },
              skills: { type: 'keyword' },
              years_of_experience: { type: 'integer' },
              location: { type: 'keyword' },
            },
          },
          enrichment: {
            properties: {
              public_repos: { type: 'integer' },
              total_stars: { type: 'integer' },
              recent_activity_days: { type: 'integer' },
              updated_at: { type: 'date' },
            },
          },
          notificationSettings: { type: 'object', enabled: false },
          scores: {
            type: 'nested',
            properties: {
              job_id: { type: 'keyword' },
              score: { type: 'integer' },
              breakdown_json: { type: 'object', enabled: false },
              outreach_messages: { type: 'keyword' },
              pipelineStage: { type: 'keyword' },
              conversationHistory: { type: 'object', enabled: false },
              aiFitScore: { type: 'float' },
              aiSummary: { type: 'text' },
              aiRecommendation: { type: 'keyword' },
            },
          },
        },
      },
    });

    console.log(`[Elasticsearch] Created index: ${config.index}`);
  }
};

/**
 * Close Elasticsearch connection
 */
export const closeElasticsearchConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
  }
};
