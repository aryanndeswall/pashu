import base64
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.incident import IncidentMedia
from app.services.storage_service import LocalStorageService, get_storage_service


@pytest.mark.asyncio
async def test_local_storage_service_direct():
    """Verify LocalStorageService persists file and constructs canonical gs:// and HTTPS URIs."""
    service = LocalStorageService()
    test_bytes = b"RIFF\x00\x00\x00\x00WEBPVP8 \x00\x00\x00\x00"  # mock WebP header
    media_id = "MED-TEST-001"
    sync_id = "SYNC-TEST-001"

    result = await service.upload_media(
        media_id=media_id,
        sync_id=sync_id,
        data_bytes=test_bytes,
        media_type="PHOTO_WEBP",
        content_type="image/webp",
    )

    assert result.media_id == media_id
    assert result.sync_id == sync_id
    assert result.gs_uri.startswith("gs://pashu-suraksha-assets/")
    assert result.gs_uri.endswith(f"{media_id}.webp")
    assert "/api/v1/sync/media/stream/" in result.https_url
    assert service.get_local_path(media_id) is not None

    # Test presigned upload URL generation
    upload_url = service.generate_presigned_upload_url(media_id=media_id, sync_id=sync_id)
    assert media_id in upload_url
    assert sync_id in upload_url

    # Test signed download URL
    download_url = service.get_signed_download_url(media_id=media_id, sync_id=sync_id)
    assert f"/api/v1/sync/media/stream/{media_id}" in download_url


@pytest.mark.asyncio
async def test_sync_media_with_binary_payload(client: AsyncClient, db_session):
    """Verify /api/v1/sync/media endpoint ingests base64 media, stores asset, and persists IncidentMedia record."""
    sample_webp = b"RIFFtestWEBPVP8 sample lesion photo binary bytes"
    b64_data = base64.b64encode(sample_webp).decode("utf-8")
    media_id = "MED-PHOTO-8899"
    sync_id = "SYNC-REP-9988"

    payload = {
        "media_id": media_id,
        "sync_id": sync_id,
        "report_id": "REP-2026-001",
        "media_type": "PHOTO_WEBP",
        "media_data": f"data:image/webp;base64,{b64_data}",
        "content_type": "image/webp",
        "file_size_kb": 1,
    }

    response = await client.post("/api/v1/sync/media", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["media_id"] == media_id
    assert data["sync_id"] == sync_id
    assert "gs://" in data["gs_uri"]
    assert data["https_url"] is not None

    # Verify database persistence in incident_media
    stmt = select(IncidentMedia).where(IncidentMedia.media_id == media_id)
    res = await db_session.execute(stmt)
    record = res.scalar_one_or_none()
    assert record is not None
    assert record.sync_id == sync_id
    assert record.media_type == "PHOTO_WEBP"
    assert record.gs_uri == data["gs_uri"]


@pytest.mark.asyncio
async def test_sync_media_metadata_only(client: AsyncClient):
    """Verify /api/v1/sync/media endpoint handles metadata-only sync gracefully."""
    media_id = "MED-AUDIO-1122"
    sync_id = "SYNC-REP-1122"

    payload = {
        "media_id": media_id,
        "sync_id": sync_id,
        "report_id": "REP-2026-002",
        "media_type": "AUDIO_NOTE",
        "file_size_kb": 65,
    }

    response = await client.post("/api/v1/sync/media", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert "gs://" in data["gs_uri"]
    assert data["https_url"] is not None


@pytest.mark.asyncio
async def test_generate_presigned_upload_url(client: AsyncClient):
    """Verify /api/v1/sync/media/signed-url generates a valid PUT upload URL."""
    payload = {
        "media_id": "MED-DIRECT-3344",
        "sync_id": "SYNC-REP-3344",
        "media_type": "PHOTO_WEBP",
        "content_type": "image/webp",
        "expires_minutes": 15,
    }

    response = await client.post("/api/v1/sync/media/signed-url", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["media_id"] == "MED-DIRECT-3344"
    assert data["sync_id"] == "SYNC-REP-3344"
    assert data["method"] == "PUT"
    assert data["upload_url"] is not None
    assert data["gs_uri"].startswith("gs://")


@pytest.mark.asyncio
async def test_stream_media_endpoint(client: AsyncClient):
    """Verify /api/v1/sync/media/stream/{media_id} streams locally stored media file."""
    # First upload a media file
    sample_content = b"TEST_AUDIO_WAV_CHUNK"
    b64_data = base64.b64encode(sample_content).decode("utf-8")
    media_id = "MED-STREAM-5566"
    sync_id = "SYNC-REP-5566"

    upload_resp = await client.post(
        "/api/v1/sync/media",
        json={
            "media_id": media_id,
            "sync_id": sync_id,
            "media_type": "AUDIO_NOTE",
            "media_data": b64_data,
            "content_type": "audio/webm",
        },
    )
    assert upload_resp.status_code == 200

    # Now fetch it via streaming endpoint
    stream_resp = await client.get(f"/api/v1/sync/media/stream/{media_id}")
    assert stream_resp.status_code in [200, 307]
    if stream_resp.status_code == 200:
        assert stream_resp.content == sample_content


@pytest.mark.asyncio
async def test_triage_with_photo_uri(client: AsyncClient):
    """Verify multimodal triage endpoint accepts gs:// photo_uri without raising exceptions."""
    payload = {
        "species": "Bovine",
        "secondary_symptoms": ["blisters in mouth", "hypersalivation"],
        "photo_uri": "gs://pashu-suraksha-assets/incidents/SYNC-123/MED-001.webp",
        "audio_transcript": "तोंडात फोड आले आहेत आणि लाळ गळत आहे",
    }

    response = await client.post("/api/v1/triage/multimodal", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["syndrome_code"] == "VSS"
    assert data["clinical_confidence"] > 0.7
