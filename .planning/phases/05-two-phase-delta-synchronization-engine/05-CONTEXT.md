# Phase 5: Two-Phase Delta Synchronization Engine - Context & Decisions

**Phase:** 05  
**Status:** Locked  
**Created:** 2026-09-03  
**Requirements Addressed:** `SYNC-01`, `SYNC-02`, `SYNC-03`

---

## 1. Executive Summary & Core Objective

The non-negotiable priority of Pashu-Suraksha is immediate early-warning transmission—even in complete cellular dead zones or patchy rural 2G coverage. Phase 5 builds the **Two-Phase Delta Synchronization Engine**:
- **Phase 1 (Lightweight Telemetry, <2 KB):** Immediately transmits critical syndromic incident packets (syndrome code, secondary symptoms, LGD village code, GPS coordinates, priority level, Pashu Aadhaar) over flaky 2G/EDGE networks or 1-tap SMS fallback.
- **Phase 2 (Binary Media Payloads, 100–350 KB):** Queues heavy WebP lesion photos and vernacular audio memos in native SQLite, uploading them opportunistically when high-speed 4G/5G or Wi-Fi connectivity is detected.

---

## 2. Locked Architectural Decisions

### A. 4-Tier Network State Detection (`networkService.ts` - `SYNC-01`)
- Uses `@capacitor/network` native Android plugin with fallback to browser `navigator.onLine` and `window.addEventListener('online'/'offline')`.
- Categorizes network into 4 distinct operational states:
  1. `OFFLINE`: Zero network connectivity. All operations persist to SQLite `offline_sync_queue`.
  2. `CELLULAR_2G_EDGE`: Low bandwidth, high latency. Triggers **Phase 1 JSON Telemetry Sync Only** (<2 KB). Blocks heavy binary uploads to prevent connection resets.
  3. `CELLULAR_4G_5G`: High-speed mobile data. Executes Phase 1 telemetry and opportunistic Phase 2 binary uploads.
  4. `WIFI`: Unlimited high-speed broadband. Flushes entire backlog of Phase 1 and Phase 2 binary payloads.
- Emits real-time reactive connection state updates to Zustand `useSyncStore`.

### B. Two-Phase Delta Protocol & Event Lifecycle (`syncEngineService.ts` - `SYNC-02`, `SYNC-03`)
- **Queue State Machine:**
  - Statuses: `PENDING` ➔ `PHASE_1_SYNCED` ➔ `PHASE_2_SYNCED` (or `FAILED_RETRY`).
  - Prioritization: Priority 3 (Anthrax biohazard / IDSP emergencies) flushes ahead of Priority 2 (standard outbreaks) and Priority 1 (routine animal registrations).
- **Exponential Backoff & Retry Logic:**
  - Initial delay: 2s; Max backoff: 60s; Max retries before flagging manual intervention: 5.
- **Configurable HTTP Adapter:**
  - Supports simulated mock client with network latency simulation and offline toggle for unit/integration testing, ready for direct seamless wiring into FastAPI backend in Phase 6.

### C. 1-Tap Compressed SMS Emergency Fallback (`smsFallbackService.ts` - `SYNC-02`)
- For remote regions with complete mobile data blackout (no GPRS/EDGE) but active 2G GSM cellular voice/SMS towers:
- Compresses critical syndromic data into standard 140-character format:
  `PS*<SYN_CODE>*<LGD_CODE>*<LAT,LNG>*<TAG>*<PRIORITY>*<CHECKSUM>`
  Example: `PS*HSDS*558301*19.39,74.65*TAG9842*P3*C4F1`
- Generates native SMS URI (`sms:1962?body=...`) for 1-tap farmer/vet dispatch to District Outbreak Cell.

### D. User Interface & Sync Transparency (`SyncQueueDrawer.tsx`, `HeaderBar.tsx`)
- **Header Sync Pill:**
  - Live status indicator visible in the app top header:
    - 🟢 `सर्व समक्रमित (All Synced)`
    - 🟡 `३ रांगेत (3 Pending - 2G)`
    - 🔴 `ऑफलाइन (Offline Mode)`
    - 🔄 `समक्रमित होत आहे... (Syncing...)`
- **Slide-Up Sync Queue Drawer (`SyncQueueDrawer.tsx`):**
  - Displays pending items count, breakdown of Phase 1 (Data) vs Phase 2 (Media), retry status, and a 52px thumb target `[ आताच समक्रमित करा (Sync Now) ]` action.

---

## 3. Verification & Acceptance Criteria

1. `@capacitor/network` plugin installed and wrapped with graceful offline web fallbacks.
2. Unit tests verify 4-tier network state evaluation and event listener dispatch.
3. Unit tests verify Phase 1 payload separation (<2 KB JSON stripped of binary media) and sequential status promotion (`PENDING` -> `PHASE_1_SYNCED` -> `PHASE_2_SYNCED`).
4. Unit tests verify SMS syntax generation (<140 characters) and checksum validation.
5. Component tests verify `SyncQueueDrawer.tsx` rendering pending sync items and executing manual sync flushes.
6. Mobile test suite passes 100% green and production bundle builds with 0 errors.
