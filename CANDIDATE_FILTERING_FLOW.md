# Candidate Filtering Flow - How Candidates are Matched to Jobs

## Overview
This document explains how candidates are filtered and matched when a job is created in the system.

## Flow Diagram

```
Job Creation → Keyword Extraction → Candidate Sourcing → Scoring → Storage → Retrieval
```

## Step-by-Step Process

### 1. Job Creation (`POST /api/v1/jobs`)

**Location:** `server/src/api/routes/jobRoutes.ts:30`

When a job is created:
- Input: `jd_text`, `job_title`, `company_name`
- The `createJob` service extracts keywords from the job description
- Keywords extracted include:
  - `role`: Job title/role
  - `skills`: Required technical skills
  - `min_experience_years`: Minimum years of experience
  - `location`: Job location

**Example:**
```json
{
  "jd_text": "We are seeking a Senior Backend Engineer...",
  "job_title": "Senior Backend Engineer",
  "company_name": "CoolStartup Co."
}
```

**Extracted Keywords:**
```json
{
  "role": "Senior Backend Engineer",
  "skills": ["Python", "FastAPI", "Postgres"],
  "min_experience_years": 5,
  "location": "Sydney"
}
```

### 2. Candidate Sourcing (`POST /api/v1/jobs/:jobId/source`)

**Location:** `server/src/api/routes/jobRoutes.ts:257`
**Service:** `server/src/services/sourcingService.ts`

**Process:**
1. **LinkedIn Search via Apify:**
   - Uses Apify's LinkedIn profile search API
   - Searches by: role, skills, location
   - Returns LinkedIn profiles matching the criteria
   - Falls back to mock data if Apify is unavailable

2. **Candidate Scoring Algorithm:**
   Each candidate is scored based on 4 factors (total: 100 points):

   **a. Role Match (30 points)**
   - Checks if candidate's headline contains the required role
   - Case-insensitive matching
   - Example: "Senior Backend Engineer" matches "Backend Engineer"

   **b. Skills Match (40 points)**
   - Compares candidate's skills with required skills
   - Calculates: `(matched_skills / total_required_skills) * 40`
   - Partial matching (substring matching)
   - Example: If 3 out of 5 required skills match → 24 points

   **c. Location Match (15 points)**
   - Checks if candidate location matches job location
   - Special case: If job is "Remote", all candidates get 15 points
   - Partial matching (substring matching)

   **d. Experience Match (15 points)**
   - Compares candidate's years of experience with required years
   - If candidate has >= required years → 15 points
   - If candidate has < required years → `(candidate_years / required_years) * 15`

3. **Score Breakdown:**
   Each candidate gets a `breakdown_json` array showing scoring details:
   ```json
   [
     {
       "signal": "role_match",
       "value": 30,
       "reason": "Role matches: Senior Backend Engineer"
     },
     {
       "signal": "skill_match",
       "value": 24,
       "reason": "Matched 3 skills: Python, FastAPI, Postgres"
     },
     {
       "signal": "location",
       "value": 15,
       "reason": "Location: Sydney vs Sydney"
     },
     {
       "signal": "experience",
       "value": 15,
       "reason": "5 years of experience (required: 5)"
     }
   ]
   ```

4. **Outreach Message Generation:**
   - Automatically generates personalized outreach messages
   - Includes matched skills and job details
   - Example: "Hi Alex, I noticed your experience with Python, FastAPI, Postgres..."

5. **Candidate Transformation:**
   - Transforms LinkedIn profiles to internal candidate format
   - Creates candidate structure with:
     - Basic info (name, email, bio)
     - Keywords (role, skills, experience, location)
     - Scores array (one entry per job)
     - Outreach messages
     - Pipeline stage (default: "sourced")

### 3. Candidate Storage

**Location:** `server/src/db/jsonDb.ts:83`

Candidates are stored in `server/src/data/candidates.json` with:
- Each candidate has a `scores` array
- Each score entry is linked to a specific `job_id`
- Structure:
  ```json
  {
    "_id": "candidate-id",
    "full_name": "Alex Chen",
    "email": "alex.chen@example.com",
    "scores": [
      {
        "job_id": "job-id-1",
        "score": 84,
        "breakdown_json": [...],
        "outreach_messages": [...],
        "pipelineStage": "sourced"
      }
    ]
  }
  ```

**Note:** Currently, sourced candidates are returned but may need to be explicitly saved via a separate endpoint (check frontend implementation).

### 4. Candidate Retrieval (`GET /api/v1/jobs/:jobId/candidates`)

**Location:** `server/src/api/routes/jobRoutes.ts:102`

**Filtering Options:**
- `sort`: Sort by score (default: by score descending)
- `exclude_open_to_work`: Filter out candidates not open to work

**Process:**
1. Gets all candidates with scores for the job
2. Filters by `open_to_work` if requested
3. Sorts by score (highest first)
4. Returns candidate list with scores

### 5. Frontend Retrieval (`GET /:jdId/cd`)

**Location:** `server/src/api/routes/frontendCandidateRoutes.ts:45`

- Gets candidates in frontend-compatible format
- Includes full candidate data + scores
- Transforms backend format to frontend format

## Scoring Formula Summary

```
Total Score = Role Match + Skills Match + Location Match + Experience Match

Role Match:     30 points (if headline contains role)
Skills Match:   40 points * (matched_skills / total_required_skills)
Location Match: 15 points (if location matches or job is remote)
Experience:     15 points (if experience >= required, else proportional)
```

## Key Files

1. **Job Creation:** `server/src/api/routes/jobRoutes.ts:30`
2. **Candidate Sourcing:** `server/src/services/sourcingService.ts:22`
3. **Scoring Logic:** `server/src/services/sourcingService.ts:32-95`
4. **Database Storage:** `server/src/db/jsonDb.ts:83`
5. **Candidate Retrieval:** `server/src/api/routes/jobRoutes.ts:102`

## Example Flow

1. **Create Job:**
   ```
   POST /api/v1/jobs
   {
     "jd_text": "Senior Backend Engineer with Python...",
     "job_title": "Senior Backend Engineer",
     "company_name": "TechCorp"
   }
   ```

2. **Source Candidates:**
   ```
   POST /api/v1/jobs/{jobId}/source
   → Searches LinkedIn
   → Scores candidates
   → Returns scored candidates
   ```

3. **Get Candidates:**
   ```
   GET /api/v1/jobs/{jobId}/candidates?sort=score
   → Returns candidates sorted by score
   ```

## Notes

- Candidates are **not automatically saved** after sourcing - they need to be explicitly saved
- Scoring happens **during sourcing**, not after
- Each candidate can have scores for **multiple jobs** (stored in `scores` array)
- The scoring algorithm is **deterministic** - same candidate + same job = same score
