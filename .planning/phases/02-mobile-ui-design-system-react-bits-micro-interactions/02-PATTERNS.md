# Phase 2: Mobile UI, Design System & React Bits Micro-Interactions - Pattern Map

**Mapped:** 2026-08-31  
**Target Directory:** `mobile/src/`  

## Existing Codebase Patterns

### 1. Styling & Tokens
- **Framework:** Tailwind CSS v4 via `@import "tailwindcss";` in `mobile/src/index.css`.
- **Custom Utilities:** `.field-touch-target` with `min-height: 52px; min-width: 52px;` declared in `index.css`.
- **Design Tokens:** High-contrast emerald (`bg-emerald-950`, `text-emerald-200`) and slate palettes established in `App.tsx` and `HealthCheckView.tsx`.

### 2. State & Cache Management
- **Query Cache:** `@tanstack/react-query` QueryClient configured in `App.tsx` (`retry: 2`, `staleTime: 5 mins`).
- **Store Architecture:** `zustand` is installed in `mobile/package.json` for lightweight UI and navigation state.

### 3. Component Organization
- Current files: `mobile/src/views/HealthCheckView.tsx`, `mobile/src/App.tsx`.
- New directory structure convention:
  - `mobile/src/components/navigation/`: Navigation items, BottomBar, SOSButton.
  - `mobile/src/components/syndromes/`: SyndromeGrid, SyndromeCard, AnatomicalBadge.
  - `mobile/src/components/animations/`: RadarSweep, HazardBorder, CountUpTicker, FluidDrawer (React Bits).
  - `mobile/src/views/`: Main screens (ReportView, DashboardView, AnimalRegistryView, LabReferralView).
  - `mobile/src/services/`: Device bridges (hapticsService.ts).
  - `mobile/src/types/`: Types for syndromes, navigation, and reports.

### 4. Hardware Integrations
- Capacitor 6 plugins bridge to Android. In Web fallback, gracefully handle absent native plugins using try/catch or browser APIs (`navigator.vibrate`).
- AndroidManifest must declare required permissions (`android.permission.VIBRATE`).
