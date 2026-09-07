# Phase 14: Cloud Database, Redis Alert Pub/Sub & Push Notification Bridge - Validation Strategy

**Phase:** 14  
**Status:** Planned  
**Requirements Addressed:** `CLOUD-04`, `CLOUD-05`  

---

## 1. Automated Verification Gates

### Backend Test Suite (`pytest backend/tests/test_pubsub.py` and `test_notifications.py`)
1. **Resilient Database Engine**:
   - Verify `database.py` establishes session and commits transactions.
   - Verify fallback logic to local SQLite when cloud credentials are unconfigured or simulate connection timeout.
2. **Redis Pub/Sub & Connection Manager**:
   - Verify `PubSubService` publishes messages to `outbreaks:alerts`.
   - Verify in-memory broadcaster fallback when Redis is offline.
   - Verify WebSocket endpoint (`/api/v1/clusters/ws`) connects, receives ping/pong, and receives broadcasted outbreak alert frame.
   - Verify SSE endpoint (`/api/v1/clusters/stream`) delivers `text/event-stream` chunks.
3. **Notification Service (FCM & SMS)**:
   - Verify `NotificationService.dispatch_containment_alert()` produces valid FCM payload and statutory SMS text.
   - Verify graceful degradation when FCM is not configured (logs dispatch and returns success receipt).
4. **Trigger Integration**:
   - Verify triggering a cluster outbreak in `/api/v1/clusters/evaluate` or `/api/v1/sync/telemetry` publishes to Redis and dispatches push notifications automatically.

### Mobile Client Test Suite (`vitest src/tests/liveAlertStream.test.ts`)
1. **Live Alert Client**:
   - Verify client service connects to WebSocket/SSE stream.
   - Verify reception of live alert updates active outbreak state.
2. **Command Center Real-time Banner**:
   - Verify UI displays the incoming emergency containment directive.

---

## 2. Full Regression Verification

1. `pytest backend/tests` (all backend test suites green).
2. `npm test` in `mobile/` (all 31+ test suites green).
3. `npm run build` in `mobile/` (zero TypeScript errors).
