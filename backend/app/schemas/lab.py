from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

ColdChainStatus = Literal["OPTIMAL", "WARNING", "BREACHED"]
RequisitionStatus = Literal[
    "PENDING",
    "IN_TRANSIT",
    "RECEIVED",
    "TESTING",
    "LAB_CONFIRMED",
    "NEGATIVE",
]


class ColdChainMetrics(BaseModel):
    elapsed_hours: float
    remaining_hours: float
    percent_elapsed: float
    cold_chain_status: ColdChainStatus
    is_breached: bool
    current_temp_c: float
    advisory_message: str
    advisory_message_mr: str


class LabRequisitionCreate(BaseModel):
    animal_tag_id: str = Field(..., min_length=12, max_length=12, description="12-digit Pashu Aadhaar RFID ear tag")
    incident_id: Optional[str] = None
    cluster_id: Optional[str] = None
    vet_id: str = Field("VET-MAH-4821", description="Field Veterinarian Registration ID")
    village_name: Optional[str] = None
    district_name: Optional[str] = "Ahmednagar"
    sample_type: str = Field(..., description="Vesicular Swab, Skin Scab, Whole Blood, Nasal Swab")
    suspected_disease: str = Field(..., description="FMD, LSD, Anthrax, HS, BQ")
    preservative: Optional[str] = Field("50% Glycerol Phosphate Buffered Saline (pH 7.4-7.6)")
    destination_lab: str = Field("District Diagnostic Lab (DDL), Pune")
    collected_at: Optional[datetime] = None
    initial_temp_c: float = Field(4.0, ge=-20.0, le=45.0)


class TemperatureLogCreate(BaseModel):
    temperature_c: float = Field(..., ge=-20.0, le=50.0)
    location_checkpoint: Optional[str] = None
    logged_by: Optional[str] = None


class LabResultSubmit(BaseModel):
    test_type: str = Field(..., description="RT-PCR, Sandwich ELISA, Bacterial Culture")
    test_result: Literal["POSITIVE", "NEGATIVE", "INCONCLUSIVE"]
    pathologist_id: str = Field("PATH-DDL-102", description="Lab Pathologist / Officer ID")
    notes: Optional[str] = None


class LabRequisitionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    requisition_id: str
    animal_tag_id: str
    incident_id: Optional[str] = None
    cluster_id: Optional[str] = None
    vet_id: str
    village_name: Optional[str] = None
    district_name: Optional[str] = None
    sample_type: str
    suspected_disease: str
    preservative: Optional[str] = None
    destination_lab: str
    status: str
    transit_temp_c: float
    temp_breached: bool
    collected_at: datetime
    dispatched_at: datetime
    received_at: Optional[datetime] = None
    test_type: Optional[str] = None
    test_result: Optional[str] = None
    result_notes: Optional[str] = None
    pathologist_id: Optional[str] = None
    confirmed_at: Optional[datetime] = None
    qr_payload: Optional[str] = None
    cold_chain: ColdChainMetrics
