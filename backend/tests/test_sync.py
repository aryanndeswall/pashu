from datetime import datetime, timezone
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_sync_status(client: AsyncClient):
    response = await client.get("/api/v1/sync/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["service"] == "pashu-suraksha-sync-gateway"
    assert "total_incidents_ingested" in data


@pytest.mark.asyncio
async def test_sync_telemetry_success(client: AsyncClient):
    payload = {
        "sync_id": "SYNC-TEST-001",
        "report_id": "REP-TEST-001",
        "syndrome_code": "VSS",
        "syndrome_name": "Vesicular Stomatitis Syndrome",
        "secondary_symptoms": ["Salivation", "Foot Lesions"],
        "latitude": 19.3912,
        "longitude": 74.6521,
        "lgd_code": 558301,
        "village_name": "Ashwi Budruk",
        "district_name": "Ahmednagar",
        "pashu_aadhaar": "100293847561",
        "species": "Bovine",
        "animal_count_affected": 2,
        "mortality_count": 0,
        "reported_at": datetime.now(timezone.utc).isoformat(),
        "has_photo": True,
        "has_audio": False,
        "priority": 2,
    }

    response = await client.post("/api/v1/sync/telemetry", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sync_id"] == "SYNC-TEST-001"
    assert data["report_id"] == "REP-TEST-001"
    assert data["status"] == "COMPLETED"
    assert "receipt_id" in data
    assert data["receipt_id"].startswith("RCPT-")
    assert data["incident_id"] is not None
    assert "cluster_evaluation" in data
    assert data["cluster_evaluation"]["syndrome_code"] == "VSS"


@pytest.mark.asyncio
async def test_sync_media_success(client: AsyncClient):
    payload = {
        "media_id": "MED-P-12345",
        "sync_id": "SYNC-TEST-001",
        "media_type": "PHOTO_WEBP",
        "media_data": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2wAA",
        "file_size_kb": 120,
    }

    response = await client.post("/api/v1/sync/media", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["media_id"] == "MED-P-12345"
    assert data["sync_id"] == "SYNC-TEST-001"
    assert data["status"] == "COMPLETED"
    assert "stored_uri" in data
