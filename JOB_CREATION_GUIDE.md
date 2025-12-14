# Guide: Creating a Job That Matches 80%+ of Candidates

## Understanding the Scoring System

Candidates are scored on a 100-point scale:
- **Role Match**: 30 points (if headline contains the role)
- **Skills Match**: 40 points (proportional: matched_skills / total_required_skills × 40)
- **Location Match**: 15 points (if location matches or job is remote)
- **Experience Match**: 15 points (if experience >= required, else proportional)

**To get 80% match (80+ points), a candidate needs:**
- Role match (30 pts) + Skills match (30+ pts) + Location (15 pts) + Experience (5+ pts) = 80+
- OR: Role match (30 pts) + Skills match (40 pts) + Location (15 pts) = 85
- OR: Role match (30 pts) + Skills match (35+ pts) + Location (15 pts) + Experience (15 pts) = 95+

## Step-by-Step Guide

### Step 1: Analyze Your Candidate Pool

Run this command to see your candidate pool statistics:
```bash
node -e "const fs = require('fs'); const candidates = JSON.parse(fs.readFileSync('server/src/data/candidates.json', 'utf8')); /* analysis code */"
```

### Step 2: Choose a Common Role

**Strategy**: Pick a role that appears in at least 30-40% of candidate headlines.

**Examples of broad roles that match many candidates:**
- "Software Engineer" (matches: Backend Engineer, Frontend Engineer, Full Stack Engineer, etc.)
- "Engineer" (matches almost all engineering roles)
- "Developer" (matches: Software Developer, Web Developer, etc.)

**Avoid**: Very specific roles like "Senior Principal Infrastructure Engineer" (too narrow)

### Step 3: Select Common Skills (3-5 skills)

**Strategy**: Choose skills that appear in 40%+ of candidates.

**Tips:**
- Include 1-2 very common skills (appears in 60%+ candidates) - guarantees high match
- Include 2-3 moderately common skills (appears in 30-50% candidates) - broadens match
- Avoid niche skills that only 5-10% have

**Example skill combinations for high match:**
- `["JavaScript", "Python", "React"]` - Very common stack
- `["Python", "Node.js", "PostgreSQL"]` - Backend focused
- `["React", "TypeScript", "Node.js"]` - Full stack

### Step 4: Set Location to "Remote"

**Strategy**: Set location to "Remote" to get automatic 15 points for ALL candidates.

**Why**: The scoring system gives 15 points if:
- Location matches exactly, OR
- Job location is "Remote" (matches everyone)

**Alternative**: If you want on-site, use the most common location from your candidate pool.

### Step 5: Set Low Experience Requirement

**Strategy**: Set minimum experience to 0-2 years to maximize experience match points.

**Why**: 
- If required = 0 years: Everyone gets 15 points
- If required = 2 years: Candidates with 2+ years get 15 points, others get proportional
- If required = 5 years: Only 5+ year candidates get full 15 points

**Recommendation**: Use 0-2 years for maximum match, or match the average experience in your pool.

## Example Job That Matches 80%+ Candidates

Based on typical candidate pools, here's an example:

```json
{
  "jd_text": "We are looking for a Software Engineer to join our team. You will work on building scalable web applications using modern technologies. Experience with JavaScript, Python, and React is preferred. This is a remote position.",
  "job_title": "Software Engineer",
  "company_name": "Your Company"
}
```

**Why this works:**
- **Role**: "Software Engineer" - matches many candidate headlines (30 points)
- **Skills**: ["JavaScript", "Python", "React"] - very common skills (30-40 points)
- **Location**: "Remote" - matches everyone (15 points)
- **Experience**: Defaults to 0 if not specified (15 points)

**Expected Score**: 90-100 points for most candidates = 80%+ match rate

## Quick Reference: Scoring Breakdown

| Component | Points | How to Maximize |
|-----------|--------|-----------------|
| Role Match | 30 | Use broad role names (Engineer, Developer) |
| Skills Match | 40 | Include 3-5 common skills |
| Location | 15 | Use "Remote" for universal match |
| Experience | 15 | Set to 0-2 years for maximum match |

## Testing Your Job

1. Create the job via API or frontend
2. Check server logs for auto-sourcing
3. View candidates - you should see 80%+ with scores of 80+
4. If match rate is low, adjust:
   - Make role more generic
   - Add more common skills
   - Change location to "Remote"
   - Lower experience requirement

## Pro Tips

1. **Start Broad, Then Narrow**: Create a broad job first, then create more specific ones
2. **Use "Remote"**: Always use "Remote" location for maximum candidate pool
3. **Multiple Skills**: Include 3-5 skills rather than 1-2 (gives more matching opportunities)
4. **Generic Titles**: "Software Engineer" matches more than "Senior Backend Engineer"
5. **Check Your Pool**: Always analyze your candidate pool first to see what's common

## Common Mistakes to Avoid

❌ **Too Specific Role**: "Senior Principal Infrastructure Engineer" - too narrow
✅ **Better**: "Software Engineer" or "Backend Engineer"

❌ **Niche Skills**: ["Haskell", "Erlang", "COBOL"] - too rare
✅ **Better**: ["JavaScript", "Python", "React"]

❌ **On-Site Only**: "San Francisco, CA" - limits to SF candidates only
✅ **Better**: "Remote"

❌ **High Experience**: "10+ years required" - excludes most candidates
✅ **Better**: "2+ years" or "0+ years"
