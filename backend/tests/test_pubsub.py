import asyncio
import json
import pytest
from httpx import AsyncClient
from starlette.testclient import TestClient
from app.main import app
from app.services.pubsub_service import pubsub_service, OutbreakAlertEvent


@pytest.mark.asyncio
async def test_pubsub_service_direct_publishing():
    """Verify PubSubService publishes outbreak event and tracks in-memory history."""
    event = OutbreakAlertEvent(
        cluster_id="CLS-TEST-PUB-01",
        syndrome_code="SARF",
        suspected_disease="Anthrax (Bacillus anthracis)",
        epicenter_lat=19.3912,
        epicenter_lon=74.6521,
        village_name="Ashwi Budruk",
        district_name="Ahmednagar",
        movement_freeze_radius_km=1.0,
        ring_vaccination_radius_km=5.0,
        surveillance_radius_km=10.0,
        alert_level="CRITICAL",
        containment_directive="Immediate Carcass Lockdown & Movement Freeze Citing PCICDA 2009",
    )

    published = await pubsub_service.publish_outbreak_event(event)
    assert published["cluster_id"] == "CLS-TEST-PUB-01"
    assert published["syndrome_code"] == "SARF"
    assert published["alert_level"] == "CRITICAL"

    recent = pubsub_service.get_recent_events()
    assert any(e["cluster_id"] == "CLS-TEST-PUB-01" for e in recent)


@pytest.mark.asyncio
async def test_sse_stream_generator():
    """Verify pubsub_service.sse_stream() produces properly formatted SSE connect and alert chunks."""
    await pubsub_service.publish_outbreak_event(
        OutbreakAlertEvent(
            cluster_id="CLS-SSE-01",
            syndrome_code="HSDS",
            suspected_disease="Hemorrhagic Septicemia",
            epicenter_lat=19.45,
            epicenter_lon=74.70,
        )
    )

    gen = pubsub_service.sse_stream(max_events=2)
    connect_frame = await anext(gen)
    assert "event: connect" in connect_frame
    assert "pashu-suraksha-live-alerts" in connect_frame

    alert_frame = await anext(gen)
    assert "event: outbreak_alert" in alert_frame
    assert "cluster_id" in alert_frame


@pytest.mark.asyncio
async def test_sse_endpoint_headers(client: AsyncClient):
    """Verify /api/v1/clusters/stream returns 200 with text/event-stream content-type."""
    response = await client.get("/api/v1/clusters/stream?limit=1")
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
    assert "event: connect" in response.text


def test_websocket_endpoint():
    """Verify /api/v1/clusters/ws accepts connection, delivers handshake, and responds to ping."""
    with TestClient(app) as sync_client:
        with sync_client.websocket_connect("/api/v1/clusters/ws") as websocket:
            # Receive initial connection message
            initial_msg = websocket.receive_json()
            assert initial_msg["type"] == "CONNECTION_ESTABLISHED"
            assert "recent_events" in initial_msg

            # Send ping
            websocket.send_text("ping")
            reply = websocket.receive_text()
            assert reply == "pong"


@pytest.mark.asyncio
async def test_telemetry_sync_triggers_live_outbreak_event(client: AsyncClient):
    """Verify syncing a high-mortality incident triggers SaTScan outbreak declaration and pubsub event."""
    initial_event_count = len(pubsub_service.get_recent_events())

    payload = {
        "sync_id": f"SYNC-OUTBREAK-{asyncio.get_event_loop().time()}",
        "report_id": f"REP-EMERGENCY-{asyncio.get_event_loop().time()}",
        "syndrome_code": "SARF",
        "species": "Bovine",
        "animal_count_affected": 5,
        "mortality_count": 3,  # Triggers immediate OUTBREAK_DECLARED
        "latitude": 19.3912,
        "longitude": 74.6521,
        "lgd_code": 558301,
        "village_name": "Ashwi Budruk",
        "district_name": "Ahmednagar",
        "priority": 3,
    }

    response = await client.post("/api/v1/sync/telemetry", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["containment_triggered"] is True

    # Verify a new event was appended to pubsub history
    recent_events = pubsub_service.get_recent_events()
    assert len(recent_events) >= initial_event_count + 1
    latest_event = recent_events[-1]
    assert latest_event["syndrome_code"] == "SARF"
    assert latest_event["alert_level"] == "CRITICAL"
