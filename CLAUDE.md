# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

WorkshopHub is an internal training registration system: employees browse internal training sessions and register for them. It is also the baseline codebase for a 3-day AI-assisted software delivery training, so some defects are planted on purpose (see "Intentional seeds" below).

pnpm workspace monorepo with two packages:
- `api/` (`@workshophub/api`): Express 4 + TypeScript backend using Prisma 5 on SQLite.
- `app/` (`@workshophub/app`): React 18 + TypeScript + Vite 5 frontend.

## Commands

The `Makefile` is the stable command interface. Prefer it over calling pnpm directly.

| Command | Purpose |
|---|---|
| `make setup` | `pnpm install`, copy `.env.example` → `.env` (and into `api/.env`), run `prisma generate` + `db push`, then seed |
| `make dev` | Start the Vite dev server (5173) and the API (3001) together |
| `make test` | Run all API Jest tests (unit + integration). The `app/` package has no tests |
| `make test-unit` | Run unit tests only (no DB needed) |
| `make lint` / `make format-check` | Run ESLint / Prettier on both packages |
| `make build` | Run `tsc` + `vite build` for `app/`, then `tsc` for `api/` |
| `make seed` / `make reset-db` | Seed the DB, or force-reset the schema and re-seed |
| `make smoke-test` | Check a *running* API (default port 3001) |
| `make security` | Run Gitleaks + Trivy locally |
| `make reasons-lint` | Validate the REASONS structure of `spdd/prompt/*.md` |
| `make prod-up` / `prod-down` / `prod-logs` | Run the production Docker image on port 8080 |

Run a single test from `api/`:
```bash
cd api && pnpm exec jest tests/integration/training-sessions.test.ts
cd api && pnpm exec jest -t "returns 200 with an array of sessions"
```

After editing `api/prisma/schema.prisma`, run `cd api && pnpm exec prisma generate && pnpm exec prisma db push`.

## Architecture

**API request flow:** `server.ts` → `app.ts` (mounts `/health`, `/api/training-sessions`, `/api/admin`, plus a global error handler) → `routes/*` → `services/*` → `lib/prisma.ts` (the shared `PrismaClient` singleton). When `app/dist` exists, `app.ts` also serves the built frontend with an SPA fallback. That is how production serves frontend and API from one process on port 8080 (see `Dockerfile` and `docker-entrypoint.sh`; the entrypoint runs `prisma db push` on every start).

**Service error convention:** services throw plain objects like `{ status, error }` (e.g. `{ status: 409, error: 'Training session is full' }`), not `Error` instances. Routes catch them, send `err.status` with `{ error }`, and fall back to a 500 response. Follow this pattern for new endpoints.

**Capacity / registration:** `TrainingSession.registered` is a denormalized counter. `createRegistration` validates input first, checks that the session exists (404), then, inside a `$transaction`, runs a conditional `updateMany` (`registered < capacity`). The affected-row count decides whether to create the `Registration` or throw 409. That is what keeps the counter from going over capacity, so keep it atomic.

**Frontend → API:** components call `fetch(\`${API_BASE}/api/...\`)`, where `API_BASE = import.meta.env.VITE_API_URL || ''`. In dev, the Vite proxy forwards `/api` and `/health` to `localhost:3001`. In prod, requests go to the same origin. Shared response types live in `app/src/types/`. After a registration, the page refetches the list so counts come from the server.

**Database and tests:** `DATABASE_URL` is resolved relative to `api/prisma/schema.prisma`, so `file:../database/X` means `api/database/X`. Integration tests run against the **shared seeded dev DB** (`api/tests/setup.ts` defaults to it), not an isolated one. They rely on the seed data containing at least one full session and one non-full session. They clean up registrations whose emails start with `test-`, so new tests must use that prefix and restore any state they change. If tests fail with DB errors, run `make reset-db`.

**Intentional seeds (training exercises):** these defects are deliberate. Don't fix them unless the task asks you to:
- `routes/training-sessions.ts` `/search`: SQL injection via `$queryRawUnsafe`, plus direct Prisma use in a route.
- `routes/admin.ts`: an unauthenticated endpoint that creates its own `PrismaClient`.
- `app.ts` error handler: leaks `err.stack` in responses.

## Workflow Conventions

- **Branch names** must match `wh-<string>-<string>` (e.g. `wh-2-session-registration`). The Husky pre-commit hook enforces this via `scripts/branch-name-check.sh`, so commits on `main` fail the hook.
- **Pre-commit** also runs `scripts/reasons-lint.sh`. Prompt files in `spdd/prompt/` must contain the REASONS-Canvas sections in this order: `## Requirements`, `## Entities`, `## Approach`, `## Structure`, `## Operations`, `## Norms`, `## Safeguards`. Feature work follows the SPDD flow: an analysis doc in `spdd/analysis/`, then a structured prompt in `spdd/prompt/`, then code.
- **CI** (`.github/workflows/pr-check.yml`) runs on PRs to `main`. It pushes and seeds a fresh SQLite DB, then runs test, lint and format-check.

## Team Norms

1. **No `any`.** Never use TypeScript `any`, and that includes `as any` and implicit `any`. Use explicit types, `unknown` with narrowing, or generics.
2. **No direct Prisma in routes.** Route handlers in `api/src/routes/` must not import `lib/prisma` or `@prisma/client`. Put DB access in `api/src/services/`. Routes only parse input, call a service, and map the result to HTTP.
3. **All code must pass `make test` and `make lint`.** Run both before you call a change done, commit, or open a PR. Fix the underlying problem. Do not disable lint rules, add `eslint-disable`, or skip or delete tests to get a green run.

## MCP Permissions

<!-- PLACEHOLDER: define which MCP servers/tools the agent may use and with what scope. -->

- TODO: list permitted MCP servers and tools, with read/write scope for each.
- TODO: list denied tools/scopes (e.g. production writes, secret access, merging MRs).

## AGENT_BOUNDARY

<!-- PLACEHOLDER: define what the agent may and may not do autonomously. -->

- TODO: paths and actions the agent may change without asking.
- TODO: actions that require human approval (e.g. schema changes, `make reset-db`, prod deploys, secret handling, pushing to `main`).
