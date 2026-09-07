# Phase 13: Firebase Cloud Storage & Resumable Media Sync Pipeline - Research

**Phase:** 13  
**Status:** Completed  
**Domain:** Firebase Cloud Storage, Google Cloud Storage Admin SDK, Signed URL Generation, Resumable Media Sync Pipeline, Gemini Multimodal `gs://` Ingestion  
**Requirements Addressed:** `CLOUD-02`  

---

## 1. Cloud Storage Architecture: Firebase Admin SDK & Google Cloud Storage

In Google Cloud / Firebase ecosystems, Firebase Storage buckets (`<project-id>.firebasestorage.app`) are standard Google Cloud Storage (GCS) buckets.
The backend interacts with the bucket using `firebase-admin` or `google-cloud-storage`:

```python
import firebase_admin
from firebase_admin import credentials, storage

# Initialize using service account credentials file
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred, {
        'storageBucket': settings.FIREBASE_STORAGE_BUCKET
    })

bucket = storage.bucket()
blob = bucket.blob("incidents/SYNC-123/MED-P-456.webp")
blob.upload_from_string(binary_bytes, content_type="image/webp")
```

### Key Technical Properties:
1. **Canonical `gs://` URI**:
   `gs://{bucket.name}/{blob.name}` is directly understood by Google GenAI SDK (`google-genai`):
   ```python
   types.Part.from_uri(file_uri=f"gs://{bucket.name}/{blob.name}", mime_type="image/webp")
   ```
   This eliminates base64 payload transfer overhead over network layers.

2. **Secure Signed URLs (v4)**:
   For mobile devices and Web-GIS dashboards to securely stream images and audio without making the bucket public:
   ```python
   signed_url = blob.generate_signed_url(
       version="v4",
       expiration=timedelta(minutes=60),
       method="GET",
   )
   ```

3. **Presigned Upload URLs**:
   For direct client-to-cloud uploads:
   ```python
   presigned_upload_url = blob.generate_signed_url(
       version="v4",
       expiration=timedelta(minutes=15),
       method="PUT",
       content_type=content_type,
   )
   ```

4. **Zero-Configuration Fallback (`LocalStorageService`)**:
   When `FIREBASE_CREDENTIALS_PATH` is absent or the credentials file cannot be loaded (e.g. offline dev, isolated test containers):
   - Files are stored in a local directory (`backend/uploads/` or temporary sandbox).
   - Generates deterministic simulated `gs://pashu-suraksha-assets/...` URIs and local streaming URLs `/api/v1/sync/media/stream/{media_id}`.
   - Allows all automated tests to execute in sub-milliseconds without cloud dependencies.

---

## 2. Mobile Resumable Two-Phase Sync Queue

The mobile application already enforces a two-phase relational split in SQLite:
- Phase 1: `offline_sync_queue` (lightweight JSON telemetry <1.5 KB flushed immediately over 2G/EDGE).
- Phase 2: `media_sync_queue` (binary assets: lesion WebP photos ~150 KB and audio notes ~80 KB flushed over 4G/WiFi).

### Enhancements for Phase 13:
1. **Binary Transmission**:
   Update `mobile/src/services/syncEngineService.ts` to transmit the binary payload (`media_data` base64/blob) to the FastAPI media upload endpoint `/api/v1/sync/media`.
2. **Metadata Reconciliation**:
   Upon successful storage response from backend, update the SQLite `media_sync_queue` and associated incident records with `gs_uri` and `https_url`.
3. **Bandwidth Adaptivity**:
   Maintain the 2G/4G/WiFi network tier gating:
   - On 2G/EDGE: Queue remains local; user can view locally cached base64 previews.
   - On 4G/5G/Wi-Fi: Background worker flushes queued media and receives cloud URLs.

---

## 3. Gemini Multimodal Ingestion Integration

Update `backend/app/services/triage_service.py`:
- Support `photo_uri` and `audio_uri` in `TriageRequest`.
- When `photo_uri` starts with `gs://`, pass `types.Part.from_uri(file_uri=request.photo_uri, mime_type="image/webp")` directly to `client.models.generate_content`.
- When `photo_uri` is an HTTPS URL or local file path, fetch/read bytes and pass `types.Part.from_bytes(...)`.
- Retain the dual-layer Rule Zero Anthrax filter and graceful fallback to `EdgeRulesEvaluator`.

---

## 4. Database Schema: Incident Media Entity

Create `IncidentMedia` in `backend/app/models/incident.py`:
```python
class IncidentMedia(Base):
    __tablename__ = "incident_media"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    media_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    sync_id: Mapped[str] = mapped_column(String(100), index=True)
    report_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    media_type: Mapped[str] = mapped_column(String(50))  # PHOTO_WEBP, AUDIO_NOTE
    file_size_kb: Mapped[int] = mapped_column(Integer, default=0)
    gs_uri: Mapped[str] = mapped_column(String(255), nullable=True)
    https_url: Mapped[str] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
```
