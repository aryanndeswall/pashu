from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class OutbreakCluster(Base):
    __tablename__ = "outbreak_clusters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cluster_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    syndrome_code: Mapped[str] = mapped_column(String(10), index=True)
    status: Mapped[str] = mapped_column(String(30))  # WATCH, WARNING, OUTBREAK_DECLARED
    ops_score: Mapped[float] = mapped_column(Float, nullable=False)
    attack_rate: Mapped[float] = mapped_column(Float, nullable=False)
    total_cases: Mapped[int] = mapped_column(Integer, nullable=False)
    total_deaths: Mapped[int] = mapped_column(Integer, default=0)
    epicenter_lat: Mapped[float] = mapped_column(Float, nullable=False)
    epicenter_lon: Mapped[float] = mapped_column(Float, nullable=False)
    affected_villages: Mapped[str] = mapped_column(String, nullable=True)
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
