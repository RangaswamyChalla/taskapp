# AIDEN V2 — Phase-by-Phase Implementation Checklist

**Engineering Plan:** `ENGINEERING_PLAN_V2.md`
**Last Updated:** March 2026
**Status:** Not Started

---

## PHASE 0 — Stabilization (Weeks 1-2)

**Goal:** Fix all critical security vulnerabilities and reliability issues. Zero new features.

### 0.1 Security Hardening

- [ ] **0.1.1** Remove API key from localStorage
  - [ ] Create `backend/src/services/sessionService.ts` — issue httpOnly session tokens
  - [ ] Update `frontend/src/contexts/PipelineContext.jsx` — remove `localStorage.setItem('aiden_api_key', ...)`
  - [ ] Update `frontend/src/services/api.js` — send session token instead of API key
  - [ ] Update `backend/src/routes/aiRoutes.ts` — accept session-based auth

- [ ] **0.1.2** Add authentication to `/ai/generate`
  - [ ] Import `auth` middleware in `backend/src/routes/aiRoutes.ts`
  - [ ] Apply `auth` to `router.post('/generate', ...)` route
  - [ ] Add test: `backend/tests/ai.test.ts` — verify unauthenticated requests return 401

- [ ] **0.1.3** Fail-fast on missing JWT_SECRET
  - [ ] Edit `backend/src/middleware/auth.ts` — replace fallback with `process.exit(1)`
  - [ ] Add `JWT_SECRET` to `backend/.env.example` with comment: `# REQUIRED - DO NOT OMIT IN PRODUCTION`
  - [ ] Add test: verify server exits if JWT_SECRET is unset

- [ ] **0.1.4** Add Helmet.js security headers
  - [ ] `npm install helmet` in `backend/`
  - [ ] Import and apply `helmet()` in `backend/src/app.ts`
  - [ ] Configure CSP for iframe preview: `frameAncestors: false`
  - [ ] Verify headers with: `curl -I http://localhost:3001/health`

- [ ] **0.1.5** Validate CORS origin
  - [ ] Edit `backend/src/app.ts` CORS config — if `FRONTEND_URL` is set, reject non-matching origins
  - [ ] Add test: send request with wrong origin, verify 403

### 0.2 Reliability Fixes

- [ ] **0.2.1** Fix ALTER TABLE on every startup
  - [ ] In `backend/src/config/database.ts` — before `ALTER TABLE tasks ADD COLUMN tags`, query `PRAGMA_table_info('tasks')` to check if column exists
  - [ ] Remove the `() => {}` empty callback that swallows errors

- [ ] **0.2.2** Add graceful shutdown
  - [ ] In `backend/src/server.ts` — add `process.on('SIGTERM', ...)` handler
  - [ ] Close database connection on shutdown
  - [ ] Close HTTP server on shutdown
  - [ ] Test: send SIGTERM, verify clean exit with log "Shutting down gracefully"

- [ ] **0.2.3** Add structured logging with Pino
  - [ ] `npm install pino pino-http` in `backend/`
  - [ ] Create `backend/src/middleware/logging.ts` — request logging with requestId + userId
  - [ ] Replace all `console.log/error` in `backend/src/app.ts`, `server.ts`, controllers, middleware
  - [ ] Log format: JSON `{"level":"info","requestId":"...","userId":"...","duration_ms":...,"msg":"..."}`

- [ ] **0.2.4** Add env var validation with envalid
  - [ ] `npm install envalid` in `backend/`
  - [ ] Create `backend/src/config/validateEnv.ts` — define required: `JWT_SECRET`, `PORT`, `DATABASE_URL`; optional: `AI_PROVIDER`, `OLLAMA_BASE_URL`
  - [ ] Call `validateEnv()` at top of `backend/src/server.ts`
  - [ ] Verify server fails fast with clear error if required vars are missing

### 0.3 Environment & Tooling

- [ ] **0.3.1** Add ESLint + Prettier (backend)
  - [ ] `npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin` in `backend/`
  - [ ] Create `backend/.eslintrc.js` — extends `eslint:recommended`, `@typescript-eslint/recommended`
  - [ ] Create `backend/.prettierrc` — single quotes, semi, 2-space indent
  - [ ] Add `lint` and `format` scripts to `backend/package.json`

- [ ] **0.3.2** Add ESLint + Prettier (frontend)
  - [ ] `npm install -D eslint prettier eslint-plugin-react eslint-plugin-react-hooks` in `frontend/`
  - [ ] Create `frontend/.eslintrc.js`, `frontend/.prettierrc`
  - [ ] Add `lint` and `format` scripts to `frontend/package.json`

- [ ] **0.3.3** Add Husky + lint-staged
  - [ ] `npm install -D husky lint-staged` in root
  - [ ] Add `.husky/pre-commit` hook — runs `lint-staged`
  - [ ] Configure `lint-staged` in `package.json` — lint + format-check on staged files

---

## PHASE 1 — TypeScript Migration (Weeks 3-5)

**Goal:** Full type safety across backend and frontend.

### 1.1 Backend TypeScript

- [ ] **1.1.1** Initialize TypeScript (backend)
  - [ ] `npm install -D typescript @types/node @types/express @types/jsonwebtoken @types/bcrypt @types/cors @types/sqlite3 ts-node` in `backend/`
  - [ ] Create `backend/tsconfig.json` — `target: ES2022`, `module: commonjs`, `strict: true`, `outDir: dist`
  - [ ] Create `backend/src/` directory structure: `controllers/`, `routes/`, `middleware/`, `services/`, `repositories/`, `types/`, `config/`, `agents/`

- [ ] **1.1.2** Convert backend config files
  - [ ] `backend/src/config/database.ts` — add types for DB config, return types
  - [ ] `backend/src/config/validateEnv.ts` — add interface for env vars
  - [ ] `backend/src/config/pino.ts` — typed logger configuration

- [ ] **1.1.3** Convert backend middleware
  - [ ] `backend/src/middleware/auth.ts` → `auth.ts` — add `AuthenticatedRequest` interface extending `Request`
  - [ ] `backend/src/middleware/errorHandler.ts` → typed error handling
  - [ ] `backend/src/middleware/logging.ts` → typed request logging
  - [ ] `backend/src/middleware/validate.ts` → replace with Zod (see 1.1.5)

- [ ] **1.1.4** Convert backend routes
  - [ ] `backend/src/routes/authRoutes.ts` → typed handlers
  - [ ] `backend/src/routes/taskRoutes.ts`
  - [ ] `backend/src/routes/aiRoutes.ts`
  - [ ] `backend/src/routes/healthRoutes.ts` (new)

- [ ] **1.1.5** Add Zod for runtime validation
  - [ ] `npm install zod` in `backend/`
  - [ ] Create `backend/src/schemas/user.schema.ts` — register, login schemas
  - [ ] Create `backend/src/schemas/task.schema.ts` — createTask, updateTask schemas
  - [ ] Create `backend/src/schemas/ai.schema.ts` — generate schema
  - [ ] Replace `validate.ts` middleware with Zod-based validation middleware

### 1.2 Frontend TypeScript

- [ ] **1.2.1** Initialize TypeScript (frontend)
  - [ ] `npm install -D typescript @types/react @types/react-dom @types/node` in `frontend/`
  - [ ] Create `frontend/tsconfig.json` — `target: ES2020`, `lib: DOM`, `strict: true`
  - [ ] Rename all `.js` → `.tsx` files

- [ ] **1.2.2** Add frontend types
  - [ ] `frontend/src/types/user.ts` — `User`, `AuthState`
  - [ ] `frontend/src/types/task.ts` — `Task`, `TaskFilters`, `PaginatedTasks`
  - [ ] `frontend/src/types/pipeline.ts` — `AgentState`, `AgentConfig`, `PipelineConfig`, `GeneratedCode`, `Metrics`, `CommMessage`
  - [ ] `frontend/src/types/api.ts` — `ApiError`, `ApiResponse`

- [ ] **1.2.3** Convert frontend services
  - [ ] `frontend/src/services/api.ts` → `api.ts` — add typed response/error types

- [ ] **1.2.4** Convert frontend contexts
  - [ ] `frontend/src/contexts/AuthContext.tsx` — add typed context interface
  - [ ] `frontend/src/contexts/PipelineContext.tsx` — full TypeScript rewrite with typed agents

- [ ] **1.2.5** Convert frontend components
  - [ ] All components in `frontend/src/components/` → `.tsx` with typed props
  - [ ] All hooks in `frontend/src/hooks/` → `.ts` with typed returns

- [ ] **1.2.6** Add React Query
  - [ ] `npm install @tanstack/react-query` in `frontend/`
  - [ ] Wrap app in `QueryClientProvider` in `frontend/src/App.tsx`
  - [ ] Replace manual `useState` + `useEffect` in `useTasks.ts` with `useQuery`/`useMutation`
  - [ ] Replace manual fetch logic in `usePipeline.ts` with React Query

### 1.3 Shared Types

- [ ] **1.3.1** Create shared types package (optional, or just duplicate types)
  - [ ] If duplicating: ensure `backend/src/types/` and `frontend/src/types/` are kept in sync
  - [ ] Alternatively: create `packages/shared/` with shared TypeScript interfaces

---

## PHASE 2 — Architecture Refactor (Weeks 6-9)

**Goal:** Proper layered architecture. Real multi-agent orchestration.

### 2.1 Repository/Service Layer

- [ ] **2.1.1** Add repository pattern (backend)
  - [ ] Create `backend/src/repositories/UserRepository.ts` — `findByEmail`, `create`, `findById`, `softDelete`, `updateLastLogin`
  - [ ] Create `backend/src/repositories/TaskRepository.ts` — `findAll` (with filters/pagination), `findById`, `create`, `update`, `softDelete`, `findStats`
  - [ ] Create `backend/src/repositories/BaseRepository.ts` — generic CRUD methods

- [ ] **2.1.2** Add service layer
  - [ ] Create `backend/src/services/AuthService.ts` — `register`, `login`, `logout`, `getCurrentUser`
  - [ ] Create `backend/src/services/TaskService.ts` — business logic (cascade operations, validation)
  - [ ] Create `backend/src/services/AiService.ts` — AI calls with retry logic, fallback
  - [ ] Create `backend/src/services/SessionService.ts` — session token management

- [ ] **2.1.3** Update controllers to use services
  - [ ] Refactor `backend/src/controllers/authController.ts` — delegate to `AuthService`
  - [ ] Refactor `backend/src/controllers/taskController.ts` — delegate to `TaskService`
  - [ ] Remove all direct `getDb()` calls from controllers
  - [ ] Verify all existing tests still pass

### 2.2 Real Multi-Agent Orchestration

- [ ] **2.2.1** Define agent interfaces
  - [ ] Create `backend/src/agents/Agent.ts` — `AgentConfig`, `AgentResult`, `AgentExecuteInput` interfaces
  - [ ] Create `backend/src/agents/AgentRegistry.ts` — registry of all 5 agents

- [ ] **2.2.2** Implement base agent class
  - [ ] Create `backend/src/agents/BaseAgent.ts` — abstract class with `name`, `systemPrompt`, `execute()` method
  - [ ] Add retry logic, timeout handling, error recovery

- [ ] **2.2.3** Implement 5 concrete agents
  - [ ] `backend/src/agents/AnalyzerAgent.ts` — SRS parsing, entity extraction
  - [ ] `backend/src/agents/ArchitectAgent.ts` — system design, DB schema, API routes
  - [ ] `backend/src/agents/CoderAgent.ts` — code generation (frontend, backend, DB, nginx, env)
  - [ ] `backend/src/agents/ReviewerAgent.ts` — security scan, quality check, syntax validation
  - [ ] `backend/src/agents/DeployerAgent.ts` — config generation, deployment readiness

- [ ] **2.2.4** Add agent communication bus
  - [ ] Create `backend/src/agents/AgentBus.ts` — EventEmitter-based message bus
  - [ ] Agents publish to bus on completion: `bus.emit('analyzer:complete', result)`
  - [ ] Downstream agents subscribe: `bus.on('analyzer:complete', (result) => ...)`
  - [ ] Add `bus.getHistory()` for debugging

- [ ] **2.2.5** Replace hardcoded COMMS with real agent events
  - [ ] Remove static `COMMS` array from `frontend/src/config/agents.ts`
  - [ ] Update `frontend/src/contexts/PipelineContext.tsx` — subscribe to SSE/WebSocket for real agent messages
  - [ ] Update `frontend/src/components/CommsPanel.tsx` — render real agent output instead of static messages

### 2.3 Real-Time Communication

- [ ] **2.3.1** Add SSE endpoint for pipeline progress
  - [ ] Create `backend/src/routes/pipelineRoutes.ts` — `GET /pipeline/stream/:runId` (SSE)
  - [ ] Emit events: `agent:start`, `agent:progress`, `agent:thought`, `agent:complete`, `agent:error`
  - [ ] Include payload: `{ agentId, state, progress, thought, message }`

- [ ] **2.3.2** Connect frontend to SSE
  - [ ] In `frontend/src/hooks/usePipeline.ts` — open `EventSource` to `/pipeline/stream/:runId`
  - [ ] Update `PipelineContext` — replace fake `setTimeout` with real SSE events
  - [ ] Handle `agent:error` events — show user-friendly error in UI

- [ ] **2.3.3** Add pipeline cancellation
  - [ ] `DELETE /pipeline/:runId` — cancel running pipeline
  - [ ] In `AgentRunner.ts` — check `AbortSignal` on each step; throw `CancelledError` if aborted
  - [ ] Frontend: "Cancel" button calls `DELETE /pipeline/:runId`
  - [ ] Cleanup: stop SSE connection, reset UI state

### 2.4 Refactor Frontend Architecture

- [ ] **2.4.1** Split PipelineContext
  - [ ] Create `frontend/src/contexts/AgentContext.tsx` — agent states, thoughts, flow nodes
  - [ ] Create `frontend/src/contexts/CodeContext.tsx` — generated code, active file, preview state
  - [ ] Simplify `PipelineContext` to orchestration only (launch, cancel, runId)

- [ ] **2.4.2** Add Zustand for global state
  - [ ] `npm install zustand` in `frontend/`
  - [ ] Migrate auth state to Zustand store
  - [ ] Migrate pipeline state to Zustand store
  - [ ] Remove React Context where Zustand suffices

---

## PHASE 3 — Database & Persistence (Weeks 10-12)

**Goal:** Production-grade data layer with migrations and PostgreSQL support.

### 3.1 Migrations

- [ ] **3.1.1** Set up node-pg-migrate
  - [ ] `npm install node-pg-migrate` in `backend/`
  - [ ] Add migration scripts to `backend/src/migrations/` (JavaScript for now, TypeScript later)
  - [ ] Add `migrate` and `migrate:create` scripts to `backend/package.json`
  - [ ] Create `migrations.config.js` — connection to both SQLite (dev) and PostgreSQL (prod)

- [ ] **3.1.2** Write initial migration (001_initial_schema)
  - [ ] `CREATE TABLE users (...)` — id (INTEGER PRIMARY KEY for SQLite; UUID for PG), email, password_hash, name, last_login, deleted_at, created_at, updated_at
  - [ ] `CREATE TABLE tasks (...)` — id, title, description, status, priority, due_date, tags (JSON/text), creator_id, assignee_id, deleted_at, created_at, updated_at
  - [ ] `CREATE INDEX idx_tasks_creator ON tasks(creator_id)`
  - [ ] `CREATE INDEX idx_tasks_status ON tasks(status)`

- [ ] **3.1.3** Remove initSchema from database.js
  - [ ] Delete `CREATE TABLE IF NOT EXISTS` calls from `backend/src/config/database.ts`
  - [ ] Remove `db.serialize()` block
  - [ ] Verify migrations run on fresh DB

- [ ] **3.1.4** Add future migration for audit_log (002_audit_log)
  - [ ] `CREATE TABLE audit_log (...)` — id, table_name, record_id, action, user_id, old_data (JSONB), new_data (JSONB), created_at
  - [ ] Index on `(table_name, record_id)`

### 3.2 PostgreSQL Support

- [ ] **3.2.1** Install PostgreSQL client
  - [ ] `npm install pg pg-promise` or `npm install knex` in `backend/`
  - [ ] Add `DATABASE_URL` parsing for PostgreSQL connection string

- [ ] **3.2.2** Abstract database layer
  - [ ] Create `backend/src/config/db.ts` — factory: returns SQLite or PostgreSQL connection based on `DATABASE_URL`
  - [ ] Use an ORM/query builder that supports both (Knex or Drizzle)
  - [ ] Update all repository methods to use the abstracted DB

- [ ] **3.2.3** Add UUID primary key migration (003_uuid_migration)
  - [ ] Add new migration: `ALTER TABLE users ADD COLUMN uuid UUID DEFAULT gen_random_uuid()`
  - [ ] Add new migration: `ALTER TABLE tasks ADD COLUMN uuid UUID DEFAULT gen_random_uuid()`
  - [ ] Update `taskRoutes.ts` and `taskController.ts` — accept UUID in params
  - [ ] **Warning:** This is a breaking change; coordinate with frontend

### 3.3 Transactions & Data Integrity

- [ ] **3.3.1** Wrap task operations in transactions
  - [ ] In `TaskRepository.ts` — wrap `create` and `update` in `db.transaction()`
  - [ ] Ensure `updated_at` is set within the same transaction
  - [ ] Test: simulate failure mid-transaction, verify rollback

- [ ] **3.3.2** Add audit logging service
  - [ ] Create `backend/src/services/AuditService.ts` — `log(tableName, recordId, action, userId, oldData, newData)`
  - [ ] Call `AuditService.log()` from all repository `create`/`update`/`delete` methods
  - [ ] Add test for audit log completeness

- [ ] **3.3.3** Add unique constraint on user email (migration)
  - [ ] Migration 004: `CREATE UNIQUE INDEX idx_users_email ON users(lower(email)) WHERE deleted_at IS NULL`

### 3.4 Caching

- [ ] **3.4.1** Add Redis for caching
  - [ ] `npm install ioredis` in `backend/`
  - [ ] Create `backend/src/config/redis.ts` — connection + helpers
  - [ ] Cache task stats: `GET /tasks/stats` with 60s TTL

---

## PHASE 4 — DevOps & Deployment (Weeks 13-15)

**Goal:** Docker-based deployment, CI/CD pipeline, production hardening.

### 4.1 Docker

- [ ] **4.1.1** Create backend Dockerfile
  - [ ] `taskapp/backend/Dockerfile` — `FROM node:20-alpine`
  - [ ] Multi-stage: build stage → production stage
  - [ ] Copy `package*.json`, `npm ci --production`, copy source
  - [ ] Run as non-root user
  - [ ] Expose port 3001

- [ ] **4.1.2** Create frontend Dockerfile
  - [ ] `taskapp/frontend/Dockerfile` — build stage: `FROM node:20-alpine AS build`
  - [ ] Build React app with `REACT_APP_API_URL` arg
  - [ ] Production stage: `FROM nginx:alpine`
  - [ ] Copy built assets to nginx html directory
  - [ ] Expose port 80

- [ ] **4.1.3** Create Docker Compose (dev)
  - [ ] `docker-compose.yml` — services: `backend`, `frontend`, `postgres`, `redis`
  - [ ] Volume mounts for live reload (backend: src/, frontend: src/)
  - [ ] PostgreSQL with persistent volume
  - [ ] `ollama` service (optional, for local AI)

- [ ] **4.1.4** Create Docker Compose (prod)
  - [ ] `docker-compose.prod.yml` — no volume mounts, built images
  - [ ] nginx reverse proxy container
  - [ ] SSL certificate via Let's Encrypt (or placeholder)
  - [ ] Health checks on all services

- [ ] **4.1.5** Create nginx configuration
  - [ ] `nginx/nginx.conf` — upstream to backend:3001, serve frontend static files
  - [ ] Rate limiting: 500 req/15min per IP
  - [ ] SSL/TLS config (if certs available)
  - [ ] Gzip compression

### 4.2 CI/CD

- [ ] **4.2.1** Create GitHub Actions CI workflow
  - [ ] `.github/workflows/ci.yml`
  - [ ] Trigger: push to `main`, pull requests to `main`
  - [ ] Jobs: lint (backend + frontend) → test (backend Jest) → build (backend + frontend) → E2E (Playwright)
  - [ ] Cache `node_modules/` and `.npm/` caches
  - [ ] Matrix strategy: Node 18, 20

- [ ] **4.2.2** Create GitHub Actions CD workflow
  - [ ] `.github/workflows/cd.yml`
  - [ ] Trigger: push to `main` (after CI passes)
  - [ ] Jobs: build Docker images → push to GHCR → deploy to cloud (or `docker-compose` on server)
  - [ ] Secrets: `DOCKER_HUB_TOKEN`, `SERVER_SSH_KEY`, etc.

- [ ] **4.2.3** Add Playwright E2E tests
  - [ ] `npm install -D @playwright/test` in root
  - [ ] `e2e/specs/auth.spec.ts` — register, login, logout
  - [ ] `e2e/specs/tasks.spec.ts` — create, read, update, delete task
  - [ ] `e2e/specs/pipeline.spec.ts` — enter SRS, launch pipeline, view output
  - [ ] `playwright.config.ts` — base URL, timeout, headless
  - [ ] Run in CI after app containers are up

### 4.3 Production Hardening

- [ ] **4.3.1** Add health check endpoints
  - [ ] `GET /health/live` — returns 200 if process is alive
  - [ ] `GET /health/ready` — checks DB connectivity + AI provider reachable
  - [ ] Update nginx config: `health_check` directive pointing to `/health/ready`

- [ ] **4.3.2** Add Prometheus metrics
  - [ ] `npm install prom-client` in `backend/`
  - [ ] `GET /metrics` endpoint — Prometheus scrape target
  - [ ] Instrument: `http_request_duration_seconds` (histogram), `http_requests_total` (counter), `pipeline_runs_total` (counter), `ai_call_duration_seconds` (histogram)

- [ ] **4.3.3** Add Sentry error tracking
  - [ ] `npm install @sentry/node @sentry/react @sentry/tracing` in `backend/` and `frontend/`
  - [ ] `backend/src/instrument.ts` — Sentry Node.js init with tracesSampler
  - [ ] `frontend/src/instrument.ts` — Sentry React init with browserTracing
  - [ ] Set `SENTRY_DSN` in environment variables

- [ ] **4.3.4** Finalize environment config
  - [ ] All env vars documented in `backend/.env.example`
  - [ ] Required vars clearly marked; optional vars have defaults
  - [ ] Test startup with minimal `.env` — should either fail fast or use safe defaults

---

## PHASE 5 — Feature Completeness (Weeks 16-19)

**Goal:** Add all missing features from the evaluation.

### 5.1 Code Generation UX

- [ ] **5.1.1** Add code download as ZIP
  - [ ] `npm install archiver` in `backend/`
  - [ ] `POST /pipeline/:runId/download` — creates ZIP of all generated files
  - [ ] Frontend: "Download Code" button in `CodePreview.tsx`
  - [ ] ZIP includes: `frontend/`, `backend/`, `database/`, `nginx.conf`, `.env.example`, `README.md`

- [ ] **5.1.2** Add syntax-highlighted code viewer
  - [ ] `npm install react-syntax-highlighter` in `frontend/`
  - [ ] Replace raw `<pre>` in `CodePreview.tsx` with `SyntaxHighlighter`
  - [ ] Add: line numbers, copy-to-clipboard button, file download button
  - [ ] Language auto-detection from file extension

- [ ] **5.1.3** Add generated code search
  - [ ] Frontend: search input in `CodePreview.tsx`
  - [ ] Filters generated code by keyword across all files
  - [ ] Highlights matching lines

- [ ] **5.1.4** Add dark mode toggle
  - [ ] Create `frontend/src/config/theme.ts` — `lightTheme`, `darkTheme` objects
  - [ ] Add `ThemeContext.tsx` — `theme`, `toggleTheme`, `setTheme`
  - [ ] Wrap app in `ThemeProvider`
  - [ ] Apply theme via CSS variables on `:root`
  - [ ] Persist preference in `localStorage`

### 5.2 Task Management Enhancements

- [ ] **5.2.1** Add `due_date` to task updates
  - [ ] Edit `backend/src/schemas/task.schema.ts` — add `due_date` to `updateTaskSchema`
  - [ ] Edit `backend/src/services/TaskService.ts` — handle `due_date` in update
  - [ ] Edit `frontend/src/components/TaskManager/TaskForm.tsx` — add due_date field
  - [ ] Edit `frontend/src/components/TaskManager/TaskList.tsx` — display due_date

- [ ] **5.2.2** Add task comments
  - [ ] Migration 005: `CREATE TABLE task_comments (id, task_id, user_id, content, created_at)`
  - [ ] `backend/src/repositories/CommentRepository.ts`
  - [ ] `backend/src/routes/commentRoutes.ts` — `GET /tasks/:id/comments`, `POST /tasks/:id/comments`
  - [ ] Frontend: `TaskDetail.tsx` — show comments, add comment form

- [ ] **5.2.3** Add task search (full-text)
  - [ ] Migration: `CREATE VIRTUAL TABLE tasks_fts USING fts5(title, description, content='tasks', content_rowid='id')` (SQLite)
  - [ ] Or PostgreSQL: `CREATE INDEX idx_tasks_fts ON tasks USING GIN (to_tsvector('english', title || ' ' || description))`
  - [ ] `GET /tasks/search?q=...` — full-text search endpoint
  - [ ] Frontend: search bar in task list

- [ ] **5.2.4** Add undo for task delete
  - [ ] `DELETE /tasks/:id` — set `deleted_at` (already soft delete)
  - [ ] `POST /tasks/:id/restore` — clear `deleted_at`
  - [ ] Add "Recently deleted" filter in frontend task list
  - [ ] Auto-purge: scheduled job clears `deleted_at` rows older than 30 days

### 5.3 Pipeline Enhancements

- [ ] **5.3.1** Add pipeline history
  - [ ] Migration 006: `CREATE TABLE pipeline_runs (id, user_id, srs_input, status, generated_code, metrics, created_at)`
  - [ ] `backend/src/repositories/PipelineRunRepository.ts`
  - [ ] `GET /pipeline/history` — list past runs for current user
  - [ ] `GET /pipeline/:runId` — get specific run with full output
  - [ ] Frontend: "History" tab showing past pipeline runs

- [ ] **5.3.2** Add code quality scoring
  - [ ] `backend/src/services/CodeQualityScorer.ts` — after code generation:
    - Validate generated code is valid JSON
    - Check all required keys exist (frontend, backend, database, nginx, env)
    - Count lines of code per file
    - Simulate syntax check (parse frontend JS, backend JS, SQL)
    - Score 0-100
  - [ ] Store score in `pipeline_runs.metrics`
  - [ ] Display score in `Metrics.tsx`

- [ ] **5.3.3** Add multi-language SRS support
  - [ ] `AnalyzerAgent.ts` — detect SRS format (Markdown, plain text, structured)
  - [ ] Support natural language SRS descriptions (not just structured)
  - [ ] Add markdown parser for structured SRS documents

- [ ] **5.3.4** Add custom agent prompts
  - [ ] `ConfigPanel.tsx` — add section for custom agent system prompts
  - [ ] `POST /pipeline` — accept `agentConfig` in body: `{ analyzerPrompt?, architectPrompt?, ... }`
  - [ ] `AgentRunner.ts` — merge custom prompts with default system prompts

---

## PHASE 6 — Advanced AI & Scale (Weeks 20-24)

**Goal:** Enterprise-grade AI orchestration and horizontal scalability.

### 6.1 Advanced Agent Features

- [ ] **6.1.1** Add agent tool use (LangChain tools)
  - [ ] `npm install langchain @langchain/core` in `backend/`
  - [ ] Define tools: `FileWriter`, `FileReader`, `ShellExecutor` (sandboxed)
  - [ ] `CoderAgent.ts` — uses `FileWriter` tool to write generated files
  - [ ] `ReviewerAgent.ts` — uses `ShellExecutor` to run syntax checks

- [ ] **6.1.2** Add agent reflection loop
  - [ ] `ReviewerAgent.ts` — if issues found, loop back to `CoderAgent` with fix instructions
  - [ ] Max 3 iterations (prevent infinite loops)
  - [ ] Track iteration count in agent state
  - [ ] Frontend: show "Review iteration 1/3" in UI

- [ ] **6.1.3** Add code execution sandbox
  - [ ] Integrate Deno Deploy or WebContainer for frontend preview
  - [ ] Start generated backend in sandbox, verify it boots without error
  - [ ] Hit health endpoint of sandboxed app
  - [ ] Report: "Backend started successfully" or "Backend failed to start: [error]"
  - [ ] **Security:** sandbox must have no network access, limited filesystem

- [ ] **6.1.4** Add vector memory for agents
  - [ ] `npm install chromadb` or `npm install @pinecone-database/pinecone` in `backend/`
  - [ ] `backend/src/memory/VectorStore.ts` — `add(code, metadata)`, `search(query, k)`
  - [ ] `ReviewerAgent.ts` — before flagging an issue, search vector store for similar past issues
  - [ ] Store each completed code output in vector DB with metadata: `{ domain, language, timestamp }`

### 6.2 Scalability

- [ ] **6.2.1** Make backend stateless
  - [ ] Verify: no in-memory state (sessions in Redis, pipeline state in DB)
  - [ ] Remove any global variables in `backend/src/`
  - [ ] Document stateless design in `ARCHITECTURE_REVIEW.md`

- [ ] **6.2.2** Add job queue for pipeline (BullMQ)
  - [ ] `npm install bullmq ioredis` in `backend/`
  - [ ] `POST /pipeline` — enqueues job, returns `runId` immediately
  - [ ] `backend/src/workers/pipelineWorker.ts` — processes job asynchronously
  - [ ] Client SSE connects to `/pipeline/stream/:runId` (worker emits events)
  - [ ] Add `GET /pipeline/:runId/status` — returns job state (queued, active, completed, failed)

- [ ] **6.2.3** Add API versioning
  - [ ] Prefix all routes with `/api/v1/`
  - [ ] `backend/src/routes/authRoutes.ts` → `/api/v1/auth`
  - [ ] `backend/src/routes/taskRoutes.ts` → `/api/v1/tasks`
  - [ ] `backend/src/routes/aiRoutes.ts` → `/api/v1/ai`
  - [ ] Redirect or version-negotiate old `/auth`, `/tasks` paths

- [ ] **6.2.4** Add OpenAPI 3.0 spec
  - [ ] `npm install swagger-ui-express swagger-jsdoc` in `backend/`
  - [ ] Write `openapi.yaml` — all endpoints, request/response schemas, auth
  - [ ] Serve Swagger UI at `/api/docs`
  - [ ] Add `@OpenAPIV2` decorators or JSDoc annotations to routes

### 6.3 Enterprise Features

- [ ] **6.3.1** Add multi-tenancy
  - [ ] All queries must include `team_id` filter (middleware extracts from JWT)
  - [ ] Migration: add `team_id` to users table
  - [ ] `tenantMiddleware.ts` — `req.teamId = jwt.teamId`
  - [ ] PostgreSQL row-level security: `CREATE POLICY tenant_isolation ON tasks FOR ALL USING (team_id = current_setting('app.current_tenant')::uuid)`

- [ ] **6.3.2** Add RBAC
  - [ ] Migration: `CREATE TABLE team_members (team_id, user_id, role)` (already in schema.sql)
  - [ ] `backend/src/middleware/rbac.ts` — `requireRole('admin')`, `requireRole('member')`
  - [ ] Apply to routes: only `owner` can delete team, only `admin`/`owner` can manage members
  - [ ] Frontend: hide UI elements based on role

- [ ] **6.3.3** Add OAuth (Google + GitHub)
  - [ ] `npm install passport passport-google-oauth20 passport-github2` in `backend/`
  - [ ] `backend/src/routes/authRoutes.ts` — `GET /auth/google`, `GET /auth/google/callback`, similarly for GitHub
  - [ ] On OAuth callback: find or create user, issue JWT, redirect to frontend
  - [ ] Frontend: "Sign in with Google" and "Sign in with GitHub" buttons

- [ ] **6.3.4** Add audit dashboard
  - [ ] `GET /audit/logs` — query `audit_log` table with filters (table, user, date range)
  - [ ] `frontend/src/pages/AuditDashboard.tsx` — table view of audit entries
  - [ ] Filters: date range, table name, action type, user

---

## PHASE 7 — Polish & Handover (Weeks 25-26)

**Goal:** Production release with full documentation.

### 7.1 Documentation

- [ ] **7.1.1** Update OpenAPI spec
  - [ ] Finalize `openapi.yaml` with all endpoints, schemas, examples
  - [ ] Verify Swagger UI loads at `/api/docs`

- [ ] **7.1.2** Update architecture documentation
  - [ ] Rewrite `ARCHITECTURE_REVIEW.md` with V2 architecture
  - [ ] Add sequence diagrams for pipeline flow
  - [ ] Add component diagrams for service/repository layers
  - [ ] Document Docker and deployment architecture

- [ ] **7.1.3** Write deployment guide
  - [ ] `DEPLOYMENT.md` — step-by-step production deployment
  - [ ] Sections: prerequisites, environment setup, Docker, database migration, nginx, SSL, monitoring
  - [ ] Troubleshooting section: common errors and fixes

- [ ] **7.1.4** Write security documentation
  - [ ] `SECURITY.md` — threat model, security controls
  - [ ] Document: how API keys are stored, how JWTs are validated, how CORS is configured
  - [ ] Document: what data is logged, what data is encrypted at rest

### 7.2 Final Testing & Polish

- [ ] **7.2.1** Performance testing with k6
  - [ ] `k6/scripts/smoke.ts` — 10 concurrent users, 1 minute
  - [ ] `k6/scripts/load.ts` — 100 concurrent users, 5 minutes
  - [ ] `k6/scripts/stress.ts` — ramp up to 500 concurrent
  - [ ] Metrics: p95/p99 latency, error rate, throughput
  - [ ] Identify bottlenecks: DB queries, AI calls, memory

- [ ] **7.2.2** Accessibility audit
  - [ ] `npm install @axe-core/react` in `frontend/`
  - [ ] Run axe on all pages: Home, Tasks, Output, Agent Status
  - [ ] Fix WCAG 2.1 AA violations: color contrast, keyboard navigation, ARIA labels

- [ ] **7.2.3** Cross-browser testing
  - [ ] Test on Chrome, Firefox, Safari, Edge (latest versions)
  - [ ] Verify: app loads, auth works, pipeline runs, code preview renders
  - [ ] Fix any CSS inconsistencies

- [ ] **7.2.4** Write user documentation
  - [ ] `docs/USER_GUIDE.md` — how to use AIDEN (from sign-up to code download)
  - [ ] `docs/QUICK_START.md` — 5-minute quick start
  - [ ] `docs/AGENTS.md` — how each agent works
  - [ ] `docs/FAQ.md` — common questions and troubleshooting

---

## Phase Completion Checklist

| Phase | Tasks | Completed | Verified |
|-------|-------|-----------|----------|
| Phase 0 | 20 | [ ] | [ ] |
| Phase 1 | 18 | [ ] | [ ] |
| Phase 2 | 17 | [ ] | [ ] |
| Phase 3 | 14 | [ ] | [ ] |
| Phase 4 | 13 | [ ] | [ ] |
| Phase 5 | 12 | [ ] | [ ] |
| Phase 6 | 14 | [ ] | [ ] |
| Phase 7 | 8 | [ ] | [ ] |
| **Total** | **116** | [ ] | [ ] |
