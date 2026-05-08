# RFID Tool Tracking System

A full-stack web application for warehouse and industrial teams to track physical tools using simulated RFID scanning.

## Features

- **Tool Master** — Full CRUD: add, edit, delete tools with status tracking (Available / Issued / Missing)
- **Issue Tool** — Check out a tool to a user with full validation
- **Return Tool** — Check in a tool back to inventory
- **RFID Inventory Scan** — Simulate a scanner feed; instantly see Correct / Missing / Extra tools
- **Dashboard** — Real-time stats: totals by status, category breakdown, recent activity
- **Transaction Log** — Complete history of every issue and return event
- **JWT Authentication** — Secure login and registration

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express 5 + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT (bcryptjs + jsonwebtoken) |
| API Contract | OpenAPI 3.1 → Orval codegen |
| Deployment | Docker + Railway |

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL database

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/rfid-tool-tracking.git
cd rfid-tool-tracking

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in DATABASE_URL and JWT_SECRET

# 4. Push the database schema
pnpm --filter @workspace/db run push

# 5. Start the backend
pnpm --filter @workspace/api-server run dev

# 6. Start the frontend (in a new terminal)
pnpm --filter @workspace/rfid-tracker run dev
```

---

## Deploying to Railway

### Step 1 — Push to GitHub

See the **"Push to GitHub"** section below.

### Step 2 — Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub account and select your repository
4. Railway will auto-detect the `Dockerfile` and start building

### Step 3 — Add PostgreSQL

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically inject `DATABASE_URL` into your service

### Step 4 — Set Environment Variables

In Railway → your service → **"Variables"** tab, add:

| Variable | Value |
|---|---|
| `JWT_SECRET` | Any long random string (min 32 chars) |
| `NODE_ENV` | `production` |

> `PORT` and `DATABASE_URL` are set by Railway automatically — do **not** add them manually.

### Step 5 — Done!

Railway builds your Docker image and deploys. Your app will be live at:
`https://your-service-name.up.railway.app`

The database schema is automatically applied on every startup.

---

## GitHub Actions CI/CD

The repo includes two automated workflows:

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | Every push & PR | Typecheck + Build verification |
| `deploy.yml` | Push to `main` | Typecheck + Build + Deploy to Railway |

### One-time Setup for Auto-Deploy

1. **Get Railway Token:**
   - Railway Dashboard → your project → **Settings** → **Tokens** → **New Token**
   - Copy the token value

2. **Add to GitHub Secrets:**
   - Your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Name: `RAILWAY_TOKEN`, Value: paste the token

After this, every push to `main` automatically deploys to Railway.

---

## API Reference

All protected endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/tools` | Yes | List all tools |
| POST | `/api/tools` | Yes | Create tool |
| PUT | `/api/tools/:id` | Yes | Update tool |
| DELETE | `/api/tools/:id` | Yes | Delete tool |
| POST | `/api/issue` | Yes | Issue tool to user |
| POST | `/api/return` | Yes | Return tool |
| POST | `/api/scan` | Yes | RFID inventory scan |
| GET | `/api/stats` | Yes | Dashboard statistics |
| GET | `/api/transactions` | Yes | Transaction history |
| GET | `/api/healthz` | No | Health check |

### Scan Example

```json
POST /api/scan
{ "scannedTools": ["T001", "T002", "T004"] }

Response:
{
  "correctTools": ["T001", "T002"],
  "missingTools": ["T003"],
  "extraTools": ["T004"],
  "summary": { "total": 3, "correct": 2, "missing": 1, "extra": 1 }
}
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `PORT` | Yes (auto) | Server port (Railway sets this) |
| `NODE_ENV` | Yes | `development` or `production` |
| `CORS_ORIGIN` | No | Restrict CORS to specific domain |

---

## Database Schema

```
users         — id, name, email, password, created_at
tools         — id, tool_id, name, category, status, created_at, updated_at
transactions  — id, tool_id, user_id, action_type, issue_date, return_date, created_at
```
