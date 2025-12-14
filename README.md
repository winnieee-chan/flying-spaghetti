# Flying Spaghetti

A modern recruitment platform with AI-powered candidate management, pipeline tracking, and intelligent matching. Features Elasticsearch for scalable candidate search and MCP (Model Context Protocol) integration for AI agents.

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+**
- **npm** or **yarn**
- **Docker** (for Elasticsearch - optional but recommended)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd flying-spaghetti
```

2. **Install dependencies:**

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd web
npm install
```

### Configuration

#### Backend Configuration

Create `server/.env`:
```env
# Server
PORT=3000

# Elasticsearch (Optional - set to false to use JSON file storage)
USE_ELASTICSEARCH=true
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=candidates

# AI Services (Optional)
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# MCP Context (Optional - enables AI to query talent pool)
USE_MCP_CONTEXT=false
```

#### Frontend Configuration

Create `web/.env`:
```env
# Use real API (set to "true" to use mocks instead)
VITE_USE_MOCKS=false

# Backend API URL
VITE_API_BASE_URL=http://localhost:3000
```

### Running the Application

#### Option 1: With Elasticsearch (Recommended)

**Step 1: Start Elasticsearch**
```bash
# From project root
docker-compose up -d
```

Wait a few seconds for Elasticsearch to be ready. Verify it's running:
```bash
curl http://localhost:9200
```

**Step 2: Migrate Data to Elasticsearch**
```bash
cd server
npm run migrate:elasticsearch
```

This will migrate all candidates from JSON to Elasticsearch.

**Step 3: Start Backend**
```bash
cd server
npm run dev
```

The server will automatically:
- Check Elasticsearch health
- Ensure the index exists
- Start on port 3000

**Step 4: Start Frontend**
```bash
cd web
npm run dev
```

The application will be available at:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Server API:** [http://localhost:3000](http://localhost:3000)
- **API Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Elasticsearch:** [http://localhost:9200](http://localhost:9200)

#### Option 2: Without Elasticsearch (JSON File Storage)

If you don't want to use Elasticsearch:

1. Set `USE_ELASTICSEARCH=false` in `server/.env`
2. Skip the Docker and migration steps
3. Start backend and frontend as above

The application will use JSON file storage instead.

## 📁 Project Structure

```
.
├── server/              # Backend server (Express + TypeScript)
│   ├── src/
│   │   ├── api/         # API routes
│   │   ├── db/          # Database layer (JSON + Elasticsearch)
│   │   ├── services/    # Business logic, AI, Elasticsearch, MCP
│   │   ├── mcp/         # MCP server for AI agents
│   │   ├── config/      # Configuration (Elasticsearch)
│   │   └── utils/       # Adapters, migrations, utilities
│   └── src/data/        # JSON data files (fallback)
├── web/                 # Frontend (React + Vite + TypeScript)
│   └── src/
│       ├── components/  # React components
│       ├── stores/      # Zustand state management
│       └── services/    # API client (mock + HTTP adapters)
├── docs/                # Documentation
└── docker-compose.yml   # Elasticsearch setup
```

## ✨ Features

- **Job Management** - Create, update, and manage job postings
- **Candidate Pipeline** - Track candidates through stages (New → Engaged → Closing)
- **AI-Powered Analysis** - Intelligent candidate matching and recommendations
- **Elasticsearch Integration** - Scalable full-text search and analytics
- **MCP Server** - Expose talent pool to AI agents via Model Context Protocol
- **Messaging** - Conversation history with candidates
- **External Search** - Find candidates from external sources
- **Batch Operations** - Move multiple candidates between stages
- **Analytics** - Talent pool and job-specific analytics

## 🛠️ Development

### Server Development

```bash
cd server
npm run dev    # Development mode with auto-reload
```

### Frontend Development

```bash
cd web
npm run dev    # Development server with hot reload
```

### Production Build

**Server:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd web
npm run build
npm run preview
```

## 🧪 Testing

### Quick API Test

```bash
./test-api.sh
```

### Elasticsearch Testing

```bash
cd server
npm run test:elasticsearch
```

### MCP Server Testing

```bash
cd server
npm run test:mcp
```

### Manual Testing

See [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for comprehensive testing instructions.

## 📚 Documentation

All documentation is available in the [`docs/`](docs/) folder:

- **[Elasticsearch Setup](docs/ELASTICSEARCH_SETUP.md)** - Elasticsearch installation and configuration
- **[MCP Integration](docs/MCP_INTEGRATION.md)** - MCP server setup and usage
- **[API Documentation](docs/FRONTEND_API_DOCUMENTATION.md)** - Complete API reference
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Testing instructions
- **[Elasticsearch Migration Plan](docs/ELASTICSEARCH_MIGRATION_PLAN.md)** - Migration architecture and decisions

## 🔧 Configuration

### Server Environment Variables

See the [Configuration](#configuration) section above for complete setup.

Key variables:
- `USE_ELASTICSEARCH` - Enable/disable Elasticsearch (default: false)
- `GEMINI_API_KEY` - Required for AI features
- `USE_MCP_CONTEXT` - Enable MCP context for AI (optional)

### Frontend Configuration

Key variables:
- `VITE_USE_MOCKS` - Use mock data instead of real API (default: false in production)
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:3000)

## 🏗️ Architecture

- **Backend:** Express.js with TypeScript
- **Database:** Elasticsearch (with JSON file fallback via feature flag)
- **Frontend:** React with Vite, Zustand for state management
- **AI Integration:** Google Gemini API
- **Search:** Elasticsearch full-text search with filters and aggregations
- **MCP Integration:** Model Context Protocol server for AI agents
- **Data Flow:** Frontend ↔ API Adapters ↔ Backend ↔ Database Factory ↔ Elasticsearch/JSON

## 📝 API Endpoints

The server provides comprehensive API endpoints:

- **Job endpoints** - CRUD operations (`/jd`, `/:jdId`)
- **Candidate endpoints** - Management, search, analytics (`/:jdId/cd`, `/candidates`)
- **Search endpoints** - Full-text search with filters (`/:jobId/cd/search`, `/candidates/search`)
- **Analytics endpoints** - Talent pool and job analytics (`/:jobId/cd/analytics`, `/candidates/analytics`)
- **AI endpoints** - AI-powered features (`/:jobId/cd/:candidateId/ai/*`)
- **Notification endpoints** - Candidate notification preferences (`/api/v1/candidates/:candidateId/*`)

See [API Documentation](docs/FRONTEND_API_DOCUMENTATION.md) for details.

## 🚀 Advanced Features

### Elasticsearch

- Full-text search across candidate profiles
- Faceted search (skills, location, experience)
- Aggregations for analytics
- Scalable to thousands of candidates

See [Elasticsearch Setup Guide](docs/ELASTICSEARCH_SETUP.md) for details.

### MCP Server

- Expose talent pool to AI agents
- Search and query candidates via MCP protocol
- Integrate with Claude Desktop, GPT-4, and other MCP clients

See [MCP Integration Guide](docs/MCP_INTEGRATION.md) for details.

### Running MCP Server

```bash
cd server
npm run mcp:server
```

## 🛠️ Development Scripts

### Backend Scripts

```bash
cd server

npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run migrate:elasticsearch  # Migrate data to Elasticsearch
npm run test:elasticsearch     # Test Elasticsearch integration
npm run test:mcp              # Test MCP server
npm run mcp:server            # Start MCP server
```

### Frontend Scripts

```bash
cd web

npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 🤝 Contributing

1. Install dependencies in both `server/` and `web/`
2. Set up Elasticsearch (optional but recommended)
3. Configure environment variables
4. Run development servers
5. Make changes
6. Test using the provided test scripts

## 🐛 Troubleshooting

### Elasticsearch Connection Issues

- Ensure Docker is running: `docker ps`
- Check Elasticsearch health: `curl http://localhost:9200`
- Verify environment variables in `server/.env`
- Check server logs for connection errors

### Frontend Not Connecting to Backend

- Verify `VITE_USE_MOCKS=false` in `web/.env`
- Check `VITE_API_BASE_URL` matches backend port (default: `http://localhost:3000`)
- Ensure backend is running on port 3000
- Check browser console for CORS or network errors

### Candidate Counts Showing 0

- Ensure Elasticsearch is enabled and data is migrated
- Check that `USE_ELASTICSEARCH=true` in `server/.env`
- Run migration: `npm run migrate:elasticsearch`
- Restart the server after configuration changes

## 📄 License

ISC
