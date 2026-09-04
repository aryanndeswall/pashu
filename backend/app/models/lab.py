from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Float, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class LabRequisition(Base):
    __tablename__ = "lab_requisitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    requisition_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    animal_tag_id: Mapped[str] = mapped_column(String(12), index=True)
    incident_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    cluster_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    vet_id: Mapped[str] = mapped_column(String(50), nullable=False)
    village_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    district_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    sample_type: Mapped[str] = mapped_column(String(50), nullable=False)
    suspected_disease: Mapped[str] = mapped_column(String(50), nullable=False)
    preservative: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    destination_lab: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="IN_TRANSIT")
    transit_temp_c: Mapped[float] = mapped_column(Float, default=4.0)
    temp_breached: Mapped[bool] = mapped_column(Boolean, default=False)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    dispatched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    received_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    test_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    test_result: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    result_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pathologist_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    qr_payload: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
