---
task_id: 20260906-complete-functional-integration
title: Complete Functional Integration (Live Video Consult, Backend Sync, Direct Ingestion)
status: complete
created_at: 2026-09-06T17:45:00.000Z
completed_at: 2026-09-06T19:40:00.000Z
type: quick
---

# Quick Task: Complete Functional Integration

## Context
The user requested: "lets make it functional completly".
In prior turns, the user asked:
- "can we add video conferencing between doc and farmer?"
- "make the language selector work effortlessly in whole ui"
- "generate new dashboards for doctor and admin specific"
The dashboards and UI are in place, but several key actions (e.g. "Video Call Farmer", sync uploads, statutory containment trigger, and direct animal/lab registration) were either routing to other tabs or using mock placeholders.

## Objectives
1. Build a fully functional Doctor-Farmer Video Tele-Consultation modal (`VideoConsultModal.tsx`) with real `getUserMedia` camera/mic controls, PiP layout, simulated peer stream, and in-call clinical prescription drawer.
2. Implement `/api/v1/sync` FastAPI endpoints (`/telemetry`, `/media`, `/status`) and wire `syncEngineService.ts` to perform real HTTP sync with automatic offline fallback.
3. Wire live animal registration and lab requisition creation to backend APIs (`/api/v1/animals`, `/api/v1/labs/requisitions`) when online, with SQLite persistence.
4. Add interactive action handlers in Admin and Consumer dashboards (Statutory PCICDA memo generator modal, MVU dispatch notification, and Consumer direct tele-consult CTA).
5. Add complete trilingual keys (EN, HI, MR) in `languageStore.ts`.
6. Verify with Vitest (`npm test`), TypeScript check (`tsc --noEmit`), backend Pytest, and browser subagent validation.

## Verification Results
- **Vitest**: 30/30 test suites passed (152/152 tests green).
- **TypeScript**: `npx tsc --noEmit` passed with 0 errors.
- **Backend Pytest**: 23/23 tests passed (`test_sync.py`, `test_animals.py`, `test_labs.py`, `test_triage_api.py`).
- **Browser Subagent**: Verified Doctor "Video Call Farmer" flow with Rx drawer and Farmer "Emergency Video Tele-Consult" flow with zero console errors. WebP recording saved.

