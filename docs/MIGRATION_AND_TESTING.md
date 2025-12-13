# Migration and Testing Guide

## Step 1: Migrate Mock Data

### Run the Migration Script

```bash
cd server
npm run migrate
```

This will:
- ✅ Add `pipelineStages` to all jobs (if missing)
- ✅ Add `scores` array to all candidates (if missing)
- ✅ Calculate and add scores for each candidate-job pair
- ✅ Generate score breakdowns based on skills, experience, and location matching

### What the Migration Does

1. **Jobs Migration:**
   - Adds default `pipelineStages`: `["new", "engaged", "closing"]`
   - Preserves all existing job data

2. **Candidates Migration:**
   - Creates `scores` array for each candidate
   - For each job, calculates a match score based on:
     - Skill matching (fuzzy match)
     - Experience level comparison
     - Location matching
   - Generates score breakdown with reasons
   - Creates default outreach messages

### Verify Migration

After running migration, check:
```bash
# Check jobs have pipelineStages
cat server/src/data/jobs.json | grep -A 5 "pipelineStages"

# Check candidates have scores
cat server/src/data/candidates.json | grep -A 3 "scores"
```

## Step 2: Integration Testing

### Quick Test (Automated)

```bash
# From project root
./test-api.sh
```

### Full Integration Test (Manual)

1. **Start Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Configure Frontend:**
   - Edit `web/src/services/config.ts`:
     ```typescript
     export const USE_MOCKS = false;
     export const API_BASE_URL = "http://localhost:3000";
     ```

3. **Start Frontend:**
   ```bash
   cd web
   npm run dev
   ```

4. **Test in Browser:**
   - Open http://localhost:5173 (or your frontend port)
   - Follow the test checklist in `INTEGRATION_TEST.md`

## Test Results Checklist

### ✅ Core Functionality
- [ ] Dashboard loads jobs from server
- [ ] Job detail page loads candidates
- [ ] Candidate side panel shows details
- [ ] Pipeline stages display correctly
- [ ] Stage updates persist

### ✅ Data Transformations
- [ ] Job fields map correctly (id, title, description, company)
- [ ] Candidate fields map correctly (id, name, matchScore, etc.)
- [ ] Filters display correctly
- [ ] Pipeline stages display correctly

### ✅ CRUD Operations
- [ ] Create job works
- [ ] Update job works
- [ ] Update candidate stage works
- [ ] Batch move candidates works

### ✅ Messaging
- [ ] Send message works
- [ ] Messages appear in conversation history
- [ ] Messages persist after refresh

### ✅ AI Features
- [ ] Analyze candidate works
- [ ] Draft message works
- [ ] Summarize conversation works
- [ ] Suggest message works
- [ ] Suggest times works
- [ ] Draft offer works
- [ ] Negotiate works
- [ ] Decision summary works

## Troubleshooting

### Migration Issues

**Error: "Cannot find module"**
- Run `npm install` in server
- Make sure TypeScript is compiled: `npm run build`

**Error: "File not found"**
- Verify `server/src/data/jobs.json` and `candidates.json` exist
- Check file paths in migration script

### Testing Issues

**No data showing:**
- Verify migration ran successfully
- Check server server is running
- Verify API_BASE_URL is correct
- Check browser console for errors

**Data not persisting:**
- Verify database write permissions
- Check file paths are correct
- Verify db methods are called

## Next Steps After Testing

1. **Fix any issues found** during testing
2. **Optimize performance** if needed
3. **Add error handling** for edge cases
4. **Document any limitations** or known issues
5. **Prepare for production** deployment
