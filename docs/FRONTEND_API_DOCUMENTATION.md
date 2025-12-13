# Frontend API Documentation

This document lists all API calls made by the frontend, including their inputs, outputs, and descriptions. This will help match with server endpoints and migrate mock data.

## Table of Contents

1. [Job APIs](#job-apis)
2. [Candidate APIs](#candidate-apis)
3. [AI APIs](#ai-apis)
4. [Workflow APIs](#workflow-apis)
5. [Backend Comparison](#server-comparison)
6. [Migration Notes](#migration-notes)

---

## Job APIs

### 1. GET `/jd`
**Description:** Fetch all job descriptions

**Method:** `GET`

**Input:** None

**Output:**
```typescript
Job[]
```

**Type Definition:**
```typescript
interface Job {
  id: string;
  title: string;
  description?: string;
  company: string;
  createdAt: string;
  candidateCount?: number;
  filters?: JobFilters;
  message?: string;
  pipelineStages?: PipelineStage[];
}

interface JobFilters {
  experience?: string[];
  location?: string[];
  skills?: string[];
}

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color?: string;
}
```

**Used in:** `jobStore.ts` - `fetchJobs()`

**Backend Match:** ❌ No direct match. Backend has `GET /jobs` but different structure.

---

### 2. POST `/jd`
**Description:** Create a new job description

**Method:** `POST`

**Input:**
```typescript
{
  title?: string;
  description?: string;
  company?: string;
  filters?: JobFilters;
  message?: string;
  pipelineStages?: PipelineStage[];
}
```

**Output:**
```typescript
Job
```

**Used in:** `jobStore.ts` - `createJob()`

**Backend Match:** ✅ `POST /jobs` exists but expects different input:
- Backend expects: `{ jd_text, job_title, company_name }`
- Frontend sends: `{ title, description, company, filters, message, pipelineStages }`

---

### 3. GET `/:jdId`
**Description:** Fetch a specific job description by ID

**Method:** `GET`

**Input:** Path parameter `jdId` (string)

**Output:**
```typescript
Job
```

**Used in:** `jobStore.ts` - `fetchJob()`

**Backend Match:** ✅ `GET /jobs/:jobId` exists but returns different structure:
- Backend returns: `{ jobId, status, extracted_keywords, scoring_ratios }`
- Frontend expects: Full `Job` object with `id, title, description, company, createdAt, filters, message, pipelineStages`

---

### 4. PUT `/:jdId`
**Description:** Update a job description (filters, pipeline stages, or other fields)

**Method:** `PUT`

**Input:**
```typescript
{
  filters?: JobFilters;
  title?: string;
  description?: string;
  company?: string;
  message?: string;
  pipelineStages?: PipelineStage[];
}
```

**Output:**
```typescript
Job
```

**Used in:** 
- `jobStore.ts` - `updateFilters()`
- `jobStore.ts` - `updatePipelineStages()`

**Backend Match:** ✅ `PUT /jobs/:jobId` exists but expects different input:
- Backend expects: `{ extracted_keywords, scoring_ratios }`
- Frontend sends: `{ filters, pipelineStages, title, description, company, message }`

---

## Candidate APIs

### 5. GET `/:jdId/cd`
**Description:** Fetch all candidates for a specific job

**Method:** `GET`

**Input:** Path parameter `jdId` (string)

**Output:**
```typescript
Candidate[]
```

**Type Definition:**
```typescript
interface Candidate {
  id: string;
  name: string;
  email: string;
  experience: string;
  location: string;
  skills: string[];
  resume?: string;
  status: string;
  avatar?: string;
  headline?: string;
  source?: "seeded" | "external";
  matchScore?: number;
  pipelineStage?: "new" | "engaged" | "closing";
  aiFitScore?: number;
  aiSummary?: string;
  aiRecommendation?: "reach_out" | "wait" | "archive" | "advance" | "offer" | "reject";
  conversationHistory?: Message[];
}

interface Message {
  id: string;
  from: "founder" | "candidate";
  content: string;
  timestamp: string;
  aiDrafted?: boolean;
}
```

**Used in:** `candidateStore.ts` - `fetchCandidates()`

**Backend Match:** ✅ `GET /jobs/:jobId/candidates` exists but returns different structure:
- Backend returns: `{ jobId, candidates: [{ candidateId, full_name, headline, github_username, score, open_to_work }] }`
- Frontend expects: Array of full `Candidate` objects

---

### 6. POST `/:jobId/cd/external-search`
**Description:** Search for external candidates and add them to the job's candidate pool

**Method:** `POST`

**Input:**
```typescript
{
  query: string;
}
```

**Output:**
```typescript
Candidate[]
```

**Used in:** `candidateStore.ts` - `searchExternalCandidates()`

**Backend Match:** ❌ No server endpoint exists

---

### 7. PUT `/:jobId/cd/:candidateId/stage`
**Description:** Update a candidate's pipeline stage

**Method:** `PUT`

**Input:**
```typescript
{
  stageId: string;
}
```

**Output:**
```typescript
{ success: boolean }
```

**Used in:** `candidateStore.ts` - `updateCandidateStage()`

**Backend Match:** ❌ No server endpoint exists

---

### 8. POST `/:jobId/cd/batch-move`
**Description:** Batch move candidates to a different pipeline stage based on match score criteria

**Method:** `POST`

**Input:**
```typescript
{
  criteria: {
    minMatchScore?: number;
    maxMatchScore?: number;
  };
  targetStageId: string;
}
```

**Output:**
```typescript
{
  count: number; // Number of candidates moved
}
```

**Used in:** `candidateStore.ts` - `batchMoveCandidates()`

**Backend Match:** ❌ No server endpoint exists

---

## AI APIs

### 9. POST `/:jobId/cd/:candidateId/ai/analyze`
**Description:** Analyze a candidate using AI to generate fit score, summary, and recommendation

**Method:** `POST`

**Input:**
```typescript
{} // Empty body
```

**Output:**
```typescript
{
  fitScore: number;
  summary: string;
  recommendation: string;
  confidence: number;
  suggestedMessage?: string;
}
```

**Used in:** `aiStore.ts` - `analyzeCandidate()`

**Backend Match:** ❌ No server endpoint exists

---

### 10. POST `/:jobId/cd/:candidateId/ai/draft-message`
**Description:** Draft the first outreach message to a candidate

**Method:** `POST`

**Input:**
```typescript
{} // Empty body
```

**Output:**
```typescript
string // Drafted message text
```

**Used in:** `aiStore.ts` - `draftFirstMessage()`

**Backend Match:** ❌ No server endpoint exists (but server has `outreach_messages` in candidate data)

---

### 11. POST `/:jobId/cd/:candidateId/ai/summarize-conversation`
**Description:** Generate a summary of the conversation with a candidate

**Method:** `POST`

**Input:**
```typescript
{} // Empty body
```

**Output:**
```typescript
string // Conversation summary
```

**Used in:** `aiStore.ts` - `summarizeConversation()`

**Backend Match:** ❌ No server endpoint exists

---

### 12. POST `/:jobId/cd/:candidateId/ai/suggest-message`
**Description:** Suggest the next message based on the last message in the conversation

**Method:** `POST`

**Input:**
```typescript
{
  lastMessage: string;
}
```

**Output:**
```typescript
string // Suggested message text
```

**Used in:** `aiStore.ts` - `suggestNextMessage()`

**Backend Match:** ❌ No server endpoint exists

---

### 13. POST `/:jobId/cd/:candidateId/ai/suggest-times`
**Description:** Suggest interview time slots for a candidate

**Method:** `POST`

**Input:**
```typescript
{} // Empty body
```

**Output:**
```typescript
Date[] // Array of suggested interview times
```

**Used in:** `aiStore.ts` - `suggestInterviewTimes()`

**Backend Match:** ❌ No server endpoint exists

---

### 14. POST `/:jobId/cd/:candidateId/ai/draft-offer`
**Description:** Draft an offer letter for a candidate

**Method:** `POST`

**Input:**
```typescript
{
  terms?: Record<string, unknown>; // e.g., { salary: string, startDate: string }
}
```

**Output:**
```typescript
string // Drafted offer letter text
```

**Used in:** `aiStore.ts` - `draftOffer()`

**Backend Match:** ❌ No server endpoint exists

---

### 15. POST `/:jobId/cd/:candidateId/ai/negotiate`
**Description:** Get AI assistance for negotiating with a candidate

**Method:** `POST`

**Input:**
```typescript
{
  request: string; // Candidate's negotiation request
}
```

**Output:**
```typescript
string // AI-generated negotiation response
```

**Used in:** `aiStore.ts` - `helpNegotiate()`

**Backend Match:** ❌ No server endpoint exists

---

### 16. POST `/:jobId/cd/:candidateId/ai/decision-summary`
**Description:** Generate a summary for a hiring decision (hire or reject)

**Method:** `POST`

**Input:**
```typescript
{
  decision: "hire" | "reject";
}
```

**Output:**
```typescript
string // Decision summary text
```

**Used in:** `aiStore.ts` - `generateDecisionSummary()`

**Backend Match:** ❌ No server endpoint exists

---

## Workflow APIs

### 17. POST `/:jobId/cd/:candidateId/messages`
**Description:** Send a message to a candidate

**Method:** `POST`

**Input:**
```typescript
{
  content: string;
}
```

**Output:**
```typescript
{ success: boolean; messageId?: string }
```

**Used in:** `workflowStore.ts` - `sendMessage()`

**Backend Match:** ✅ `POST /jobs/:jobId/candidates/:candidateId/send` exists but:
- Backend endpoint: `/jobs/:jobId/candidates/:candidateId/send`
- Frontend calls: `/:jobId/cd/:candidateId/messages`
- Backend returns: `{ candidateId, jobId, full_name, email_sent, message }`
- Frontend expects: `{ success: boolean, messageId?: string }`

---

## Summary Statistics

### Total API Endpoints: 17

**By Category:**
- Job APIs: 4
- Candidate APIs: 4
- AI APIs: 8
- Workflow APIs: 1

**By HTTP Method:**
- GET: 2
- POST: 12
- PUT: 3
- DELETE: 0

**Backend Match Status:**
- ✅ Matched (needs adaptation): 4
- ❌ Not matched: 13

---

## Backend Comparison

### Existing Backend Endpoints

#### Job Routes (`/jobs`)
1. `POST /jobs` - Create job (different input/output structure)
2. `GET /jobs/:jobId` - Get job (different output structure)
3. `PUT /jobs/:jobId` - Update job (different input structure)
4. `GET /jobs/:jobId/candidates` - Get candidates (different output structure)
5. `GET /jobs/:jobId/candidates/:candidateId` - Get candidate details
6. `POST /jobs/:jobId/candidates/sendall` - Send messages to all candidates
7. `POST /jobs/:jobId/candidates/:candidateId/send` - Send message to candidate

#### Candidate Routes (`/candidates`)
1. `GET /candidates` - Get all candidates (with filters)
2. `GET /candidates/:candidateId` - Get candidate profile
3. `POST /candidates/:candidateId/send` - Send job message to candidate

### Key Differences

1. **URL Structure:**
   - Frontend: `/jd`, `/:jdId/cd`, `/:jobId/cd/:candidateId/...`
   - Backend: `/jobs`, `/jobs/:jobId/candidates`, `/jobs/:jobId/candidates/:candidateId/...`

2. **Data Models:**
   - Frontend `Job`: `{ id, title, description, company, createdAt, filters, message, pipelineStages }`
   - Backend `Job`: `{ jobId, jd_text, job_title, company_name, status, extracted_keywords, scoring_ratios }`
   
   - Frontend `Candidate`: `{ id, name, email, experience, location, skills, matchScore, pipelineStage, aiFitScore, ... }`
   - Backend `CandidateScore`: `{ candidateId, full_name, headline, github_username, score, open_to_work, breakdown_json, outreach_messages }`

3. **Missing Backend Features:**
   - Pipeline stages management
   - AI analysis endpoints
   - External candidate search
   - Batch operations
   - Conversation history
   - Workflow state management

---

## Migration Notes

### Priority 1: Core Functionality
1. **Job CRUD Operations**
   - Map frontend `Job` model to server `Job` model
   - Create adapter layer to transform data structures
   - Update URL paths to match server (`/jd` → `/jobs`)

2. **Candidate Fetching**
   - Map server `CandidateScore` to frontend `Candidate`
   - Handle missing fields (experience, location, skills extraction)
   - Add candidate count to job responses

### Priority 2: Essential Features
3. **Message Sending**
   - Align endpoint paths (`/messages` vs `/send`)
   - Standardize response format

4. **Pipeline Stages**
   - Add pipeline stage support to server
   - Store stage in candidate data
   - Add batch move endpoint

### Priority 3: Advanced Features
5. **AI Endpoints**
   - Implement AI analysis endpoints
   - Integrate with LLM service
   - Add conversation summarization

6. **External Search**
   - Implement external candidate search
   - Integrate with external APIs or data sources

### Mock Data Migration

**Current Mock Data Structure:**
- `mockData.jobDescriptions`: Map<string, Job>
- `mockData.candidates`: Map<string, Candidate>
- `mockData.starredCandidates`: Map<string, Set<string>>

**Backend Data Structure:**
- `jobs.json`: Array of Job objects
- `candidates.json`: Array of Candidate objects
- In-memory database via `db.ts`

**Migration Strategy:**
1. Convert frontend mock data generators to server seed data
2. Map frontend types to server types
3. Create transformation utilities for data conversion
4. Update server routes to return frontend-compatible formats
