# Elasticsearch Setup Guide

## Quick Start

### 1. Start Elasticsearch

```bash
# From project root
docker-compose up -d
```

This will start Elasticsearch on `http://localhost:9200`

### 2. Configure Environment

Add to `server/.env`:

```env
# Elasticsearch Configuration
USE_ELASTICSEARCH=true
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=candidates
```

### 3. Migrate Data

```bash
cd server
npm run migrate:elasticsearch
```

This will:
- Check Elasticsearch connection
- Create the index with proper mappings
- Migrate all candidates from JSON to Elasticsearch

### 4. Start Server

```bash
npm run dev
```

The server will automatically:
- Check Elasticsearch health
- Ensure index exists
- Use Elasticsearch if enabled, fallback to JSON if not

## Verification

### Check Elasticsearch Health

```bash
curl http://localhost:9200/_cluster/health
```

### Check Index

```bash
curl http://localhost:9200/candidates/_count
```

### Search Candidates

```bash
curl -X POST "http://localhost:9200/candidates/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "full_name": "Alex"
    }
  }
}'
```

## MCP Server

The MCP server exposes Elasticsearch candidate data to AI agents.

### Start MCP Server

```bash
cd server
npm run mcp:server
```

The MCP server runs on stdio and can be connected to MCP clients.

### MCP Tools Available

1. **search_candidates** - Search candidates by query, skills, location, experience
2. **get_candidate_by_id** - Get a specific candidate
3. **get_candidates_for_job** - Get all candidates for a job with scores

### Example MCP Client Usage

```typescript
// In your MCP client
const result = await mcpClient.callTool('search_candidates', {
  query: 'Python developer',
  skills: ['Python', 'FastAPI'],
  location: 'Sydney',
  minExperience: 3,
  limit: 10
});
```

## Troubleshooting

### Elasticsearch Not Starting

```bash
# Check logs
docker-compose logs elasticsearch

# Restart
docker-compose restart elasticsearch
```

### Migration Fails

1. Check Elasticsearch is running: `curl http://localhost:9200`
2. Check index exists: `curl http://localhost:9200/_cat/indices`
3. Delete and recreate index if needed:
   ```bash
   curl -X DELETE http://localhost:9200/candidates
   npm run migrate:elasticsearch
   ```

### Fallback to JSON

If Elasticsearch has issues, set in `.env`:
```env
USE_ELASTICSEARCH=false
```

The server will automatically use JSON file storage.

## Production Setup

For production, use Elastic Cloud:

1. Sign up at https://cloud.elastic.co
2. Create a deployment
3. Get connection details
4. Update `.env`:
   ```env
   USE_ELASTICSEARCH=true
   ELASTICSEARCH_NODE=https://your-deployment.es.cloud:9243
   ELASTICSEARCH_USERNAME=elastic
   ELASTICSEARCH_PASSWORD=your-password
   ELASTICSEARCH_INDEX=candidates
   ```

## Next Steps

- [ ] Test all API endpoints with Elasticsearch
- [ ] Verify search performance
- [ ] Set up MCP client integration
- [ ] Monitor Elasticsearch metrics
- [ ] Set up index aliases for zero-downtime updates
