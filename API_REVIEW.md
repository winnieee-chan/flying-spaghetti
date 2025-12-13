# API Implementation Plan

## Current State

### What We Have

**API Service (`src/services/api.js`)**
- Mock-based API abstraction layer
- Endpoints:
  - `POST /jd` - Create job with full job object
  - `GET /jd` - Get all jobs
  - `GET /jd-id` - Get job description
  - `PUT /jd-id` - Update job filters
  - `GET /jd-id/cd` - Get candidates list
  - `GET /jd-id/cd-id` - Get candidate detail
- Simulated network latency (100-400ms)
- All mock data contained in this file

**Job Store (`src/stores/jobStore.js`)**
- Zustand store for job state management
- State: `jobs`, `currentJob`, `filters`, `candidates`, `loading`, `error`
- Actions:
  - `fetchJobs()` - Get all jobs
  - `createJob(jobData)` - Create job with full object
  - `fetchJob(jdId)` - Get specific job
  - `updateFilters(jdId, filters)` - Update filters only
  - `fetchCandidates(jdId)` - Get candidates for job
- All async calls go through `api.*` methods

**Mock Data Structure**
- Jobs: `{ id, title, description, company, filters, message }`
- Candidates: `{ id, name, email, experience, location, skills, status }`

**Components**
- `SetupNotification.jsx` - Notification setup (separate feature)
- `ViewNotification.jsx` - Notification viewing (separate feature)

---

## Target State

### What We Want

**API Service (`src/services/api.js`)**
- REST-style endpoints matching backend contract:
  - `POST /jobs` - Upload JD text, triggers LLM extraction, returns job with extracted filters/ratios
  - `GET /jobs/:jobId` - Get filters/ratios (LLM-extracted or user-refined)
  - `PUT /jobs/:jobId` - Save final filters/ratios (with scoring weights)
  - `GET /jobs/:jobId/candidates` - Get ranked candidate list (supports query params: `?sort=score&exclude_open_to_work=true`)
  - `GET /jobs/:jobId/candidates/:candidateId` - Get candidate detail with score breakdown
  - `POST /jobs/:jobId/candidates/sendall` - Generate and send personalized messages to all candidates
  - `POST /candidates/:candidateId/send` - Send email to specific candidate
- Query parameter support for candidate filtering
- Mock data includes ratios (scoring weights) and candidate scores

**Job Store (`src/stores/jobStore.js`)**
- State: `jobs`, `currentJob`, `filters`, `ratios`, `candidates`, `loading`, `error`
- Actions:
  - `fetchJobs()` - Get all jobs
  - `createJob({ jdText })` - Upload JD text, returns job with LLM-extracted filters
  - `fetchJob(jobId)` - Get job with filters and ratios
  - `updateFiltersAndRatios(jobId, { filters, ratios })` - Save final filters and scoring weights
  - `fetchCandidates(jobId, queryParams)` - Get ranked candidates with optional filtering
  - `fetchCandidateDetail(jobId, candidateId)` - Get candidate with score breakdown
  - `sendMessagesToAll(jobId)` - Send emails to all candidates
  - `sendMessageToCandidate(candidateId)` - Send email to one candidate

**Mock Data Structure**
- Jobs: 
  ```javascript
  {
    id,
    jdText, // Original JD text
    title, // Extracted or user-provided
    description, // Extracted or user-provided
    company, // Extracted or user-provided
    filters: {
      experience: [],
      location: [],
      skills: [],
      // ... other filter categories
    },
    ratios: { // Scoring weights for candidate matching
      skillWeight: 0.4,
      experienceWeight: 0.3,
      locationWeight: 0.2,
      // ... other scoring weights
    },
    message: "Personalized message template"
  }
  ```
- Candidates:
  ```javascript
  {
    id,
    name,
    email,
    experience,
    location,
    skills,
    status,
    score: 0.85, // Matching score (0-1)
    scoreBreakdown: { // Score details
      skillMatch: 0.9,
      experienceMatch: 0.8,
      locationMatch: 0.7
    },
    enrichment: { // Additional data
      linkedinUrl: "...",
      githubUrl: "...",
      // ... other enrichment data
    }
  }
  ```

**Page Workflow**
1. **Dashboard** - List all jobs, navigate to create job
2. **Create Job Page** - Upload JD text, review/edit keywords (filters/ratios), confirm → triggers candidate search
3. **Candidate List Page** - Display ranked candidates with:
   - Name
   - Email
   - Overall matching score
4. **Candidate Detail Page** - Show:
   - Personal details
   - Matching score breakdown
   - Summary of matching

**API Flow**
1. Dashboard → `GET /jobs` (list all jobs)
2. Create Job Page → `POST /jobs` (upload JD text, get LLM-extracted filters/ratios)
3. Create Job Page → `PUT /jobs/:jobId` (save refined filters/ratios, triggers search)
4. Candidate List Page → `GET /jobs/:jobId/candidates?sort=score` (get ranked candidates)
5. Candidate Detail Page → `GET /jobs/:jobId/candidates/:candidateId` (get candidate with score breakdown)

**Components**
- **Dashboard Component** - List all jobs, create new job button
- **CreateJob Component** - Upload JD text, review/edit keywords (filters/ratios), confirm and search
- **CandidateList Component** - Display candidates with name, email, overall matching score
- **CandidateDetail Component** - Show personal details, matching score breakdown, matching summary

---

## Implementation Plan

### Phase 1: API Layer
1. Update endpoint paths to `/jobs` and `/candidates` pattern
2. Implement `POST /jobs` to accept `{ jdText }` and return job with extracted filters/ratios
3. Implement `GET /jobs/:jobId` to return filters and ratios
4. Implement `PUT /jobs/:jobId` to accept filters and ratios
5. Add query parameter support to `GET /jobs/:jobId/candidates`
6. Implement `POST /jobs/:jobId/candidates/sendall` endpoint
7. Implement `POST /candidates/:candidateId/send` endpoint
8. Update mock data structure to include ratios and candidate scores

### Phase 2: Store Layer
1. Add `ratios` to store state
2. Update `createJob()` to accept `{ jdText }` instead of full job object
3. Update `fetchJob()` to handle and store ratios
4. Update `updateFilters()` to handle both filters and ratios
5. Update `fetchCandidates()` to support query parameters
6. Add `fetchCandidateDetail()` action
7. Add `sendMessagesToAll()` action
8. Add `sendMessageToCandidate()` action
9. Update all API calls to use new endpoint paths

### Phase 3: Mock Data Enhancement
1. Add `ratios` object to job mock data
2. Add `score` and `scoreBreakdown` to candidate mock data
3. Add `enrichment` data to candidates
4. Simulate LLM processing delay for `POST /jobs`
5. Implement query parameter filtering for candidates

### Phase 4: Components
1. Create Dashboard component - List all jobs, create new job navigation
2. Create CreateJob component - Upload JD text, review/edit keywords (filters/ratios), confirm and search
3. Create CandidateList component - Display candidates with name, email, overall matching score
4. Create CandidateDetail component - Show personal details, matching score breakdown, matching summary
5. Update routing to connect all pages

---

## Key Features

### Job Creation Flow
1. **Dashboard** - View all jobs, click to create new job
2. **Create Job Page** - Upload JD text → LLM extracts keywords → Returns recommended filters/ratios
3. **Create Job Page** - Recruiter reviews and refines keywords → Saves final filters/ratios → Triggers candidate search
4. **Candidate List Page** - View ranked candidates with overall matching scores
5. **Candidate Detail Page** - View detailed candidate information with score breakdown

### Candidate Matching
- Candidates ranked by matching score (0-1)
- Score breakdown shows skill, experience, location match percentages
- Query parameters allow filtering (sort, exclude_open_to_work, etc.)

### Candidate Display
- **List View**: Name, email, overall matching score (sorted by score)
- **Detail View**: Personal details, matching score breakdown (skill, experience, location), matching summary

---

## Notes

- All mock data and simulation logic stays in `api.js` (single source of truth)
- LLM processing is async and may take time - proper loading states required
- Scoring weights (ratios) control how candidates are ranked
- Query parameters provide flexible candidate filtering
- Email sending triggers message generation and delivery
