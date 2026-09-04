from typing import Dict, Any
from fastapi import APIRouter, status
from app.schemas.triage import TriageRequest, TriageResponse, SYNDROME_METADATA
from app.services.triage_service import triage_service

router = APIRouter()


@router.post(
    "/multimodal",
    response_model=TriageResponse,
    status_code=status.HTTP_200_OK,
    summary="Multimodal AI Triage (Gemini Flash & Rule Zero)",
)
async def triage_multimodal(payload: TriageRequest):
    """
    Ingest lesion photo (WebP/base64), Indic vernacular voice transcripts, species,
    and observed symptoms to produce structured clinical triage with localized biosecurity directives.
    """
    return await triage_service.triage(payload)


@router.get(
    "/syndromes",
    response_model=Dict[str, Any],
    summary="List 8 Standard Syndromic Categories and Metadata",
)
async def get_syndromic_metadata():
    """
    Return dictionary of 8 standardized national syndromic categories with Marathi names and suspected diseases.
    """
    return SYNDROME_METADATA
