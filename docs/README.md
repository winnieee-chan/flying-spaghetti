# Documentation

This folder contains all project documentation.

## Documentation Files

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** - Quick setup guide for server and frontend
- **[MIGRATION_AND_TESTING.md](MIGRATION_AND_TESTING.md)** - Step-by-step migration and testing guide

### API Documentation
- **[FRONTEND_API_DOCUMENTATION.md](FRONTEND_API_DOCUMENTATION.md)** - Complete documentation of all 17 frontend API endpoints
- **[API_REVIEW.md](API_REVIEW.md)** - API review and analysis

### Testing
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comprehensive testing guide with cURL commands
- **[INTEGRATION_TEST.md](INTEGRATION_TEST.md)** - Integration testing checklist

### Implementation
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Summary of what was implemented
- **[REMAINING_TASKS.md](REMAINING_TASKS.md)** - Task completion status

## Quick Reference

### Server Setup
```bash
cd server
npm install
npm run dev  # Development mode (auto-reload)
# or
npm run build && npm start  # Production mode
```

### Frontend Setup
```bash
cd web
npm install
npm run dev
```

### Run Both
```bash
# From project root
npm run dev
```

### Test API
```bash
# From project root
./test-api.sh
```

## Project Structure

```
.
├── server/     # Backend server (Express + TypeScript)
├── web/        # Frontend (React + Vite)
└── docs/       # This documentation folder
```

## Key Features

- ✅ 17 API endpoints fully implemented
- ✅ Real data persistence (JSON file-based)
- ✅ AI features with intelligent fallbacks
- ✅ Pipeline stage management
- ✅ Conversation history storage
- ✅ Data transformation adapters

For detailed information, see the individual documentation files above.
