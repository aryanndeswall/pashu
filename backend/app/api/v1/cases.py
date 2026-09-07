# ponytail: REST endpoints for ClinicalCase doctor-farmer cross-connection
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.case import ClinicalCase
from app.schemas.case import (
    CaseCreate,
    CaseUpdate,
    CaseResponse,
    CaseListResponse,
    ConsultationLogRequest,
)
from app.services.auth_service import auth_service

router = APIRouter(prefix="/cases", tags=["Clinical Cases & Tele-Consultation"])

# Default jurisdiction doctor assignment
DEFAULT_DOCTOR = {
    "doctor_id": "usr_vet_02",
    "doctor_name": "Dr. Ananya Deshmukh",
    "doctor_phone_masked": "+91 9422X-XX842",
}


def serialize_case(c: ClinicalCase) -> CaseResponse:
    return CaseResponse(
        id=c.id,
        report_id=c.report_id,
        farmer_id=c.farmer_id,
        farmer_name=c.farmer_name,
        farmer_phone_masked=c.farmer_phone_masked,
        doctor_id=c.doctor_id,
        doctor_name=c.doctor_name,
        doctor_phone_masked=c.doctor_phone_masked,
        animal_tag=c.animal_tag,
        species=c.species,
        breed=c.breed,
        syndrome_code=c.syndrome_code,
        syndrome_name=c.syndrome_name,
        symptoms=c.symptoms,
        ai_differential=c.ai_differential,
        urgency=c.urgency,
        status=c.status,
        interim_advice=c.interim_advice,
        doctor_notes=c.doctor_notes,
        prescription=c.prescription,
        visit_eta=c.visit_eta,
        village_name=c.village_name,
        block_name=c.block_name,
        district_name=c.district_name,
        latitude=c.latitude,
        longitude=c.longitude,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    payload: CaseCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Submits a new clinical case from farmer's syndromic triage report.
    Automatically assigns local jurisdiction veterinarian and generates DPDP phone hashes.
    """
    clean_phone = "".join(filter(str.isdigit, payload.farmer_phone))
    phone_hash = auth_service.hash_phone(clean_phone)
    phone_masked = auth_service.mask_phone(clean_phone)

    case_id = f"CASE-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    doc_id = payload.doctor_id or DEFAULT_DOCTOR["doctor_id"]
    doc_name = payload.doctor_name or DEFAULT_DOCTOR["doctor_name"]
    doc_phone = DEFAULT_DOCTOR["doctor_phone_masked"]

    # Generate helpful default interim advice if none provided
    advice = payload.interim_advice
    if not advice:
        if "VSS" in payload.syndrome_code or "FMD" in payload.syndrome_code:
            advice = (
                "1. बाधित गाईला इतर जनावरांपासून किमान १५ मीटर दूर विलगीकरणात ठेवा.\n"
                "2. तोंड व खुरांचे व्रण पोटॅशियम परमँगनेटच्या हलक्या गुलाबी पाण्याने धुवा.\n"
                "3. कोरडा चारा देऊ नका; मऊ भाताची पेज किंवा लापशी खाऊ घाला."
            )
        else:
            advice = (
                "1. जनावरास सावलीत व कोरड्या जागेत बांधा.\n"
                "2. ताजे व स्वच्छ पाणी मुबलक प्रमाणात उपलब्ध करा.\n"
                "3. पशुवैद्यकीय अधिकारी येईपर्यंत जनावरास विश्रांती द्या."
            )

    new_case = ClinicalCase(
        id=case_id,
        report_id=payload.report_id,
        farmer_id=payload.farmer_id or f"usr_{uuid.uuid4().hex[:10]}",
        farmer_name=payload.farmer_name,
        farmer_phone_hash=phone_hash,
        farmer_phone_masked=phone_masked,
        doctor_id=doc_id,
        doctor_name=doc_name,
        doctor_phone_masked=doc_phone,
        animal_tag=payload.animal_tag,
        species=payload.species,
        breed=payload.breed,
        syndrome_code=payload.syndrome_code,
        syndrome_name=payload.syndrome_name,
        symptoms=payload.symptoms,
        ai_differential=payload.ai_differential,
        urgency=payload.urgency or "HIGH",
        status="AWAITING_DOCTOR",
        interim_advice=advice,
        village_name=payload.village_name or "Ashwi Budruk",
        block_name=payload.block_name or "Rahuri",
        district_name=payload.district_name or "Ahmednagar",
        latitude=payload.latitude or 19.3912,
        longitude=payload.longitude or 74.6521,
    )

    db.add(new_case)
    await db.commit()
    await db.refresh(new_case)

    return serialize_case(new_case)


@router.get("", response_model=CaseListResponse)
async def list_cases(
    farmer_phone_hash: Optional[str] = Query(None, description="Filter cases by farmer SHA-256 phone hash"),
    doctor_id: Optional[str] = Query(None, description="Filter cases by assigned doctor ID"),
    block: Optional[str] = Query(None, description="Filter cases by block/taluka"),
    status: Optional[str] = Query(None, description="Filter by case status"),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists clinical cases for doctor clinical queues or farmer consultation history.
    """
    stmt = select(ClinicalCase)
    count_stmt = select(func.count(ClinicalCase.id))

    if farmer_phone_hash:
        stmt = stmt.where(ClinicalCase.farmer_phone_hash == farmer_phone_hash)
        count_stmt = count_stmt.where(ClinicalCase.farmer_phone_hash == farmer_phone_hash)

    if doctor_id:
        stmt = stmt.where(ClinicalCase.doctor_id == doctor_id)
        count_stmt = count_stmt.where(ClinicalCase.doctor_id == doctor_id)

    if block:
        stmt = stmt.where(ClinicalCase.block_name == block)
        count_stmt = count_stmt.where(ClinicalCase.block_name == block)

    if status:
        stmt = stmt.where(ClinicalCase.status == status)
        count_stmt = count_stmt.where(ClinicalCase.status == status)

    stmt = stmt.order_by(ClinicalCase.created_at.desc())

    result = await db.execute(stmt)
    cases = result.scalars().all()

    total_count = len(cases)
    active_count = sum(1 for c in cases if c.status != "RESOLVED")

    return CaseListResponse(
        total=total_count,
        active_count=active_count,
        items=[serialize_case(c) for c in cases],
    )


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case_by_id(
    case_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve clinical case details by case ID.
    """
    stmt = select(ClinicalCase).where(ClinicalCase.id == case_id)
    res = await db.execute(stmt)
    clinical_case = res.scalar_one_or_none()
    if not clinical_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return serialize_case(clinical_case)


@router.patch("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: str,
    payload: CaseUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Doctor updates case status (e.g. VISIT_SCHEDULED), adds prescription or doctor notes.
    """
    stmt = select(ClinicalCase).where(ClinicalCase.id == case_id)
    res = await db.execute(stmt)
    clinical_case = res.scalar_one_or_none()
    if not clinical_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )

    if payload.status is not None:
        clinical_case.status = payload.status
    if payload.doctor_id is not None:
        clinical_case.doctor_id = payload.doctor_id
    if payload.doctor_name is not None:
        clinical_case.doctor_name = payload.doctor_name
    if payload.doctor_phone_masked is not None:
        clinical_case.doctor_phone_masked = payload.doctor_phone_masked
    if payload.doctor_notes is not None:
        clinical_case.doctor_notes = payload.doctor_notes
    if payload.prescription is not None:
        clinical_case.prescription = payload.prescription
    if payload.visit_eta is not None:
        clinical_case.visit_eta = payload.visit_eta

    await db.commit()
    await db.refresh(clinical_case)
    return serialize_case(clinical_case)


@router.post("/{case_id}/consult")
async def record_consultation_session(
    case_id: str,
    payload: ConsultationLogRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Records a live video or audio tele-consultation event between doctor and farmer.
    """
    stmt = select(ClinicalCase).where(ClinicalCase.id == case_id)
    res = await db.execute(stmt)
    clinical_case = res.scalar_one_or_none()
    if not clinical_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )

    if clinical_case.status == "AWAITING_DOCTOR":
        clinical_case.status = "IN_CONSULTATION"
    if payload.notes:
        existing = clinical_case.doctor_notes or ""
        clinical_case.doctor_notes = f"{existing}\n[Tele-Consult {payload.channel}]: {payload.notes}".strip()

    await db.commit()
    return {
        "success": True,
        "case_id": case_id,
        "channel": payload.channel,
        "message": f"Tele-consultation session ({payload.channel}) logged successfully.",
    }
