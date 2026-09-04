---
phase: 6
slug: livestock-registry-pashu-aadhaar-cloud-persistence
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-03
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Frontend Framework** | vitest 2.0.5 + @testing-library/react |
| **Backend Framework** | pytest 8.x + pytest-asyncio + httpx |
| **Frontend Quick Command** | `npm --prefix mobile test -- --run` |
| **Backend Quick Command** | `pytest backend/tests` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run corresponding test suite
- **After every plan wave:** Run full test suites
- **Before `/gsd-verify-work`:** Full frontend & backend suites must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | REC-01 | T-06-01 | FastAPI animal registration enforces 12-digit tag and DPDP phone hashing | backend | `pytest backend/tests/test_animals.py` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | REC-02 | T-06-02 | Backend calculates DAHD booster due dates (180/365 days) with status flags | backend | `pytest backend/tests/test_animals.py` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | REC-01 | T-06-03 | Docker compose and PostGIS schema DDL compile without syntax errors | unit | `pytest backend/tests/test_database.py` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | REC-01 | T-06-04 | animalService queries and updates SQLite local_animals offline | unit | `npm --prefix mobile test -- src/tests/animalService.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | REC-01, REC-02 | T-06-05 | AnimalRegistryView renders My Cattle, 12-digit search, and booster alerts | component | `npm --prefix mobile test -- src/tests/AnimalRegistryView.test.tsx` | ❌ W0 | ⬜ pending |
| 06-02-03 | 02 | 2 | REC-01 | T-06-06 | Registering new animal writes to SQLite and queues sync event | integration | `npm --prefix mobile test -- src/tests/AnimalRegistryView.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_animals.py` — stubs for backend REC-01 & REC-02
- [ ] `mobile/src/tests/animalService.test.ts` — stubs for mobile REC-01 offline service
- [ ] `mobile/src/tests/AnimalRegistryView.test.tsx` — stubs for passbook UI

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-03
