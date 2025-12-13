# Flying Spaghetti

A modern recruitment platform with AI-powered candidate management, pipeline tracking, and intelligent matching.

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+**
- **npm**

### Run the Application

Open **two terminal windows**:

**Terminal 1 - Start Server:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd web
npm install
npm run dev
```

The application will be available at:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Server API:** [http://localhost:3000](http://localhost:3000)
- **API Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 📁 Project Structure

```
.
├── server/          # Backend server (Express + TypeScript)
│   ├── src/
│   │   ├── api/     # API routes
│   │   ├── db/      # Database layer (JSON file-based)
│   │   ├── services/# Business logic & AI services
│   │   └── utils/    # Adapters & utilities
│   └── src/data/    # JSON data files
├── web/             # Frontend (React + Vite + TypeScript)
│   └── src/
│       ├── components/
│       ├── stores/   # Zustand state management
│       └── services/ # API client
└── docs/            # Documentation
```

## ✨ Features

- **Job Management** - Create, update, and manage job postings
- **Candidate Pipeline** - Track candidates through stages (New → Engaged → Closing)
- **AI-Powered Analysis** - Intelligent candidate matching and recommendations
- **Messaging** - Conversation history with candidates
- **External Search** - Find candidates from external sources
- **Batch Operations** - Move multiple candidates between stages

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

### Manual Testing

See [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for comprehensive testing instructions.

## 📚 Documentation

All documentation is available in the [`docs/`](docs/) folder:

- **[Quick Start Guide](docs/QUICK_START.md)** - Detailed setup instructions
- **[API Documentation](docs/FRONTEND_API_DOCUMENTATION.md)** - Complete API reference
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Testing instructions
- **[Integration Guide](docs/INTEGRATION_TEST.md)** - Integration testing checklist

## 🔧 Configuration

### Server Environment Variables

Create `server/.env`:
```env
PORT=3000
GEMINI_API_KEY=your_key_here  # Optional - for AI features
OPENAI_API_KEY=your_key_here   # Optional - fallback for AI
```

### Frontend Configuration

Create `web/.env`:
```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:3000
```

## 🏗️ Architecture

- **Backend:** Express.js with TypeScript, file-based JSON storage
- **Frontend:** React with Vite, Zustand for state management
- **AI Integration:** Google Gemini API (with OpenAI fallback)
- **Data Flow:** Frontend ↔ Adapters ↔ Backend ↔ Database

## 📝 API Endpoints

The server provides 17 API endpoints:

- **4 Job endpoints** - CRUD operations for jobs
- **4 Candidate endpoints** - Candidate management and search
- **1 Message endpoint** - Conversation management
- **8 AI endpoints** - AI-powered features (analyze, draft, suggest, etc.)

See [API Documentation](docs/FRONTEND_API_DOCUMENTATION.md) for details.

## 🤝 Contributing

1. Install dependencies in both `server/` and `web/`
2. Run development servers
3. Make changes
4. Test using the provided test scripts

## 📄 License

ISC
