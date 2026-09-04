---
phase: 5
slug: two-phase-delta-synchronization-engine
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-03
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.0.5 + @testing-library/react |
| **Config file** | `mobile/vite.config.ts` |
| **Quick run command** | `npm --prefix mobile test -- --run` |
| **Full suite command** | `npm --prefix mobile test -- --run` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm --prefix mobile test -- --run`
- **After every plan wave:** Run `npm --prefix mobile test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 8 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | SYNC-01 | T-05-01 | Network service categorizes connection into 4 states (Offline, 2G, 4G, WiFi) | unit | `npm --prefix mobile test -- src/tests/networkService.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | SYNC-02 | T-05-02 | Two-phase sync engine serializes Phase 1 JSON (<2KB) and promotes record status | unit | `npm --prefix mobile test -- src/tests/syncEngine.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | SYNC-02 | T-05-03 | SMS fallback service encodes <140 character payload with valid CRC checksum | unit | `npm --prefix mobile test -- src/tests/smsFallbackService.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | SYNC-03 | T-05-04 | Phase 2 media upload queues WebP/audio and executes only on 4G/Wi-Fi | integration | `npm --prefix mobile test -- src/tests/syncEngine.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | SYNC-01, SYNC-02 | T-05-05 | Header sync status pill reflects pending count and opens SyncQueueDrawer | component | `npm --prefix mobile test -- src/tests/SyncQueueDrawer.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 2 | SYNC-02, SYNC-03 | T-05-06 | Manual "Sync Now" button triggers queue flush and updates status to green | integration | `npm --prefix mobile test -- src/tests/SyncQueueDrawer.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `mobile/src/tests/networkService.test.ts` — stubs for SYNC-01
- [ ] `mobile/src/tests/syncEngine.test.ts` — stubs for SYNC-02 and SYNC-03
- [ ] `mobile/src/tests/smsFallbackService.test.ts` — stubs for SYNC-02 SMS syntax
- [ ] `mobile/src/tests/SyncQueueDrawer.test.tsx` — stubs for UI drawer & sync action

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 8s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-03
