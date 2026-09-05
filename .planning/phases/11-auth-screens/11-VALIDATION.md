---
phase: 11
slug: auth-screens
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-05
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.9 + @testing-library/react |
| **Config file** | `mobile/vite.config.ts` |
| **Quick run command** | `npm --prefix mobile test -- --run src/tests/authScreens.test.ts` |
| **Full suite command** | `npm --prefix mobile test -- --run` |
| **Estimated runtime** | ~18 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm --prefix mobile test -- --run src/tests/authScreens.test.ts`
- **After every plan wave:** Run `npm --prefix mobile test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green (120+ tests passing)
- **Max feedback latency:** 18 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | AUTH-01 | T-11-01 | Extended auth store with sequential state machine & credentials schema | unit | `npm --prefix mobile test -- --run src/tests/authScreens.test.ts` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | AUTH-01 | T-11-02 | Role Portal and role-tailored login screen rendering & phone validation | component | `npm --prefix mobile test -- --run src/tests/authScreens.test.ts` | ❌ W0 | ⬜ pending |
| 11-01-03 | 01 | 1 | AUTH-02 | T-11-03 | 6-digit OTP verification with auto-advance, SIH demo auto-fill & resend timer | component | `npm --prefix mobile test -- --run src/tests/authScreens.test.ts` | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 2 | AUTH-03 | T-11-04 | Sequential LGD onboarding with Maharashtra district/block/village persistence | component | `npm --prefix mobile test -- --run src/tests/authScreens.test.ts` | ❌ W0 | ⬜ pending |
| 11-02-02 | 02 | 2 | AUTH-04 | T-11-05 | 4-digit Offline Security PIN keypad, hash verification & lockout mechanism | unit / component | `npm --prefix mobile test -- --run src/tests/authScreens.test.ts` | ❌ W0 | ⬜ pending |
| 11-02-03 | 02 | 2 | AUTH-05 | T-11-06 | User Profile screen with DPDP masked phone, demo role switcher & secure logout | component | `npm --prefix mobile test -- --run src/tests/authScreens.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `mobile/src/tests/authScreens.test.ts` — test stubs covering AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Haptic Feedback on PIN & OTP taps | AUTH-02, AUTH-04 | Physical vibration hardware perception | Tap 4-digit PIN numbers on real Android device; verify tactile vibration occurs on every keypad tap |
| SIH Hackathon Role Switcher | AUTH-05 | Visual fluidity during jury presentation | Tap switch role from profile, ensure instant transition without page reload |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 18s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-05
