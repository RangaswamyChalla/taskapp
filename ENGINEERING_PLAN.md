# AIDEN Engineering Implementation Plan

## Overview

This plan implements improvements to the AIDEN application in **phased stages** to minimize risk and avoid disturbing existing functionality. Each phase is self-contained and additive.

---

## Principles

1. **Non-breaking**: No changes to working endpoints or component APIs without backward compatibility
2. **Additive first**: New features added before deprecating old behavior
3. **Test after each phase**: Run `npm test` (backend) and `npm run build` (frontend) before proceeding
4. **Phase gates**: Complete and verify Phase N before starting Phase N+1

---

## Phase 1: API Completeness & Data Model Alignment
**Goal**: Align backend with API documentation; no frontend behavior change  
**Risk**: Low  
**Estimate**: 4–6 hours

### 1.1 Add `GET /tasks/:id` (Backend)
- **File**: `taskapp/backend/routes/taskRoutes.js`
- **Action**: Add route `router.get('/:id', auth, getTaskById)` (before `/stats` to avoid conflict)
- **File**: `taskapp/backend/controllers/taskController.js`
- **Action**: Add `getTaskById(req, res)` — fetch single task by id, creator_id check
- **Existing impact**: None — purely additive

### 1.2 Add Tags Support (Backend)
- **File**: `taskapp/backend/config/database.js`
- **Action**: Add migration/schema update: `ALTER TABLE tasks ADD COLUMN tags TEXT` (JSON string or comma-separated for SQLite)
- **File**: `taskapp/backend/controllers/taskController.js`
- **Action**: In createTask, updateTask, getTasks: read/write tags (parse/store as JSON)
- **Existing impact**: None — new optional field, default `[]`

### 1.3 Implement Real Pagination (Backend)
- **File**: `taskapp/backend/controllers/taskController.js`
- **Action**: In getTasks, add `LIMIT ? OFFSET ?` from query params `page`, `limit` (default 20)
- **Action**: Return `total` from separate COUNT query
- **Existing impact**: Low — frontend already handles `data.tasks`; add `?page=1&limit=20` when needed

### 1.4 Add `cancelled` Status (Backend + DB)
- **File**: `taskapp/backend/config/database.js`
- **Action**: Ensure tasks.status accepts `cancelled` (TEXT, no enum — already flexible)
- **File**: `taskapp/backend/controllers/taskController.js`
- **Action**: Allow `cancelled` in updateTask validation
- **Existing impact**: None — additive status

**Phase 1 Gate**: Run `npm test` in backend; all 14 tests pass.

---

## Phase 2: Frontend–API Alignment
**Goal**: Use new API features in UI; fix ConfigPanel duplication  
**Risk**: Low  
**Estimate**: 3–4 hours

### 2.1 Add Cancelled to Task Filters
- **File**: `taskapp/frontend/src/components/TaskManager/TaskList.jsx`
- **Action**: Add `'cancelled'` to filter buttons array
- **Existing impact**: None — additive filter

### 2.2 Optional: Single Task Fetch (if needed)
- **File**: `taskapp/frontend/src/hooks/useTasks.js`
- **Action**: Add `fetchTaskById(id)` using `GET /tasks/:id` (only if detail modal/view added later)
- **Existing impact**: None — optional, not wired until Phase 4+

### 2.3 Remove ConfigPanel Duplication
- **File**: `taskapp/frontend/src/components/LeftPanel/SRSInput.jsx`
- **Action**: Remove inline `ConfigPanel` component; import from `ConfigPanel.jsx` or keep only one
- **File**: `taskapp/frontend/src/App.jsx`
- **Action**: Ensure single `ConfigPanel` import
- **Existing impact**: None — cosmetic cleanup

### 2.4 Display Tags in TaskList (if tags implemented)
- **File**: `taskapp/frontend/src/components/TaskManager/TaskList.jsx`
- **Action**: Render `t.tags` as chips when present
- **File**: `taskapp/frontend/src/components/TaskManager/TaskForm.jsx`
- **Action**: Add optional tags input (comma-separated)
- **Existing impact**: None — optional display

**Phase 2 Gate**: `npm run build` succeeds; manual smoke test (login, create task, filter).

---

## Phase 3: ConfigPanel Behavior
**Goal**: Make Frontend/Backend/DB/Nginx toggles affect pipeline output  
**Risk**: Medium  
**Estimate**: 4–5 hours

### 3.1 Lift Config State
- **File**: `taskapp/frontend/src/components/LeftPanel/ConfigPanel.jsx`
- **Action**: Convert to controlled component; accept `config`, `onConfigChange` props
- **File**: `taskapp/frontend/src/App.jsx`
- **Action**: Add state `config = { frontend: true, backend: true, db: true, nginx: true }`; pass to ConfigPanel and PipelineContext

### 3.2 Wire Config to Pipeline
- **File**: `taskapp/frontend/src/contexts/PipelineContext.jsx`
- **Action**: Accept `config` in `launchPipeline(srs, apiKey, config)`
- **Action**: After `finalCode` is set, filter keys by config: only include `frontend` if `config.frontend`, etc.
- **Existing impact**: Low — output shape unchanged when all toggles on; when off, omit those keys

### 3.3 Wire Config to CodePreview
- **File**: `taskapp/frontend/src/components/CenterPanel/CodePreview.jsx`
- **Action**: Accept `config` prop; only show tabs for enabled artifacts
- **Existing impact**: None — additive filtering

**Phase 3 Gate**: Toggle "Backend API" off → only frontend/db/nginx tabs; no runtime errors.

---

## Phase 4: SRS Templates & UX
**Goal**: Add missing templates; minor UX improvements  
**Risk**: Low  
**Estimate**: 2–3 hours

### 4.1 Add Logistics & Banking Templates
- **File**: `taskapp/frontend/src/config/templates.js`
- **Action**: Add `logistics`, `banking` templates (aligned with demoApps domains)
- **File**: `taskapp/frontend/src/components/LeftPanel/SRSInput.jsx`
- **Action**: Add chips for "Logistics", "Banking" that load `TEMPLATES.logistics`, `TEMPLATES.banking`

### 4.2 Optional: GET /tasks/:id Usage
- **File**: `taskapp/frontend/src/components/TaskManager/TaskList.jsx` (or new TaskDetail.jsx)
- **Action**: If task detail modal added, use `fetchTaskById` from useTasks
- **Existing impact**: None until modal is added

**Phase 4 Gate**: Select "Logistics" template → SRS populates; Launch Pipeline → Logistics demo appears.

---

## Phase 5: AI Pipeline Robustness
**Goal**: Retries, better error handling; no change to happy path  
**Risk**: Medium  
**Estimate**: 4–6 hours

### 5.1 Add Retry Logic to callAgent
- **File**: `taskapp/frontend/src/contexts/PipelineContext.jsx`
- **Action**: Wrap `fetch` in retry loop (e.g., 2 retries with 2s delay on 5xx or network error)
- **Existing impact**: None — improves reliability only

### 5.2 Structured API Error Handling
- **File**: `taskapp/frontend/src/contexts/PipelineContext.jsx`
- **Action**: Parse Anthropic error response; show user-friendly message (e.g., "Invalid API key", "Rate limit exceeded")
- **Existing impact**: None — better UX on failure

### 5.3 Timeout Handling
- **File**: `taskapp/frontend/src/contexts/PipelineContext.jsx`
- **Action**: Add AbortController with timeout (e.g., 60s per agent call)
- **Existing impact**: None — prevents hung UI

**Phase 5 Gate**: Invalid API key → clear message; network failure → retry then fallback.

---

## Phase 6: Routing & Structure (Optional)
**Goal**: Add React Router for shareable URLs  
**Risk**: Medium  
**Estimate**: 3–4 hours

### 6.1 Install React Router
- **Action**: `npm install react-router-dom` in frontend

### 6.2 Define Routes
- **File**: `taskapp/frontend/src/App.jsx`
- **Action**: Wrap with `BrowserRouter`; add routes: `/` (main), `/output` (code view), `/tasks` (task manager focus)
- **Action**: Use `Navigate` or `Link` for tab switches where appropriate
- **Existing impact**: Low — default route `/` preserves current behavior

**Phase 6 Gate**: Navigate to `/output` directly; back button works.

---

## Phase 7: Backend AI Proxy (Optional, Higher Effort)
**Goal**: Move Anthropic calls to backend; hide API key  
**Risk**: Medium  
**Estimate**: 6–8 hours

### 7.1 Backend Proxy Endpoint
- **File**: `taskapp/backend/routes/aiRoutes.js` (new)
- **Action**: `POST /ai/generate` — accepts `{ systemRole, messages, requireJson }`; calls Anthropic; returns result
- **File**: `taskapp/backend/.env`
- **Action**: Add `ANTHROPIC_API_KEY` (server-side only)

### 7.2 Frontend Use Proxy
- **File**: `taskapp/frontend/src/contexts/PipelineContext.jsx`
- **Action**: Replace direct `fetch('https://api.anthropic.com/...')` with `API.post('/ai/generate', ...)` when `REACT_APP_USE_AI_PROXY=true`
- **Existing impact**: None — feature-flagged; default stays direct for backward compatibility

**Phase 7 Gate**: With proxy enabled, pipeline works without API key in browser.

---

## Implementation Order Summary

| Phase | Focus                    | Dependencies | Est. Hours |
|-------|--------------------------|--------------|------------|
| 1     | API completeness         | None         | 4–6        |
| 2     | Frontend–API alignment   | Phase 1      | 3–4        |
| 3     | ConfigPanel behavior     | None         | 4–5        |
| 4     | SRS templates            | None         | 2–3        |
| 5     | AI robustness            | None         | 4–6        |
| 6     | Routing (optional)       | None         | 3–4        |
| 7     | Backend AI proxy (opt.)  | None         | 6–8        |

**Recommended sequence**: 1 → 2 → 3 → 4 → 5 (6 and 7 as needed)

---

## Verification Checklist (After Each Phase)

- [ ] `cd taskapp/backend; npm test` — all tests pass
- [ ] `cd taskapp/frontend; npm run build` — builds successfully
- [ ] Manual: Login (Demo) → Create task → Update status → Delete task
- [ ] Manual: Launch Pipeline (no key) → Demo output appears
- [ ] Manual: Launch Pipeline (with key) → Real AI output (if key valid)

---

## File Change Summary

| Phase | Files Touched |
|-------|---------------|
| 1     | `taskRoutes.js`, `taskController.js`, `database.js` |
| 2     | `TaskList.jsx`, `TaskForm.jsx`, `SRSInput.jsx`, `App.jsx`, `useTasks.js` |
| 3     | `ConfigPanel.jsx`, `App.jsx`, `PipelineContext.jsx`, `CodePreview.jsx` |
| 4     | `templates.js`, `SRSInput.jsx` |
| 5     | `PipelineContext.jsx` |
| 6     | `App.jsx`, `package.json`, new `Routing.jsx` or similar |
| 7     | `aiRoutes.js` (new), `app.js`, `PipelineContext.jsx`, `.env` |

---

## Rollback Strategy

- Each phase is committed separately; revert that commit if issues arise.
- Database: Phase 1 tags column can be dropped with `ALTER TABLE tasks DROP COLUMN tags` if needed (SQLite 3.35+).
