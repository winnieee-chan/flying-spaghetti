/**
 * Elasticsearch Configuration
 */

export interface ElasticsearchConfig {
  node: string;
  username?: string;
  password?: string;
  index: string;
  enabled: boolean;
}

export const getElasticsearchConfig = (): ElasticsearchConfig => {
  return {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
    index: process.env.ELASTICSEARCH_INDEX || 'candidates',
    enabled: process.env.USE_ELASTICSEARCH === 'true',
  };
};
