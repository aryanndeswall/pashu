# Roadmap: Pashu-Suraksha (पशु सुरक्षा)

## Milestones

- ✅ **Milestone v1.0: MVP Core & Offline-First Foundation** (Phases 1-11, completed 2026-09-05) — *Archived in `.planning/milestones/v1.0-ROADMAP.md`*
- 🚀 **Milestone v1.1: Live Cloud Integrations & Production Services** (Phases 12-14, active)

---

## Active Milestone: v1.1 Live Cloud Integrations & Production Services

Connecting real cloud credentials, storage pipelines, and live AI endpoints to elevate the verified offline-first platform into a connected production system.

### Phases

- [x] **Phase 12: Live Environment Configuration & Gemini 3.7 Flash Cloud Perception** - Inject live Gemini API key, configure dynamic mobile API gateway (`VITE_API_BASE_URL`), and verify live multimodal triage on lesion photos and vernacular audio.
- [x] **Phase 13: Firebase Cloud Storage & Resumable Media Sync Pipeline** - Integrate Firebase Storage SDKs, configure buckets for lesion WebP images and Indic audio notes, and enable direct `gs://` ingestion into Gemini.
- [x] **Phase 14: Cloud Database, Redis Alert Pub/Sub & Push Notification Bridge** - Connect cloud PostgreSQL 16 + PostGIS and Redis, stream live outbreak cluster events, and broadcast containment directives via FCM/SMS.

---

## Phase Details

### Phase 12: Live Environment Configuration & Gemini 3.7 Flash Cloud Perception
**Goal**: Wire live Google Gemini API key into the FastAPI backend (`google-genai` SDK), establish dynamic API gateway resolution on the mobile client (`VITE_API_BASE_URL`), and verify end-to-end multimodal perception on real lesion photos and Indic voice notes with sub-800ms response times.  
**Depends on**: Milestone v1.0 (Phase 11)  
**Requirements**: CLOUD-01, CLOUD-03  
**Success Criteria**:
1. Backend boots with live `GEMINI_API_KEY` from `.env`, initializing Google GenAI Client with `gemini-2.5-flash` or `gemini-3.7-flash`.
2. Multimodal triage endpoint (`/api/v1/triage/multimodal`) processes real lesion photos and Indic audio notes, returning structured clinical JSON conforming to `TriageResponse`.
3. Mobile client dynamically reads `VITE_API_BASE_URL` from environment, communicating with the live backend when online and cleanly falling back to native SQLite heuristic rules when offline or on network failure.  
**Plans**: 2 plans

Plans:
- [x] 12-01: Environment configuration templates, dynamic API gateway service, and backend Gemini live client verification.
- [x] 12-02: End-to-end live multimodal triage execution, latency benchmarking, and client-side online/offline fallback integration.

---

### Phase 13: Firebase Cloud Storage & Resumable Media Sync Pipeline
**Goal**: Integrate Firebase Client and Admin SDKs to store heavy binary assets (lesion WebP photos and vernacular voice notes) in Google Cloud Storage, updating the mobile two-phase sync queue with resumable upload capabilities and passing `gs://` URLs directly to Gemini.  
**Depends on**: Phase 12  
**Requirements**: CLOUD-02  
**Success Criteria**:
1. Firebase Client SDK is initialized on mobile with project credentials; Firebase Admin SDK is initialized on FastAPI backend with service account credentials.
2. Lesion WebP photos (<300 KB) and vernacular voice recordings (.m4a/.webm) upload securely to the Firebase Storage bucket with progress tracking.
3. Uploaded media URIs are stored in the livestock incident database and accessible via authenticated/signed URLs or direct Google Cloud Storage references.  
**Plans**: 2 plans

Plans:
- [x] 13-01: Firebase project configuration, backend Firebase Admin SDK integration, and signed URL generation service.
- [x] 13-02: Mobile Firebase Storage upload client, two-phase sync queue integration, and media preview verification.

---

### Phase 14: Cloud Database, Redis Alert Pub/Sub & Push Notification Bridge
**Goal**: Connect the cloud-hosted PostgreSQL 16 + PostGIS 3.4 database and Redis broker, streaming live outbreak cluster triggers via WebSocket/SSE to the Web-GIS dashboard, and bridging push containment notifications via Firebase Cloud Messaging (FCM) or SMS.  
**Depends on**: Phase 13  
**Requirements**: CLOUD-04, CLOUD-05  
**Success Criteria**:
1. Backend connects to cloud PostgreSQL with PostGIS extension active, executing spatial SaTScan queries and geodetic buffer generation in production.
2. Redis pub/sub channel broadcasts live outbreak cluster triggers to connected Web-GIS command centers in <200ms.
3. Automated containment alerts (1 km Movement Freeze, 5 km Ring Vaccination) dispatch push notifications to registered Pashu Sakhis and field vets.  
**Plans**: 2 plans

Plans:
- [x] 14-01: Cloud PostgreSQL + PostGIS database connection, migration verification, and Redis pub/sub cluster streaming.
- [x] 14-02: Firebase Cloud Messaging (FCM) / SMS push alert integration and Web-GIS live alert banner integration.

