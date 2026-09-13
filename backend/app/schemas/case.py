# ponytail: lean schemas for doctor-farmer clinical cases & cross-connection
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class CaseCreate(BaseModel):
    report_id: Optional[str] = Field(default=None, description="Linked syndromic report ID")
    farmer_id: Optional[str] = Field(default=None, description="Farmer user ID")
    farmer_name: str = Field(..., description="Farmer full name")
    farmer_phone: str = Field(..., description="Farmer raw or masked mobile number")
    
    doctor_id: Optional[str] = Field(default=None, description="Assigned veterinarian ID")
    doctor_name: Optional[str] = Field(default=None, description="Assigned veterinarian name")
    
    animal_tag: str = Field(..., description="12-digit Pashu Aadhaar ear tag")
    species: str = Field(..., description="Species e.g. Cow, Buffalo, Goat")
    breed: Optional[str] = Field(default=None, description="Breed name")
    
    syndrome_code: str = Field(..., description="Primary syndrome code (e.g. VSS, NSLS, HSDS)")
    syndrome_name: str = Field(..., description="Localized syndrome description")
    symptoms: Optional[str] = Field(default=None, description="Observed clinical symptoms")
    ai_differential: Optional[str] = Field(default=None, description="AI triage diagnostic differential")
    urgency: Optional[str] = Field(default="HIGH", description="NORMAL, HIGH, CRITICAL")
    interim_advice: Optional[str] = Field(default=None, description="Interim first-aid advice while awaiting doctor")

    # Multimodal AI Metadata
    photo_url: Optional[str] = Field(default=None, description="URL or WebP image string of the lesion")
    audio_url: Optional[str] = Field(default=None, description="URL or base64 of the audio recording")
    audio_transcript: Optional[str] = Field(default=None, description="Vernacular voice transcript")
    clinical_confidence: Optional[float] = Field(default=None, description="Gemini confidence score 0.0 - 1.0")
    clinical_rationale: Optional[str] = Field(default=None, description="Detailed epidemiological rationale")
    identified_symptoms: Optional[str] = Field(default=None, description="JSON or comma-separated symptom tags")
    containment_actions: Optional[str] = Field(default=None, description="JSON or text containment directives")
    biohazard_alert: Optional[str] = Field(default=None, description="Biohazard alert level")
    model_used: Optional[str] = Field(default=None, description="Inference model e.g. Gemini 3.7 Flash")
    ai_report_json: Optional[str] = Field(default=None, description="Full raw TriageResponse JSON")
    
    village_name: Optional[str] = Field(default="Ashwi Budruk", description="Village name")
    block_name: Optional[str] = Field(default="Rahuri", description="Taluka / Block name")
    district_name: Optional[str] = Field(default="Ahmednagar", description="District name")
    latitude: Optional[float] = Field(default=19.3912, description="Latitude coordinate")
    longitude: Optional[float] = Field(default=74.6521, description="Longitude coordinate")

    model_config = ConfigDict(extra="ignore")


class CaseUpdate(BaseModel):
    status: Optional[str] = Field(default=None, description="AWAITING_DOCTOR, IN_CONSULTATION, VISIT_SCHEDULED, RESOLVED")
    doctor_id: Optional[str] = Field(default=None, description="Assigned veterinarian ID")
    doctor_name: Optional[str] = Field(default=None, description="Assigned veterinarian name")
    doctor_phone_masked: Optional[str] = Field(default=None, description="Veterinarian masked contact")
    doctor_notes: Optional[str] = Field(default=None, description="Clinical notes from doctor examination")
    prescription: Optional[str] = Field(default=None, description="Medical prescription & supportive care")
    visit_eta: Optional[str] = Field(default=None, description="Estimated time of arrival for field inspection")
    ai_differential: Optional[str] = Field(default=None, description="Updated or confirmed differential")

    model_config = ConfigDict(extra="ignore")


class ConsultationLogRequest(BaseModel):
    channel: str = Field(default="VIDEO", description="VIDEO, AUDIO, FIELD_VISIT")
    notes: Optional[str] = Field(default=None, description="Summary notes from tele-consultation")


class CaseResponse(BaseModel):
    id: str
    report_id: Optional[str] = None
    farmer_id: str
    farmer_name: str
    farmer_phone_masked: str
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_phone_masked: Optional[str] = None
    animal_tag: str
    species: str
    breed: Optional[str] = None
    syndrome_code: str
    syndrome_name: str
    symptoms: Optional[str] = None
    ai_differential: Optional[str] = None
    urgency: str = "HIGH"
    status: str = "AWAITING_DOCTOR"
    interim_advice: Optional[str] = None
    doctor_notes: Optional[str] = None
    prescription: Optional[str] = None
    visit_eta: Optional[str] = None
    photo_url: Optional[str] = None
    audio_url: Optional[str] = None
    audio_transcript: Optional[str] = None
    clinical_confidence: Optional[float] = None
    clinical_rationale: Optional[str] = None
    identified_symptoms: Optional[str] = None
    containment_actions: Optional[str] = None
    biohazard_alert: Optional[str] = None
    model_used: Optional[str] = None
    ai_report_json: Optional[str] = None
    village_name: str
    block_name: str
    district_name: str
    latitude: float
    longitude: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseListResponse(BaseModel):
    total: int
    active_count: int
    items: List[CaseResponse]
