from typing import List, Literal, Optional
from pydantic import BaseModel, Field, ConfigDict

SyndromeCode = Literal["VSS", "NSLS", "HSDS", "AROS", "CMSS", "SARF", "HES", "NAS"]
BiohazardAlert = Literal["NONE", "WARNING", "CRITICAL_ANTHRAX_LOCK"]

SYNDROME_METADATA = {
    "VSS": {
        "en": "Vesicular Stomatitis Syndrome",
        "mr": "लाळ्या खुरकूत संलक्षण",
        "disease": "Foot and Mouth Disease (FMD)",
    },
    "NSLS": {
        "en": "Nodular Skin Lesion Syndrome",
        "mr": "लंपी त्वचा संलक्षण",
        "disease": "Lumpy Skin Disease (LSD)",
    },
    "HSDS": {
        "en": "Hemorrhagic Septicemic Disease",
        "mr": "घटसर्प (गळघोटू)",
        "disease": "Hemorrhagic Septicemia (HS)",
    },
    "AROS": {
        "en": "Acute Respiratory Outbreak Syndrome",
        "mr": "तीव्र श्वसन संलक्षण",
        "disease": "Peste des Petits Ruminants (PPR)",
    },
    "CMSS": {
        "en": "Clinical Mastitis & Wasting Syndrome",
        "mr": "कासदाह संलक्षण",
        "disease": "Clinical Bovine Mastitis",
    },
    "SARF": {
        "en": "Sudden Death with Bleeding Syndrome",
        "mr": "काळपुळी (पटकी / ॲन्थ्रॅक्स)",
        "disease": "Anthrax (Bacillus anthracis)",
    },
    "HES": {
        "en": "Hemorrhagic Enteritis Syndrome",
        "mr": "तीव्र रक्तमिश्रित हगवण",
        "disease": "Blackleg (Black Quarter)",
    },
    "NAS": {
        "en": "Neurological & Abortion Syndrome",
        "mr": "मज्जासंस्था व गर्भपात संलक्षण",
        "disease": "Brucellosis / Rabies",
    },
}


class TriageRequest(BaseModel):
    photo_base64: Optional[str] = Field(
        default=None,
        description="Base64 encoded lesion photo (WebP/JPEG)",
    )
    photo_uri: Optional[str] = Field(
        default=None,
        description="Cloud Storage URI (gs://... or signed https://) for zero-egress ingestion",
    )
    audio_base64: Optional[str] = Field(
        default=None,
        description="Base64 encoded audio note (m4a/opus/wav)",
    )
    audio_uri: Optional[str] = Field(
        default=None,
        description="Cloud Storage URI for audio note",
    )
    audio_transcript: Optional[str] = Field(
        default=None,
        description="Vernacular Marathi/Hindi speech transcript or notes",
    )
    species: str = Field(
        default="Bovine",
        description="Animal species (Bovine, Buffalo, Caprine, Ovine)",
    )
    secondary_symptoms: List[str] = Field(
        default=[],
        description="Observed clinical symptoms list",
    )
    village_lgd_code: Optional[int] = Field(
        default=None,
        description="Optional LGD village code for spatial context",
    )

    model_config = ConfigDict(extra="ignore")


class TriageResponse(BaseModel):
    syndrome_code: SyndromeCode
    syndrome_name_en: str
    syndrome_name_marathi: str
    suspected_disease: str
    clinical_confidence: float = Field(..., ge=0.0, le=1.0)
    biohazard_alert: BiohazardAlert
    clinical_rationale: str
    identified_symptoms: List[str] = []
    immediate_advisory_marathi: str
    immediate_advisory_hindi: str
    recommended_containment_actions: List[str] = []
    inference_time_ms: int
    model_used: str

    model_config = ConfigDict(from_attributes=True)
