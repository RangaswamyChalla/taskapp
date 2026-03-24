# AIDEN — Engineering Plan V2

**Based on:** Complete System Evaluation (March 2026)
**Current State:** Prototype (3.75/10 Production Readiness)
**Target State:** Enterprise-Grade Multi-Agent Code Synthesis Platform

---

## Executive Summary

AIDEN V1 is a functional prototype that demonstrates a compelling vision: transforming Software Requirements Specifications (SRS) into application prototypes through a 5-agent AI pipeline. However, it has **critical security vulnerabilities**, **no TypeScript**, **no CI/CD**, **no real multi-agent orchestration**, and **no production deployment story**. This plan defines a structured path from prototype to production.

---

## Root Cause Analysis (from Evaluation)

| Category | Count | Top Issues |
|----------|-------|------------|
| **Critical Security** | 5 | localStorage API key, unauthenticated AI proxy, hardcoded JWT secret, no CSP on iframe, CORS allowlist bypass |
| **Major Architecture** | 4 | No TypeScript, tight coupling (direct DB in controllers), fake agent communication, no service/repository pattern |
| **Major Reliability** | 3 | `ALTER TABLE` on every startup, SQLite singleton race, no graceful shutdown |
| **Major Scalability** | 4 | No migrations, no Docker, no horizontal scaling path, in-process state |
| **Minor Quality** | 6 | Inline styles, no OpenAPI docs, hardcoded `bcrypt` rounds, no dark mode, no code download |

---

## Phase 0 — Stabilization (Weeks 1-2)

**Goal:** Fix all critical security and reliability issues. No new features.

### 0.1 — Security Hardening

- [ ] **a. Remove API key from localStorage**
  - Store API key hashed in backend session or httpOnly cookie
  - Backend issues a session token; frontend stores only the token
  - File: `PipelineContext.jsx`, `api.js`, new `sessionController.js`

- [ ] **b. Add authentication to `/ai/generate`**
  - Add `auth` middleware to `aiRoutes.js:95`
  - Pipeline still works without login but AI proxy requires auth
  - File: `routes/aiRoutes.js`

- [ ] **c. Fail-fast on missing JWT_SECRET**
  - In `auth.js:6-12`, replace fallback with:
    ```js
    if (!secret) {
      console.error('[Auth] FATAL: JWT_SECRET not set');
      process.exit(1);
    }
    ```
  - File: `middleware/auth.js`

- [ ] **d. Add Helmet.js security headers**
  - Install `helmet`; apply to `app.js`
  - Add CSP for iframe preview: `frame-ancestors 'none'`
  - Add: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
  - File: `backend/app.js`, `backend/package.json`

- [ ] **e. Validate CORS origin**
  - If `FRONTEND_URL` is set, reject requests with mismatched origin
  - Add origin allowlist validation in CORS config
  - File: `backend/app.js`

### 0.2 — Reliability Fixes

- [ ] **a. Fix ALTER TABLE on every startup**
  - Before `ALTER TABLE`, check if column exists using `pragma_table_info`
  - File: `backend/config/database.js`

- [ ] **b. Add graceful shutdown**
  - Handle `SIGTERM` and `SIGINT` in `server.js`
  - Close DB connection and stop accepting new connections before exiting
  - File: `backend/server.js`

- [ ] **c. Add structured logging**
  - Replace `console.log/error` with Pino logger
  - Add `requestId` and `userId` to every log line
  - File: `backend/app.js`, `backend/middleware/errorHandler.js`, all controllers

- [ ] **d. Add startup validation**
  - Use `envalid` to validate all required env vars at startup
  - Fail fast with clear error messages if `.env` is misconfigured
  - File: `backend/server.js`, `backend/package.json`

### 0.3 — Environment & Tooling

- [ ] **a. Add `.env` validation schema**
  - Define required vs optional env vars
  - File: `backend/.env.schema.js`

- [ ] **b. Add ESLint + Prettier**
  - Configure for Node.js (backend) and React (frontend)
  - File: `.eslintrc.js`, `.prettierrc`, `backend/package.json`, `frontend/package.json`

- [ ] **c. Add Husky + lint-staged**
  - Pre-commit hooks: lint + format check
  - File: `package.json` (root), `.husky/`

---

## Phase 1 — TypeScript Migration (Weeks 3-5)

**Goal:** Add type safety across the entire codebase. Reduce runtime errors by ~60%.

### 1.1 — Backend TypeScript

- [ ] **a. Convert backend to TypeScript**
  - Install: `typescript`, `@types/node`, `@types/express`, `@types/jsonwebtoken`, `@types/bcrypt`, `@types/cors`, `@types/sqlite3`
  - Convert: `app.js` → `app.ts`, `server.js` → `server.ts`
  - Convert all middleware, controllers, routes, config
  - File: `backend/tsconfig.json`, `backend/src/` (new structure)

- [ ] **b. Add Zod for runtime validation**
  - Replace `validate.js` with Zod schemas for all request bodies
  - Files: `backend/src/middleware/validate.ts`, `backend/src/schemas/`

- [ ] **c. Add types for database layer**
  - Define `User`, `Task`, `Team` interfaces
  - Add repository pattern: `UserRepository`, `TaskRepository`
  - Files: `backend/src/types/`, `backend/src/repositories/`

### 1.2 — Frontend TypeScript

- [ ] **a. Convert frontend to TypeScript**
  - Add TypeScript to CRA config (`tsconfig.json`)
  - Convert all `.js` → `.tsx` with proper types
  - Files: `frontend/tsconfig.json`, `frontend/src/` (migrate all files)

- [ ] **b. Add React Query for data fetching**
  - Replace manual `useState` + `useEffect` + `axios` with TanStack Query
  - File: `frontend/src/hooks/usePipeline.ts`, `frontend/src/hooks/useTasks.ts`

- [ ] **c. Add types for pipeline context**
  - Define: `AgentState`, `PipelineConfig`, `GeneratedCode`, `Metrics`
  - File: `frontend/src/types/pipeline.ts`

---

## Phase 2 — Architecture Refactor (Weeks 6-9)

**Goal:** Proper layered architecture with service/repository pattern. Real multi-agent orchestration.

### 2.1 — Service/Repository Layer

- [ ] **a. Add repository pattern**
  - `UserRepository`: `findByEmail`, `create`, `findById`, `softDelete`
  - `TaskRepository`: `findAll`, `findById`, `create`, `update`, `softDelete`, `findStats`
  - Files: `backend/src/repositories/`

- [ ] **b. Add service layer**
  - `AuthService`: register, login, refreshToken, logout
  - `TaskService`: CRUD operations + business logic
  - `AiService`: manage AI calls, retries, fallbacks
  - Files: `backend/src/services/`

- [ ] **c. Update controllers to use services**
  - Remove direct `getDb()` calls from controllers
  - Controllers become thin request/response handlers
  - Files: `backend/src/controllers/`

### 2.2 — Real Multi-Agent Orchestration

- [ ] **a. Add agent framework**
  - Use LangChain.js or implement custom agent loop
  - Each agent: `Analyzer`, `Architect`, `Coder`, `Reviewer`, `Deployer` becomes a class with `systemPrompt`, `tools`, `execute(input)` method
  - File: `backend/src/agents/`

- [ ] **b. Add agent communication bus**
  - EventEmitter-based message bus for inter-agent communication
  - Agents publish outputs to bus; downstream agents subscribe
  - File: `backend/src/agents/AgentBus.ts`

- [ ] **c. Add agent memory**
  - Store agent outputs in vector DB (Chroma or pgvector) for context
  - Reviewer agent can query past code patterns
  - File: `backend/src/memory/`

- [ ] **d. Replace hardcoded COMMS with real messages**
  - Remove `frontend/src/config/agents.js` static COMMS array
  - Agents produce real output messages rendered in CommsPanel via WebSocket
  - File: `frontend/src/contexts/PipelineContext.tsx`, `backend/src/agents/`

### 2.3 — Real-Time Communication

- [ ] **a. Add WebSocket/SSE for pipeline progress**
  - Replace fake `setTimeout` ticks with real agent event streaming
  - Backend emits: `agent:start`, `agent:progress`, `agent:complete`, `agent:error`
  - File: `backend/src/routes/pipelineRoutes.ts`, `frontend/src/hooks/usePipeline.ts`

- [ ] **b. Add interruptibility**
  - Client can send `DELETE /pipeline/:runId` to cancel running pipeline
  - Use `AbortController` in agent loops
  - File: `backend/src/agents/AgentRunner.ts`, `frontend/src/hooks/usePipeline.ts`

---

## Phase 3 — Database & Persistence (Weeks 10-12)

**Goal:** Production-grade data layer with migrations, transactions, and PostgreSQL support.

### 3.1 — Migrations

- [ ] **a. Add migration tool**
  - Use `node-pg-migrate` or `db-migrate`
  - Remove all `CREATE TABLE IF NOT EXISTS` from `initSchema`
  - File: `backend/src/migrations/`, `database/migrations/`

- [ ] **b. Write initial migration**
  - Convert current SQLite schema to first migration file
  - All future schema changes go through new migrations
  - File: `database/migrations/001_initial_schema.ts`

- [ ] **c. Add PostgreSQL support**
  - Update `getDb()` to support both SQLite (dev) and PostgreSQL (prod)
  - Use `knex` or `drizzle-orm` as the query builder
  - File: `backend/src/config/database.ts`

### 3.2 — Transactions & Data Integrity

- [ ] **a. Add transactions to task operations**
  - Wrap multi-step operations in SQLite/PostgreSQL transactions
  - File: `backend/src/repositories/TaskRepository.ts`

- [ ] **b. Add audit logging**
  - Use `audit_log` table (already in PostgreSQL schema)
  - Add trigger/service to log all INSERT/UPDATE/DELETE on tasks
  - File: `backend/src/services/AuditService.ts`

- [ ] **c. Add UUID primary keys**
  - Migrate from `INTEGER AUTOINCREMENT` to `UUID`
  - Update all foreign key references
  - File: migration files

### 3.3 — Caching & Performance

- [ ] **a. Add Redis for session caching**
  - Store sessions in Redis instead of memory
  - File: `backend/src/config/redis.ts`

- [ ] **b. Add query result caching**
  - Cache frequently accessed data (task stats, agent configs)
  - File: `backend/src/services/CacheService.ts`

---

## Phase 4 — DevOps & Deployment (Weeks 13-15)

**Goal:** Docker-based deployment, CI/CD pipeline, production hardening.

### 4.1 — Docker

- [ ] **a. Add Dockerfile for backend**
  - Node.js 20 Alpine, multi-stage build
  - Files: `taskapp/backend/Dockerfile`

- [ ] **b. Add Dockerfile for frontend**
  - Node.js 20 build stage → Nginx serve stage
  - Files: `taskapp/frontend/Dockerfile`

- [ ] **c. Add Docker Compose**
  - Services: `frontend`, `backend`, `postgres`, `redis`, `ollama` (optional)
  - Volumes for persistent data
  - Files: `docker-compose.yml`, `docker-compose.prod.yml`

- [ ] **d. Add nginx reverse proxy**
  - SSL termination, HTTP/2, static file serving for frontend
  - Rate limiting at nginx level (complementing app-level)
  - Files: `nginx/Dockerfile`, `nginx/nginx.conf`

### 4.2 — CI/CD

- [ ] **a. GitHub Actions — CI pipeline**
  - Trigger: push to `main` and PRs
  - Steps: lint → type-check → unit tests → build → E2E tests
  - Files: `.github/workflows/ci.yml`

- [ ] **b. GitHub Actions — CD pipeline**
  - Trigger: push to `main` only
  - Steps: build Docker images → push to registry → deploy to cloud
  - Files: `.github/workflows/cd.yml`

- [ ] **c. Add Playwright E2E tests**
  - Test: register → login → create task → run pipeline → view output
  - Files: `e2e/`

### 4.3 — Production Hardening

- [ ] **a. Add health check endpoints**
  - `GET /health/live` — process alive
  - `GET /health/ready` — DB + AI provider reachable
  - File: `backend/src/routes/healthRoutes.ts`

- [ ] **b. Add Prometheus metrics**
  - Expose `/metrics` endpoint
  - Instrument: request latency, error rate, AI call duration, pipeline success/failure
  - File: `backend/src/middleware/metrics.ts`

- [ ] **c. Add Sentry error tracking**
  - Backend: `@sentry/node`
  - Frontend: `@sentry/react`
  - File: `backend/src/instrument.ts`, `frontend/src/instrument.ts`

- [ ] **d. Environment config validation**
  - Use `envalid` to fail fast on missing required env vars
  - File: `backend/src/config/validateEnv.ts`

---

## Phase 5 — Feature Completeness (Weeks 16-19)

**Goal:** Add all missing features identified in the evaluation.

### 5.1 — Code Generation UX

- [ ] **a. Add code download as ZIP**
  - Package all generated files (frontend, backend, database, nginx, env) into a downloadable zip
  - File: `backend/src/services/CodePackager.ts`, frontend component

- [ ] **b. Add generated code search**
  - Full-text search within generated code files
  - File: frontend component

- [ ] **c. Add generated code diff/viewer**
  - Syntax-highlighted code viewer with copy button, line numbers
  - Replace raw `<pre>` rendering
  - File: `frontend/src/components/CodePreview.tsx`

- [ ] **d. Add dark mode toggle to AIDEN UI**
  - The app itself should support dark/light themes
  - File: `frontend/src/config/theme.ts`, `frontend/src/App.tsx`

### 5.2 — Task Management Enhancements

- [ ] **a. Add task comments**
  - `task_comments` table, CRUD endpoints
  - File: `database/migrations/`, `backend/src/`

- [ ] **b. Add task attachments**
  - File upload to local/S3 storage
  - File: `backend/src/services/FileService.ts`

- [ ] **c. Add task search**
  - SQLite FTS5 or PostgreSQL `tsvector` for full-text search
  - File: `backend/src/repositories/TaskRepository.ts`

- [ ] **d. Add undo/redo for task operations**
  - Soft-delete with 30-day recovery window
  - File: `backend/src/services/TaskService.ts`

### 5.3 — Pipeline Enhancements

- [ ] **a. Add pipeline history**
  - Store each pipeline run in DB with SRS input + generated output
  - File: `database/migrations/`, `backend/src/repositories/PipelineRunRepository.ts`

- [ ] **b. Add generated code quality scoring**
  - Automated test runner: start the generated backend, hit health endpoint, check for errors
  - Score: 0-100 published with output
  - File: `backend/src/services/CodeQualityScorer.ts`

- [ ] **c. Add multi-language SRS support**
  - Analyzer agent handles SRS in multiple formats (Markdown, PDF, plain text)
  - File: `backend/src/agents/Analyzer.ts`

- [ ] **d. Add custom agent prompts**
  - Allow users to customize agent system prompts via UI
  - File: `frontend/src/components/ConfigPanel.tsx`

---

## Phase 6 — Advanced AI & Scale (Weeks 20-24)

**Goal:** Enterprise-grade AI orchestration and horizontal scalability.

### 6.1 — Advanced Agent Features

- [ ] **a. Add agent tool use**
  - Agents can use tools: file system read/write, execute shell commands, search web
  - LangChain tool interface
  - File: `backend/src/agents/tools/`

- [ ] **b. Add agent reflection loop**
  - Reviewer agent can loop back to Coder with fix requests (max 3 iterations)
  - File: `backend/src/agents/Reviewer.ts`

- [ ] **c. Add code execution sandbox**
  - Run generated backend in WebContainer or Deno Deploy before presenting preview
  - File: `backend/src/services/CodeSandbox.ts`

- [ ] **d. Add vector memory for agents**
  - Chroma DB for storing past code patterns
  - Reviewer queries similar past issues before flagging
  - File: `backend/src/memory/VectorStore.ts`

### 6.2 — Scalability

- [ ] **a. Add horizontal scaling support**
  - Stateless backend design (sessions in Redis, DB)
  - Add `横向扩展` documentation for k8s deployment
  - File: `k8s/`, `docker-compose.yml`

- [ ] **b. Add read replicas**
  - Configure PostgreSQL read replica for `GET /tasks` queries
  - File: `docker-compose.prod.yml`, `backend/src/config/database.ts`

- [ ] **c. Add job queue for pipeline**
  - Move AI pipeline to background job (Bull/BullMQ + Redis)
  - Client polls or SSE for progress
  - File: `backend/src/workers/pipelineWorker.ts`

- [ ] **d. Add API versioning**
  - Move all endpoints to `/api/v1/` prefix
  - Add OpenAPI 3.0 spec
  - File: `backend/src/routes/`, `openapi.yaml`

### 6.3 — Enterprise Features

- [ ] **a. Add multi-tenancy**
  - `team_id` on all resources (schema already exists)
  - Row-level security in PostgreSQL
  - File: `backend/src/middleware/tenant.ts`

- [ ] **b. Add RBAC**
  - Roles: `owner`, `admin`, `member` (schema already exists)
  - Role-based endpoint protection
  - File: `backend/src/middleware/rbac.ts`

- [ ] **c. Add SSO/OAuth**
  - Google, GitHub OAuth integration
  - File: `backend/src/routes/authRoutes.ts` (OAuth routes)

- [ ] **d. Add audit dashboard**
  - UI for viewing audit_log entries
  - File: `frontend/src/pages/AuditDashboard.tsx`

---

## Phase 7 — Polish & Handover (Weeks 25-26)

**Goal:** Production release with full documentation and knowledge transfer.

### 7.1 — Documentation

- [ ] **a. Complete API documentation**
  - OpenAPI 3.0 spec for all endpoints
  - Swagger UI at `/api/docs`
  - File: `openapi.yaml`

- [ ] **b. Architecture documentation**
  - Update `ARCHITECTURE_REVIEW.md` with V2 architecture
  - Add sequence diagrams for pipeline flow
  - File: `ARCHITECTURE_REVIEW.md`

- [ ] **c. Deployment documentation**
  - Step-by-step production deployment guide
  - Docker, nginx, PostgreSQL, Redis, Ollama setup
  - File: `DEPLOYMENT.md`

- [ ] **d. Security documentation**
  - Threat model, penetration test results
  - Security review sign-off
  - File: `SECURITY.md`

### 7.2 — Final Polish

- [ ] **a. Performance audit**
  - Load test with k6: 100 concurrent users, 1000 tasks
  - Optimize identified bottlenecks
  - File: `perf-tests/`

- [ ] **b. Accessibility audit**
  - Run `axe` on all frontend pages
  - Fix WCAG 2.1 AA violations
  - File: `frontend/src/` (fixes)

- [ ] **c. Cross-browser testing**
  - Test on Chrome, Firefox, Safari, Edge
  - Fix any rendering inconsistencies
  - File: `e2e/`

- [ ] **d. User documentation**
  - Quick start guide
  - Video walkthrough
  - File: `docs/`

---

## Priority Matrix

```
HIGH ────────────────────────────────────────────────────────► LOW
│ Phase 0   Phase 1   Phase 2   Phase 3   Phase 4   Phase 5   Phase 6   Phase 7
│ Stabilize TS Migrate Arch Refactor DB/Migrate Docker/CI  Features  Polish
│
└─ Security fixes (Phase 0) must complete before ANY other phase
└─ TypeScript (Phase 1) gates Phase 2 refactoring
└─ Docker/CI (Phase 4) gates production deployment
└─ All phases can run features in parallel after Phase 2
```

---

## Estimated Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 0 | 2 weeks | Security & Reliability |
| Phase 1 | 3 weeks | TypeScript Migration |
| Phase 2 | 4 weeks | Architecture Refactor |
| Phase 3 | 3 weeks | Database & Persistence |
| Phase 4 | 3 weeks | DevOps & Deployment |
| Phase 5 | 4 weeks | Feature Completeness |
| Phase 6 | 5 weeks | Advanced AI & Scale |
| Phase 7 | 2 weeks | Polish & Handover |
| **Total** | **26 weeks** | ~6 months |

---

## File Change Summary by Phase

### Phase 0 (No new files, fixes only)
- `backend/middleware/auth.js` — fail-fast JWT
- `backend/app.js` — Helmet, CORS fix
- `backend/routes/aiRoutes.js` — add auth middleware
- `backend/config/database.js` — fix ALTER TABLE
- `backend/server.js` — graceful shutdown
- `frontend/src/contexts/PipelineContext.jsx` — remove localStorage key
- **New:** `backend/middleware/logging.js` (Pino)
- **New:** `.env.schema.js`

### Phase 1 (New TypeScript files)
- `backend/tsconfig.json`, `frontend/tsconfig.json`
- `backend/src/` (migrate all .js → .ts)
- `frontend/src/` (migrate all .jsx → .tsx)
- `backend/src/schemas/` (Zod)
- `backend/src/types/`, `frontend/src/types/`

### Phase 2 (Architecture)
- `backend/src/agents/` (new agent classes)
- `backend/src/services/`, `backend/src/repositories/`
- `backend/src/agents/AgentBus.ts`
- `backend/src/memory/` (vector store)
- `backend/src/routes/pipelineRoutes.ts` (WebSocket/SSE)

### Phase 3 (Database)
- `database/migrations/` (node-pg-migrate)
- `backend/src/config/database.ts` (PostgreSQL + Knex)
- `backend/src/services/AuditService.ts`

### Phase 4 (DevOps)
- `backend/Dockerfile`, `frontend/Dockerfile`
- `docker-compose.yml`, `docker-compose.prod.yml`
- `nginx/`, `k8s/`
- `.github/workflows/ci.yml`, `.github/workflows/cd.yml`
- `e2e/` (Playwright)
- `backend/src/middleware/metrics.ts`
- `backend/src/instrument.ts`, `frontend/src/instrument.ts`

### Phase 5 (Features)
- `backend/src/services/CodePackager.ts`
- `database/migrations/` (comments, attachments tables)
- `frontend/src/pages/` (new pages)

### Phase 6 (Advanced)
- `backend/src/agents/tools/`
- `backend/src/workers/pipelineWorker.ts` (BullMQ)
- `backend/src/middleware/rbac.ts`
- `openapi.yaml`

### Phase 7 (Polish)
- `ARCHITECTURE_REVIEW.md` (update)
- `DEPLOYMENT.md`, `SECURITY.md`, `docs/`
- `perf-tests/`
