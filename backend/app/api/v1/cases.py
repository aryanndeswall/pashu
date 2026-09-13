# ponytail: REST endpoints for ClinicalCase doctor-farmer cross-connection
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
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
from app.services.pubsub_service import pubsub_service, CaseTriageEvent

router = APIRouter(prefix="/cases", tags=["Clinical Cases & Tele-Consultation"])


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
        photo_url=c.photo_url,
        audio_url=c.audio_url,
        audio_transcript=c.audio_transcript,
        clinical_confidence=c.clinical_confidence,
        clinical_rationale=c.clinical_rationale,
        identified_symptoms=c.identified_symptoms,
        containment_actions=c.containment_actions,
        biohazard_alert=c.biohazard_alert,
        model_used=c.model_used,
        ai_report_json=c.ai_report_json,
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

    doc_id = payload.doctor_id
    doc_name = payload.doctor_name
    doc_phone = None

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
        photo_url=payload.photo_url,
        audio_url=payload.audio_url,
        audio_transcript=payload.audio_transcript,
        clinical_confidence=payload.clinical_confidence,
        clinical_rationale=payload.clinical_rationale,
        identified_symptoms=payload.identified_symptoms,
        containment_actions=payload.containment_actions,
        biohazard_alert=payload.biohazard_alert,
        model_used=payload.model_used,
        ai_report_json=payload.ai_report_json,
        village_name=payload.village_name or "Unknown",
        block_name=payload.block_name or "Unknown",
        district_name=payload.district_name or "Ahmednagar",
        latitude=payload.latitude or 19.3912,
        longitude=payload.longitude or 74.6521,
    )

    db.add(new_case)
    await db.commit()
    await db.refresh(new_case)

    # Publish to Redis -> SSE -> every Vet & Farmer screen instantly
    await pubsub_service.publish_case_event(CaseTriageEvent(
        event_type="NEW_CASE",
        case_id=new_case.id,
        farmer_name=new_case.farmer_name,
        village_name=new_case.village_name,
        block_name=new_case.block_name,
        district_name=new_case.district_name,
        syndrome_name=new_case.syndrome_name,
        urgency=new_case.urgency,
        status=new_case.status,
        doctor_id=new_case.doctor_id,
        doctor_name=new_case.doctor_name,
        species=new_case.species,
        animal_tag=new_case.animal_tag,
        photo_url=new_case.photo_url,
        latitude=new_case.latitude,
        longitude=new_case.longitude,
    ))

    return serialize_case(new_case)


@router.get("", response_model=CaseListResponse)
async def list_cases(
    farmer_phone_hash: Optional[str] = Query(None, description="Filter cases by farmer SHA-256 phone hash"),
    farmer_id: Optional[str] = Query(None, description="Filter cases by farmer ID"),
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

    if farmer_id:
        stmt = stmt.where(ClinicalCase.farmer_id == farmer_id)
        count_stmt = count_stmt.where(ClinicalCase.farmer_id == farmer_id)

    if doctor_id:
        # Jurisdiction-wide dispatch: Doctors see their cases AND unassigned cases awaiting attention
        stmt = stmt.where(or_(ClinicalCase.doctor_id == doctor_id, ClinicalCase.doctor_id.is_(None), ClinicalCase.doctor_id == "", ClinicalCase.status == "AWAITING_DOCTOR"))
        count_stmt = count_stmt.where(or_(ClinicalCase.doctor_id == doctor_id, ClinicalCase.doctor_id.is_(None), ClinicalCase.doctor_id == "", ClinicalCase.status == "AWAITING_DOCTOR"))

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
    if payload.ai_differential is not None:
        clinical_case.ai_differential = payload.ai_differential

    await db.commit()
    await db.refresh(clinical_case)

    # Publish CASE_UPDATED / PRESCRIPTION_ISSUED to Redis -> SSE
    event_type = "PRESCRIPTION_ISSUED" if payload.prescription else "CASE_UPDATED"
    await pubsub_service.publish_case_event(CaseTriageEvent(
        event_type=event_type,
        case_id=clinical_case.id,
        farmer_name=clinical_case.farmer_name,
        village_name=clinical_case.village_name,
        block_name=clinical_case.block_name,
        district_name=clinical_case.district_name,
        syndrome_name=clinical_case.syndrome_name,
        urgency=clinical_case.urgency,
        status=clinical_case.status,
        doctor_id=clinical_case.doctor_id,
        doctor_name=clinical_case.doctor_name,
        prescription=clinical_case.prescription,
        doctor_notes=clinical_case.doctor_notes,
        visit_eta=clinical_case.visit_eta,
        species=clinical_case.species,
        animal_tag=clinical_case.animal_tag,
        photo_url=clinical_case.photo_url,
        latitude=clinical_case.latitude,
        longitude=clinical_case.longitude,
    ))

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
    await db.refresh(clinical_case)

    # Broadcast consultation event
    await pubsub_service.publish_case_event(CaseTriageEvent(
        event_type="CONSULTATION_LOGGED",
        case_id=clinical_case.id,
        farmer_name=clinical_case.farmer_name,
        village_name=clinical_case.village_name,
        block_name=clinical_case.block_name,
        district_name=clinical_case.district_name,
        syndrome_name=clinical_case.syndrome_name,
        urgency=clinical_case.urgency,
        status=clinical_case.status,
        doctor_id=clinical_case.doctor_id,
        doctor_name=clinical_case.doctor_name,
        prescription=clinical_case.prescription,
        doctor_notes=clinical_case.doctor_notes,
        visit_eta=clinical_case.visit_eta,
        species=clinical_case.species,
        animal_tag=clinical_case.animal_tag,
        latitude=clinical_case.latitude,
        longitude=clinical_case.longitude,
    ))

    return {
        "success": True,
        "case_id": case_id,
        "channel": payload.channel,
        "message": f"Tele-consultation session ({payload.channel}) logged successfully.",
    }


@router.get("/stream")
async def stream_triage_queue():
    """
    SSE live stream of triage queue events (NEW_CASE, CASE_CLAIMED, CASE_RESOLVED).
    Vets connect here — every incoming farmer report appears on their screen instantly.
    """
    return StreamingResponse(
        pubsub_service.case_sse_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.post("/{case_id}/claim", response_model=CaseResponse)
async def claim_case(
    case_id: str,
    doctor_id: str = Query(..., description="Firebase UID of the claiming vet"),
    doctor_name: str = Query(..., description="Display name of the claiming vet"),
    db: AsyncSession = Depends(get_db),
):
    """
    A Vet claims an AWAITING_DOCTOR case, locking it to themselves.
    Instantly broadcasts CASE_CLAIMED event so it disappears from other Vets' queues.
    """
    stmt = select(ClinicalCase).where(ClinicalCase.id == case_id)
    res = await db.execute(stmt)
    clinical_case = res.scalar_one_or_none()
    if not clinical_case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    if clinical_case.status != "AWAITING_DOCTOR":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Case already claimed or resolved (status: {clinical_case.status}).",
        )

    clinical_case.doctor_id = doctor_id
    clinical_case.doctor_name = doctor_name
    clinical_case.status = "IN_CONSULTATION"
    await db.commit()
    await db.refresh(clinical_case)

    # Broadcast — removes case from every other Vet's queue
    await pubsub_service.publish_case_event(CaseTriageEvent(
        event_type="CASE_CLAIMED",
        case_id=clinical_case.id,
        farmer_name=clinical_case.farmer_name,
        village_name=clinical_case.village_name,
        block_name=clinical_case.block_name,
        district_name=clinical_case.district_name,
        syndrome_name=clinical_case.syndrome_name,
        urgency=clinical_case.urgency,
        status=clinical_case.status,
        doctor_id=doctor_id,
        doctor_name=doctor_name,
        latitude=clinical_case.latitude,
        longitude=clinical_case.longitude,
    ))

    return serialize_case(clinical_case)
