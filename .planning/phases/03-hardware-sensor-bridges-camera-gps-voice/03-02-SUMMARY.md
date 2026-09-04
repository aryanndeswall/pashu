# Phase 3: Plan 02 Summary — Reporting Wizard UI & Sensor Cards

**Plan:** 03-02  
**Status:** Completed  
**Execution Date:** 2026-09-03  
**Requirements Addressed:** `SYN-02`, `SYN-03`, `SYN-04`

---

## 1. What was built

1. **`CameraCaptureCard.tsx` (`SYN-03`):**
   - Single-tap camera launch ("📸 कॅमेरा उघडा (Take Photo)") and gallery upload ("🖼️ गॅलरी निवडा").
   - Live thumbnail display with real-time green compression badge: `WebP • {sizeKB} KB` and dimension overlay.
   - Retake button ("🔄 बदला") and remove action.
   - Strict 52px thumb target enforcement (`.field-touch-target`).

2. **`VoiceRecorderCard.tsx` (`SYN-02`):**
   - In idle state: Prominent microphone button with Devanagari copy: "🎙️ व्हॉइस नोट रेकॉर्ड करा (कमाल ३० सेकंद)".
   - In recording state: 8-bar animated equalizer visualizer in crimson, real-time timer countdown (`00:18 / 00:30.0`), and Stop button.
   - In recorded state: Audio playback bar with Play/Pause controls (`▶️ ऐका / ⏸️ थांबवा`), audio duration tag, and "पुन्हा रेकॉर्ड करा" button.

3. **`LocationPickerCard.tsx` (`SYN-04`):**
   - Real-time GPS accuracy badge (`GPS अचूकता: ±8m`, with green/amber signal indicator).
   - Auto-snapped LGD village badge displaying village name, block, district, and LGD code.
   - Expandable / searchable manual village selector dropdown allowing instant override from all 26 seeded Maharashtra villages if indoors or GPS is degraded.
   - GPS refresh button with spin animation.

4. **3-Step Focused `ReportWizardView.tsx`:**
   - **Step 1: लक्षण निवड (Syndrome Selection):** 2-column visual grid selecting from the 8 standardized syndromes, gating progress until selection.
   - **Step 2: पुरावे जोडणी (Media & Voice Evidence):** Side-by-side Camera tile and Voice recording tile with syndrome recall badge.
   - **Step 3: स्थान व पशू आधार (Location & Tag):** GPS auto-lock card and 12-digit Pashu Aadhaar RFID ear-tag input with auto-formatting (`XXXX-XXXX-XXXX`).
   - Final CTA: "अहवाल जतन करा (Save Offline Report)", writing the structured syndromic record to SQLite `offline_sync_queue` and triggering haptic confirmation.

5. **Updated `ReportView.tsx`:**
   - Replaced static syndrome drawer with the full 3-step `ReportWizardView` as the primary workflow in the Report tab.

---

## 2. Verification & Test Results

- **Integration Tests (`ReportWizardView.test.tsx`):**
  - Verified Step 1 syndrome selection disables Next button until clicked.
  - Verified advancing from Step 1 to Step 2 exposes Camera and Voice cards.
  - Verified advancing from Step 2 to Step 3 displays Location and 12-digit Pashu Aadhaar input.
  - Verified clicking "अहवाल जतन करा" executes `dbService.execute` into `offline_sync_queue` and renders success confirmation.
- **Full Suite Vitest:**
  - 7 test files, 31 passed tests (100% green).
- **Production Build:**
  - `tsc && vite build`: Compiled in 9.02s with zero TypeScript or Vite errors.

---

## 3. Threat Model Mitigations Enforced

- **T-03-05 (Incomplete Reports):** Enforced validation gating Step 1 until a syndrome is picked, and providing a valid LGD village code before queue insertion.
- **T-03-06 (Media Leaks):** Cleaned up audio playback instances and object URLs upon component unmount.
- **T-03-07 (Data Loss):** Handled SQLite queue insertions with fallback and clear confirmation modal.
