# MCP Integration Guide

## Overview

The MCP (Model Context Protocol) integration allows AI agents to query the talent pool for enhanced context when analyzing candidates and drafting messages.

## Architecture

```
AI Service (aiService.ts)
    ↓ (optional)
MCP Client (mcpClient.ts)
    ↓
Database Layer (db.ts)
    ↓
Elasticsearch / JSON
```

## Features

### 1. MCP Server
- **Location**: `server/src/mcp/server.ts`
- **Purpose**: Exposes talent pool as MCP resources and tools
- **Tools Available**:
  - `search_candidates` - Search by query, skills, location, experience
  - `get_candidate_by_id` - Get specific candidate
  - `get_candidates_for_job` - Get all candidates for a job with scores

### 2. MCP Client
- **Location**: `server/src/services/mcpClient.ts`
- **Purpose**: Allows AI services to query talent pool programmatically
- **Functions**:
  - `searchCandidatesViaMCP()` - Search candidates
  - `getCandidatesForJobViaMCP()` - Get job candidates
  - `getCandidateByIdViaMCP()` - Get candidate by ID

### 3. AI Service Integration
- **Location**: `server/src/services/aiService.ts`
- **Enhancement**: Optionally uses MCP context when `USE_MCP_CONTEXT=true`
- **Benefits**:
  - Better candidate analysis with market context
  - Enhanced message personalization
  - Market position awareness

## Configuration

### Enable MCP Context in AI

Add to `server/.env`:
```env
USE_MCP_CONTEXT=true
```

When enabled, AI services will:
- Compare candidates against similar profiles in talent pool
- Include market position (above/below average score)
- Provide better context for recommendations

## Usage

### Start MCP Server

```bash
cd server
npm run mcp:server
```

The MCP server runs on stdio and can be connected to MCP clients.

### Test MCP Tools

```bash
npm run test:mcp
```

### Use in AI Service

The AI service automatically uses MCP context when:
1. `USE_MCP_CONTEXT=true` is set
2. Elasticsearch is enabled
3. MCP client functions are available

No code changes needed - it's automatic!

## Example: Enhanced Candidate Analysis

**Without MCP:**
```
Candidate: Alex Chen
Score: 75
Analysis: Good fit based on skills
```

**With MCP:**
```
Candidate: Alex Chen
Score: 75
Market Position: Above average (avg: 65)
Similar Candidates: 12 found
Analysis: Strong candidate, above market average, highly recommended
```

## MCP Server Tools

### search_candidates
```json
{
  "query": "Python developer",
  "skills": ["Python", "FastAPI"],
  "location": "Sydney",
  "minExperience": 3,
  "openToWork": true,
  "limit": 10
}
```

### get_candidate_by_id
```json
{
  "candidateId": "550e8400-e29b-41d4-a716-446655440001"
}
```

### get_candidates_for_job
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440010",
  "minScore": 60
}
```

## Benefits

1. **Better AI Analysis**: AI has access to market context
2. **Improved Recommendations**: Recommendations consider market position
3. **Enhanced Personalization**: Messages can reference market insights
4. **Future-Proof**: Ready for external MCP clients and AI agents

## Next Steps

- Connect external MCP clients (Claude, GPT-4, etc.)
- Add more MCP tools (analytics, trends, etc.)
- Create MCP-based AI workflows
- Integrate with other MCP servers
