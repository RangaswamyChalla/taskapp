# AIDEN Implementation Phases — Checklist

Use this to track progress. Check off items as completed.

---

## Phase 1: API Completeness & Data Model Alignment
**Status**: ✅ Done

- [x] 1.1 Add `GET /tasks/:id` route and controller
- [x] 1.2 Add tags column and support in task CRUD
- [x] 1.3 Implement real pagination (LIMIT/OFFSET, COUNT)
- [x] 1.4 Add `cancelled` status support
- [x] **Gate**: `npm test` — all pass

---

## Phase 2: Frontend–API Alignment
**Status**: ✅ Done

- [x] 2.1 Add `cancelled` to TaskList filter buttons
- [x] 2.2 (Optional) Add `fetchTaskById` in useTasks
- [x] 2.3 Remove ConfigPanel duplication in SRSInput
- [x] 2.4 Display tags in TaskList; add tags input in TaskForm
- [x] **Gate**: `npm run build` — success; manual smoke test

---

## Phase 3: ConfigPanel Behavior
**Status**: ✅ Done

- [x] 3.1 Make ConfigPanel controlled (config, onConfigChange)
- [x] 3.2 Wire config to PipelineContext; filter output by toggles
- [x] 3.3 Wire config to CodePreview; show only enabled tabs
- [x] **Gate**: Toggle Backend off → only frontend/db/nginx

---

## Phase 4: SRS Templates & UX
**Status**: ✅ Done

- [x] 4.1 Add Logistics & Banking templates to templates.js
- [x] 4.2 Add Logistics, Banking chips in SRSInput
- [ ] 4.3 (Optional) Task detail modal using GET /tasks/:id — skipped
- [x] **Gate**: Logistics template → demo output

---

## Phase 5: AI Pipeline Robustness
**Status**: ✅ Done

- [x] 5.1 Add retry logic to callAgent (2 retries, 2s delay)
- [x] 5.2 Structured Anthropic error parsing
- [x] 5.3 AbortController timeout (60s per agent)
- [x] **Gate**: Invalid key → clear message; retry on failure

---

## Phase 6: Routing (Optional)
**Status**: ✅ Done

- [x] 6.1 Install react-router-dom
- [x] 6.2 Add BrowserRouter and routes (/, /output, /tasks, /agents)
- [x] 6.3 Update tab switches to use navigation
- [x] **Gate**: Direct /output URL works

---

## Phase 7: Backend AI Proxy (Optional)
**Status**: ✅ Done

- [x] 7.1 Create aiRoutes.js with POST /ai/generate
- [x] 7.2 Add ANTHROPIC_API_KEY to backend .env
- [x] 7.3 Feature-flag frontend to use proxy when enabled
- [x] **Gate**: Pipeline works via proxy without key in browser
