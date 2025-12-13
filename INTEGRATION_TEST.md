# Integration Testing Guide

This guide helps you test the full integration between frontend and backend.

## Prerequisites

1. **Backend server running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend configured to use real API:**
   - Update `web/src/services/config.ts`:
     ```typescript
     export const USE_MOCKS = false;
     export const API_BASE_URL = "http://localhost:3000";
     ```

3. **Run data migration (if needed):**
   ```bash
   cd backend
   npm run migrate
   ```

## Test Checklist

### ✅ Job APIs

- [ ] **GET `/jd`** - Dashboard loads jobs
  - Open dashboard
  - Verify jobs are displayed
  - Check job cards show: title, company, date, candidate count

- [ ] **POST `/jd`** - Create new job
  - Click "Create Job"
  - Fill in job details
  - Submit and verify job appears in list

- [ ] **GET `/:jdId`** - View job details
  - Click on a job card
  - Verify job details page loads
  - Check all fields display correctly

- [ ] **PUT `/:jdId`** - Update job filters
  - Edit job filters
  - Save and verify changes persist

### ✅ Candidate APIs

- [ ] **GET `/:jdId/cd`** - View candidates
  - Open a job detail page
  - Verify candidates list loads
  - Check candidate cards show: name, match score, skills

- [ ] **POST `/:jobId/cd/external-search`** - Search external candidates
  - Use external search feature
  - Verify new candidates appear
  - Check they're marked as "external"

- [ ] **PUT `/:jobId/cd/:candidateId/stage`** - Update candidate stage
  - Drag candidate to different stage
  - Or use stage dropdown
  - Verify stage updates immediately

- [ ] **POST `/:jobId/cd/batch-move`** - Batch move candidates
  - Select multiple candidates
  - Use batch move feature
  - Verify all selected candidates move

### ✅ Message APIs

- [ ] **POST `/:jobId/cd/:candidateId/messages`** - Send message
  - Open candidate side panel
  - Type and send a message
  - Verify message appears in conversation
  - Check message is stored

### ✅ AI APIs

- [ ] **POST `/:jobId/cd/:candidateId/ai/analyze`** - Analyze candidate
  - Click "Analyze" on a candidate
  - Verify fit score, summary, recommendation appear
  - Check results are stored

- [ ] **POST `/:jobId/cd/:candidateId/ai/draft-message`** - Draft message
  - Click "Draft Message"
  - Verify message text appears
  - Check it's editable

- [ ] **POST `/:jobId/cd/:candidateId/ai/summarize-conversation`** - Summarize
  - After sending messages, click "Summarize"
  - Verify summary appears

- [ ] **POST `/:jobId/cd/:candidateId/ai/suggest-message`** - Suggest next message
  - After receiving a message, use suggest feature
  - Verify suggestion appears

- [ ] **POST `/:jobId/cd/:candidateId/ai/suggest-times`** - Suggest interview times
  - Use interview scheduling feature
  - Verify time slots appear

- [ ] **POST `/:jobId/cd/:candidateId/ai/draft-offer`** - Draft offer
  - Use offer drafting feature
  - Verify offer text appears

- [ ] **POST `/:jobId/cd/:candidateId/ai/negotiate`** - Help negotiate
  - Use negotiation help feature
  - Verify response appears

- [ ] **POST `/:jobId/cd/:candidateId/ai/decision-summary`** - Decision summary
  - Make a hire/reject decision
  - Generate summary
  - Verify summary appears

## Data Verification

### Check Data Transformations

1. **Job Fields:**
   - `id` (frontend) ↔ `jobId` (backend) ✓
   - `title` (frontend) ↔ `job_title` (backend) ✓
   - `description` (frontend) ↔ `jd_text` (backend) ✓
   - `company` (frontend) ↔ `company_name` (backend) ✓
   - `filters` (frontend) ↔ `extracted_keywords` (backend) ✓
   - `pipelineStages` (frontend) ↔ `pipelineStages` (backend) ✓

2. **Candidate Fields:**
   - `id` (frontend) ↔ `candidateId` (backend) ✓
   - `name` (frontend) ↔ `full_name` (backend) ✓
   - `matchScore` (frontend) ↔ `score` (backend) ✓
   - `pipelineStage` (frontend) ↔ `pipelineStage` (backend) ✓
   - `experience`, `location`, `skills` extracted correctly ✓

## Common Issues & Solutions

### Issue: No jobs showing
**Solution:** 
- Check backend server is running
- Verify `backend/src/data/jobs.json` has data
- Check browser console for errors
- Verify API_BASE_URL is correct

### Issue: No candidates for job
**Solution:**
- Run migration: `npm run migrate` in backend
- Verify candidates have scores for that job
- Check `backend/src/data/candidates.json` has scores array

### Issue: Pipeline stages not working
**Solution:**
- Verify jobs have `pipelineStages` field
- Check database methods are called correctly
- Verify stage updates are persisted

### Issue: AI endpoints not working
**Solution:**
- Check `GEMINI_API_KEY` is set (optional - will use fallback)
- Verify AI service is imported correctly
- Check error logs in backend console

### Issue: CORS errors
**Solution:**
- Verify CORS middleware is enabled in `server.ts`
- Check frontend is calling correct URL
- Verify headers are set correctly

## Automated Testing

Run the test script:
```bash
./test-api.sh
```

This will test:
- GET `/jd`
- GET `/:jdId/cd`
- PUT `/:jobId/cd/:candidateId/stage`
- POST `/:jobId/cd/:candidateId/messages`
- POST `/:jobId/cd/:candidateId/ai/analyze`

## Manual Testing Flow

1. **Start Backend:**
   ```bash
   cd backend
   npm run migrate  # Run migration first
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd web
   npm run dev
   ```

3. **Test Flow:**
   - Open dashboard → Verify jobs load
   - Click job → Verify candidates load
   - Click candidate → Verify details load
   - Update stage → Verify persists
   - Send message → Verify stored
   - Use AI features → Verify work

## Success Criteria

- ✅ All 17 endpoints work correctly
- ✅ Data displays correctly in frontend
- ✅ All CRUD operations work
- ✅ Pipeline stages update correctly
- ✅ Messages are stored and retrieved
- ✅ AI features work (with or without API key)
- ✅ No console errors
- ✅ Data persists across page refreshes
