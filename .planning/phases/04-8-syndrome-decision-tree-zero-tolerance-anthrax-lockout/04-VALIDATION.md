---
phase: 4
slug: 8-syndrome-decision-tree-zero-tolerance-anthrax-lockout
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-03
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.0.5 + @testing-library/react |
| **Config file** | `mobile/vite.config.ts` |
| **Quick run command** | `npm --prefix mobile test -- --run` |
| **Full suite command** | `npm --prefix mobile test -- --run` |
| **Estimated runtime** | ~7 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm --prefix mobile test -- --run`
- **After every plan wave:** Run `npm --prefix mobile test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 7 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | BIO-01 | T-04-01 | Deterministic rule engine maps 8 syndromes to differential diagnoses | unit | `npm --prefix mobile test -- src/tests/decisionTreeService.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | BIO-01, BIO-02 | T-04-02 | Rule Zero triggers CRITICAL_ANTHRAX_LOCK on sudden death & orifice bleeding | unit | `npm --prefix mobile test -- src/tests/decisionTreeService.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | BIO-02 | T-04-03 | Web Audio siren & SpeechSynthesis TTS synthesize offline warning without crash | unit | `npm --prefix mobile test -- src/tests/alarmAudioService.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | BIO-02 | T-04-04 | Full-screen AnthraxBiohazardModal with 52px buttons & 5-point checklist | component | `npm --prefix mobile test -- src/tests/AnthraxBiohazardModal.test.tsx` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | BIO-03 | T-04-05 | IDSP zoonotic payload queued with priority 3 into SQLite offline_sync_queue | integration | `npm --prefix mobile test -- src/tests/AnthraxBiohazardModal.test.tsx` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 2 | BIO-01, BIO-02 | T-04-06 | Reporting wizard halts normal progression and renders lockout on HSDS | integration | `npm --prefix mobile test -- src/tests/ReportWizardView.test.tsx` | ✅ exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `mobile/src/tests/decisionTreeService.test.ts` — stubs for BIO-01
- [ ] `mobile/src/tests/alarmAudioService.test.ts` — stubs for BIO-02 audio synthesis
- [ ] `mobile/src/tests/AnthraxBiohazardModal.test.tsx` — stubs for BIO-02 modal & BIO-03 IDSP queue

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audio Siren & TTS Playback | BIO-02 | Validates audible volume & speaker fidelity on Android | Select HSDS, verify audible siren tone and spoken Marathi warning |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 7s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-03
