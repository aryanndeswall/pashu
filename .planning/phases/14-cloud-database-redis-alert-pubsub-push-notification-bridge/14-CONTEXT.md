# Phase 14: Cloud Database, Redis Alert Pub/Sub & Push Notification Bridge - Context

**Gathered:** 2026-09-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect cloud-hosted PostgreSQL 16 + PostGIS 3.4 database (Neon) and Upstash Redis broker, stream real-time outbreak detection events via dual-transport (WebSocket and Server-Sent Events) to the Web-GIS command dashboard, and bridge automated containment directives (1km movement freeze, 5km ring vaccination) via Firebase Cloud Messaging (FCM) topic broadcasts and statutory SMS fallback.
Covers requirements CLOUD-04 and CLOUD-05.
This completes Milestone v1.1.

</domain>

<decisions>
## Implementation Decisions

### 1. Database Connectivity & Resilient Hybrid Engine
- **D-01:** Connect to cloud Neon PostgreSQL (`postgresql+asyncpg://...`) configured in `DATABASE_URL`.
- **D-02:** Provide automated fallback to local SQLite (`sqlite+aiosqlite:///./pashu_cloud.db`) if cloud database is unreachable or offline, ensuring zero startup crashes and uninterrupted local testing.
- **D-03:** Execute table creation / schema verification on application startup for both cloud PostgreSQL and local SQLite.

### 2. Redis Pub/Sub Outbreak Event Streaming
- **D-04:** Use Redis Pub/Sub on channel `outbreaks:alerts` via `REDIS_URL`.
- **D-05:** In-memory fallback event broadcaster if Redis is unconfigured or temporarily disconnected, so events still stream to locally connected clients.
- **D-06:** Dual Real-Time Transport:
  - WebSocket endpoint: `/api/v1/clusters/ws` for full-duplex sub-100ms cluster event push.
  - Server-Sent Events (SSE) endpoint: `/api/v1/clusters/stream` for lightweight unidirectional HTTP streaming.
- **D-07:** Publish trigger events automatically whenever `/api/v1/sync/telemetry` or `/api/v1/clusters/evaluate` declares an outbreak or generates containment buffers.

### 3. Containment Alert Bridge (FCM & SMS)
- **D-08:** Firebase Cloud Messaging (FCM) Integration:
  - Uses `firebase_admin.messaging` initialized from `FIREBASE_CREDENTIALS_PATH`.
  - Dispatches topic messages to `district_{district_slug}` and `lgd_{lgd_code}`.
  - Fallback stub logger when FCM is not configured so tests pass deterministically.
- **D-09:** Statutory SMS Notification Bridge:
  - Generates standardized Emergency Zoonotic Directive text citing PCICDA 2009 Sections 6, 10, 20.
  - Returns SMS payload structure for field devices without mobile data.
- **D-10:** Web-GIS Dashboard Integration:
  - Update mobile/web command center (`CommandMapView.tsx` / `DashboardView.tsx`) to subscribe to live WebSocket/SSE outbreak alerts and display a real-time flashing emergency biosecurity banner.

### The Agent's Discretion
- Redis connection pooling and retry parameters (max 3 reconnection attempts with exponential backoff).
- Keepalive ping intervals for WebSockets (every 30 seconds).
- Schema structure for `OutbreakAlertEvent` (timestamp, cluster_id, syndrome_code, epicenter, buffer_radii, advisory).

</decisions>

<canonical_refs>
## Canonical References

### Database, Redis & Streaming Specifications
- `PRODUCTION_TECH_STACK_AND_AUDIT.md` §2.1 & §4 — PostgreSQL 16 + PostGIS, Redis Pub/Sub, and WebSocket/SSE real-time telemetry streaming.
- `MOBILE_APK_PRODUCTION_TECH_STACK_AND_AUDIT.md` §3 — Push notification handling, Web-GIS war room integration.
- `backend/app/database.py` — Async SQLAlchemy engine and session factory.
- `backend/app/api/v1/clusters.py` — SaTScan cluster evaluation and buffer generation endpoints.
- `backend/app/api/v1/sync.py` — Mobile telemetry ingestion trigger point.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/config.py`: Already contains `DATABASE_URL` and `REDIS_URL`.
- `backend/app/services/auth_service.py`: Already demonstrates connecting to Redis via `redis.from_url(settings.REDIS_URL)`.
- `backend/app/services/buffer_service.py`: Generates 1km, 5km, and 10km geodetic buffer GeoJSON FeatureCollections.
- `backend/app/models/cluster.py`: `OutbreakCluster` database model.

### Established Patterns
- Pydantic v2 schemas for all event structures.
- Graceful degradation with in-memory fallbacks when external cloud services are offline.
- Dual-tier testing: mock/in-memory for unit tests, live integration for cloud verification.

</code_context>

<specifics>
## Specific Ideas

- Build `backend/app/services/pubsub_service.py` managing Redis pub/sub listener, WebSocket connection manager, and SSE generator.
- Build `backend/app/services/notification_service.py` managing FCM topic messaging and SMS emergency broadcast generation.
- Add `/api/v1/clusters/broadcast` endpoint to test alert broadcasting directly.
- Connect mobile `CommandMapView` / `DashboardView` to the live alert stream.

</specifics>

<deferred>
## Deferred Ideas

- None. Milestone v1.1 completes with Phase 14.

</deferred>

---

*Phase: 14-cloud-database-redis-alert-pubsub-push-notification-bridge*
*Context gathered: 2026-09-07*
