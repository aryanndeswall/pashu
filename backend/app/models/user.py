# ponytail: lean User model strictly adhering to DPDP Act 2023 for livestock health surveillance
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    # DPDP Act 2023: Phone numbers stored as SHA-256 salted hashes
    phone_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    phone_masked: Mapped[str] = mapped_column(String(20), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # 'consumer', 'doctor', 'admin'
    
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_marathi: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    name_hindi: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    block: Mapped[str] = mapped_column(String(100), nullable=False)
    village: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    title_marathi: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    title_hindi: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    title_english: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    license_or_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    offline_pin_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    
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
