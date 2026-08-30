---
phase: 1
slug: project-scaffolding-native-android-apk-foundation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-30
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (TypeScript/React) + Android Gradle CLI |
| **Config file** | `mobile/vite.config.ts` |
| **Quick run command** | `npm --prefix mobile run test -- --run` |
| **Full suite command** | `npm --prefix mobile run build && npx --prefix mobile cap sync android` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm --prefix mobile run test -- --run` (or bundle check)
- **After every plan wave:** Run `npm --prefix mobile run build && npx --prefix mobile cap sync android`
- **Before `/gsd-verify-work`:** Full suite must be green + Android build verified
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | APK-01 | T-01-01 | Relative asset paths in WebView | build | `npm --prefix mobile run build` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | APK-01 | T-01-02 | Package ID matches com.pashusuraksha.app | config | `npx --prefix mobile cap sync android` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | APK-02 | T-01-03 | SQLCipher encryption key & protected path | unit | `npm --prefix mobile run test -- --run` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | APK-02 | T-01-04 | DDL migrations execute without errors | integration | `npm --prefix mobile run test -- --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `mobile/package.json` — Dependencies and build/test scripts
- [ ] `mobile/vite.config.ts` — Vitest configuration with relative asset base
- [ ] `mobile/src/tests/sqlite.test.ts` — Unit test stubs for database initialization and seeding

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Native APK install on physical Android | APK-01 | Requires hardware device | Run `adb install mobile/android/app/build/outputs/apk/debug/app-debug.apk` and verify app launch |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending 2026-08-30
