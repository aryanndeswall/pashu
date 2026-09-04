---
phase: 3
slug: hardware-sensor-bridges-camera-gps-voice
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-03
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.0.5 + @testing-library/react |
| **Config file** | `mobile/vite.config.ts` |
| **Quick run command** | `npm --prefix mobile test -- --run` |
| **Full suite command** | `npm --prefix mobile test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm --prefix mobile test -- --run`
- **After every plan wave:** Run `npm --prefix mobile test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | SYN-03 | T-03-01 | WebP scale and compression bounded (<300 KB) | unit | `npm --prefix mobile test -- --run src/tests/cameraService.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | SYN-02 | T-03-02 | 30s auto-stop & audio mime validation | unit | `npm --prefix mobile test -- --run src/tests/voiceService.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | SYN-04 | T-03-03 | Haversine snapping & accuracy fallback | unit | `npm --prefix mobile test -- --run src/tests/locationService.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | SYN-02, SYN-03, SYN-04 | — | 3-step wizard flow and offline SQLite draft save | integration | `npm --prefix mobile test -- --run src/tests/ReportWizardView.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `mobile/src/tests/cameraService.test.ts` — stubs for SYN-03
- [ ] `mobile/src/tests/voiceService.test.ts` — stubs for SYN-02
- [ ] `mobile/src/tests/locationService.test.ts` — stubs for SYN-04
- [ ] `mobile/src/tests/ReportWizardView.test.tsx` — stubs for 3-step reporting wizard integration

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Native Camera & Shutter Click | SYN-03 | Requires physical Android camera sensor | Run on Android device, capture image, check compression badge |
| Native Mic Recording & Audio Output | SYN-02 | Requires physical Android microphone & speaker | Run on Android device, record 15s Marathi audio, test playback |
| Native GPS Hardware Fix | SYN-04 | Requires hardware GNSS satellite chip | Run on Android device outdoors, verify auto-snapped LGD village |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-03
