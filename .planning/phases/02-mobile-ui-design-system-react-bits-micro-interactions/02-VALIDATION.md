---
phase: 02
slug: mobile-ui-design-system-react-bits-micro-interactions
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-31
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution of Phase 2 (Mobile UI, Design System & React Bits Micro-Interactions).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (React 19 + TypeScript) + Capacitor CLI |
| **Config file** | `mobile/vite.config.ts` |
| **Quick run command** | `npm --prefix mobile test -- --run` |
| **Full suite command** | `npm --prefix mobile run build && npx --prefix mobile cap sync android` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm --prefix mobile test -- --run`
- **After every plan wave:** Run `npm --prefix mobile run build && npx --prefix mobile cap sync android`
- **Before `/gsd-verify-work`:** Full test suite must pass with 0 errors and APK asset sync confirmed
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | APK-03 | T-02-01 | Haptics service gracefully falls back on web/unsupported platforms without throwing runtime exceptions | unit | `npm --prefix mobile test -- --run` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | APK-03 | T-02-02 | Navigation bar maintains 52px touch targets and switches active tabs with light haptic feedback | unit | `npm --prefix mobile test -- --run` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | SYN-01 | T-02-03 | 8-Syndrome selector renders all 8 clinical categories with anatomical icons, Marathi subtitles, and severity indicators | unit | `npm --prefix mobile test -- --run` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | SYN-01 | T-02-04 | Selecting HSDS (Hyperacute Sudden Death / Anthrax) triggers crimson hazard glow and critical biohazard modal warning | unit | `npm --prefix mobile test -- --run` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | APK-03 | T-02-05 | React Bits animations (RadarSweep, CountUpTicker, HazardBorder) render at 60 FPS without DOM layout thrashing | unit/build | `npm --prefix mobile run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `mobile/src/services/hapticsService.ts` — Capacitor Haptics bridge with web fallback
- [ ] `mobile/src/tests/navigation.test.tsx` — Test suite for 4-tab bar, elevated SOS button, and touch targets
- [ ] `mobile/src/tests/syndromes.test.tsx` — Test suite for 8-syndrome grid rendering and HSDS biohazard trigger

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Physical Vibration on Android Device | APK-03 | Requires physical Android vibration motor | Tap tabs and syndrome cards on physical device via `adb install` to verify tactile pulse |
| Sunlight Contrast Legibility | UI-UXmax | Visual verification under outdoor ambient light | Inspect screen under direct sunlight to confirm WCAG AAA readability |
