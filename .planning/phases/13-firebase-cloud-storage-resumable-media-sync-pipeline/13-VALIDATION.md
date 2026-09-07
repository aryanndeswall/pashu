# Phase 13: Firebase Cloud Storage & Resumable Media Sync Pipeline - Validation Strategy

**Phase:** 13  
**Status:** Planned  
**Requirements Addressed:** `CLOUD-02`  

---

## 1. Automated Verification Gates

### Backend Test Suite (`pytest backend/tests/test_storage.py` and `test_sync.py`)
1. **Storage Service Initialization**:
   - Verify `get_storage_service()` initializes `FirebaseStorageService` when credentials exist and bucket is specified.
   - Verify `LocalStorageService` activates when credentials are dummy or unconfigured, storing binary files safely and returning valid `gs://` and HTTP URLs.
2. **Binary Media Upload Endpoint (`/api/v1/sync/media`)**:
   - Ingests WebP lesion photo and Indic voice note with base64 binary content.
   - Stores media record in `incident_media` table.
   - Returns `stored_uri`, `gs_uri`, `https_url`, and `COMPLETED` status.
3. **Signed URL Generation Endpoint (`/api/v1/sync/media/signed-url`)**:
   - Generates presigned PUT URL for client-side resumable direct upload.
4. **Media Retrieval Endpoint (`/api/v1/sync/media/{media_id}`)**:
   - Retrieves stored media metadata and streams or redirects to asset.
5. **Gemini Integration with `gs://` URI**:
   - Verify `GeminiTriageService` accepts `photo_uri` (`gs://...`) without throwing error, routing either to `client.models.generate_content` or graceful fallback.

### Mobile Client Test Suite (`vitest src/tests/mediaSync.test.ts` and `syncEngine.test.ts`)
1. **Two-Phase Delta Synchronization**:
   - Phase 1 flushes lightweight telemetry.
   - Phase 2 flushes binary media over 4G/WiFi.
   - SQLite `media_sync_queue` is updated with returned `https_url` and `gs_uri`.
2. **Resilience under Network Failure**:
   - Network failure flags `FAILED_RETRY` and preserves binary in SQLite until connectivity is restored.
3. **Bandwidth Gating**:
   - Under `CELLULAR_2G_EDGE`, media sync is held in queue while telemetry is sent.

---

## 2. Manual / End-to-End Smoke Test

1. Launch FastAPI backend:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
2. Check storage service initialization in console log (`[StorageService] Initialized Firebase Storage with bucket pashu-f51a1.firebasestorage.app`).
3. Trigger a sample report with photo and voice note from Mobile Report Wizard.
4. Check that media queue transitions from `PENDING` -> `COMPLETED`, displaying the cloud-stored image.
