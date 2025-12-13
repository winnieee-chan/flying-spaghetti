# flying-spaghetti-

Monorepo with **separate frontend + backend** (pure JavaScript).

- **Frontend:** Vite + React (JS)
- **Backend:** Node + Express (JS)
- **Dev:** run both with one command

## Prerequisites

- **Node.js 20+**
- npm

Check:

```bash
node -v
npm -v
```

## Repo structure

```
.
├── web/        # Frontend (Vite + React)
└── backend/     # Backend (Express)
```

## Quick start

From the repo root:

```bash
npm install
npm run dev
```

This starts:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3001](http://localhost:3001)

> Note: backend logs may show `nodemon clean exit - waiting for changes` — this is normal (it’s just waiting for file changes).

## Frontend setup

Install dependencies:

```bash
npm --prefix web install
```

Env file:
Create `web/.env`:

```bash
VITE_API_URL=http://localhost:3001
```

Run frontend only:

```bash
npm run dev:web
# or
npm --prefix web run dev
```

## Backend setup

Install dependencies:

```bash
npm --prefix server install
```

Run backend only:

```bash
npm run dev:server
# or
npm --prefix server run dev
```

Health check:

```bash
curl http://localhost:3001/health
```

## Useful scripts (root)

- `npm run dev` – run frontend + backend
- `npm run dev:web` – run frontend only
- `npm run dev:server` – run backend only
