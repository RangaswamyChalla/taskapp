# AIDEN Architecture Review

**Reviewer:** Principal Architect  
**Date:** 2026-03-21  
**Scope:** taskapp backend + frontend, AI pipeline, integrations, orchestration

---

## 1. Executive Summary

The AIDEN application is a **multi-agent code synthesis platform** that turns SRS (Software Requirements Specifications) into app prototypes. The system is functionally sound, with a clear separation between the task management API, auth, and the AI pipeline. All integration points tested successfully. Several architectural improvements and technical debt items are recommended.

**Verification Status:**
- Backend: ✓ API ready on :3001
- Health: ✓ `GET /health` returns `{"status":"ok"}`
- Auth: ✓ Register, login, JWT flow working
- Tasks: ✓ CRUD, pagination, tags, `cancelled` status
- AI Proxy: ✓ Anthropic + Ollama provider abstraction
- Tests: ✓ 19/19 passing (auth, tasks, AI)

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AIDEN v2                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Frontend (React, port 3000)                                                 │
│  ├── AuthContext        → JWT, demo login                                    │
│  ├── PipelineContext    → 5-agent pipeline, AI calls                         │
│  ├── useTasks           → Tasks CRUD via API                                 │
│  └── Routes: /, /agents, /output, /tasks                                     │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ REACT_APP_API_URL (default localhost:3001)
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Backend (Express, port 3001)                                                │
│  ├── /auth     → register, login, me                                         │
│  ├── /tasks    → CRUD, pagination, filters, getById, stats                   │
│  ├── /ai       → POST /generate (Anthropic or Ollama)                        │
│  └── /health   → liveness                                                    │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   SQLite (taskapp.db)   Anthropic API          Ollama (localhost:11434)
   users, tasks          or Ollama              when AI_PROVIDER=ollama
```

---

## 3. Integration Points

| Layer | Consumer | Provider | Contract | Status |
|-------|----------|----------|----------|--------|
| Auth | Frontend | Backend `/auth/*` | JWT in `Authorization`, `localStorage.token` | ✓ |
| Tasks | Frontend useTasks | Backend `/tasks` | REST CRUD, pagination `page`, `limit` | ✓ |
| AI | PipelineContext | Backend `/ai/generate` or Anthropic direct | `{systemRole, messages, requireJson}` | ✓ |
| CORS | Browser | Backend | `FRONTEND_URL`, credentials | ✓ |
| Request ID | Frontend api.js | Backend req.id | `X-Request-ID` | ✓ |

**Critical env vars:**
- Backend: `JWT_SECRET`, `DATABASE_URL` (or `./taskapp.db`), `AI_PROVIDER`, `ANTHROPIC_API_KEY` / Ollama
- Frontend: `REACT_APP_API_URL`, `REACT_APP_USE_AI_PROXY`

---

## 4. Orchestration Flow

### 4.1 Pipeline (5-Agent Sequence)

```
SRS Input → [Analyzer] → [Architect] → [Coder] → [Reviewer] → [Deployer] → Output
```

1. **Analyzer** – Extracts core requirements from SRS.
2. **Architect** – Defines DB schema + REST routes.
3. **Coder** – Generates JSON `{frontend, backend, database, nginx, env}`.
4. **Reviewer** – Security/syntax review, fixes.
5. **Deployer** – Validates nginx/env alignment.

**Modes:**
- **AI Proxy** (`REACT_APP_USE_AI_PROXY=true`): All calls go via `POST /ai/generate` (backend → Anthropic or Ollama).
- **Direct Anthropic**: Frontend calls Anthropic API with stored API key (no proxy).
- **Demo Mode**: No API key → uses `detectDemoApp` + `contextualizeDemo` with pre-built demos.

### 4.2 Auth Flow

```
App load → GET /auth/me (if token) → setUser / clear token
Sign In → POST /auth/login (demo@app.com) or register-then-login
All /tasks, /ai → require Authorization: Bearer <token>
```

### 4.3 Task Flow

```
useTasks(user) → GET /tasks?page=1&limit=20
createTask → POST /tasks
updateTask → PATCH /tasks/:id
deleteTask → DELETE /tasks/:id (soft delete via deleted_at)
```

---

## 5. Strengths

- **Clear layering**: Routes → controllers → DB; frontend contexts isolate auth, pipeline, tasks.
- **Provider abstraction**: AI supports Anthropic and Ollama via `AI_PROVIDER`.
- **Security**: JWT auth, rate limiting (500/15min), CORS, request ID for tracing.
- **Soft delete**: Tasks use `deleted_at`; `creator_id` scoping.
- **Retries**: AI calls retry on 5xx/429 when using direct Anthropic.
- **Demo fallback**: Graceful demo mode when API key missing/invalid.

---

## 6. Issues & Technical Debt

### 6.1 Database Mismatch

- **.env.example**: `DATABASE_URL=postgresql://...`
- **Actual implementation**: SQLite via `sqlite3`; `DATABASE_URL` used as file path or defaults to `./taskapp.db`.
- **Risk**: Confusion for deploy; PostgreSQL support not implemented.

**Recommendation:** Align docs/schema: either document SQLite-only, or add a real PostgreSQL adapter (e.g. `pg` + connection pooling).

### 6.2 dotenv Loading

- **Backend** uses `require('dotenv').config()` with default `process.cwd()`.
- `.env.example` lives at `taskapp/`; backend runs from `taskapp/backend/`.
- **Risk**: `.env` in `taskapp/` may not be loaded if backend is started from `taskapp/backend/`.

**Recommendation:** Use `path.join(__dirname, '../.env')` or a shared root `.env` and document expected CWD.

### 6.3 AI Proxy Auth Requirement

- `POST /ai/generate` requires valid JWT (auth middleware).
- Pipeline can run without user sign-in in demo mode, but proxy path requires auth.
- **Impact**: Users must sign in to use AI proxy; no “anonymous” pipeline runs.

**Recommendation:** Consider an optional “guest” token or a dedicated API-key-based auth for the AI proxy if unauthenticated pipeline runs are desired.

### 6.4 SRSInput Placeholder

- API key input still labeled “Anthropic API Key” while Ollama is supported.
- **Recommendation:** Change to “API Key (optional for Ollama)” or add provider selector in UI.

### 6.5 Route Ordering

- `GET /tasks/stats` is correctly defined before `GET /tasks/:id` to avoid `stats` being captured as `:id`.
- No other route conflicts observed.

### 6.6 Callback-Style DB

- `taskController` uses raw `sqlite3` callbacks; nested callbacks in `getTasks` (count + data).
- **Recommendation:** Move to async/await (e.g. `better-sqlite3` or promisified `sqlite3`) for maintainability and error handling.

---

## 7. Recommendations (Prioritized)

| Priority | Item | Effort |
|----------|------|--------|
| P1 | Document DB: SQLite vs PostgreSQL; fix `.env.example` if keeping SQLite-only | Low |
| P1 | Fix dotenv path or document “run from taskapp/” for backend | Low |
| P2 | Update SRSInput label for API key / Ollama | Low |
| P2 | Add `GET /ai/status` returning `{ provider, ollamaReachable? }` for diagnostics | Medium |
| P3 | Refactor taskController to async/await or `better-sqlite3` | Medium |
| P3 | Add structured logging (e.g. pino) with `req.id` | Medium |

---

## 8. Run Logs Summary

**Backend (nodemon):**
```
[nodemon] starting `node server.js`
✓ API ready on :3001
```

**Health check:**
```json
{"status":"ok","ts":"2026-03-21T04:39:00.988Z"}
```

**Auth + tasks integration:**
- Register → Login → GET /tasks: Success
- Response: `{ tasks: [], total: 0, page: 1, pages: 1, limit: 20 }`

**Tests:**
```
PASS tests/auth.test.js
PASS tests/ai.test.js
PASS tests/tasks.test.js
Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
```

---

## 9. Conclusion

The AIDEN application is **production-ready for its intended use case** (SRS → prototype pipeline with task management). Integrations are correct, orchestration is clear, and the addition of Ollama support improves flexibility. The main follow-ups are documentation alignment (DB, env), UX tweaks (API key label), and gradual modernization (async DB, structured logging).
