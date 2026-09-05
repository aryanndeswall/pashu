# Requirements: Pashu-Suraksha (पशु सुरक्षा) — Milestone v1.1

**Defined:** 2026-09-05  
**Milestone:** `v1.1` — Live Cloud Integrations, Firebase Storage & Multimodal AI Ingestion  
**Core Value:** Immediate, reliable early-warning outbreak identification and automated biosecurity containment—even in complete cellular dead zones—so that contagious outbreaks and fatal zoonoses (Anthrax, FMD, LSD) are contained within hours rather than days.

---

## v1.1 Requirements

### Cloud Multimodal Perception (CLOUD-AI)
- [ ] **CLOUD-01**: Google Gemini 3.7 Flash Live Inference — Backend ingests `GEMINI_API_KEY`, executes real multimodal triage calls on lesion WebP photos and vernacular audio notes via `google-genai` SDK, adhering strictly to the Pydantic schema in <800ms.

### Cloud Media Storage & Sync (CLOUD-STORAGE)
- [ ] **CLOUD-02**: Firebase Cloud Storage Integration — Secure media pipeline using Firebase Client and Admin SDKs for uploading, storing, and generating signed/public URLs for lesion photos and audio recordings, with direct Gemini `gs://` URI compatibility.

### Mobile Dynamic Networking (CLOUD-NET)
- [ ] **CLOUD-03**: Dynamic Mobile API Gateway Configuration — Mobile client reads `VITE_API_BASE_URL` from `.env`, connects to the cloud backend over HTTPS/WSS, and gracefully falls back to local SQLite operations when offline or when cloud requests timeout.

### Live Outbreak Streaming & Push Notifications (CLOUD-STREAM)
- [ ] **CLOUD-04**: Production Cloud Database & Redis Pub/Sub — Backend connects to a live PostgreSQL 16 + PostGIS 3.4 database and Redis instance, streaming real-time outbreak detection events via WebSockets/SSE to connected clients.
- [ ] **CLOUD-05**: Containment Alert Broadcast Bridge — Push notification pipeline (via Firebase Cloud Messaging / SMS Gateway) to broadcast 1-5-10 km biosecurity movement freeze directives to field workers in affected jurisdictions.

---

## Traceability Matrix

| Requirement ID | Category | Phase | Status |
|----------------|----------|:-----:|:------:|
| **CLOUD-01** | Cloud Multimodal Perception | Phase 12 | Pending |
| **CLOUD-02** | Cloud Media Storage & Sync | Phase 13 | Pending |
| **CLOUD-03** | Mobile Dynamic Networking | Phase 12 | Pending |
| **CLOUD-04** | Live Outbreak Streaming | Phase 14 | Pending |
| **CLOUD-05** | Containment Alert Broadcast | Phase 14 | Pending |
