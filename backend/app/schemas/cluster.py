from datetime import datetime, timezone
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, ConfigDict

OutbreakStatus = Literal["WATCH", "WARNING", "OUTBREAK_DECLARED"]


class IncidentCreate(BaseModel):
    report_id: str = Field(..., description="Unique incident or report ID")
    syndrome_code: str = Field(..., description="Standard 8 syndromic category (VSS, NSLS, etc.)")
    species: str = Field(default="Bovine", description="Affected species")
    animal_count_affected: int = Field(default=1, ge=1, description="Number of clinically sick animals")
    mortality_count: int = Field(default=0, ge=0, description="Number of deaths")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Geographic latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Geographic longitude")
    lgd_code: int = Field(..., ge=1, description="Local Government Directory (LGD) village code")
    village_name: Optional[str] = Field(default=None, description="Village name")
    reported_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Incident reporting timestamp",
    )

    model_config = ConfigDict(extra="ignore")


class ClusterEvaluationRequest(BaseModel):
    incident: IncidentCreate
    historical_incidents: Optional[List[IncidentCreate]] = Field(
        default=None,
        description="Optional list of recent incidents to evaluate against (defaults to DB records)",
    )

    model_config = ConfigDict(extra="ignore")


class ClusterEvaluationResponse(BaseModel):
    cluster_id: str
    syndrome_code: str
    status: OutbreakStatus
    ops_score: float = Field(..., ge=0.0, le=1.0, description="Outbreak Probability Score (0.0 to 1.0)")
    attack_rate: float = Field(..., ge=0.0, description="Poisson Attack Rate (%)")
    total_cases: int
    total_deaths: int
    epicenter_lat: float
    epicenter_lon: float
    affected_villages: List[str]
    total_census_denominator: int
    requires_containment_buffers: bool
    advisory_headline: str

    model_config = ConfigDict(from_attributes=True)


class ClusterSummary(BaseModel):
    cluster_id: str
    syndrome_code: str
    status: OutbreakStatus
    ops_score: float
    attack_rate: float
    total_cases: int
    total_deaths: int
    epicenter_lat: float
    epicenter_lon: float
    affected_villages: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
