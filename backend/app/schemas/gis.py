from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class EpiCurvePoint(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD")
    day_index: int = Field(..., ge=1, le=14, description="Day index 1 to 14")
    suspected_cases: int = Field(..., ge=0)
    confirmed_cases: int = Field(..., ge=0)
    mortality_count: int = Field(..., ge=0)
    reproduction_number: float = Field(..., description="Effective Reproduction Number (Rt)")


class EpiCurveResponse(BaseModel):
    district_name: str
    syndrome_code: str
    total_suspected: int
    total_confirmed: int
    total_deaths: int
    peak_day: str
    current_rt: float
    points: List[EpiCurvePoint]


class MarketClosureMemoRequest(BaseModel):
    cluster_id: str = Field(..., description="Active outbreak cluster ID (e.g. CL-SYN_VESICULAR-558301)")
    district_name: str = Field("Ahmednagar", description="District jurisdiction")
    magistrate_name: str = Field(
        "जिल्हा दंडाधिकारी, अहमदनगर (District Collector & DM)",
        description="Designated statutory authority",
    )
    affected_villages: List[str] = Field(
        default=["Ashwi Budruk", "Rahuri Rural", "Sangamner Khurd"],
        description="LGD villages within 10 km containment perimeter",
    )
    closed_haats: List[str] = Field(
        default=["राहुरी आठवडे पशु बाजार (Rahuri Cattle Haat)", "संगमनेर बैल बाजार (Sangamner Livestock Fair)"],
        description="Livestock markets suspended under PCICDA Section 10",
    )
    quarantine_checkpoints: List[str] = Field(
        default=["SH-10 Rahuri Toll Barrier", "NH-160 Shirdi Road Checkpost"],
        description="Police biosecurity check-posts under PCICDA Section 20",
    )


class MarketClosureMemoResponse(BaseModel):
    memo_reference_no: str
    issued_at: datetime
    act_citation: str
    order_headline_mr: str
    order_headline_en: str
    full_memo_marathi: str
    full_memo_english: str
    affected_villages: List[str]
    closed_haats: List[str]
    quarantine_checkpoints: List[str]
    signatory: str


class IdspDispatchPayload(BaseModel):
    cluster_id: str
    syndrome_code: str
    suspected_disease: str
    district_name: str = "Ahmednagar"
    human_contacts_flagged: int = Field(12, description="Cattle handlers and farmers in close contact")
    risk_level: str = Field("HIGH", description="CRITICAL, HIGH, MODERATE")


class IdspDispatchResponse(BaseModel):
    dispatch_id: str
    status: str
    target_agency: str
    dispatched_at: datetime
    fhir_message_id: str
    recommended_actions: List[str]
    recommended_actions_mr: List[str]


class SimulationStep(BaseModel):
    step_number: int
    step_title: str
    step_title_mr: str
    component: str
    status: str
    metrics: Dict[str, Any]


class SimulationResponse(BaseModel):
    scenario_name: str
    total_steps: int
    execution_time_ms: float
    steps: List[SimulationStep]
    final_containment_status: str


class ReverseGeocodeResponse(BaseModel):
    latitude: float
    longitude: float
    state_name: str
    district_name: str
    block_name: str
    village_name: str
    pincode: Optional[str] = None
    formatted_address: str
    source: str
    accuracy_level: str = "HIGH"


class LocationSearchResult(BaseModel):
    latitude: float
    longitude: float
    state_name: str
    district_name: str
    block_name: str
    village_name: str
    pincode: Optional[str] = None
    formatted_address: str


class LocationSearchResponse(BaseModel):
    query: str
    total: int
    results: List[LocationSearchResult]


