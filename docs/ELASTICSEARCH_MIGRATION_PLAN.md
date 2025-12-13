# Elasticsearch + MCP Migration Plan

## Recommendations Summary

### 1. MCP Usage: **Create MCP Server** ✅
**Recommendation:** Create an MCP server that exposes Elasticsearch as a resource/tool for AI agents to query the talent pool.

**Rationale:**
- Allows AI agents (like Gemini) to directly query your talent pool through MCP protocol
- Enables semantic search capabilities through AI integration
- Future-proof: Can be extended to other AI tools and agents
- Follows MCP best practices for exposing data sources

**Implementation:**
- Create `server/src/mcp/` directory with MCP server implementation
- Expose Elasticsearch queries as MCP tools/resources
- Use `@modelcontextprotocol/sdk` for MCP server implementation

### 2. Elasticsearch Setup: **Local Docker (Dev) + Elastic Cloud (Production)** ✅
**Recommendation:** Use Docker for local development, Elastic Cloud for production.

**Rationale:**
- **Docker (Dev):** Easy setup, no cost, full control, matches production-like environment
- **Elastic Cloud (Prod):** Managed service, automatic scaling, built-in security, monitoring
- Best of both worlds: fast iteration locally, production-grade in cloud

**Setup:**
```bash
# Local development
docker-compose up -d elasticsearch

# Production: Use Elastic Cloud free tier (14-day trial, then pay-as-you-go)
```

### 3. Migration Strategy: **Feature Flag Approach** ✅
**Recommendation:** Use feature flag to toggle between JSON and Elasticsearch.

**Rationale:**
- **Safest:** Can roll back instantly if issues arise
- **Flexible:** Test Elasticsearch without breaking existing functionality
- **Gradual:** Migrate endpoints one by one
- **Development-friendly:** Easy to test both implementations

**Implementation:**
- Environment variable: `USE_ELASTICSEARCH=true/false`
- Abstract storage layer: `db/elasticsearchDb.ts` and `db/jsonDb.ts`
- Factory pattern to select implementation based on flag

### 4. Data Modeling: **Nested Documents** ✅
**Recommendation:** Use nested documents - candidate with nested scores array.

**Rationale:**
- Matches current data structure (candidate has scores array)
- Single document per candidate = easier updates
- Efficient queries: can search candidates and filter by job scores in one query
- Better for full-text search across candidate data
- Nested queries allow filtering by job-specific fields

**Elasticsearch Mapping:**
```json
{
  "mappings": {
    "properties": {
      "_id": { "type": "keyword" },
      "full_name": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "email": { "type": "keyword" },
      "bio": { "type": "text" },
      "github_username": { "type": "keyword" },
      "open_to_work": { "type": "boolean" },
      "keywords": {
        "properties": {
          "role": { "type": "keyword" },
          "skills": { "type": "keyword" },
          "years_of_experience": { "type": "integer" },
          "location": { "type": "keyword" }
        }
      },
      "scores": {
        "type": "nested",
        "properties": {
          "job_id": { "type": "keyword" },
          "score": { "type": "integer" },
          "breakdown_json": { "type": "object" },
          "pipelineStage": { "type": "keyword" },
          "conversationHistory": { "type": "object" },
          "aiFitScore": { "type": "float" },
          "aiSummary": { "type": "text" },
          "aiRecommendation": { "type": "keyword" }
        }
      }
    }
  }
}
```

### 5. Search Requirements: **Full-Text + Faceted + Aggregations** ✅
**Recommendation:** Implement full-text search, faceted search, and aggregations.

**Priority Order:**
1. **Full-text search** - Essential for searching bios, skills, headlines
2. **Faceted search** - Critical for filtering by skills, location, experience
3. **Aggregations** - Important for analytics (candidate counts, score distributions)
4. **Autocomplete** - Nice to have for UX improvements
5. **Semantic search** - Future enhancement (requires vector embeddings)

**Implementation:**
- Use Elasticsearch's `multi_match` for full-text search
- Use `terms` aggregations for faceted filters
- Use `completion` suggester for autocomplete
- Future: Add vector embeddings for semantic search

### 6. Additional Recommendations

#### Jobs Storage
**Recommendation:** Keep jobs in JSON for now, migrate later if needed.
- Jobs are smaller dataset (15 vs 60+ candidates)
- Less frequent updates
- Can migrate separately if needed

#### Scale Expectations
- **Current:** 60 candidates
- **Expected Growth:** 1,000-10,000 candidates (reasonable for hackathon)
- Elasticsearch handles this easily on single node

#### Real-time vs Eventual Consistency
**Recommendation:** Eventual consistency is acceptable.
- Elasticsearch refresh interval: 1 second (default)
- Good enough for recruitment platform
- Can use `refresh=wait_for` for critical writes

#### Elasticsearch Features to Use
1. **Index Templates** - Standardize candidate index structure
2. **Aliases** - Zero-downtime reindexing
3. **Bulk API** - Efficient data migration
4. **Search Templates** - Reusable query patterns

---

## Migration Architecture

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Routes     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  DB Abstraction │◄────►│ Feature Flag │
│   (Factory)     │      └──────────────┘
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ JSON   │ │ Elasticsearch│
│  DB    │ │     DB       │
└────────┘ └──────┬───────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Elasticsearch  │
         │   (Docker/Cloud)│
         └─────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   MCP Server     │
         │ (Exposes ES as   │
         │  MCP Resource)   │
         └─────────────────┘
```

---

## Implementation Steps

### Phase 1: Setup (Day 1)
1. ✅ Add Elasticsearch Docker setup
2. ✅ Install Elasticsearch client (`@elastic/elasticsearch`)
3. ✅ Create index template and mappings
4. ✅ Set up feature flag system

### Phase 2: Data Layer (Day 1-2)
1. ✅ Create `db/elasticsearchDb.ts` with all CRUD operations
2. ✅ Create `db/dbFactory.ts` to select implementation
3. ✅ Update `db/db.ts` to use factory pattern
4. ✅ Migrate existing candidates to Elasticsearch

### Phase 3: Testing (Day 2)
1. ✅ Test all read operations
2. ✅ Test all write operations
3. ✅ Test search and filtering
4. ✅ Compare results between JSON and ES

### Phase 4: MCP Integration (Day 2-3)
1. ✅ Install MCP SDK
2. ✅ Create MCP server
3. ✅ Expose Elasticsearch queries as MCP tools
4. ✅ Test MCP server with AI agents

### Phase 5: Cutover (Day 3)
1. ✅ Enable Elasticsearch by default
2. ✅ Monitor for issues
3. ✅ Keep JSON as backup
4. ✅ Document migration

---

## File Structure

```
server/
├── src/
│   ├── db/
│   │   ├── db.ts              # Main DB interface (unchanged)
│   │   ├── dbFactory.ts      # NEW: Factory to select implementation
│   │   ├── jsonDb.ts         # EXISTING: JSON implementation
│   │   └── elasticsearchDb.ts # NEW: Elasticsearch implementation
│   ├── mcp/
│   │   ├── server.ts         # NEW: MCP server
│   │   ├── tools.ts          # NEW: MCP tools (search, filter, etc.)
│   │   └── resources.ts     # NEW: MCP resources (candidate data)
│   ├── services/
│   │   └── elasticsearchService.ts # NEW: ES connection & utilities
│   └── config/
│       └── elasticsearch.ts  # NEW: ES configuration
├── docker-compose.yml        # NEW: ES Docker setup
└── .env.example              # UPDATED: Add ES config
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@elastic/elasticsearch": "^8.11.0",
    "@modelcontextprotocol/sdk": "^0.5.0"
  }
}
```

---

## Environment Variables

```env
# Elasticsearch
USE_ELASTICSEARCH=true
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_INDEX=candidates

# MCP
MCP_SERVER_PORT=3001
MCP_SERVER_NAME=talent-pool-server
```

---

## Key Benefits

1. **Scalability:** Handle thousands of candidates efficiently
2. **Search:** Powerful full-text and faceted search
3. **AI Integration:** MCP enables AI agents to query talent pool
4. **Flexibility:** Feature flag allows safe migration
5. **Future-proof:** Easy to add semantic search, analytics, etc.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Keep JSON backup, dual-write during transition |
| Performance issues | Use bulk API, optimize queries, monitor |
| MCP complexity | Start simple, add features incrementally |
| Elasticsearch learning curve | Use official docs, start with basic queries |

---

## Success Criteria

- ✅ All existing API endpoints work with Elasticsearch
- ✅ Search performance is better than JSON file search
- ✅ MCP server exposes talent pool to AI agents
- ✅ Zero data loss during migration
- ✅ Can rollback to JSON if needed

---

## Next Steps

1. Review and approve this plan
2. Set up Elasticsearch (Docker)
3. Implement data layer abstraction
4. Migrate candidates
5. Test thoroughly
6. Deploy MCP server
7. Enable feature flag
