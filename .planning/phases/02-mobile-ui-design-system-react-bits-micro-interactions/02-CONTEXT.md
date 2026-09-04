# Phase 2: Mobile UI, Design System & React Bits Micro-Interactions - Context

**Gathered:** 2026-08-31  
**Status:** Ready for planning  

<domain>
## Phase Boundary

Phase 2 delivers the mobile application's complete user interface shell, rural ergonomic design system, 8-syndrome visual selector, and hardware-accelerated micro-animations inside the Capacitor 6 Android APK:
- **UI-UXmax Rural Ergonomics**: High-contrast outdoor sunlight color tokens (WCAG AAA), 52px thumb touch targets, and multilingual typography (English, Marathi, Hindi).
- **Navigation Shell**: Fixed bottom tab bar (Report, Dashboard, Animals, Labs) with an elevated center emergency action button (SOS / Biohazard).
- **8-Syndrome Visual Selector**: Icon-first card selector covering VSS, NSLS, HSDS, AROS, CMSS, SARF, HES, and NAS with visual anatomical badges and local disease names.
- **React Bits Micro-Interactions & Haptics**: Animated hazard cards, pulsating GPS radar sweeps, count-up metric tickers, and tactile vibration feedback (`@capacitor/haptics`).

*Hardware sensor integrations (Camera WebP compression, native audio recording, GPS geolocation) are deferred to Phase 3; deterministic offline edge rules are deferred to Phase 4.*
</domain>

<decisions>
## Implementation Decisions

### 1. Visual Design Tokens & Sunlight High-Contrast Palette (UI-UXmax)
- **D-01: Outdoor High-Contrast Sunlight Theme as Default:** Uses WCAG AAA compliant deep emerald (`#064e3b` / `#022c22`), safety amber (`#d97706`), and vivid hazard crimson (`#dc2626`) on crisp, high-contrast light backgrounds for maximum outdoor visibility under direct midday sun (350–450 nit budget Android screens). Includes a quick-toggle high-contrast dark theme for night/indoor barn use.
- **D-02: 52px Rural Thumb Touch Targets:** All interactive buttons, cards, and tab triggers strictly maintain minimum `52px x 52px` bounding touch targets (`.field-touch-target`) for easy one-handed operation and gloved hands.
- **D-03: Devanagari Typography Tuning:** Marathi (`मराठी`) and Hindi script glyphs receive ~15–20% increased line-height and optimized base font sizes to prevent conjunct consonants from blurring on budget low-DPI displays.

### 2. Navigation Architecture & Bottom Tab Structure
- **D-04: 4 Tabs + Elevated Center Action Button:**
  1. **Report (नोंदणी / लक्षणे):** Direct entry to the 8-syndrome quick reporter.
  2. **Dashboard (डॅशबोर्ड):** Active local outbreak alerts, epidemic risk level, sync queue status.
  3. **Center Floating Action Button (SOS / Urgent):** Elevated, high-visibility button for instant one-tap access to Anthrax / Sudden Death or Emergency Outbreak reporting.
  4. **Animals (पशु आधार):** 12-digit Pashu Aadhaar tag search and local livestock records.
  5. **Labs (प्रयोगशाळा):** e-LRF sample tracking and cold-chain timers (for field vets).
- **D-05: One-Handed Ergonomics:** Primary navigation controls and high-frequency action buttons remain confined to the bottom 40% of the screen.

### 3. 8-Syndrome Visual Card Selector Experience
- **D-06: 2-Column Visual Card Grid:** Visual 2-column grid featuring large anatomical icons/badges indicating symptom locations:
  - **VSS (Vesicular & Salivation):** Mouth & Hoof blisters / Drooling (*लाळ गळणे, तोंड-खुरांचे फोड*).
  - **NSLS (Nodular Skin Lesions):** Skin Lumps & Edema (*गाठी, लंपी त्वचा*).
  - **HSDS (Hyperacute Sudden Death):** Sudden death with dark unclotted blood (*अचानक मृत्यू, रक्तस्त्राव*).
  - **AROS (Acute Respiratory & Oculonasal):** Nasal discharge, coughing, grunting (*श्वास त्रास, नाकातून स्त्राव*).
  - **CMSS (Crepitant Muscular Swelling):** Shoulder/quarter swelling with crackling sound (*सुजलेली मान/पाय, घटसर्प/काळपुळी*).
  - **SARF (Storm Abortion & Reproductive Failure):** Late-term abortion clusters (*गर्भपात, ब्रुसेलोसिस*).
  - **HES (Hemorrhagic Enteric Syndrome):** Bloody diarrhea and dehydration (*रक्ताची संडास*).
  - **NAS (Neurological / Agitation Syndrome):** Circling, aggression, paralysis (*पिसाळणे, चक्कर येणे*).
- **D-07: Visual Severity Color Coding:** Green (Endemic / Routine), Amber (High Contagion / Quarantine Suspect), and Flashing Red (Critical Zoonotic / Anthrax Lockout).
- **D-08: HSDS / Anthrax Visual Pre-Warning:** Clear visual indicator on the HSDS card alerting field workers to the no-cut carcass rule before entry.

### 4. React Bits & Haptic Feedback Micro-Interactions
- **D-09: React Bits Hardware-Accelerated Animation Suite:**
  - **Radar Pulse Sweep:** Simulated 5km/10km radar sweep animation around the user's GPS marker on the offline dashboard.
  - **Animated Hazard Card Border:** Flashing crimson glow border on high-risk syndrome cards (HSDS/Anthrax) and active outbreak warning banners.
  - **Count-Up Metric Tickers:** Smooth number roll-up for offline pending sync queue (e.g., `0 → 3 reports queued`) and local village case counts.
  - **Fluid Swipe Bottom Sheet:** Smooth swipeable bottom drawer for quick symptom confirmation and voice recording flow.
- **D-10: 3-Tier Haptic Vibration Feedback (`@capacitor/haptics`):**
  - **Light Tap (`ImpactStyle.Light`):** Syndrome card selection, tab navigation.
  - **Medium Confirmation (`ImpactStyle.Medium`):** Saving report to encrypted offline SQLite.
  - **Heavy Pulsating Warning (`NotificationType.Error`):** Anthrax / high-risk biohazard selection.

### Agent's Discretion
- Exact React Bits DOM/CSS implementation details inside Vite/Tailwind v4.
- Specific SVG iconography for the 8 anatomical body badges.
- Tab bar transition curves and bottom sheet swipe drag resistance.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing:**

### Mobile Architecture & UI Specifications
- `MOBILE_APK_PRODUCTION_TECH_STACK_AND_AUDIT.md` — Section 4 (Design System & Tooling Synergy: GSD + UI-UXmax + Stitch + React Bits) and Part VI (Mobile APK Demo Flow).
- `AUDIT_AND_COMPREHENSIVE_PRD.md` §1 (8 Core Syndromic Surveillance Categories) & §2.1 (Multi-Channel Ingestion & Syndromic Reporting).
- `.planning/research/STACK.md` — UI libraries (Capacitor 6, React 19, Tailwind CSS v4, Lucide icons, `@capacitor/haptics`).

### Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 2 Details & Acceptance Criteria.
- `.planning/REQUIREMENTS.md` — `APK-03` (Haptic vibration feedback) & `SYN-01` (8-syndrome visual selector).
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mobile/src/index.css`: Contains Tailwind v4 import and `.field-touch-target` (52px minimum height/width utility class).
- `mobile/src/views/HealthCheckView.tsx`: Working diagnostic view displaying native SQLite status, seeded LGD count (26 villages), and platform metrics.
- `mobile/src/database/sqliteConnection.ts`: Native SQLite database service ready to receive offline records.

### Established Patterns
- Capacitor 6 native bridge initialization with web fallback.
- High-contrast emerald/slate aesthetic established in Phase 1's header.
- TanStack Query v5 configured for local state caching in `App.tsx`.

### Integration Points
- `mobile/src/App.tsx`: Replace current single-screen `HealthCheckView` layout with the 4-tab + elevated SOS navigation shell.
- New component directories to create:
  - `mobile/src/components/navigation/`: BottomBar, TabItem, SOSButton.
  - `mobile/src/components/syndromes/`: SyndromeGrid, SyndromeCard, AnatomicalBadge.
  - `mobile/src/components/animations/`: RadarSweep, HazardBorder, CountUpTicker, FluidDrawer (React Bits).
  - `mobile/src/services/haptics.ts`: Haptics utility wrapper around `@capacitor/haptics`.
</code_context>

<specifics>
## Specific Ideas

- **One-Touch SOS Experience:** Tapping the center elevated SOS button immediately triggers heavy haptic vibration, opens the urgent reporting modal, and pre-highlights Hyperacute Sudden Death / Anthrax with a flashing hazard border.
- **Offline Health Badge in Header:** Retain the Phase 1 "Offline Core" status pill with SQLite record counter in the top bar so the field worker always knows local storage is safe.
</specifics>

<deferred>
## Deferred Ideas

- **Hardware Camera Shutter & WebP Compression:** Deferred to **Phase 3** (`SYN-03`).
- **Hardware GPS Geolocation & Village Snapping:** Deferred to **Phase 3** (`SYN-04`).
- **Hardware Voice Note Recorder Bridge:** Deferred to **Phase 3** (`SYN-02`).
- **Deterministic 8-Syndrome Decision Tree & Anthrax Lockout Engine:** Deferred to **Phase 4** (`BIO-01`, `BIO-02`, `BIO-03`).
- **Two-Phase Delta Sync Manager:** Deferred to **Phase 5** (`SYNC-01`, `SYNC-02`, `SYNC-03`).
</deferred>
