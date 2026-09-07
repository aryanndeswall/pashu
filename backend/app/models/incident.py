from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    syndrome_code: Mapped[str] = mapped_column(String(10), index=True)  # VSS, NSLS, HSDS, etc.
    species: Mapped[str] = mapped_column(String(50), default="Bovine")
    animal_count_affected: Mapped[int] = mapped_column(Integer, default=1)
    mortality_count: Mapped[int] = mapped_column(Integer, default=0)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    lgd_code: Mapped[int] = mapped_column(Integer, index=True)
    village_name: Mapped[str] = mapped_column(String(100), nullable=True)
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )


class LivestockCensus(Base):
    __tablename__ = "livestock_census"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lgd_code: Mapped[int] = mapped_column(Integer, index=True)
    village_name: Mapped[str] = mapped_column(String(100), nullable=False)
    district_name: Mapped[str] = mapped_column(String(100), default="Ahmednagar")
    species: Mapped[str] = mapped_column(String(50), default="Bovine")
    total_population: Mapped[int] = mapped_column(Integer, nullable=False)


class IncidentMedia(Base):
    __tablename__ = "incident_media"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    media_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    sync_id: Mapped[str] = mapped_column(String(100), index=True)
    report_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    media_type: Mapped[str] = mapped_column(String(50))  # PHOTO_WEBP, AUDIO_NOTE
    file_size_kb: Mapped[int] = mapped_column(Integer, default=0)
    gs_uri: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    https_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

