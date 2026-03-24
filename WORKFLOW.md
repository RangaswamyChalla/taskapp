# AIDEN Implementation Workflow

This document describes how to execute the engineering plan using the workflow system.

---

## Workflow Overview

```
ENGINEERING_PLAN.md     → Master plan (phases, tasks, gates)
PHASES_CHECKLIST.md     → Living checklist (mark items done)
.cursor/rules/          → AI guidance for implementation
```

---

## How to Implement

### Step 1: Start a Phase

1. Open `ENGINEERING_PLAN.md` and read the target phase.
2. Open `PHASES_CHECKLIST.md` and set phase status to "In progress".

### Step 2: Implement Tasks

- Work through each task in the phase.
- Make changes only to files listed in the plan.
- Do not modify unrelated code.

### Step 3: Run Phase Gate

| Phase | Gate Command | Expected |
|-------|--------------|----------|
| 1 | `cd taskapp/backend; npm test` | 14 tests pass |
| 2 | `cd taskapp/frontend; npm run build` | Compiled successfully |
| 3 | Manual: toggle Backend off in ConfigPanel | Only frontend/db/nginx tabs |
| 4 | Manual: select Logistics template, launch | Logistics demo output |
| 5 | Manual: invalid API key | Clear error message |

### Step 4: Commit & Mark Complete

1. Commit changes with message: `Phase N: <description>`
2. Update `PHASES_CHECKLIST.md` — check off items, set phase to Done.
3. Proceed to next phase.

---

## Using Cursor AI

When asking Cursor to implement a phase:

- **Example**: "Implement Phase 1 from ENGINEERING_PLAN.md"
- **Example**: "Do task 1.1 — add GET /tasks/:id"
- **Example**: "Complete Phase 2, then run the gate"

The `.cursor/rules/aiden-implementation.mdc` rule provides context when working in `taskapp/**` files.

---

## Rollback

If a phase causes issues:

1. `git revert HEAD` (or the phase commit)
2. Re-run the phase gate to confirm prior state
3. Fix the approach and re-implement

---

## Quick Reference

| Phase | Focus | Est. Hours |
|-------|-------|------------|
| 1 | API completeness | 4–6 |
| 2 | Frontend–API | 3–4 |
| 3 | ConfigPanel | 4–5 |
| 4 | Templates | 2–3 |
| 5 | AI robustness | 4–6 |
