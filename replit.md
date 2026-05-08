# RFID Tool Tracking System

A full-stack web app for warehouse/industrial teams to track physical tools using simulated RFID scanning.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/rfid-tracker run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `JWT_SECRET` — JWT signing key (defaults to built-in dev key)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: JWT (bcryptjs + jsonwebtoken)
- Frontend: React + Vite + Tailwind CSS + Wouter + React Query

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Database tables (users, tools, transactions)
- `artifacts/api-server/src/routes/` — Backend route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT middleware
- `artifacts/rfid-tracker/src/` — Frontend React app
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod validation schemas

## Architecture decisions

- Contract-first API: OpenAPI spec gates codegen which gates frontend hooks
- JWT stored in localStorage under key `rfid_token`; custom fetch picks it up via `setAuthTokenGetter`
- RFID scan is simulated: POST /scan with array of tool IDs, system compares to database
- All protected routes use `authMiddleware` — 401 if no/invalid token
- Tool status transitions: Available → Issued (via /issue), Issued → Available (via /return)

## Product

- **Tool Master**: Full CRUD for tools with status tracking (Available / Issued / Missing)
- **Issue Tool**: Check out a tool to a user; validates tool is Available first
- **Return Tool**: Check in a tool; validates it is currently Issued
- **RFID Inventory Scan**: Submit a list of scanned tool IDs; get back correct/missing/extra breakdown
- **Dashboard**: Stats overview (totals by status, category breakdown, recent activity)
- **Transaction Log**: Full history of all issue/return events

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before touching frontend code
- The codegen script cleans up orval index.ts files before running to avoid duplicate export conflicts
- `lib/api-zod/src/index.ts` only exports from `./generated/api` (not `./generated/types`)
- Express 5: use `/{*splat}` for wildcard routes, params are `string | string[]`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
