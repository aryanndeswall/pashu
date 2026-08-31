# Phase 2: Mobile UI, Design System & React Bits Micro-Interactions - Research

**Researched:** 2026-08-31  
**Domain:** Rural Mobile Ergonomics (UI-UXmax), Tailwind CSS v4, React Bits (Capacitor 6 WebView), `@capacitor/haptics`, 8-Syndrome Clinical Taxonomy  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from CONTEXT.md & UI-SPEC.md)

### Locked Decisions
- **D-01 (Sunlight High-Contrast Palette):** WCAG AAA compliant outdoor sunlight light theme by default (Dominant `#f8fafc`/`#ffffff`, Secondary `#ffffff`/`#f1f5f9`/`#022c22`, Accent `#059669`, Hazard Crimson `#dc2626`) for 350–450 nit budget screens, with single-tap dark mode toggle (`#020617`).
- **D-02 (52px Rural Thumb Touch Targets):** All interactive buttons, cards, and tab triggers strictly enforce a minimum `52px x 52px` bounding touch target (`.field-touch-target`).
- **D-03 (Devanagari Typography Tuning):** Marathi (`मराठी`) and Hindi script glyphs receive ~15–20% increased line-height (1.45) and bold base styling for rural readability.
- **D-04 (4 Tabs + Elevated Center SOS Action Button):**
  1. Report (नोंदणी / लक्षणे)
  2. Dashboard (डॅशबोर्ड)
  3. Center Floating SOS (तातडीक / आपत्कालीन) - Elevated circular crimson button
  4. Animals (पशु आधार)
  5. Labs (प्रयोगशाळा)
- **D-05 (One-Handed Ergonomics):** Navigation controls and primary actions concentrated in the lower 40% of the screen.
- **D-06 (8-Syndrome Visual Card Selector):** 2-column grid covering VSS, NSLS, HSDS, AROS, CMSS, SARF, HES, and NAS with anatomical icon badges, bilingual subtitles, and severity pills.
- **D-07 (Visual Severity Color Coding):** Green (Routine/Endemic), Amber (High Contagion), and Flashing Red (Critical Zoonotic / Anthrax Lockout).
- **D-08 (HSDS / Anthrax Visual Pre-Warning):** Clear warning indicator on HSDS card alerting field workers to the no-cut carcass rule before entry.
- **D-09 (React Bits Animation Suite):**
  - Radar Pulse Sweep (`RadarSweep.tsx`): 60 FPS CSS/canvas radar sweep around GPS marker.
  - Animated Hazard Card Border (`HazardBorder.tsx`): Flashing crimson pulse on HSDS card & outbreak alerts.
  - Count-Up Metric Tickers (`CountUpTicker.tsx`): Smooth RAF-based integer roll-up for offline queue and local case counts.
  - Fluid Swipe Bottom Sheet (`FluidDrawer.tsx`): Hardware-accelerated CSS spring bottom drawer.
- **D-10 (3-Tier Haptic Feedback):** `@capacitor/haptics` integration with Light Tap (tab switch), Medium Pulse (syndrome selection & SQLite save), and Error Heavy Buzz (SOS / Anthrax alert).

### Agent's Discretion
- Exact React Bits CSS keyframe implementation details inside Tailwind v4.
- Specific SVG vector icons for anatomical badges (Mouth/Hoof, Skin, Blood, Lungs, Swollen Quarter, Reproductive, Enteric, Neurological).
- Modal sheet transitions and gesture spring physics.

### Deferred Ideas (OUT OF SCOPE)
- Hardware camera shutter & WebP compression -> Phase 3 (`SYN-03`).
- Hardware GPS geolocation & village snapping -> Phase 3 (`SYN-04`).
- Native audio voice memo recording -> Phase 3 (`SYN-02`).
- Deterministic 8-syndrome edge rule evaluation & IDSP payload generator -> Phase 4 (`BIO-01`, `BIO-02`, `BIO-03`).
- Two-phase delta sync engine -> Phase 5 (`SYNC-01`, `SYNC-02`, `SYNC-03`).
</user_constraints>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@capacitor/haptics` | `^6.0.0` | Native Haptic Vibration | Provides physical tactile confirmation via Android vibration motor (`android.permission.VIBRATE`). |
| `lucide-react` | `^0.439.0` | Accessible Icon Primitives | Tree-shaken SVG icons for anatomical badges, status pills, and tab navigation. |
| `clsx` + `tailwind-merge` | Latest | Dynamic Class Names | Standard utility for conditional class merging with Tailwind v4. |
| `zustand` | `^4.5.5` | UI & Navigation State | Lightweight store tracking active tab, selected syndrome, dark/sunlight theme toggle. |
| `react` | `^19.0.0` | Mobile UI Runtime | Concurrent transitions and actions embedded in APK. |
| `tailwindcss` | `^4.0.0` | Mobile Styling & Tokens | Zero-runtime CSS engine with hardware-accelerated animations. |

### Supporting
| Component / Tool | Implementation | Purpose |
|------------------|----------------|---------|
| `RadarSweep` | CSS Conic-Gradient + Keyframes | Hardware-accelerated radar sweep (0-cost WebGL/CSS, 60 FPS). |
| `HazardBorder` | CSS Keyframe Box-Shadow Pulse | Flashing crimson hazard alert border. |
| `CountUpTicker` | React 19 `requestAnimationFrame` Hook | Smooth integer count roll-up without external bundle weight. |
| `FluidDrawer` | CSS Transform Spring Transitions | Bottom drawer with touch gesture support for mobile. |

### Installation Commands
```bash
# In /mobile
npm install @capacitor/haptics
```
*(Note: `lucide-react`, `zustand`, `clsx`, `tailwind-merge`, `tailwindcss` are already installed in Phase 1).*
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Component Hierarchy

```
App.tsx
├── HeaderBar (Offline Core Status, Sunlight/Dark Mode Toggle, Title)
├── Main Viewport (Overflow-y auto, pb-24 for tab clearance)
│   ├── [Tab: Report] -> SyndromeSelectorView
│   │   ├── QuickSearch / Category Filter
│   │   ├── SyndromeGrid (2-column responsive layout)
│   │   │   └── SyndromeCard (x8 with AnatomicalBadge, HazardBorder, Severity Pill)
│   │   └── FluidDrawer (Syndrome confirmation bottom sheet)
│   ├── [Tab: Dashboard] -> DashboardView
│   │   ├── RadarSweepWidget (GPS perimeter simulation)
│   │   ├── LocalOutbreakAlertBanner (HazardBorder)
│   │   └── SyncQueueMetricCard (CountUpTicker for pending SQLite reports)
│   ├── [Tab: Animals] -> AnimalRegistryView (Pashu Aadhaar tag search preview)
│   └── [Tab: Labs] -> LabReferralView (e-LRF sample tracker preview)
├── EmergencySOSModal (Triggered by center button or HSDS tap, Crimson Biohazard Lockout)
└── BottomBar (Fixed bottom-0, 4 Tabs + Elevated Center Circular SOSButton)
```

### Android Manifest Permission Check
`@capacitor/haptics` requires `android.permission.VIBRATE` in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.VIBRATE" />
```
*(Must be added to AndroidManifest.xml and synced via `npx cap sync android`).*
</architecture_patterns>

<validation_architecture>
## Validation Architecture

Nyquist sampling contract for Phase 2:

### Automated Test Infrastructure
- **Framework:** `vitest` for React unit tests + TypeScript verification.
- **Quick run command:** `npm --prefix mobile run test -- --run`
- **Full build & sync command:** `npm --prefix mobile run build && npx --prefix mobile cap sync android`

### Verification Mapping
1. **REQ APK-03 (Tactile Haptic Feedback):**
   - Haptics wrapper service (`hapticsService.ts`) handles native `@capacitor/haptics` calls with web fallback (`navigator.vibrate` / no-op).
   - Vitest test suite validates invocation of light, medium, and error vibration methods on UI interactions.
2. **REQ SYN-01 (8-Syndrome Visual Selector):**
   - Verified via unit test ensuring all 8 standardized syndromes (VSS, NSLS, HSDS, AROS, CMSS, SARF, HES, NAS) render with their required anatomical badges, Marathi translations, and severity classes.
   - Verified that selecting HSDS (Hyperacute Sudden Death) triggers the critical biohazard hazard border and heavy haptic feedback.
3. **Ergonomic Touch Targets:**
   - Verified via DOM unit tests that buttons and tab targets have `.field-touch-target` class with min-height >= 52px.
</validation_architecture>

<pitfalls_and_gotchas>
## Pitfalls and Gotchas

1. **Android WebView Haptic Permissions:** Without `<uses-permission android:name="android.permission.VIBRATE" />` in `AndroidManifest.xml`, haptic calls silently fail on native Android devices. The permission must be verified in the Android manifest.
2. **CSS Animation Performance on Low-End Chips:** Avoid heavy blur filters (`backdrop-blur-md`) on low-end Mali/Adreno GPUs as they cause severe frame drops in WebViews. Use solid high-contrast alpha colors (`rgba(2, 44, 34, 0.95)`) and pure CSS `transform` and `opacity` keyframes for 60 FPS rendering.
3. **Safe Area Inset Clipping:** On Android devices with navigation gestures or punch-hole displays, fixed bottom navigation bars can overlap with the home gesture indicator. Apply `padding-bottom: env(safe-area-inset-bottom, 16px)` to `BottomBar`.
</pitfalls_and_gotchas>

---
*Phase: 02-mobile-ui-design-system-react-bits-micro-interactions*  
*Research completed: 2026-08-31*  
*Ready for planning: yes*
