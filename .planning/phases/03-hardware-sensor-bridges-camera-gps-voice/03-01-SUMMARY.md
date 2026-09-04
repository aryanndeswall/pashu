# Phase 3: Plan 01 Summary — Hardware Sensor Bridges (Camera, GPS, Voice)

**Plan:** 03-01  
**Status:** Completed  
**Execution Date:** 2026-09-03  
**Requirements Addressed:** `SYN-02`, `SYN-03`, `SYN-04`

---

## 1. What was built

1. **Hardware Plugins Installed & Configured:**
   - `@capacitor/camera` (`^6.1.0`): Native camera capture & gallery access.
   - `@capacitor/geolocation` (`^6.1.0`): High-accuracy GNSS hardware GPS acquisition.
   - `capacitor-voice-recorder` (`6.0.1`): Native audio recording bridge pinned to Capacitor 6.
   - `mobile/android/app/src/main/AndroidManifest.xml`: Declared runtime permissions for `CAMERA`, `READ_MEDIA_IMAGES`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, and hardware feature tags.

2. **On-Device WebP Compression Service (`cameraService.ts`):**
   - Calculates bounded aspect ratios downscaling to max `1280x720` (720p).
   - Offscreen Canvas 2D WebP scaling pipeline with adaptive quality reduction (75% -> 60%) guaranteeing payloads `<300 KB`.
   - Browser & mock test fallbacks supporting headless test environments.

3. **Vernacular Audio Recording Bridge (`voiceService.ts`):**
   - Audio capture with hard 30-second timeout auto-stop enforcing `SYN-02`.
   - Audio duration timer ticker, playback controller (`playAudio`/`stopPlayback`), base64 audio extraction, and audio state reset.
   - HTML5 `MediaRecorder` web fallback for browser testing.

4. **Geolocation & LGD Centroid Snapping (`locationService.ts`):**
   - High-accuracy GPS positioning with web fallback.
   - Offline Haversine geodetic distance formula calculating km distance between coordinates.
   - Offline nearest village centroid snapping against 26 seeded Maharashtra LGD villages in SQLite (`local_lgd_hierarchy`).
   - Accuracy thresholding: flags coordinates > 25 km from nearest known centroid and supports manual dropdown override.

---

## 2. Verification & Test Results

- **Unit Tests:**
  - `mobile/src/tests/cameraService.test.ts`: 5 passing tests (aspect ratio scaling, 1080p -> 720p, square ratio, WebP payload output).
  - `mobile/src/tests/voiceService.test.ts`: 4 passing tests (idle state, duration tracking, 30s auto-stop cap, reset state).
  - `mobile/src/tests/locationService.test.ts`: 5 passing tests (0 distance identity, Haversine Rahuri-Sangamner distance, Sangamner LGD snapping to Ashwi Budruk, threshold accuracy flag, all villages list).
  - Test run: 14 passing tests in 3.78s.
- **Production Build:**
  - `tsc && vite build`: Succeeded in 26.71s with zero errors (`dist/assets/index-CY3YG-cS.js` 315.16 kB).

---

## 3. Threat Model Mitigations Enforced

- **T-03-01 (Memory Exhaustion):** Offscreen canvas downscales images to 1280x720 and restricts file size under 300 KB.
- **T-03-02 (Storage Exhaustion):** Strict 30s hard-cap ticker terminates recording automatically.
- **T-03-03 (Invalid GPS Coordinates):** Snapping against verified LGD codes and distance thresholding ensures clean spatial clustering.
- **T-03-04 (Permissions Crash):** Camera, location, and microphone permissions declared in `AndroidManifest.xml`.
