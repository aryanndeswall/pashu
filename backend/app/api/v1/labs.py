from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.lab import (
    LabRequisitionCreate,
    LabRequisitionResponse,
    TemperatureLogCreate,
    LabResultSubmit,
)
from app.services.lab_service import lab_service

router = APIRouter()


@router.post(
    "/requisitions",
    response_model=LabRequisitionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate Electronic Lab Requisition Form (e-LRF) with QR Payload",
)
async def create_requisition(payload: LabRequisitionCreate) -> LabRequisitionResponse:
    """
    Creates an electronic lab requisition form (e-LRF) linked to a 12-digit Pashu Aadhaar RFID ear tag.
    Generates a unique Requisition ID (LRF-YYYYMMDD-XXXX), QR barcode payload, and starts the 48-hour cold chain SLA.
    """
    return lab_service.create_requisition(payload)


@router.get(
    "/requisitions",
    response_model=List[LabRequisitionResponse],
    summary="List Diagnostic Lab Requisitions",
)
async def list_requisitions(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (IN_TRANSIT, LAB_CONFIRMED, etc.)"),
    animal_tag_id: Optional[str] = Query(None, description="Filter by 12-digit Pashu Aadhaar tag ID"),
    district_name: Optional[str] = Query(None, description="Filter by district name"),
) -> List[LabRequisitionResponse]:
    """
    Retrieves all diagnostic lab requisitions with optional filtering by status, animal tag, or district.
    """
    return lab_service.list_requisitions(
        status=status_filter,
        animal_tag_id=animal_tag_id,
        district_name=district_name,
    )


@router.get(
    "/requisitions/{requisition_id}",
    response_model=LabRequisitionResponse,
    summary="Get Detailed Requisition with Live 48-Hour Cold Chain SLA",
)
async def get_requisition(requisition_id: str) -> LabRequisitionResponse:
    """
    Retrieves e-LRF details along with real-time computed cold chain transit SLA metrics.
    """
    req = lab_service.get_requisition(requisition_id)
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requisition '{requisition_id}' not found",
        )
    return req


@router.post(
    "/requisitions/{requisition_id}/temperature",
    response_model=LabRequisitionResponse,
    summary="Log Specimen Transit Temperature Checkpoint",
)
async def log_temperature(
    requisition_id: str,
    payload: TemperatureLogCreate,
) -> LabRequisitionResponse:
    """
    Logs temperature checkpoint during sample transport. Flags cold-chain breaches if temperature > 12°C.
    """
    req = lab_service.log_temperature(requisition_id, payload)
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requisition '{requisition_id}' not found",
        )
    return req


@router.post(
    "/requisitions/{requisition_id}/result",
    response_model=LabRequisitionResponse,
    summary="Record Laboratory Test Result (RT-PCR / ELISA) & Escalate Case",
)
async def submit_lab_result(
    requisition_id: str,
    payload: LabResultSubmit,
) -> LabRequisitionResponse:
    """
    Submits official laboratory assay result. If test_result is POSITIVE, escalates case status
    from IN_TRANSIT/TESTING to LAB_CONFIRMED.
    """
    req = lab_service.submit_result(requisition_id, payload)
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requisition '{requisition_id}' not found",
        )
    return req
