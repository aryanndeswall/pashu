# ponytail: ClinicalCase model connecting livestock owners with jurisdiction veterinarians
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ClinicalCase(Base):
    __tablename__ = "clinical_cases"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)  # CASE-2026-XXXX
    report_id: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    
    # Farmer / Livestock Owner Identity (DPDP Act 2023 compliant)
    farmer_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    farmer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    farmer_phone_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    farmer_phone_masked: Mapped[str] = mapped_column(String(20), nullable=False)

    # Assigned Veterinarian
    doctor_id: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    doctor_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    doctor_phone_masked: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Animal Info
    animal_tag: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    species: Mapped[str] = mapped_column(String(50), nullable=False)
    breed: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Syndromic Triage & Perception
    syndrome_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    syndrome_name: Mapped[str] = mapped_column(String(100), nullable=False)
    symptoms: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_differential: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    urgency: Mapped[str] = mapped_column(String(20), default="HIGH")  # NORMAL, HIGH, CRITICAL

    # Multimodal Field Evidence & Gemini Perception
    photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    audio_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    audio_transcript: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    clinical_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    clinical_rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    identified_symptoms: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    containment_actions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    biohazard_alert: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ai_report_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Clinical Lifecycle & Cross-Connection
    status: Mapped[str] = mapped_column(String(30), default="AWAITING_DOCTOR", index=True)  # AWAITING_DOCTOR, IN_CONSULTATION, VISIT_SCHEDULED, RESOLVED
    interim_advice: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    doctor_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prescription: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    visit_eta: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Geospatial Context
    village_name: Mapped[str] = mapped_column(String(100), nullable=False)
    block_name: Mapped[str] = mapped_column(String(100), nullable=False)
    district_name: Mapped[str] = mapped_column(String(100), default="Ahmednagar")
    latitude: Mapped[float] = mapped_column(Float, default=19.3912)
    longitude: Mapped[float] = mapped_column(Float, default=74.6521)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )
