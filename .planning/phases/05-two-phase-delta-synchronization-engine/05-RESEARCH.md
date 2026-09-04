# Phase 5: Two-Phase Delta Synchronization Engine - Research

**Phase:** 05  
**Status:** Completed  
**Domain:** Offline Synchronization, Bandwidth Throttling, Cellular Resilience, Mobile State Machine  
**Requirements Addressed:** `SYNC-01`, `SYNC-02`, `SYNC-03`

---

## 1. Network Topology & Rural India Bandwidth Reality

In rural Maharashtra (e.g. Sangamner, Akole talukas of Ahmednagar), cattle owners and Pashu Sakhis often operate in deep cellular shadows:
- **Dead Zones (0G):** Deep valley pastures, concrete cattle sheds. 0 Kbps data.
- **Flaky 2G / EDGE:** 20–60 Kbps, 800ms–2500ms RTT, frequent TCP socket resets on payloads >10 KB.
- **4G / 5G / Village Wi-Fi (CSC Centers):** 5–40 Mbps. High bandwidth capable of streaming binary photos and audio.

```
+-----------------------------------------------------------------------------------------------+
|                               Network State Transition Logic                                  |
+-----------------------------------------------------------------------------------------------+
|  Network Plugin (@capacitor/network) + Connection Type + EffectiveType (Navigator)           |
|                                                                                               |
|  [ OFFLINE ] ----------> No Socket. Persist everything to SQLite offline_sync_queue.          |
|                                                                                               |
|  [ 2G / EDGE ] --------> Phase 1 Sync ONLY: Stripped JSON Telemetry (<1.5 KB).                |
|                          Binary WebP / Audio uploads strictly BLOCKED.                         |
|                                                                                               |
|  [ 4G / 5G / WI-FI ] --> Phase 1 Sync flushes first, followed by Phase 2 Binary Uploads.      |
|                                                                                               |
|  [ TOTAL ZERO DATA ] --> 1-Tap 140-char Compressed SMS Intent: sms:1962?body=...              |
+-----------------------------------------------------------------------------------------------+
```

---

## 2. Two-Phase Delta Serialization Architecture

### Database Schema Updates
The existing `offline_sync_queue` in `migrations.ts`:
```sql
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  sync_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  priority INTEGER DEFAULT 2,
  status TEXT DEFAULT 'PENDING',
  retry_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  synced_at TEXT
);
```
Statuses:
1. `PENDING`: Not synced yet.
2. `PHASE_1_SYNCED`: Critical metadata transmitted; binary media pending high-speed link.
3. `COMPLETED`: Both telemetry and binary media verified on server.
4. `FAILED_RETRY`: Backoff retry needed.

### Payload Extraction Specification
- **Full Offline Record:** Contains `photo_webp` (base64) and `audio_base64`.
- **Phase 1 Telemetry (stripped):**
  ```json
  {
    "sync_id": "SYNC-REP-172533...",
    "report_id": "REP-172533...",
    "syndrome_code": "VSS",
    "secondary_symptoms": ["oral_vesicles", "hoof_lesions"],
    "differential": "Foot-and-Mouth Disease (FMD)",
    "latitude": 19.3912,
    "longitude": 74.6521,
    "lgd_code": 558301,
    "village_name": "Ashwi Budruk",
    "district_name": "Ahmednagar",
    "pashu_aadhaar": "1234-5678-9012",
    "has_photo": true,
    "has_audio": true,
    "reported_at": "2026-09-03T10:45:00.000Z"
  }
  ```
  Total uncompressed JSON size: **~680 bytes** (transfers in <120ms on 2G EDGE).

- **Phase 2 Binary Payload:**
  ```json
  {
    "sync_id": "SYNC-REP-172533...",
    "report_id": "REP-172533...",
    "photo_webp": "data:image/webp;base64,...",
    "audio_base64": "..."
  }
  ```
  Transferred in background when `networkState === 'CELLULAR_4G_5G' || networkState === 'WIFI'`.

---

## 3. 140-Character SMS Fallback Encoding Protocol

When GPRS/packet data is non-functional:
- **Format:** `PS*<SYN_CODE>*<LGD_CODE>*<LAT_4DEC,LNG_4DEC>*<TAG_SUFFIX>*<PRIORITY>*<HEX_CHECKSUM>`
- **Example:** `PS*HSDS*558301*19.3912,74.6521*9012*P3*C4F1`
- **Total length:** 44 characters (well within 140-char standard GSM 7-bit SMS limit).
- **Checksum algorithm:** 4-character uppercase Hex CRC-16 over payload prefix.
- Dispatched via `sms:1962?body=...` URI schema.

---

## 4. UI Transparency & Queue Management

- **Header Sync Pill:**
  - Placed beside the role switcher in `HeaderBar.tsx`.
  - Displays instant badge with state-driven styling:
    - `🟢 सर्व समक्रमित` (All clear)
    - `🟡 २ रांगेत (2G)` (Pending Phase 2)
    - `🔴 ३ रांगेत (ऑफलाइन)` (Offline backlog)
    - `🔄 समक्रमित होत आहे...` (Active sync)
- **Slide-Up Queue Drawer (`SyncQueueDrawer.tsx`):**
  - Uses `FluidDrawer.tsx`.
  - Lists each report in `offline_sync_queue` with:
    - Incident syndrome code & Marathi name
    - Timestamp
    - Status badge (`Phase 1 Synced` vs `Pending`)
    - Retry count
  - 52px thumb target `[ आताच समक्रमित करा (Sync Now) ]` action.
  - Emergency SMS Fallback action for urgent Anthrax / IDSP alerts.
