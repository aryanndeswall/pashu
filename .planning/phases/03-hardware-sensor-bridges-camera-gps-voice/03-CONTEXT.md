# Phase 3: Hardware Sensor Bridges (Camera, GPS, Voice) - Context

**Gathered:** 2026-08-31  
**Status:** Ready for planning  

<domain>
## Phase Boundary

Phase 3 implements the mobile hardware sensor bridges inside the standalone Capacitor 6 Android APK, enabling field workers to collect rich clinical telemetry even in complete cellular dead zones:
- **On-Device WebP Camera Compression (`@capacitor/camera`)**: Captures lesion photos with automatic on-device compression (<300 KB, adaptive 720p/1080p WebP) to prevent cellular upload bottlenecks (`SYN-03`).
- **High-Accuracy Geolocation & Local LGD Snapping (`@capacitor/geolocation`)**: Captures coordinates (lat, lon, accuracy radius) and deterministically snaps them to the nearest Local Government Directory (LGD) village centroid using local SQLite/JSON spatial math (`SYN-04`).
- **Vernacular Audio Memo Recording (`@capacitor-community/voice-recorder`)**: Captures 15–30s vernacular audio notes (Marathi/Hindi) with visual waveform recording animation and local playback verification (`SYN-02`).
- **3-Step Focused Reporting Wizard**: A step-by-step reporting flow guiding low-literacy field workers through:
  - Step 1: Syndrome selection (from Phase 2 grid)
  - Step 2: Media & Voice attachments (compressed photo + vernacular audio note)
  - Step 3: Location & Tag identification (auto-GPS with LGD village snapping + optional 12-digit Pashu Aadhaar tag).

*Offline edge rules and zero-tolerance Anthrax lockout logic belong to Phase 4; background two-phase delta synchronization to the FastAPI backend belongs to Phase 5.*
</domain>

<decisions>
## Implementation Decisions

### 1. Camera & Lesion Photo Capture (SYN-03)
- **D-01: Adaptive On-Device WebP Compression:**
  - Standard capture uses HTML5 Canvas offscreen pipeline to scale images to 1280x720 (720p) at 75% quality, yielding ~150–250 KB WebP payloads.
  - If device memory is low or on entry-level Android devices (<3GB RAM), automatically dials down to 60% quality (~120–180 KB) to ensure instantaneous compression without WebView heap crashes.
  - Captured photos are stored locally on the native device filesystem or as base64/WebP blobs in local SQLite drafts.

### 2. Geolocation & Local LGD Snapping (SYN-04)
- **D-02: Offline Spatial Centroid Snapping:**
  - Coordinates obtained via `@capacitor/geolocation` (accuracy threshold: 50 meters, timeout: 10 seconds).
  - Snaps coordinates offline against the pre-seeded Local Government Directory (LGD) village database in SQLite (e.g. Rahuri, Sangamner, Ahmednagar cluster) using local Haversine distance.
  - If GPS is inaccurate (>100m) or indoor, provides an intuitive single-tap dropdown override allowing the worker to manually pick the verified village name.

### 3. Vernacular Voice Recording (SYN-02)
- **D-03: 30-Second Capped Audio Note with Live Visualizer:**
  - Uses `@capacitor-community/voice-recorder` (or native MediaRecorder web fallback in browser).
  - Hard cap at 30 seconds with a real-time countdown ring and animated voice wave bars.
  - Allows immediate playback check ("ऐका / Listen") or re-record ("पुन्हा रेकॉर्ड करा / Re-record") before finalizing the report.
  - Stored in AAC/WebM format (<200 KB per clip).

### 4. Multi-Sensor Reporting Wizard UX
- **D-04: 3-Step Wizard Flow:**
  - **Step 1 (लक्षण निवड / Syndrome):** Visual 2-column syndrome selector card (selected syndrome highlighted with anatomical badge).
  - **Step 2 (फोटो व आवाज / Evidence):** Side-by-side Camera tile (with live preview thumbnail and WebP size badge) + Voice Recording tile (with recording button and timer).
  - **Step 3 (स्थान व टॅग / Location & Tag):** GPS auto-lock pill ("स्थान निश्चित: राहुरी खुर्द, ५ किमी परिघ") + 12-digit Pashu Aadhaar input.
  - Final CTA: "अहवाल जतन करा (Save Offline Report)" with haptic confirmation.

### Agent's Discretion
- Offscreen Canvas compression helper utility structure.
- Local storage naming convention for temporary media files (`reports/{report_id}/photo.webp`).
- Audio waveform visual pulse CSS keyframes in Tailwind v4.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing:**

### Architecture & Requirements
- `.planning/ROADMAP.md` — Phase 3 Objectives, Requirements, and Success Criteria.
- `.planning/REQUIREMENTS.md` — `SYN-02` (Vernacular voice note), `SYN-03` (On-device WebP compression), `SYN-04` (GPS + LGD snapping).
- `AUDIT_AND_COMPREHENSIVE_PRD.md` §2.1 (Multi-Channel Ingestion & Syndromic Reporting).
- `MOBILE_APK_PRODUCTION_TECH_STACK_AND_AUDIT.md` — Part III §B (Hardware bridges: `@capacitor/camera`, `@capacitor/geolocation`, `@capacitor-community/voice-recorder`).

### Design & Patterns
- `.planning/phases/02-mobile-ui-design-system-react-bits-micro-interactions/02-CONTEXT.md` — Established sunlight design tokens, 52px touch targets, and haptics bridge.
- `mobile/src/services/hapticsService.ts` — Haptic feedback integration pattern.
- `mobile/src/database/sqliteConnection.ts` — Local SQLite schema and LGD village table.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mobile/src/database/sqliteConnection.ts`: Seeded with 26 LGD village entries (Ahmednagar district) with latitude, longitude, and village codes.
- `mobile/src/services/hapticsService.ts`: `hapticLight`, `hapticMedium`, `hapticError` ready to accompany camera clicks and voice recording start/stop.
- `mobile/src/components/animations/FluidDrawer.tsx`: Available for step transitions or media preview dialogs.
- `mobile/src/types/syndromes.ts`: `SYNDROME_TAXONOMY` with 8 clinical syndromes.

### Integration Points
- `mobile/package.json`: Install `@capacitor/camera`, `@capacitor/geolocation`, `@capacitor-community/voice-recorder`.
- `mobile/android/app/src/main/AndroidManifest.xml`: Declare camera, audio recording, and fine location permissions.
- `mobile/src/services/cameraService.ts`: Camera capture + HTML5 Canvas WebP compression.
- `mobile/src/services/locationService.ts`: GPS coordinates + Haversine distance LGD snapping.
- `mobile/src/services/voiceService.ts`: Audio recording, stop, and playback.
- `mobile/src/views/ReportWizardView.tsx`: 3-step reporting wizard replacing the static drawer report submission.
</code_context>

<specifics>
## Specific Ideas

- **WebP Compression Badge:** Show a small green badge below the photo thumbnail (e.g. `184 KB • WebP`) so the field worker has confidence that the photo is optimized.
- **GPS Lock Indicator:** Display a pulsing satellite icon with real-time accuracy (`GPS अचूकता: 8m`) and the auto-detected village name in Marathi.
</specifics>

<deferred>
## Deferred Ideas

- **Deterministic Rule Zero & Anthrax Lockout Logic:** Deferred to **Phase 4** (`BIO-01`, `BIO-02`, `BIO-03`).
- **Two-Phase Delta Synchronization Engine:** Deferred to **Phase 5** (`SYNC-01`, `SYNC-02`, `SYNC-03`).
- **Gemini 3.7 Flash Cloud Multimodal Inference:** Deferred to **Phase 7** (`AI-01`, `AI-02`, `AI-03`).
</deferred>
