# ponytail: comprehensive test suite for ClinicalCase doctor-farmer cross-connection endpoints
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_case_dpdp_hashing_and_defaults(client: AsyncClient):
    payload = {
        "report_id": "REP-2026-TEST01",
        "farmer_name": "Ramesh Patil",
        "farmer_phone": "+91 98220 00412",
        "animal_tag": "100293847561",
        "species": "Gir Cow",
        "breed": "Gir",
        "syndrome_code": "VSS",
        "syndrome_name": "Vesicular Stomatitis / Foot-and-Mouth Disease",
        "symptoms": "Salivation, oral blisters, lameness",
        "urgency": "HIGH",
        "village_name": "Ashwi Budruk",
        "block_name": "Rahuri",
        "district_name": "Ahmednagar",
    }

    response = await client.post("/api/v1/cases", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["id"].startswith("CASE-")
    assert data["farmer_name"] == "Ramesh Patil"
    # Verify DPDP Act 2023 phone masking
    assert "9822" in data["farmer_phone_masked"]
    assert "X-XX" in data["farmer_phone_masked"]
    # Default jurisdiction doctor assignment
    assert data["doctor_id"] == "usr_vet_02"
    assert data["doctor_name"] == "Dr. Ananya Deshmukh"
    assert data["status"] == "AWAITING_DOCTOR"
    assert data["urgency"] == "HIGH"
    # Generated interim first-aid advice
    assert data["interim_advice"] is not None
    assert "पोटॅशियम" in data["interim_advice"] or "विलगीकरण" in data["interim_advice"]


@pytest.mark.asyncio
async def test_list_cases_with_filters(client: AsyncClient):
    # Create a test case
    payload = {
        "report_id": "REP-2026-TEST02",
        "farmer_name": "Suresh Shinde",
        "farmer_phone": "9423000819",
        "animal_tag": "100293847562",
        "species": "Murrah Buffalo",
        "syndrome_code": "HSDS",
        "syndrome_name": "Haemorrhagic Septicaemia",
        "block_name": "Rahuri",
    }
    create_res = await client.post("/api/v1/cases", json=payload)
    assert create_res.status_code == 201
    created_case = create_res.json()

    # Query with doctor_id filter
    list_res = await client.get("/api/v1/cases?doctor_id=usr_vet_02")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    assert any(item["id"] == created_case["id"] for item in list_data["items"])

    # Query with block filter
    block_res = await client.get("/api/v1/cases?block=Rahuri")
    assert block_res.status_code == 200
    block_data = block_res.json()
    assert any(item["id"] == created_case["id"] for item in block_data["items"])

    # Query with status filter
    status_res = await client.get("/api/v1/cases?status=AWAITING_DOCTOR")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert any(item["id"] == created_case["id"] for item in status_data["items"])


@pytest.mark.asyncio
async def test_get_case_by_id_and_not_found(client: AsyncClient):
    # Create case
    payload = {
        "farmer_name": "Anil Kadam",
        "farmer_phone": "9158000001",
        "animal_tag": "100293847563",
        "species": "Cow",
        "syndrome_code": "NSLS",
        "syndrome_name": "Lumpy Skin Disease",
    }
    create_res = await client.post("/api/v1/cases", json=payload)
    assert create_res.status_code == 201
    case_id = create_res.json()["id"]

    # Retrieve existing
    get_res = await client.get(f"/api/v1/cases/{case_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == case_id
    assert get_res.json()["syndrome_code"] == "NSLS"

    # Not found
    not_found = await client.get("/api/v1/cases/CASE-NONEXISTENT")
    assert not_found.status_code == 404


@pytest.mark.asyncio
async def test_doctor_update_case_prescription_and_eta(client: AsyncClient):
    # Create case
    payload = {
        "farmer_name": "Govind Jadhav",
        "farmer_phone": "9822112233",
        "animal_tag": "100293847564",
        "species": "Crossbred Jersey",
        "syndrome_code": "VSS",
        "syndrome_name": "Foot-and-Mouth Disease",
    }
    create_res = await client.post("/api/v1/cases", json=payload)
    assert create_res.status_code == 201
    case_id = create_res.json()["id"]

    # Doctor updates case with prescription & visit ETA
    update_payload = {
        "status": "VISIT_SCHEDULED",
        "doctor_notes": "Clinical examination confirmed moderate oral ulcers. Administered NSAID.",
        "prescription": "Meloxicam + Paracetamol 100mg bolus BID x 3 days; KMnO4 rinse BID",
        "visit_eta": "Today at 04:30 PM",
    }
    patch_res = await client.patch(f"/api/v1/cases/{case_id}", json=update_payload)
    assert patch_res.status_code == 200
    updated = patch_res.json()

    assert updated["status"] == "VISIT_SCHEDULED"
    assert "Meloxicam" in updated["prescription"]
    assert updated["visit_eta"] == "Today at 04:30 PM"
    assert "Clinical examination" in updated["doctor_notes"]


@pytest.mark.asyncio
async def test_record_tele_consultation_session(client: AsyncClient):
    # Create case
    payload = {
        "farmer_name": "Kishor Thorat",
        "farmer_phone": "9822998877",
        "animal_tag": "100293847565",
        "species": "Buffalo",
        "syndrome_code": "BRDS",
        "syndrome_name": "Bovine Respiratory Disease",
    }
    create_res = await client.post("/api/v1/cases", json=payload)
    assert create_res.status_code == 201
    case_id = create_res.json()["id"]
    assert create_res.json()["status"] == "AWAITING_DOCTOR"

    # Record tele-consultation
    consult_payload = {
        "channel": "VIDEO",
        "notes": "Farmer inspected oral cavity via live camera; advised hydration and isolation.",
    }
    consult_res = await client.post(f"/api/v1/cases/{case_id}/consult", json=consult_payload)
    assert consult_res.status_code == 200
    result = consult_res.json()
    assert result["success"] is True
    assert result["channel"] == "VIDEO"

    # Verify case status transitioned to IN_CONSULTATION
    get_res = await client.get(f"/api/v1/cases/{case_id}")
    assert get_res.status_code == 200
    case_obj = get_res.json()
    assert case_obj["status"] == "IN_CONSULTATION"
    assert "[Tele-Consult VIDEO]" in case_obj["doctor_notes"]
