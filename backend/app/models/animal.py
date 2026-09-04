from datetime import datetime, timezone
from typing import List
from sqlalchemy import (
    String,
    Integer,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Animal(Base):
    __tablename__ = "animals"

    tag_number: Mapped[str] = mapped_column(String(12), primary_key=True, index=True)
    owner_name: Mapped[str] = mapped_column(String(100), nullable=False)
    owner_phone_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    owner_phone_masked: Mapped[str] = mapped_column(String(20), nullable=False)
    species: Mapped[str] = mapped_column(String(50), nullable=False)
    breed: Mapped[str] = mapped_column(String(100), nullable=True)
    age_months: Mapped[int] = mapped_column(Integer, nullable=False)
    village_lgd_code: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    village_name: Mapped[str] = mapped_column(String(100), nullable=True)
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

    vaccinations: Mapped[List["VaccinationRecord"]] = relationship(
        "VaccinationRecord",
        back_populates="animal",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="VaccinationRecord.administered_at.desc()",
    )


class VaccinationRecord(Base):
    __tablename__ = "vaccination_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    animal_tag: Mapped[str] = mapped_column(
        String(12),
        ForeignKey("animals.tag_number", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    disease_code: Mapped[str] = mapped_column(String(30), nullable=False)  # FMD, LSD, ANTHRAX
    disease_name_marathi: Mapped[str] = mapped_column(String(100), nullable=True)
    dose_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    administered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    next_booster_due: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    batch_number: Mapped[str] = mapped_column(String(50), nullable=False)
    veterinarian_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    animal: Mapped["Animal"] = relationship("Animal", back_populates="vaccinations")
