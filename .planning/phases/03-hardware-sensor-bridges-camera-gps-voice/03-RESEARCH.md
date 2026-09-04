# Phase 3: Hardware Sensor Bridges (Camera, GPS, Voice) - Research

**Phase:** 03  
**Status:** Completed  
**Domain:** Native Android Hardware Sensor Integration (Capacitor 6)  
**Requirements Addressed:** `SYN-02`, `SYN-03`, `SYN-04`

---

## 1. Technical Architecture Overview

Phase 3 establishes native Android hardware abstraction bridges inside the Capacitor 6 container, backed by offline-capable web fallbacks for seamless browser testing.

```
+-----------------------------------------------------------------------------------+
|                           ReportWizardView (3-Step Flow)                         |
+-----------------------------------------------------------------------------------+
        |                                 |                                 |
        v                                 v                                 v
+-----------------------+     +-----------------------+     +-----------------------+
|     CameraService     |     |    LocationService    |     |     VoiceService      |
|  (@capacitor/camera)  |     | (@capacitor/geoloc)   |     | (@cap-comm/voice-rec) |
+-----------------------+     +-----------------------+     +-----------------------+
        |                                 |                                 |
        v                                 v                                 v
+-----------------------+     +-----------------------+     +-----------------------+
|  Offscreen Canvas 2D  |     |  SQLite LGD Hierarchy |     |  MediaRecorder / AAC  |
|  WebP Scaling & Comp  |     |  Haversine Distance   |     |  30s Auto-Cap & Wave  |
|  <300 KB (1280x720)   |     |  Centroid Snapping    |     |  Playback Check       |
+-----------------------+     +-----------------------+     +-----------------------+
        \                                 |                                 /
         ---------------------------------+---------------------------------
                                          |
                                          v
                      +---------------------------------------+
                      |   Local SQLite Draft & Event Queue    |
                      |     (`offline_sync_queue` / drafts)   |
                      +---------------------------------------+
```

---

## 2. Hardware Bridge Implementations

### A. Lesion Photo Capture & WebP Compression (`SYN-03`)
- **Plugin:** `@capacitor/camera` (v6.x)
- **Native / Web Flow:**
  1. Trigger native camera UI via `Camera.getPhoto({ resultType: CameraResultType.Uri, source: CameraSource.Prompt, quality: 90 })`.
  2. Load returned URI into an offscreen HTML5 `<canvas>` element.
  3. Calculate bounding aspect ratio downscaling to max dimensions `1280x720` (720p).
  4. Convert to WebP format using `canvas.toDataURL('image/webp', quality)`.
  5. Adaptive Quality Guard:
     - Standard: 75% quality (~150–250 KB).
     - If resulting payload exceeds 300 KB: automatically re-compress at 60% quality (~120–180 KB).
  6. Return structured metadata: `{ dataUrl, format: 'image/webp', sizeBytes, width, height, timestamp }`.

### B. Geolocation & Local LGD Spatial Snapping (`SYN-04`)
- **Plugin:** `@capacitor/geolocation` (v6.x)
- **Spatial Snapping Algorithm:**
  1. Request hardware GPS lock via `Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 })`.
  2. Extract `latitude`, `longitude`, and `accuracy` (in meters).
  3. Query local SQLite table `local_lgd_hierarchy` containing pre-seeded Maharashtra village centroids.
  4. Compute Haversine distance in kilometers for each village:
     $$a = \sin^2(\Delta\text{lat}/2) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2(\Delta\text{lon}/2)$$
     $$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a})$$
     $$d = R \cdot c \quad (R = 6371\text{ km})$$
  5. Deterministically snap to the record with minimum $d$.
  6. If GPS accuracy > 100 meters or nearest village > 25 km, flag as `LOW_ACCURACY` and display manual village override dropdown.

### C. Vernacular Voice Memo Recording (`SYN-02`)
- **Plugin:** `@capacitor-community/voice-recorder` (v6.x) + HTML5 `MediaRecorder` fallback.
- **Recording Logic:**
  1. Check permissions via `VoiceRecorder.hasAudioRecordingPermission()` and request if needed.
  2. Begin capture via `VoiceRecorder.startRecording()`.
  3. Start a 30-second interval ticker updating countdown and animated audio bars.
  4. At 30.0s (or when user taps Stop), trigger `VoiceRecorder.stopRecording()`.
  5. Extract base64 audio payload and MIME type (`audio/aac` on Android, `audio/webm` on browser).
  6. Provide immediate playback via `new Audio(dataUrl)` and re-record option.

---

## 3. Multi-Sensor 3-Step Wizard UX (`ReportWizardView`)

1. **Step 1: लक्षण निवड (Syndrome Selection):**
   - 2-column visual syndrome grid with anatomical icons, Devanagari labels, and search filter.
   - Requires selecting 1 of 8 standardized syndromes (VSS, NSLS, HSDS, AROS, CMSS, SARF, HES, NAS).

2. **Step 2: पुरावे जोडणी (Media & Voice Evidence):**
   - **Camera Tile:** Single-tap to open camera/gallery, display live thumbnail, and green `WebP • [size] KB` compression badge.
   - **Voice Tile:** Big pulsing record button, real-time waveform visualizer, 30s countdown timer, and audio review bar.

3. **Step 3: स्थान व पशू आधार (Location & Tag Identification):**
   - **GPS Lock Card:** Pulsing satellite radar icon, coordinates display, accuracy pill (`GPS अचूकता: ±8m`), and auto-snapped LGD village pill (`गाव: राहुरी खुर्द, ता. राहुरी, जि. अहमदनगर`).
   - **Manual Village Fallback:** Single-tap searchable dropdown to override village when GPS signal is weak.
   - **Pashu Aadhaar Tag Input:** 12-digit numeric RFID ear-tag input with auto-formatting (`XXXX-XXXX-XXXX`) and quick validation.

4. **Final Action:**
   - Single prominent button: **"अहवाल जतन करा (Save Offline Report)"**.
   - Triggers medium haptic confirmation (`hapticsService.hapticMedium()`), persists payload to local SQLite, and transitions back to Dashboard with a success toast.

---

## 4. Android Manifest Permissions & Configuration

Add to `mobile/android/app/src/main/AndroidManifest.xml`:
```xml
<!-- Camera Permissions -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-feature android:name="android.hardware.camera" android:required="false" />

<!-- Geolocation Permissions -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" android:required="false" />

<!-- Audio Recording Permissions -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-feature android:name="android.hardware.microphone" android:required="false" />
```

---

## 5. Validation Architecture

### Unit & Integration Test Suite (`vitest`)
1. **Camera Compression Service (`cameraService.test.ts`):**
   - Test Canvas WebP scale computation preserving 16:9 / 4:3 ratios up to 1280x720.
   - Test adaptive quality step-down when simulated image size > 300 KB.
2. **Location & LGD Snapping Service (`locationService.test.ts`):**
   - Test Haversine formula against known coordinates (Rahuri Khurd lat 19.3912, lon 74.6521 -> snaps to LGD code 556601).
   - Test distance threshold and low accuracy manual village override.
3. **Voice Service (`voiceService.test.ts`):**
   - Test 30-second duration timeout guard.
   - Test base64 audio payload creation and playback state handling.
4. **Report Wizard Component (`ReportWizardView.test.tsx`):**
   - Test step progression (Step 1 -> Step 2 -> Step 3).
   - Test draft persistence in SQLite upon wizard completion.
