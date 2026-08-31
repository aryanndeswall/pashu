# Phase 3: Hardware Sensor Bridges (Camera, GPS, Voice) - Discussion Log

**Date:** 2026-08-31  
**Participants:** User, Assistant (Antigravity)  
**Status:** Completed  

---

## Technical Gray Areas & User Decisions

### 1. Camera & Lesion Photo Capture (SYN-03)
- **Question:** What resolution and compression target should we lock for on-device camera WebP processing?
- **Options Presented:**
  1. 1280x720 (720p) WebP @ 75% quality (~150–250 KB).
  2. 1920x1080 (1080p) WebP @ 80% quality (~350–500 KB).
  3. Configurable / Adaptive — Automatically dials down to 720p/60% quality if the device has <3GB RAM or low storage.
- **User Decision:** **Configurable / Adaptive** — Standard default 1280x720 WebP @ 75% quality, with automatic adaptation to 720p @ 60% quality (~120–180 KB) if memory is constrained or device profile is budget.

### 2. Geolocation & LGD Village Snapping (SYN-04)
- **Question:** How should offline GPS geotagging snap coordinates to Local Government Directory (LGD) village units in cellular dead zones?
- **Options Presented:**
  1. (Recommended) Embedded local LGD centroid table (JSON/SQLite) with Haversine distance snapping (within 15 km) + manual village override.
  2. Strict GPS with retry prompt if accuracy > 50m, falling back to manual village dropdown selector.
  3. Pure coordinates only; defer LGD mapping to server-side ingestion during delta sync.
- **User Decision:** **(Recommended) Embedded local LGD centroid table (JSON/SQLite) with Haversine distance snapping (within 15 km) + manual village override.** Ensures reports always carry an official administrative unit even with zero cell connectivity.

### 3. Vernacular Voice Recording (SYN-02)
- **Question:** What duration and UX controls should be enforced for vernacular voice note recording?
- **Options Presented:**
  1. (Recommended) 30-second cap, AAC/M4A or WebM format with pulsing audio visualizer, live countdown timer, and playback confirmation.
  2. 15-second cap, lightweight mono audio to minimize local SQLite/filesystem footprint.
  3. No hard time limit, but stop automatically after 3 seconds of silence or user tap.
- **User Decision:** **(Recommended) 30-second cap, AAC/M4A or WebM format with pulsing audio visualizer, live countdown timer, and playback confirmation.** Allows farmers and Pashu Sakhis to comfortably explain colloquial symptoms in Marathi/Hindi.

### 4. Multi-Sensor Report Submission Integration
- **Question:** How should the multi-sensor reporting workflow be presented to field workers in the UI?
- **Options Presented:**
  1. Syndrome first -> Sensor attachment bottom sheet (Photo + Voice Memo + Auto-GPS) -> Save to offline SQLite draft table.
  2. Step-by-step 3-step wizard (Step 1: Syndrome, Step 2: Media/Voice, Step 3: Location & Tag ID).
  3. Single long scrollable form with inline camera thumbnail, audio button, and GPS coordinate badge.
- **User Decision:** **Step-by-step 3-step wizard (Step 1: Syndrome, Step 2: Media/Voice, Step 3: Location & Tag ID).** Provides focused cognitive load for field workers, with clear forward/back navigation and validation at each step.
