import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.services.lab_service import compute_cold_chain_sla, lab_service


@pytest.fixture(autouse=True)
def reset_lab_service():
    lab_service.clear_store()
    yield
    lab_service.clear_store()


def test_cold_chain_sla_computation():
    now = datetime(2026, 9, 4, 12, 0, 0, tzinfo=timezone.utc)

    # 1. 10 hours elapsed -> 38 hours remaining, optimal
    collected_10h_ago = now - timedelta(hours=10)
    metrics_optimal = compute_cold_chain_sla(collected_10h_ago, current_temp_c=4.0, now=now)
    assert metrics_optimal.elapsed_hours == 10.0
    assert metrics_optimal.remaining_hours == 38.0
    assert metrics_optimal.cold_chain_status == "OPTIMAL"
    assert metrics_optimal.is_breached is False

    # 2. 38 hours elapsed -> 10 hours remaining, warning
    collected_38h_ago = now - timedelta(hours=38)
    metrics_warning = compute_cold_chain_sla(collected_38h_ago, current_temp_c=4.0, now=now)
    assert metrics_warning.elapsed_hours == 38.0
    assert metrics_warning.remaining_hours == 10.0
    assert metrics_warning.cold_chain_status == "WARNING"
    assert metrics_warning.is_breached is False

    # 3. 50 hours elapsed -> 0 hours remaining, breached
    collected_50h_ago = now - timedelta(hours=50)
    metrics_time_breached = compute_cold_chain_sla(collected_50h_ago, current_temp_c=4.0, now=now)
    assert metrics_time_breached.elapsed_hours == 50.0
    assert metrics_time_breached.remaining_hours == 0.0
    assert metrics_time_breached.cold_chain_status == "BREACHED"
    assert metrics_time_breached.is_breached is True

    # 4. Temperature > 12°C -> breached immediately
    metrics_temp_breached = compute_cold_chain_sla(collected_10h_ago, current_temp_c=13.5, now=now)
    assert metrics_temp_breached.cold_chain_status == "BREACHED"
    assert metrics_temp_breached.is_breached is True


def test_api_create_requisition_success():
    client = TestClient(app)
    payload = {
        "animal_tag_id": "100234567890",
        "incident_id": "INC-TEST-01",
        "cluster_id": "CL-SYN_VESICULAR-558301",
        "vet_id": "VET-MAH-4821",
        "village_name": "Ashwi Budruk",
        "district_name": "Ahmednagar",
        "sample_type": "Vesicular Swab",
        "suspected_disease": "FMD Suspect",
        "preservative": "50% Glycerol-PBS (pH 7.4-7.6)",
        "destination_lab": "District Diagnostic Lab (DDL), Pune",
        "initial_temp_c": 4.0,
    }

    resp = client.post("/api/v1/labs/requisitions", json=payload)
    assert resp.status_code == 201
    data = resp.json()

    assert data["requisition_id"].startswith("LRF-")
    assert data["animal_tag_id"] == "100234567890"
    assert data["status"] == "IN_TRANSIT"
    assert data["qr_payload"] is not None
    assert "100234567890" in data["qr_payload"]
    assert "FMD Suspect" in data["qr_payload"]
    assert data["cold_chain"]["cold_chain_status"] == "OPTIMAL"


def _create_test_requisition(client: TestClient) -> str:
    payload = {
        "animal_tag_id": "100234567890",
        "incident_id": "INC-TEST-01",
        "cluster_id": "CL-SYN_VESICULAR-558301",
        "vet_id": "VET-MAH-4821",
        "village_name": "Rahuri",
        "district_name": "Ahmednagar",
        "sample_type": "Vesicular Swab",
        "suspected_disease": "FMD Suspect",
        "preservative": "50% Glycerol-PBS (pH 7.4-7.6)",
        "destination_lab": "District Diagnostic Lab (DDL), Pune",
        "initial_temp_c": 4.0,
    }
    resp = client.post("/api/v1/labs/requisitions", json=payload)
    assert resp.status_code == 201
    return resp.json()["requisition_id"]


def test_api_get_requisition():
    client = TestClient(app)
    req_id = _create_test_requisition(client)
    resp = client.get(f"/api/v1/labs/requisitions/{req_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["requisition_id"] == req_id
    assert "cold_chain" in data
    assert data["cold_chain"]["remaining_hours"] > 0


def test_api_log_temperature_checkpoint():
    client = TestClient(app)
    req_id = _create_test_requisition(client)

    # 1. Log normal temperature
    temp_payload = {
        "temperature_c": 5.2,
        "location_checkpoint": "Rahuri Toll Plaza",
        "logged_by": "Courier-Ramesh",
    }
    resp1 = client.post(f"/api/v1/labs/requisitions/{req_id}/temperature", json=temp_payload)
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["transit_temp_c"] == 5.2
    assert data1["cold_chain"]["cold_chain_status"] == "OPTIMAL"
    assert data1["temp_breached"] is False

    # 2. Log breached temperature (> 12°C)
    breach_payload = {
        "temperature_c": 14.8,
        "location_checkpoint": "Wagholi Transit Hub",
        "logged_by": "Courier-Ramesh",
    }
    resp2 = client.post(f"/api/v1/labs/requisitions/{req_id}/temperature", json=breach_payload)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["transit_temp_c"] == 14.8
    assert data2["cold_chain"]["cold_chain_status"] == "BREACHED"
    assert data2["temp_breached"] is True


def test_api_submit_lab_result_positive_escalation():
    client = TestClient(app)
    req_id = _create_test_requisition(client)
    result_payload = {
        "test_type": "RT-PCR",
        "test_result": "POSITIVE",
        "pathologist_id": "PATH-DDL-102",
        "notes": "Strong amplification of FMDV VP1 serotype O detected (Ct: 21.4)",
    }

    resp = client.post(f"/api/v1/labs/requisitions/{req_id}/result", json=result_payload)
    assert resp.status_code == 200
    data = resp.json()

    # Must escalate status to LAB_CONFIRMED
    assert data["status"] == "LAB_CONFIRMED"
    assert data["test_type"] == "RT-PCR"
    assert data["test_result"] == "POSITIVE"
    assert data["confirmed_at"] is not None


def test_api_submit_lab_result_negative():
    client = TestClient(app)
    req_id = _create_test_requisition(client)
    result_payload = {
        "test_type": "Sandwich ELISA",
        "test_result": "NEGATIVE",
        "pathologist_id": "PATH-DDL-102",
        "notes": "No viral antigen detected",
    }

    resp = client.post(f"/api/v1/labs/requisitions/{req_id}/result", json=result_payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "NEGATIVE"
    assert data["test_type"] == "Sandwich ELISA"


def test_api_requisition_not_found():
    client = TestClient(app)
    resp = client.get("/api/v1/labs/requisitions/NON_EXISTENT_ID")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()
