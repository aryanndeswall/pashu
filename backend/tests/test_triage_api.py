import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_api_get_syndromic_metadata(client: AsyncClient):
    response = await client.get("/api/v1/triage/syndromes")
    assert response.status_code == 200
    data = response.json()
    assert "VSS" in data
    assert "NSLS" in data
    assert "SARF" in data
    assert len(data) == 8
    assert data["VSS"]["disease"] == "Foot and Mouth Disease (FMD)"
    assert data["SARF"]["mr"] == "काळपुळी (पटकी / ॲन्थ्रॅक्स)"


@pytest.mark.asyncio
async def test_api_multimodal_triage_fmd(client: AsyncClient):
    payload = {
        "species": "Bovine (Cow)",
        "audio_transcript": "गाय तोंडात फोड आले आहेत आणि पांढरी लाळ गळत आहे, खुर पिकले आहेत",
        "secondary_symptoms": ["Salivation", "Blisters"],
        "village_lgd_code": 558301,
    }
    response = await client.post("/api/v1/triage/multimodal", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["syndrome_code"] == "VSS"
    assert data["clinical_confidence"] >= 0.90
    assert "पोटॅशियम परमँगनेट" in data["immediate_advisory_marathi"]
    assert data["inference_time_ms"] >= 0


@pytest.mark.asyncio
async def test_api_multimodal_triage_anthrax_rule_zero(client: AsyncClient):
    payload = {
        "species": "Buffalo",
        "audio_transcript": "म्हैस अचानक मरण पावली आणि नाकातून काळे रक्त वाहत आहे",
        "secondary_symptoms": ["अचानक मृत्यू", "unclotted blood"],
        "village_lgd_code": 558301,
    }
    response = await client.post("/api/v1/triage/multimodal", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["syndrome_code"] == "SARF"
    assert data["biohazard_alert"] == "CRITICAL_ANTHRAX_LOCK"
    assert data["clinical_confidence"] >= 0.95
    assert "DO NOT OPEN CARCASS" in data["immediate_advisory_marathi"] or "कापू नका" in data["immediate_advisory_marathi"]
    assert "पोस्टमार्टम न करें" in data["immediate_advisory_hindi"]


@pytest.mark.asyncio
async def test_api_multimodal_triage_lsd_skin_nodules(client: AsyncClient):
    payload = {
        "species": "Cow",
        "audio_transcript": "जनावराच्या अंगावर सर्वत्र कडक गाठी आल्या आहेत",
        "secondary_symptoms": ["त्वचेवर गाठी"],
    }
    response = await client.post("/api/v1/triage/multimodal", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["syndrome_code"] == "NSLS"
    assert "लंपी" in data["suspected_disease"] or "LSD" in data["suspected_disease"]
    assert data["biohazard_alert"] == "WARNING"


@pytest.mark.asyncio
async def test_api_multimodal_triage_empty_payload(client: AsyncClient):
    response = await client.post("/api/v1/triage/multimodal", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["syndrome_code"] in ["VSS", "NSLS", "HSDS", "AROS", "CMSS", "SARF", "HES", "NAS"]
    assert data["clinical_confidence"] > 0.5
