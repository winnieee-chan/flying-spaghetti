# flying-spaghetti-

Monorepo with **separate frontend + server** (pure JavaScript).

- **Frontend:** Vite + React (JS)
- **Server:** Node + Express (JS)
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
└── server/     # Server (Express)
```

## Quick start

From the repo root:

```bash
npm install
npm run dev
```

This starts:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Server: [http://localhost:3000](http://localhost:3000)

> Note: server logs may show `nodemon clean exit - waiting for changes` — this is normal (it’s just waiting for file changes).

## Frontend setup

Install dependencies:

```bash
npm --prefix web install
```

Env file:
Create `web/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

Run frontend only:

```bash
npm run dev:web
# or
npm --prefix web run dev
```

## Server setup

Install dependencies:

```bash
npm --prefix server install
```

Run server only:

```bash
npm run dev:server
# or
npm --prefix server run dev
```

Health check:

```bash
curl http://localhost:3000/
```

## Useful scripts (root)

- `npm run dev` – run frontend + server
- `npm run dev:web` – run frontend only
- `npm run dev:server` – run server only
