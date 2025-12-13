# Testing Guide for Backend API Integration

This guide will help you test all 17 frontend-compatible API endpoints we just built.

## Prerequisites

1. **Start the backend server:**
   ```bash
   cd backend
   npm install  # if you haven't already
   npm start
   # or
   npm run dev  # if you have a dev script
   ```

2. **Verify server is running:**
   - Check console for: `🚀 Server running on port 3000`
   - Visit: `http://localhost:3000` (should show API operational message)

## Testing Methods

### Option 1: Using cURL (Command Line)

### Option 2: Using the Frontend

### Option 3: Using Postman/Thunder Client

---

## Test Cases

### 1. Job APIs

#### GET `/jd` - List all jobs
```bash
curl http://localhost:3000/jd
```

**Expected Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Senior Backend Engineer",
    "description": "We are seeking...",
    "company": "CoolStartup Co.",
    "createdAt": "2025-12-10T10:00:00.000Z",
    "candidateCount": 5,
    "filters": {
      "experience": ["5+ years"],
      "location": ["Sydney"],
      "skills": ["Python", "FastAPI", "Postgres"]
    },
    "pipelineStages": [
      { "id": "new", "name": "New", "order": 0 },
      { "id": "engaged", "name": "Engaged", "order": 1 },
      { "id": "closing", "name": "Closing", "order": 2 }
    ]
  }
]
```

#### POST `/jd` - Create a new job
```bash
curl -X POST http://localhost:3000/jd \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer",
    "description": "We need a React developer...",
    "company": "TechCorp",
    "filters": {
      "experience": ["3-5 years"],
      "location": ["Remote"],
      "skills": ["React", "TypeScript"]
    },
    "message": "Hello! We have an exciting opportunity..."
  }'
```

**Expected Response:** Job object in frontend format with generated `id` and `createdAt`

#### GET `/:jdId` - Get job by ID
```bash
# Replace {jobId} with an actual job ID from the list
curl http://localhost:3000/550e8400-e29b-41d4-a716-446655440010
```

**Expected Response:** Single job object in frontend format

#### PUT `/:jdId` - Update job
```bash
curl -X PUT http://localhost:3000/550e8400-e29b-41d4-a716-446655440010 \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "experience": ["5-7 years"],
      "location": ["Sydney", "Remote"],
      "skills": ["Python", "FastAPI", "Postgres", "Docker"]
    },
    "pipelineStages": [
      { "id": "new", "name": "New", "order": 0 },
      { "id": "screening", "name": "Screening", "order": 1 },
      { "id": "interview", "name": "Interview", "order": 2 },
      { "id": "offer", "name": "Offer", "order": 3 }
    ]
  }'
```

**Expected Response:** Updated job object

---

### 2. Candidate APIs

#### GET `/:jdId/cd` - Get candidates for a job
```bash
# Replace {jobId} with an actual job ID
curl http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd
```

**Expected Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Alex Chen",
    "email": "alex.chen@gmail.com",
    "experience": "1 years",
    "location": "Brisbane",
    "skills": ["Next.js", "Tailwind CSS", "Supabase"],
    "headline": "Software Engineer",
    "status": "Not actively looking",
    "matchScore": 75,
    "pipelineStage": "new",
    "source": "seeded"
  }
]
```

#### POST `/:jobId/cd/external-search` - Search external candidates
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/external-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "React"
  }'
```

**Expected Response:** Array of external candidates matching the query

#### PUT `/:jobId/cd/:candidateId/stage` - Update candidate stage
```bash
curl -X PUT http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/550e8400-e29b-41d4-a716-446655440001/stage \
  -H "Content-Type: application/json" \
  -d '{
    "stageId": "engaged"
  }'
```

**Expected Response:**
```json
{
  "success": true
}
```

#### POST `/:jobId/cd/batch-move` - Batch move candidates
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/batch-move \
  -H "Content-Type: application/json" \
  -d '{
    "criteria": {
      "minMatchScore": 70,
      "maxMatchScore": 100
    },
    "targetStageId": "engaged"
  }'
```

**Expected Response:**
```json
{
  "count": 3
}
```

---

### 3. Message APIs

#### POST `/:jobId/cd/:candidateId/messages` - Send message
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/550e8400-e29b-41d4-a716-446655440001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hi Alex, I noticed your background in Next.js and thought you might be interested in our role."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "msg-1234567890-abc123"
}
```

**Verify message was stored:**
```bash
# Get candidates again and check conversationHistory
curl http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd
# Look for the candidate and check conversationHistory array
```

---

### 4. AI APIs

#### POST `/:jobId/cd/:candidateId/ai/analyze` - Analyze candidate
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/550e8400-e29b-41d4-a716-446655440001/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "fitScore": 82,
  "summary": "Strong candidate with relevant experience...",
  "recommendation": "reach_out",
  "confidence": 90
}
```

#### POST `/:jobId/cd/:candidateId/ai/draft-message` - Draft first message
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/550e8400-e29b-41d4-a716-446655440001/ai/draft-message \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:** Message string

#### POST `/:jobId/cd/:candidateId/ai/summarize-conversation` - Summarize conversation
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/550e8400-e29b-41d4-a716-446655440001/ai/summarize-conversation \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:** Summary string

#### POST `/:jobId/cd/:candidateId/ai/suggest-message` - Suggest next message
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/550e8400-e29b-41d4-a716-446655440001/ai/suggest-message \
  -H "Content-Type: application/json" \
  -d '{
    "lastMessage": "Yes, I am interested!"
  }'
```

**Expected Response:** Suggested message string

#### POST `/:jobId/cd/:candidateId/ai/suggest-times` - Suggest interview times
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/550e8400-e29b-41d4-a716-446655440001/ai/suggest-times \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:** Array of ISO date strings
```json
[
  "2025-12-15T10:00:00.000Z",
  "2025-12-15T14:00:00.000Z",
  "2025-12-16T10:00:00.000Z"
]
```

#### POST `/:jobId/cd/:candidateId/ai/draft-offer` - Draft offer letter
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/550e8400-e29b-41d4-a716-446655440001/ai/draft-offer \
  -H "Content-Type: application/json" \
  -d '{
    "terms": {
      "salary": "$130,000",
      "startDate": "2025-01-15"
    }
  }'
```

**Expected Response:** Offer letter text

#### POST `/:jobId/cd/:candidateId/ai/negotiate` - Help negotiate
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/550e8400-e29b-41d4-a716-446655440001/ai/negotiate \
  -H "Content-Type: application/json" \
  -d '{
    "request": "I would like to negotiate the salary"
  }'
```

**Expected Response:** Negotiation response text

#### POST `/:jobId/cd/:candidateId/ai/decision-summary` - Generate decision summary
```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440010/cd/550e8400-e29b-41d4-a716-446655440001/ai/decision-summary \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "hire"
  }'
```

**Expected Response:** Decision summary text

---

## Testing with Frontend

### Step 1: Update Frontend API Configuration

Make sure your frontend is configured to use the backend API instead of mocks.

**Check `web/src/services/config.ts`:**
```typescript
// Should be set to false to use real API
export const USE_MOCKS = false;

// Should point to your backend
export const API_BASE_URL = "http://localhost:3000";
```

### Step 2: Start Frontend
```bash
cd web
npm install  # if needed
npm run dev
```

### Step 3: Test in Browser

1. **Dashboard** - Should show jobs from backend
2. **Job Detail** - Should show candidates from backend
3. **Candidate Actions** - Test pipeline stage updates, messaging, AI features

---

## Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing Backend API..."
echo "======================"

# Test 1: Get all jobs
echo -e "\n1. GET /jd"
curl -s "$BASE_URL/jd" | jq '.[0] | {id, title, company, candidateCount}' || echo "Failed"

# Test 2: Get candidates for first job
echo -e "\n2. GET /:jdId/cd"
JOB_ID=$(curl -s "$BASE_URL/jd" | jq -r '.[0].id')
curl -s "$BASE_URL/$JOB_ID/cd" | jq '.[0] | {id, name, matchScore, pipelineStage}' || echo "Failed"

# Test 3: Update candidate stage
echo -e "\n3. PUT /:jobId/cd/:candidateId/stage"
CANDIDATE_ID=$(curl -s "$BASE_URL/$JOB_ID/cd" | jq -r '.[0].id')
curl -s -X PUT "$BASE_URL/$JOB_ID/cd/$CANDIDATE_ID/stage" \
  -H "Content-Type: application/json" \
  -d '{"stageId": "engaged"}' | jq '.' || echo "Failed"

# Test 4: Send message
echo -e "\n4. POST /:jobId/cd/:candidateId/messages"
curl -s -X POST "$BASE_URL/$JOB_ID/cd/$CANDIDATE_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}' | jq '.' || echo "Failed"

echo -e "\n======================"
echo "Tests completed!"
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Common Issues & Solutions

### Issue: "Cannot GET /jd"
**Solution:** Make sure the server is running and routes are registered correctly. Check `backend/src/api/server.ts`

### Issue: "Job not found"
**Solution:** Use an actual job ID from your `backend/src/data/jobs.json` file

### Issue: "Candidate not found"
**Solution:** Make sure the candidate has a score entry for that job in `backend/src/data/candidates.json`

### Issue: AI endpoints return fallback responses
**Solution:** Check if `GEMINI_API_KEY` is set in your `.env` file. AI endpoints will work without it but use simpler fallback logic.

### Issue: CORS errors when testing from frontend
**Solution:** Add CORS middleware to `backend/src/api/server.ts`:
```typescript
import cors from 'cors';
app.use(cors());
```

---

## Verification Checklist

- [ ] Backend server starts without errors
- [ ] GET `/jd` returns jobs in frontend format
- [ ] POST `/jd` creates job and returns frontend format
- [ ] GET `/:jdId` returns single job
- [ ] PUT `/:jdId` updates job
- [ ] GET `/:jdId/cd` returns candidates in frontend format
- [ ] POST `/:jobId/cd/external-search` returns candidates
- [ ] PUT `/:jobId/cd/:candidateId/stage` updates stage
- [ ] POST `/:jobId/cd/batch-move` moves candidates
- [ ] POST `/:jobId/cd/:candidateId/messages` sends message
- [ ] All 8 AI endpoints return expected formats
- [ ] Frontend can connect and display data
- [ ] Data transformations are correct (field names match frontend expectations)

---

## Next Steps

1. Test each endpoint individually
2. Test the full flow: Create job → Get candidates → Update stage → Send message → Use AI features
3. Test edge cases: Missing data, invalid inputs, etc.
4. Verify frontend integration works end-to-end
