import pytest
from httpx import AsyncClient
from app.services.notification_service import notification_service
from app.api.v1.clusters import clear_cluster_store


@pytest.fixture(autouse=True)
def clean_state():
    clear_cluster_store()
    notification_service.clear_dispatched_alerts()
    yield
    clear_cluster_store()
    notification_service.clear_dispatched_alerts()


def test_statutory_sms_generation_pcicda():
    """Verify statutory SMS texts cite PCICDA 2009 Sections 6, 10, and 20 in English and Marathi."""
    sms = notification_service.generate_statutory_sms(
        village="Ashwi Budruk",
        district="Ahmednagar",
        syndrome_code="SARF",
        disease_name="Anthrax / काळपुळी",
        radius_km=1.0,
    )

    assert "en" in sms
    assert "mr" in sms

    en_text = sms["en"]
    assert "PCICDA 2009 Sec 6, 10, 20" in en_text
    assert "Anthrax / काळपुळी" in en_text
    assert "Ashwi Budruk" in en_text
    assert "Ahmednagar" in en_text
    assert "1.0 km" in en_text
    assert "Section 20" in en_text

    mr_text = sms["mr"]
    assert "PCICDA 2009 कलम ६, १०, २०" in mr_text
    assert "Ashwi Budruk" in mr_text
    assert "हालचाल बंदी" in mr_text


@pytest.mark.asyncio
async def test_fcm_alert_dispatch():
    """Verify dispatch_fcm_alert logs message payload and returns broadcast confirmation."""
    res = await notification_service.dispatch_fcm_alert(
        topic="district_ahmednagar",
        title="CRITICAL BIOSECURITY NOTICE",
        body="Movement freeze initiated in Sangamner block",
        data={"cluster_id": "CLS-999", "action": "BIOSECURITY_CONTAINMENT"},
    )

    assert res["status"] in ("DISPATCHED", "SIMULATED")
    assert res["topic"] == "district_ahmednagar"
    assert res["title"] == "CRITICAL BIOSECURITY NOTICE"
    assert res["data"]["cluster_id"] == "CLS-999"

    dispatched = notification_service.get_dispatched_alerts()
    assert len(dispatched) >= 1
    assert dispatched[-1]["broadcast_id"] == res["broadcast_id"]


@pytest.mark.asyncio
async def test_broadcast_containment_directive():
    """Verify full broadcast containment workflow dispatches FCM and formats statutory SMS."""
    result = await notification_service.broadcast_containment_directive(
        cluster_id="CLS-DIR-001",
        syndrome_code="VSS",
        village_name="Loni",
        district_name="Ahmednagar",
        epicenter_lat=19.49,
        epicenter_lon=74.45,
        movement_freeze_radius_km=1.0,
        ring_vaccination_radius_km=5.0,
        surveillance_radius_km=10.0,
        alert_level="CRITICAL",
    )

    assert result["status"] == "SUCCESS"
    assert result["cluster_id"] == "CLS-DIR-001"
    assert result["fcm_topic"] == "district_ahmednagar"
    assert "PCICDA 2009" in result["statutory_sms_en"]
    assert "कलम ६, १०, २०" in result["statutory_sms_mr"]


@pytest.mark.asyncio
async def test_broadcast_api_endpoint(client: AsyncClient):
    """Verify POST /api/v1/clusters/broadcast returns 200 and dispatches biosecurity directive."""
    payload = {
        "cluster_id": "CLS-API-BC-01",
        "syndrome_code": "NSLS",
        "village_name": "Rahata",
        "district_name": "Ahmednagar",
        "epicenter_lat": 19.52,
        "epicenter_lon": 74.48,
        "movement_freeze_radius_km": 1.0,
        "ring_vaccination_radius_km": 5.0,
        "surveillance_radius_km": 10.0,
        "alert_level": "CRITICAL",
        "target_topic": "district_ahmednagar_emergency",
    }

    response = await client.post("/api/v1/clusters/broadcast", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "SUCCESS"
    assert data["cluster_id"] == "CLS-API-BC-01"
    assert data["fcm_topic"] == "district_ahmednagar_emergency"
    assert "PCICDA 2009" in data["statutory_sms_en"]
    assert "broadcast_id" in data


@pytest.mark.asyncio
async def test_evaluate_incident_triggers_notification(client: AsyncClient):
    """Verify that posting a high-mortality incident to /evaluate automatically triggers FCM broadcast."""
    incident_payload = {
        "incident": {
            "report_id": "REP-EVAL-NOTIF-01",
            "syndrome_code": "SARF",
            "species": "Bovine",
            "animal_count_affected": 8,
            "mortality_count": 4,  # Triggers immediate OUTBREAK_DECLARED
            "latitude": 19.3912,
            "longitude": 74.6521,
            "lgd_code": 558301,
            "village_name": "Ashwi Budruk",
        }
    }

    response = await client.post("/api/v1/clusters/evaluate", json=incident_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "OUTBREAK_DECLARED"

    # Verify notification service received the containment alert
    dispatched = notification_service.get_dispatched_alerts()
    assert len(dispatched) >= 1
    assert any("Anthrax" in d["title"] or "Anthrax" in d["body"] or "SARF" in str(d["data"]) for d in dispatched)
