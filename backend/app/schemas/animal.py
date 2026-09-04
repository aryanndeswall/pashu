import hashlib
import re
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict


class VaccinationStatus(str, Enum):
    UP_TO_DATE = "UP_TO_DATE"
    BOOSTER_DUE = "BOOSTER_DUE"
    OVERDUE = "OVERDUE"


DISEASE_BOOSTER_INTERVALS = {
    "FMD": 180,  # Foot and Mouth: 6 months
    "LSD": 365,  # Lumpy Skin: 1 year
    "ANTHRAX": 365,  # Anthrax Ring: 1 year
}

DISEASE_MARATHI_NAMES = {
    "FMD": "लाळ्या खुरकूत (FMD)",
    "LSD": "लंपी त्वचा (LSD)",
    "ANTHRAX": "काळपुळी (ॲन्थ्रॅक्स)",
}


def hash_phone_number(phone: str, salt: str = "pashu_dpdp_secret_salt_2026") -> str:
    cleaned = re.sub(r"\D", "", phone)
    salted = f"{cleaned}:{salt}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()


def mask_phone_number(phone: str) -> str:
    cleaned = re.sub(r"\D", "", phone)
    if len(cleaned) >= 4:
        last4 = cleaned[-4:]
        return f"+91-XXXXX-{last4}"
    return "+91-XXXXX-0000"


def format_tag_number(tag: str) -> str:
    if len(tag) == 12:
        return f"{tag[0:4]}-{tag[4:8]}-{tag[8:12]}"
    return tag


def compute_vaccination_status(next_booster_due: datetime) -> tuple[VaccinationStatus, int]:
    now = datetime.now(timezone.utc)
    if next_booster_due.tzinfo is None:
        target = next_booster_due.replace(tzinfo=timezone.utc)
    else:
        target = next_booster_due

    delta = target - now
    days_remaining = delta.days

    if days_remaining < 0:
        return VaccinationStatus.OVERDUE, days_remaining
    elif days_remaining <= 14:
        return VaccinationStatus.BOOSTER_DUE, days_remaining
    else:
        return VaccinationStatus.UP_TO_DATE, days_remaining


# --- Vaccination Schemas ---

class VaccinationCreate(BaseModel):
    disease_code: str = Field(..., description="Disease code: FMD, LSD, ANTHRAX")
    dose_number: int = Field(default=1, ge=1, le=10)
    administered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    batch_number: str = Field(..., min_length=2, max_length=50)
    veterinarian_name: str = Field(..., min_length=2, max_length=100)

    @field_validator("disease_code")
    @classmethod
    def validate_disease_code(cls, v: str) -> str:
        upper = v.strip().upper()
        if upper not in DISEASE_BOOSTER_INTERVALS:
            raise ValueError(f"disease_code must be one of: {list(DISEASE_BOOSTER_INTERVALS.keys())}")
        return upper


class VaccinationResponse(BaseModel):
    id: int
    animal_tag: str
    disease_code: str
    disease_name_marathi: Optional[str] = None
    dose_number: int
    administered_at: datetime
    next_booster_due: datetime
    days_remaining: int
    status: VaccinationStatus
    batch_number: str
    veterinarian_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Animal Schemas ---

class AnimalCreate(BaseModel):
    tag_number: str = Field(..., description="12-digit Pashu Aadhaar RFID tag number")
    owner_name: str = Field(..., min_length=2, max_length=100)
    owner_mobile: str = Field(..., min_length=10, max_length=15, description="10-digit mobile number")
    species: str = Field(..., min_length=2, max_length=50)
    breed: Optional[str] = Field(default=None, max_length=100)
    age_months: int = Field(..., ge=0, le=360)
    village_lgd_code: int = Field(..., ge=1)
    village_name: Optional[str] = Field(default=None, max_length=100)

    @field_validator("tag_number")
    @classmethod
    def validate_tag_number(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-]", "", v)
        if not re.match(r"^\d{12}$", cleaned):
            raise ValueError("Tag number must be exactly 12 numeric digits")
        return cleaned

    @field_validator("owner_mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        cleaned = re.sub(r"\D", "", v)
        if len(cleaned) < 10:
            raise ValueError("Mobile number must have at least 10 digits")
        return cleaned


class AnimalResponse(BaseModel):
    tag_number: str
    formatted_tag: str
    owner_name: str
    owner_phone_masked: str
    species: str
    breed: Optional[str] = None
    age_months: int
    village_lgd_code: int
    village_name: Optional[str] = None
    vaccination_status: VaccinationStatus
    vaccinations: List[VaccinationResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnimalListResponse(BaseModel):
    total: int
    items: List[AnimalResponse]
