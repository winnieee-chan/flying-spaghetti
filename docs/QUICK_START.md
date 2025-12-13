# Quick Start Guide

## Server Setup

### Option 1: Development Mode (Recommended)
```bash
cd server
npm install  # if you haven't already
npm run dev  # Uses tsx watch - auto-recompiles on changes
```

This will:
- Start the server on port 3000
- Watch for file changes and auto-reload
- Show API docs at http://localhost:3000/api-docs

### Option 2: Production Mode
```bash
cd server
npm install
npm run build  # Compile TypeScript to JavaScript
npm start      # Run compiled code
```

## Frontend Setup

```bash
cd web
npm install  # if you haven't already
npm run dev
```

## Testing the API

### Quick Test
```bash
# From project root
./test-api.sh
```

### Manual Test
```bash
# Get all jobs
curl http://localhost:3000/jd

# Get candidates for a job (use actual job ID from above)
curl http://localhost:3000/{jobId}/cd
```

### Test with Frontend

1. **Update frontend config** (`web/src/services/config.ts`):
   ```typescript
   export const USE_MOCKS = false;
   export const API_BASE_URL = "http://localhost:3000";
   ```

2. **Start frontend**:
   ```bash
   cd web
   npm run dev
   ```

3. **Open browser** and test the UI

## Troubleshooting

### "Cannot find module" error
- Run `npm run build` first, or use `npm run dev` instead

### "No jobs found"
- Check `server/src/data/jobs.json` has data
- Verify the server is running on port 3000

### CORS errors
- Add CORS middleware to `server/src/api/server.ts`:
  ```typescript
  import cors from 'cors';
  app.use(cors());
  ```

### Port already in use
- Change port in `server/src/api/server.ts` or set `PORT` environment variable

## Environment Variables

Create `.env` file in `server/` directory:
```env
PORT=3000
GEMINI_API_KEY=your_key_here  # Optional - for AI features
```
