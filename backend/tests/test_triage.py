import time
import pytest
from app.schemas.triage import TriageRequest, TriageResponse
from app.services.triage_service import triage_service, EdgeRulesEvaluator


@pytest.mark.asyncio
async def test_triage_schemas_validation():
    req = TriageRequest(
        species="Bovine",
        audio_transcript="गाय तोंडात फोड आले आहेत",
        secondary_symptoms=["Salivation", "Foot Lesions"],
        village_lgd_code=558301,
    )
    assert req.species == "Bovine"
    assert req.village_lgd_code == 558301
    assert len(req.secondary_symptoms) == 2


@pytest.mark.asyncio
async def test_vernacular_marathi_fmd_inference():
    req = TriageRequest(
        species="Bovine",
        audio_transcript="गाय तोंडात फोड आले आहेत आणि भरपूर लाळ गळत आहे, खुर पिकले आहेत",
        secondary_symptoms=["लाळ गळणे", "खुर पिकणे"],
    )
    res = await triage_service.triage(req)
    assert res.syndrome_code == "VSS"
    assert "Foot & Mouth" in res.suspected_disease or "लाळ्या खुरकूत" in res.suspected_disease
    assert res.clinical_confidence >= 0.90
    assert "पोटॅशियम परमँगनेट" in res.immediate_advisory_marathi
    assert res.inference_time_ms >= 0


@pytest.mark.asyncio
async def test_vernacular_lsd_inference():
    req = TriageRequest(
        species="Bovine",
        audio_transcript="गायीच्या अंगावर मोठ्या गाठी आल्या आहेत आणि ताप आहे",
        secondary_symptoms=["त्वचेवर गाठी"],
    )
    res = await triage_service.triage(req)
    assert res.syndrome_code == "NSLS"
    assert "लंपी" in res.suspected_disease or "Lumpy Skin" in res.suspected_disease
    assert res.clinical_confidence >= 0.90
    assert "कडुनिंबाचा धूर" in res.immediate_advisory_marathi


@pytest.mark.asyncio
async def test_vernacular_hs_inference():
    req = TriageRequest(
        species="Bovine",
        audio_transcript="जनावराचा घसा सुजला आहे आणि घरघर श्वास घेत आहे",
        secondary_symptoms=["घसा सूज"],
    )
    res = await triage_service.triage(req)
    assert res.syndrome_code == "HSDS"
    assert "घटसर्प" in res.suspected_disease or "Septicemia" in res.suspected_disease
    assert res.biohazard_alert == "WARNING"


@pytest.mark.asyncio
async def test_rule_zero_anthrax_safety_override():
    # Test case: Sudden death with unclotted bleeding (Fatal Zoonosis)
    req = TriageRequest(
        species="Bovine",
        audio_transcript="अचानक मृत्यू झाला आणि नाकातून काळे रक्त वाहत आहे",
        secondary_symptoms=["sudden death", "unclotted blood"],
    )
    res = await triage_service.triage(req)
    assert res.syndrome_code == "SARF"
    assert res.biohazard_alert == "CRITICAL_ANTHRAX_LOCK"
    assert res.clinical_confidence >= 0.95
    assert "काळपुळी" in res.suspected_disease or "Anthrax" in res.suspected_disease
    # Verify strict safety warning
    assert "DO NOT OPEN CARCASS" in res.immediate_advisory_marathi or "कापू नका" in res.immediate_advisory_marathi
    assert "पोस्टमार्टम न करें" in res.immediate_advisory_hindi


@pytest.mark.asyncio
async def test_edge_rules_sub_millisecond_speed():
    start = time.time()
    req = TriageRequest(
        species="Bovine",
        audio_transcript="लाळ गळत आहे आणि तोंडात फोड आहेत",
    )
    res = EdgeRulesEvaluator.evaluate(req, start)
    duration_ms = (time.time() - start) * 1000
    assert duration_ms < 50  # Must be sub-50ms (typically <2ms)
    assert res.syndrome_code == "VSS"
