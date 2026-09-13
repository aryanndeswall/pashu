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


class TemporaryFirstAid(BaseModel):
    summary_mr: str = Field(..., description="Short temporary first aid summary in Marathi")
    summary_hi: str = Field(..., description="Short temporary first aid summary in Hindi")
    summary_en: str = Field(..., description="Short temporary first aid summary in English")
    immediate_actions_mr: List[str] = Field(default=[], description="Actionable first-aid steps for the farmer in Marathi")
    immediate_actions_hi: List[str] = Field(default=[], description="Actionable first-aid steps in Hindi")
    immediate_actions_en: List[str] = Field(default=[], description="Actionable first-aid steps in English")
    do_not_do_mr: List[str] = Field(default=[], description="Strict 'What NOT to do' prohibitions in Marathi")
    do_not_do_hi: List[str] = Field(default=[], description="Strict 'What NOT to do' prohibitions in Hindi")
    do_not_do_en: List[str] = Field(default=[], description="Strict 'What NOT to do' prohibitions in English")
    warning_signs_mr: List[str] = Field(default=[], description="Emergency warning red flags in Marathi")
    warning_signs_en: List[str] = Field(default=[], description="Emergency warning red flags in English")
    doctor_urgency: Literal["ROUTINE", "URGENT", "EMERGENCY"] = Field(
        default="URGENT",
        description="Clinical triage urgency level while awaiting veterinary consult"
    )
    teleconsult_recommended: bool = Field(default=True, description="Whether immediate video/teleconsult is advised")

    model_config = ConfigDict(from_attributes=True)


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
    immediate_advisory_en: Optional[str] = None
    recommended_containment_actions: List[str] = []
    recommended_containment_actions_en: Optional[List[str]] = None
    temporary_first_aid: Optional[TemporaryFirstAid] = None
    suspected_disease_en: Optional[str] = None
    clinical_rationale_en: Optional[str] = None
    inference_time_ms: int
    model_used: str

    model_config = ConfigDict(from_attributes=True)

