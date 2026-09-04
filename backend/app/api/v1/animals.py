import re
from datetime import timedelta, timezone, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models.animal import Animal, VaccinationRecord
from app.schemas.animal import (
    AnimalCreate,
    AnimalResponse,
    AnimalListResponse,
    VaccinationCreate,
    VaccinationResponse,
    VaccinationStatus,
    DISEASE_BOOSTER_INTERVALS,
    DISEASE_MARATHI_NAMES,
    hash_phone_number,
    mask_phone_number,
    format_tag_number,
    compute_vaccination_status,
)

router = APIRouter()


def build_vaccination_response(record: VaccinationRecord) -> VaccinationResponse:
    stat, days = compute_vaccination_status(record.next_booster_due)
    return VaccinationResponse(
        id=record.id,
        animal_tag=record.animal_tag,
        disease_code=record.disease_code,
        disease_name_marathi=record.disease_name_marathi or DISEASE_MARATHI_NAMES.get(record.disease_code, record.disease_code),
        dose_number=record.dose_number,
        administered_at=record.administered_at,
        next_booster_due=record.next_booster_due,
        days_remaining=days,
        status=stat,
        batch_number=record.batch_number,
        veterinarian_name=record.veterinarian_name,
        created_at=record.created_at,
    )


def build_animal_response(animal: Animal) -> AnimalResponse:
    vacc_responses: List[VaccinationResponse] = []
    overall_status = VaccinationStatus.UP_TO_DATE

    if animal.vaccinations:
        for v in animal.vaccinations:
            v_resp = build_vaccination_response(v)
            vacc_responses.append(v_resp)
            if v_resp.status == VaccinationStatus.OVERDUE:
                overall_status = VaccinationStatus.OVERDUE
            elif v_resp.status == VaccinationStatus.BOOSTER_DUE and overall_status != VaccinationStatus.OVERDUE:
                overall_status = VaccinationStatus.BOOSTER_DUE

    return AnimalResponse(
        tag_number=animal.tag_number,
        formatted_tag=format_tag_number(animal.tag_number),
        owner_name=animal.owner_name,
        owner_phone_masked=animal.owner_phone_masked,
        species=animal.species,
        breed=animal.breed,
        age_months=animal.age_months,
        village_lgd_code=animal.village_lgd_code,
        village_name=animal.village_name,
        vaccination_status=overall_status,
        vaccinations=vacc_responses,
        created_at=animal.created_at,
        updated_at=animal.updated_at,
    )


@router.post("", response_model=AnimalResponse, status_code=status.HTTP_201_CREATED)
async def register_animal(
    payload: AnimalCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new livestock entity under Pashu Aadhaar (12-digit RFID).
    Farmer mobile number is hashed with salt per DPDP Act 2023.
    """
    cleaned_tag = re.sub(r"[\s\-]", "", payload.tag_number)

    # Check if already exists
    stmt = select(Animal).where(Animal.tag_number == cleaned_tag)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Animal with Pashu Aadhaar tag {cleaned_tag} is already registered.",
        )

    phone_hash = hash_phone_number(payload.owner_mobile, settings.DPDP_PHONE_SALT)
    phone_masked = mask_phone_number(payload.owner_mobile)

    animal = Animal(
        tag_number=cleaned_tag,
        owner_name=payload.owner_name.strip(),
        owner_phone_hash=phone_hash,
        owner_phone_masked=phone_masked,
        species=payload.species.strip(),
        breed=payload.breed.strip() if payload.breed else None,
        age_months=payload.age_months,
        village_lgd_code=payload.village_lgd_code,
        village_name=payload.village_name.strip() if payload.village_name else None,
    )
    db.add(animal)
    await db.commit()
    await db.refresh(animal)

    return build_animal_response(animal)


@router.get("/{tag_number}", response_model=AnimalResponse)
async def get_animal_by_tag(
    tag_number: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve livestock digital passbook and complete vaccination history by 12-digit tag.
    """
    cleaned_tag = re.sub(r"[\s\-]", "", tag_number)
    stmt = (
        select(Animal)
        .where(Animal.tag_number == cleaned_tag)
        .options(selectinload(Animal.vaccinations))
    )
    res = await db.execute(stmt)
    animal = res.scalar_one_or_none()
    if not animal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Livestock with Pashu Aadhaar tag {cleaned_tag} not found.",
        )

    return build_animal_response(animal)


@router.get("", response_model=AnimalListResponse)
async def list_animals(
    village_lgd_code: Optional[int] = Query(None, description="Filter by Village LGD Code"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    List registered animals with optional village LGD filter.
    """
    base_stmt = select(Animal).options(selectinload(Animal.vaccinations))
    count_stmt = select(func.count()).select_from(Animal)

    if village_lgd_code:
        base_stmt = base_stmt.where(Animal.village_lgd_code == village_lgd_code)
        count_stmt = count_stmt.where(Animal.village_lgd_code == village_lgd_code)

    count_res = await db.execute(count_stmt)
    total = count_res.scalar_one()

    stmt = base_stmt.offset(offset).limit(limit).order_by(Animal.created_at.desc())
    res = await db.execute(stmt)
    animals = res.scalars().all()

    items = [build_animal_response(a) for a in animals]
    return AnimalListResponse(total=total, items=items)


@router.post("/{tag_number}/vaccinations", response_model=VaccinationResponse, status_code=status.HTTP_201_CREATED)
async def add_vaccination_record(
    tag_number: str,
    payload: VaccinationCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Log a vaccination dose for an animal and compute next booster due date according to DAHD intervals.
    """
    cleaned_tag = re.sub(r"[\s\-]", "", tag_number)
    stmt = select(Animal).where(Animal.tag_number == cleaned_tag)
    res = await db.execute(stmt)
    animal = res.scalar_one_or_none()
    if not animal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Livestock with tag {cleaned_tag} does not exist.",
        )

    interval_days = DISEASE_BOOSTER_INTERVALS.get(payload.disease_code, 180)
    admin_time = payload.administered_at
    if admin_time.tzinfo is None:
        admin_time = admin_time.replace(tzinfo=timezone.utc)

    next_booster = admin_time + timedelta(days=interval_days)
    marathi_name = DISEASE_MARATHI_NAMES.get(payload.disease_code, payload.disease_code)

    vacc_record = VaccinationRecord(
        animal_tag=cleaned_tag,
        disease_code=payload.disease_code,
        disease_name_marathi=marathi_name,
        dose_number=payload.dose_number,
        administered_at=admin_time,
        next_booster_due=next_booster,
        batch_number=payload.batch_number.strip(),
        veterinarian_name=payload.veterinarian_name.strip(),
    )
    db.add(vacc_record)
    await db.commit()
    await db.refresh(vacc_record)

    return build_vaccination_response(vacc_record)


@router.get("/{tag_number}/vaccinations", response_model=List[VaccinationResponse])
async def get_animal_vaccinations(
    tag_number: str,
    db: AsyncSession = Depends(get_db),
):
    """
    List all vaccination records for an animal.
    """
    cleaned_tag = re.sub(r"[\s\-]", "", tag_number)
    stmt = (
        select(VaccinationRecord)
        .where(VaccinationRecord.animal_tag == cleaned_tag)
        .order_by(VaccinationRecord.administered_at.desc())
    )
    res = await db.execute(stmt)
    records = res.scalars().all()
    return [build_vaccination_response(r) for r in records]
