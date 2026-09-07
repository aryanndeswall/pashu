# Phase 14: Cloud Database, Redis Alert Pub/Sub & Push Notification Bridge - Research

**Phase:** 14  
**Status:** Completed  
**Domain:** Cloud PostgreSQL 16 (Neon), Redis Pub/Sub (Upstash), WebSocket & SSE Real-time Streaming, Firebase Cloud Messaging (FCM), SMS Containment Alert Dispatch  
**Requirements Addressed:** `CLOUD-04`, `CLOUD-05`  

---

## 1. Cloud Database Connection Architecture (Neon PostgreSQL 16)

The project backend uses SQLAlchemy 2.0 with `asyncpg`:
- `DATABASE_URL`: `postgresql+asyncpg://neondb_owner:***@ep-lingering-mud-b3aks14j-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb`
- `asyncpg` connects asynchronously over SSL (`pool_pre_ping=True`).
- **Resilient Hybrid Fallback Strategy**:
  During boot in `app/database.py`, if the cloud database cannot be contacted within a short timeout (e.g. 3.0s) due to offline development or DNS issues, the engine seamlessly falls back to a local SQLite async database (`sqlite+aiosqlite:///./pashu_cloud.db`).
  This guarantees that neither developers nor CI test runners are ever blocked by external cloud outages.

---

## 2. Redis Pub/Sub & Live Outbreak Streaming Engine

The backend connects to Upstash Serverless Redis (`rediss://...` over TLS) using `redis.asyncio`:

```python
import redis.asyncio as aioredis

redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
await redis_client.publish("outbreaks:alerts", json.dumps(alert_payload))
```

### Dual-Transport Outbreak Event Stream:
1. **WebSocket (`/api/v1/clusters/ws`)**:
   - Manages active client connections (`ConnectionManager`).
   - Pushes outbreak cluster declarations and geodetic buffer triggers with <100ms latency.
   - Includes automatic keep-alive ping/pong frames.
2. **Server-Sent Events (SSE) (`/api/v1/clusters/stream`)**:
   - Standard HTTP GET endpoint returning `text/event-stream`.
   - Lightweight alternative for web dashboards that prefer unidirectional streaming without full WebSocket handshake.
3. **In-Memory Event Broker Fallback**:
   - If Redis is disconnected, an in-memory broadcast bus forwards events immediately to active WebSockets and SSE streams.

---

## 3. Containment Alert Bridge (FCM Topic Messaging & SMS Fallback)

When a space-time cluster crosses the epidemic threshold (`OPS >= 0.75` or `mortality >= 2`):
1. **Firebase Cloud Messaging (FCM)**:
   - Dispatches priority notification to topic `district_{district_slug}` and `all_field_vets`:
     ```python
     from firebase_admin import messaging

     message = messaging.Message(
         notification=messaging.Notification(
             title="🚨 Biosecurity Directive: Movement Freeze Declared",
             body=f"Outbreak of {disease} detected in {village}. 1 km freeze active.",
         ),
         topic=f"district_{district.lower()}",
         data={
             "cluster_id": cluster_id,
             "syndrome_code": syndrome_code,
             "radius_km": "1",
         },
     )
     ```
2. **Statutory SMS Gateway**:
   - Generates standardized SMS payload citing Sections 6, 10, 20 of Prevention and Control of Infectious and Contagious Diseases in Animals (PCICDA) Act 2009.
   - Dispatches via SMS API or 1-tap mobile fallback for cellular dead zones.

---

## 4. Web-GIS Command Center Integration

The mobile/web client dashboard (`mobile/src/views/DashboardView.tsx` and `mobile/src/components/gis/CommandMapView.tsx`):
- Connects to the WebSocket or SSE alert stream.
- When an `OUTBREAK_ALERT` frame arrives:
  - Updates the active outbreak counter ticker.
  - Automatically centers map on the newly declared epicenter.
  - Displays the 1km, 5km, and 10km biosecurity buffer layers on MapLibre / Deck.gl.
  - Triggers the auditory biohazard warning chime.
