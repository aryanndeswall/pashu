import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, List, Optional, Set
from fastapi import WebSocket
from pydantic import BaseModel, Field

from app.config import settings

logger = logging.getLogger(__name__)

REDIS_OUTBREAK_CHANNEL = "outbreaks:alerts"
REDIS_TRIAGE_CHANNEL = "cases:triage"


class OutbreakAlertEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: f"EVT-{uuid.uuid4().hex[:8].upper()}")
    event_type: str = "OUTBREAK_ALERT"
    cluster_id: str
    syndrome_code: str
    suspected_disease: str = "Contagious Animal Disease Outbreak"
    epicenter_lat: float
    epicenter_lon: float
    village_name: Optional[str] = "Ashwi Budruk"
    district_name: Optional[str] = "Ahmednagar"
    movement_freeze_radius_km: float = 1.0
    ring_vaccination_radius_km: float = 5.0
    surveillance_radius_km: float = 10.0
    alert_level: str = "EMERGENCY"
    containment_directive: str = "1 km Movement Freeze active. Halt all animal transport."
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CaseTriageEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: f"EVT-{uuid.uuid4().hex[:8].upper()}")
    event_type: str  # NEW_CASE | CASE_CLAIMED | CASE_UPDATED | PRESCRIPTION_ISSUED | CASE_RESOLVED | CONSULTATION_LOGGED
    case_id: str
    farmer_name: str
    village_name: str
    block_name: str
    district_name: str
    syndrome_name: str
    urgency: str
    status: str
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    prescription: Optional[str] = None
    doctor_notes: Optional[str] = None
    visit_eta: Optional[str] = None
    species: Optional[str] = None
    animal_tag: Optional[str] = None
    photo_url: Optional[str] = None
    latitude: float
    longitude: float
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ConnectionManager:
    """Manages active WebSockets for real-time GIS command center alerts."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info("WebSocket client connected. Total active: %d", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info("WebSocket client disconnected. Total active: %d", len(self.active_connections))

    async def broadcast(self, message: dict):
        disconnected = set()
        for conn in self.active_connections:
            try:
                await conn.send_json(message)
            except Exception as e:
                logger.warning("Error sending to WebSocket client: %s. Pruning connection.", e)
                disconnected.add(conn)

        for dead_conn in disconnected:
            self.active_connections.discard(dead_conn)


class PubSubService:
    """
    Real-time outbreak alert pub/sub and dual-transport streaming engine.
    Connects to Upstash Redis pub/sub channel and broadcasts to Web-GIS WebSockets and SSE streams.
    Provides automated in-memory fallback if Redis is unavailable.
    """

    def __init__(self):
        self.manager = ConnectionManager()
        self._redis_client = None
        self._recent_events: List[dict] = []
        self._subscribers: List[asyncio.Queue] = []
        self._triage_subscribers: List[asyncio.Queue] = []

    async def get_redis_client(self):
        if self._redis_client is None and settings.REDIS_URL:
            try:
                import redis.asyncio as aioredis
                self._redis_client = aioredis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                )
                logger.info("Connected to Redis Pub/Sub broker at %s", settings.REDIS_URL[:20] + "...")
            except Exception as e:
                logger.warning("Failed to connect to Redis Pub/Sub: %s. Using in-memory fallback.", e)
                self._redis_client = None
        return self._redis_client

    async def publish_outbreak_event(self, event: OutbreakAlertEvent) -> dict:
        """Publishes outbreak cluster alert to Redis channel, WebSockets, and SSE queues."""
        event_data = event.model_dump()

        # Cache in memory
        self._recent_events.append(event_data)
        if len(self._recent_events) > 50:
            self._recent_events.pop(0)

        # 1. Direct WebSocket Broadcast
        await self.manager.broadcast(event_data)

        # 2. Push to local SSE subscriber queues
        for queue in list(self._subscribers):
            try:
                queue.put_nowait(event_data)
            except Exception:
                pass

        # 3. Publish to Redis Pub/Sub for multi-instance scaling
        try:
            r = await self.get_redis_client()
            if r:
                await r.publish(REDIS_OUTBREAK_CHANNEL, json.dumps(event_data))
                logger.info("Published outbreak event %s to Redis channel %s", event.event_id, REDIS_OUTBREAK_CHANNEL)
        except Exception as e:
            logger.warning("Redis publish error: %s. In-memory broadcast was successful.", e)

        return event_data

    def get_recent_events(self) -> List[dict]:
        return list(self._recent_events)

    async def sse_stream(self, max_events: Optional[int] = None) -> AsyncGenerator[str, None]:
        """Asynchronous generator streaming Server-Sent Events (SSE) to connected HTTP clients."""
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.append(queue)
        events_yielded = 0

        try:
            # Send initial keepalive and recent events
            yield f"event: connect\ndata: {json.dumps({'status': 'CONNECTED', 'service': 'pashu-suraksha-live-alerts'})}\n\n"

            for ev in self._recent_events[-5:]:
                yield f"event: outbreak_alert\ndata: {json.dumps(ev)}\n\n"
                events_yielded += 1
                if max_events is not None and events_yielded >= max_events:
                    return

            while True:
                try:
                    # Wait for next event or send periodic ping every 15s
                    event_data = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"event: outbreak_alert\ndata: {json.dumps(event_data)}\n\n"
                    events_yielded += 1
                    if max_events is not None and events_yielded >= max_events:
                        return
                except asyncio.TimeoutError:
                    yield f"event: ping\ndata: {json.dumps({'time': datetime.now(timezone.utc).isoformat()})}\n\n"
        finally:
            if queue in self._subscribers:
                self._subscribers.remove(queue)

    async def publish_case_event(self, event: CaseTriageEvent) -> dict:
        """Publishes new/claimed/resolved case events to the triage channel."""
        event_data = event.model_dump()

        # Push to local SSE triage subscriber queues
        for queue in list(self._triage_subscribers):
            try:
                queue.put_nowait(event_data)
            except Exception:
                pass

        # Publish to Redis for multi-instance scaling
        try:
            r = await self.get_redis_client()
            if r:
                await r.publish(REDIS_TRIAGE_CHANNEL, json.dumps(event_data))
                logger.info("Published case event %s to Redis channel %s", event.event_id, REDIS_TRIAGE_CHANNEL)
        except Exception as e:
            logger.warning("Redis publish error for triage: %s. In-memory broadcast was successful.", e)

        return event_data

    async def case_sse_stream(self) -> AsyncGenerator[str, None]:
        """SSE stream for live triage queue updates sent to Vet screens."""
        queue: asyncio.Queue = asyncio.Queue()
        self._triage_subscribers.append(queue)

        try:
            yield f"event: connect\ndata: {json.dumps({'status': 'CONNECTED', 'service': 'pashu-triage-queue'})}\n\n"

            while True:
                try:
                    event_data = await asyncio.wait_for(queue.get(), timeout=20.0)
                    yield f"event: case_event\ndata: {json.dumps(event_data)}\n\n"
                except asyncio.TimeoutError:
                    yield f"event: ping\ndata: {json.dumps({'time': datetime.now(timezone.utc).isoformat()})}\n\n"
        finally:
            if queue in self._triage_subscribers:
                self._triage_subscribers.remove(queue)


pubsub_service = PubSubService()
