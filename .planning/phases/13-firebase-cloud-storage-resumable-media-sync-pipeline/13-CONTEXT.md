# Phase 13: Firebase Cloud Storage & Resumable Media Sync Pipeline - Context

**Gathered:** 2026-09-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate Firebase Client and Admin SDKs / Google Cloud Storage pipeline to store heavy binary assets (lesion WebP photos and Indic audio voice notes) in Cloud Storage. Implement presigned URL / managed gateway upload with fallback, resumable mobile sync queue integration, and dual-format URI persistence (`gs://` for Gemini 3.7/2.5 Flash multimodal ingestion and HTTPS URLs for mobile/GIS dashboard display).
Covers requirement CLOUD-02.
PostgreSQL/PostGIS cloud hosting and Redis cluster pub/sub belong in Phase 14.

</domain>

<decisions>
## Implementation Decisions

### Upload Architecture
- **D-01:** Managed Backend Gateway / Presigned URL: Mobile client sync engine uploads media through the FastAPI sync gateway (`/api/v1/sync/media`), which uses the Firebase Admin SDK / Google Cloud Storage client to persist binary assets. The backend can also issue presigned PUT URLs for large files.
- **D-02:** Firebase Admin SDK integration on FastAPI backend:
  - Supports `FIREBASE_CREDENTIALS_PATH` and `FIREBASE_STORAGE_BUCKET` from `.env`.
  - When configured, uploads binary blobs directly to the specified Google Cloud Storage / Firebase bucket.
  - Generates secure signed HTTPS URLs with configurable expiration (or public URLs if bucket is public).

### Local / Stub Fallback for Non-Configured Environments
- **D-03:** When `FIREBASE_CREDENTIALS_PATH` is not present or credentials file does not exist, the backend gracefully activates a `LocalStorageService` stub:
  - Stores binary files under a local directory (`backend/uploads/` or sandboxed media dir).
  - Returns simulated `gs://pashu-suraksha-assets/...` and local HTTPS `/api/v1/media/stream/{media_id}` URLs.
  - Zero crashes, ensuring 100% of automated test suites pass without requiring real Google Cloud credentials.

### Dual-Format URI Persistence
- **D-04:** Both canonical `gs://` URI and HTTPS access URL are returned and stored:
  - `gs_uri`: e.g. `gs://<bucket>/incidents/<sync_id>/<media_id>.webp` — directly usable by Gemini via `google-genai` `Part.from_uri()`.
  - `https_url`: signed or public HTTPS URL — usable by mobile client `<img>` / `<audio>` tags and Web-GIS command center.
- **D-05:** Update `IncidentMedia` / `Incident` schema and database models if needed, and update `MediaSyncResponse` to return both `gs_uri` and `https_url`.

### Mobile Two-Phase Resumable Sync Integration
- **D-06:** Mobile `syncEngineService.ts`:
  - `processSyncQueue` currently uploads media metadata to `getSyncMediaEndpoint()`. Update it to transmit actual media binary (`media_data` base64/WebP blob) and receive the stored `gs_uri` and `https_url`.
  - Store returned URLs in local SQLite `media_sync_queue` / report records for instant offline-to-online reconciliation.
  - Provide chunked / resumable retry handling if network drops mid-upload.
- **D-07:** Update Mobile Report Wizard / Media views to display remote previews once synced, falling back to local base64 when offline.

### The Agent's Discretion
- Concrete storage file layout in bucket: `incidents/{sync_id}/{media_id}.{ext}`.
- Allowed MIME types: `image/webp`, `image/jpeg`, `image/png`, `audio/webm`, `audio/m4a`, `audio/mp4`, `audio/wav`.
- Chunk size for resumable uploads: 256 KB.

</decisions>

<canonical_refs>
## Canonical References

### Storage & Media Specifications
- `PRODUCTION_TECH_STACK_AND_AUDIT.md` §3 — Cloud Storage architecture, binary asset management, and direct `gs://` ingestion into Gemini GenAI.
- `MOBILE_APK_PRODUCTION_TECH_STACK_AND_AUDIT.md` §2.2 — Two-phase sync engine, SQLite offline queue, and bandwidth-adaptive media flushing.
- `backend/app/api/v1/sync.py` — Existing `/api/v1/sync/telemetry` and `/api/v1/sync/media` endpoints.
- `backend/app/schemas/sync.py` — `MediaSyncRequest` and `MediaSyncResponse`.
- `mobile/src/services/syncEngineService.ts` — Mobile two-phase delta synchronization engine.
- `mobile/src/types/sync.ts` — Sync schemas and interfaces.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/config.py`: Already contains `FIREBASE_CREDENTIALS_PATH: Optional[str]` and `FIREBASE_STORAGE_BUCKET: Optional[str]`.
- `backend/app/api/v1/sync.py`: Has `sync_media` endpoint returning mock `cloud-storage://` URI.
- `backend/app/schemas/sync.py`: `MediaSyncRequest` contains `media_id`, `sync_id`, `media_type`, `file_size_kb`. Needs optional `media_data` (base64 string) or multipart upload support.
- `mobile/src/services/syncEngineService.ts`: Manages SQLite `offline_sync_queue` and `media_sync_queue`, respecting 2G/4G/WiFi constraints.

### Established Patterns
- Graceful degradation: Systems operate with real cloud credentials when configured, and failover to fully functional local mocks/stubs when unconfigured.
- Pydantic v2 schemas for all request/response models.
- Vitest unit tests in mobile and pytest async tests in backend.

</code_context>

<specifics>
## Specific Ideas

- Install `firebase-admin` in `backend/requirements.txt` (or use `google-cloud-storage` which is the underlying library for Firebase Storage and has lightweight dependencies).
- In `backend/app/services/storage_service.py`, create a `StorageService` interface with `FirebaseStorageService` and `LocalStorageService`.
- Expose an endpoint `/api/v1/sync/media/upload` (or enhance `/api/v1/sync/media`) to accept base64 or multipart upload of media, persisting to cloud storage and returning `gs_uri` + `https_url`.
- Expose `/api/v1/sync/media/signed-url` to generate presigned upload URLs if direct upload is preferred.

</specifics>

<deferred>
## Deferred Ideas

- Live Cloud PostgreSQL 16 + PostGIS 3.4 database connection & migrations — Phase 14.
- Redis Pub/Sub outbreak live clustering stream & FCM notifications — Phase 14.

</deferred>

---

*Phase: 13-firebase-cloud-storage-resumable-media-sync-pipeline*
*Context gathered: 2026-09-07*
