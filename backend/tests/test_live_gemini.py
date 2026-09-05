import os
import json
import pytest
from unittest.mock import MagicMock
from app.config import settings
from app.schemas.triage import TriageRequest, TriageResponse
from app.services.triage_service import triage_service, GeminiTriageService


def test_gemini_config_defaults():
    """Verifies that Gemini settings default to the optimal 2.5-flash configuration."""
    assert settings.GEMINI_MODEL == "gemini-2.5-flash"
    assert settings.AI_INFERENCE_TIMEOUT_SECONDS == 3.0


@pytest.mark.asyncio
async def test_gemini_service_fallback_without_api_key():
    """Verifies that GeminiTriageService operates seamlessly in fallback mode when no key is set."""
    service = GeminiTriageService()
    # Force client to None (simulating absent or invalid key)
    service.client = None

    req = TriageRequest(
        species="Bovine",
        audio_transcript="गाय तोंडात फोड आले आहेत आणि भरपूर लाळ गळत आहे",
        secondary_symptoms=["Salivation", "Blisters"],
        village_lgd_code=558301,
    )

    response = await service.triage(req)
    assert isinstance(response, TriageResponse)
    assert response.syndrome_code == "VSS"
    assert response.clinical_confidence >= 0.90
    assert "EdgeRulesEvaluator" in response.model_used
    assert response.inference_time_ms >= 0


@pytest.mark.asyncio
async def test_gemini_mocked_live_call():
    """Verifies the live GenAI calling path, schema packing, and response parsing via mocked GenAI client."""
    service = GeminiTriageService()
    mock_client = MagicMock()

    mock_gemini_json = {
        "syndrome_code": "NSLS",
        "syndrome_name_en": "Nodular Skin Lesion Syndrome",
        "syndrome_name_marathi": "त्वचेवरील गाठींचे लक्षण (लंपी स्कीन डिसीज)",
        "suspected_disease": "Lumpy Skin Disease (LSD)",
        "clinical_confidence": 0.96,
        "biohazard_alert": "WARNING",
        "clinical_rationale": "Distinctive cutaneous nodular eruptions across body surface with pyrexia.",
        "identified_symptoms": ["त्वचेवरील गाठी (Cutaneous Nodules)", "ताप (Pyrexia)"],
        "immediate_advisory_marathi": "बाधित जनावराला तात्काळ विलगीकरणात ठेवा. कडुनिंबाचा धूर करा.",
        "immediate_advisory_hindi": "संक्रमित पशु को अलग रखें और नीम के पत्तों का धुआं करें।",
        "recommended_containment_actions": [
            "बाधित जनावरे विलगीकरण",
            "कीटक नियंत्रण (डास, गोचीड निर्मूलन)",
            "५ किमी परिघात गोटपॉक्स रिंग लसीकरण",
        ],
        "inference_time_ms": 340,
        "model_used": f"Google-Gemini-{settings.GEMINI_MODEL}",
    }

    mock_response = MagicMock()
    mock_response.text = json.dumps(mock_gemini_json)
    mock_client.models.generate_content.return_value = mock_response

    service.client = mock_client

    req = TriageRequest(
        species="Bovine",
        audio_transcript="गायीच्या अंगावर मोठ्या गाठी आल्या आहेत",
        secondary_symptoms=["Nodules", "Fever"],
        village_lgd_code=558301,
    )

    result = await service.triage(req)
    assert isinstance(result, TriageResponse)
    assert result.syndrome_code == "NSLS"
    assert result.clinical_confidence == 0.96
    assert "Google-Gemini" in result.model_used
    assert mock_client.models.generate_content.called


@pytest.mark.asyncio
async def test_gemini_live_call_when_key_set():
    """
    Live integration test executing a real Google Cloud inference call if GEMINI_API_KEY is configured.
    Skips cleanly if GEMINI_API_KEY is not set in environment or settings.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    if not api_key:
        pytest.skip("GEMINI_API_KEY not set. Skipping live Google Cloud GenAI API verification.")

    from google import genai
    test_client = genai.Client(api_key=api_key)

    service = GeminiTriageService()
    service.client = test_client

    req = TriageRequest(
        species="Bovine",
        audio_transcript="गायीच्या अंगावर मोठ्या गाठी आल्या आहेत आणि ताप आहे",
        secondary_symptoms=["Nodules", "Fever"],
        village_lgd_code=558301,
    )

    result = await service.triage(req)
    assert isinstance(result, TriageResponse)
    assert result.syndrome_code in ["NSLS", "VSS", "HSDS", "AROS", "CMSS", "SARF", "HES", "NAS"]
    assert result.clinical_confidence > 0.0
    assert result.inference_time_ms > 0
