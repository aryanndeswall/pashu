from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.cluster import ClusterEvaluationResponse


class TelemetrySyncRequest(BaseModel):
    sync_id: str = Field(..., description="Unique mobile synchronization identifier")
    report_id: str = Field(..., description="Syndromic report ID")
    syndrome_code: str = Field(default="VSS", description="Primary syndromic code (VSS, NSLS, HSDS, etc.)")
    syndrome_name: Optional[str] = Field(default="", description="Localized syndrome description")
    secondary_symptoms: Optional[List[str]] = Field(default=[], description="List of observed secondary symptoms")
    decision_tree_differential: Optional[Dict[str, Any]] = Field(default=None, description="Offline heuristic tree differential")
    latitude: float = Field(..., description="Geographic latitude")
    longitude: float = Field(..., description="Geographic longitude")
    lgd_code: int = Field(default=558301, description="Local Government Directory village code")
    village_name: Optional[str] = Field(default=None, description="Village name")
    district_name: Optional[str] = Field(default="Ahmednagar", description="District name")
    pashu_aadhaar: Optional[str] = Field(default="UNTAGGED", description="12-digit Pashu Aadhaar RFID ear tag")
    species: Optional[str] = Field(default="Bovine", description="Affected animal species")
    animal_count_affected: Optional[int] = Field(default=1, ge=1, description="Number of animals affected")
    mortality_count: Optional[int] = Field(default=0, ge=0, description="Number of animal deaths")
    reported_at: Optional[str] = Field(default=None, description="Client ISO timestamp of report")
    has_photo: Optional[bool] = Field(default=False, description="Whether lesion photo is attached")
    has_audio: Optional[bool] = Field(default=False, description="Whether audio voice note is attached")
    priority: Optional[int] = Field(default=2, description="Triage priority (1: Normal, 2: High, 3: Emergency)")

    model_config = ConfigDict(extra="ignore")


class TelemetrySyncResponse(BaseModel):
    sync_id: str
    report_id: str
    status: str = "COMPLETED"
    server_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    receipt_id: str
    incident_id: Optional[int] = None
    cluster_evaluation: Optional[ClusterEvaluationResponse] = None
    containment_triggered: bool = False
    message: str = "Telemetry ingested and evaluated successfully"


class MediaSyncRequest(BaseModel):
    media_id: str = Field(..., description="Unique media identifier")
    sync_id: str = Field(..., description="Associated telemetry sync ID")
    report_id: Optional[str] = Field(default=None, description="Optional incident report ID")
    media_type: Optional[str] = Field(default="PHOTO_WEBP", description="PHOTO_WEBP or AUDIO_NOTE")
    media_data: Optional[str] = Field(default=None, description="Base64 encoded binary payload or URI")
    content_type: Optional[str] = Field(default=None, description="MIME content type (image/webp, audio/webm, etc.)")
    file_size_kb: Optional[int] = Field(default=0, description="Payload size in kilobytes")

    model_config = ConfigDict(extra="ignore")


class MediaSyncResponse(BaseModel):
    media_id: str
    sync_id: str
    status: str = "COMPLETED"
    stored_uri: str
    gs_uri: Optional[str] = None
    https_url: Optional[str] = None
    file_size_kb: Optional[int] = 0
    is_cloud: bool = False
    server_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    message: str = "Binary asset secured in cloud ingestion pipeline"


class SignedUrlRequest(BaseModel):
    media_id: str = Field(..., description="Unique media identifier")
    sync_id: str = Field(..., description="Associated telemetry sync ID")
    media_type: Optional[str] = Field(default="PHOTO_WEBP", description="PHOTO_WEBP or AUDIO_NOTE")
    content_type: Optional[str] = Field(default="image/webp", description="MIME content type")
    expires_minutes: Optional[int] = Field(default=15, description="URL validity in minutes")


class SignedUrlResponse(BaseModel):
    media_id: str
    sync_id: str
    upload_url: str
    gs_uri: str
    method: str = "PUT"
    expires_minutes: int = 15
    server_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SyncStatusResponse(BaseModel):
    service: str = "pashu-suraksha-sync-gateway"
    status: str = "HEALTHY"
    database_connected: bool = True
    total_incidents_ingested: int = 0
    server_time: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
