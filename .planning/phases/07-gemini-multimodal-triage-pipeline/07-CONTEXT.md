# Phase 7: Google Gemini 3.7 Flash Multimodal Triage Pipeline - Context & Decisions

**Phase:** 07  
**Status:** Ready to execute  
**Created:** 2026-09-04  
**Requirements Addressed:** `AI-01`, `AI-02`, `AI-03`  
**Mode:** Ponytail Ultra (Clean architecture, sub-second inference, strict JSON schema, robust rule-based fallback)

---

## 1. Executive Summary & Core Objective

Phase 7 builds the cloud multimodal perception tier and AI diagnostic brain of Pashu-Suraksha:
- **Sub-Second Multimodal Inference (`AI-01`):** Analyzes cattle lesion photos (oral blisters, interdigital ulcers, skin lumps) and colloquial Marathi/Hindi voice recordings using Google Gemini 3.7 Flash in <800ms.
- **Strict Clinical JSON Schema (`AI-02`):** Maps unstructured vernacular descriptions and visual features directly into the 8 standardized syndromic categories (`VSS`, `NSLS`, `HSDS`, `AROS`, `CMSS`, `SARF`, `HES`, `NAS`) with clinical confidence scores and veterinary rationale.
- **Localized Vernacular Containment Advisories (`AI-03`):** Generates actionable biosecurity directives in Marathi and Hindi (quarantine distance, movement freeze, biohazard warnings) for immediate field execution.
- **Deterministic Offline/Test Fallback:** Provides zero-dependency hybrid neuro-symbolic rule evaluator when API keys are absent or network is restricted, ensuring 100% test reliability in CI and dead zones.

---

## 2. Locked Architectural Decisions

### A. Google GenAI SDK & Structured Outputs
- **SDK Selection:** Official `google-genai` Python SDK (`from google import genai; from google.genai import types`).
- **Model:** `gemini-2.5-flash` / `gemini-3.7-flash` with strict JSON schema definition using Pydantic v2 schemas (`response_mime_type="application/json"`).
- **Configuration:** In `backend/app/config.py`:
  - `GEMINI_API_KEY: Optional[str] = None`
  - `GEMINI_MODEL: str = "gemini-2.5-flash"`
  - `AI_INFERENCE_TIMEOUT_SECONDS: float = 3.0`

### B. 8 Clinical Syndromic Categories & Disease Mappings
| Syndrome Code | English Name | Marathi Clinical Name | Suspected Diseases | Visual & Clinical Markers |
|---|---|---|---|---|
| **`VSS`** | Vesicular Syndrome | लाळ्या खुरकूत संलक्षण | FMD, Vesicular Stomatitis | Oral vesicles, excessive saliva (laar), foot blisters, limping |
| **`NSLS`** | Nodular Skin Lesion | लंपी त्वचा संलक्षण | Lumpy Skin Disease (LSD) | Firm cutaneous nodules (2-5cm), enlarged lymph nodes, fever |
| **`HSDS`** | Hemorrhagic Septicemic Disease | घटसर्प (गळघोटू) | Hemorrhagic Septicemia (HS) | Submandibular swelling, throat edema, dyspnea, fever |
| **`AROS`** | Acute Respiratory Outbreak | तीव्र श्वसन संलक्षण | PPR, Contagious Bovine Pleuropneumonia | Muco-purulent nasal discharge, coughing, pneumonia |
| **`CMSS`** | Clinical Mastitis & Wasting | कासदाह व क्षयरोग | Mastitis, Bovine TB | Swollen inflamed udder, blood/clots in milk |
| **`SARF`** | Sudden Death with Bleeding | काळपुळी (पटकी / ॲन्थ्रॅक्स) | Anthrax, Black Quarter | Sudden collapse, unclotted blood from orifices -> **BIOHAZARD LOCK** |
| **`HES`** | Hemorrhagic Enteritis | तीव्र रक्तमिश्रित हगवण | Blackleg (BQ), Coccidiosis | Dark fetid diarrhea, recumbency, crepitant swelling |
| **`NAS`** | Neurological & Abortion | मज्जासंस्था व गर्भपात | Brucellosis, Rabies | Late-term abortion, circling, tremors, paralysis |

### C. Vernacular Indic Audio Processing (Marathi / Hindi)
- Understands rural dialect vocabulary:
  - *लाळ गळणे (drooling)*, *तोंडात फोड (mouth blisters)*, *खुर पिकणे (foot rot)* -> `VSS`
  - *अंगावर गाठी (nodules on body)*, *त्वचेवर फोड (skin lumps)* -> `NSLS`
  - *घसा सुजला (throat swollen)*, *घरघर आवाज (rattling breathing)* -> `HSDS`
  - *अचानक मृत्यू (sudden death)*, *नाकातून काळे रक्त (dark blood from nose)* -> `SARF` (Instant Lockout)

### D. Triage Endpoint Contract (`POST /api/v1/triage/multimodal`)
- **Payload:**
  - `photo_base64`: Optional WebP lesion photo string.
  - `audio_base64`: Optional audio note.
  - `audio_transcript`: Optional text transcript.
  - `species`: Bovine / Caprine / Ovine.
  - `secondary_symptoms`: Array of string symptoms.
- **Response:**
  - `syndrome_code`: One of 8 standard codes.
  - `syndrome_name_en`: English syndrome name.
  - `syndrome_name_marathi`: Marathi syndrome name.
  - `suspected_disease`: Specific disease (e.g. "Foot and Mouth Disease (FMD)").
  - `clinical_confidence`: Float score (0.00 - 1.00).
  - `biohazard_alert`: `NONE` | `WARNING` | `CRITICAL_ANTHRAX_LOCK`.
  - `clinical_rationale`: Veterinary reasoning for transparency.
  - `identified_symptoms`: Array of clinical markers extracted.
  - `immediate_advisory_marathi`: Vernacular biosecurity directive.
  - `immediate_advisory_hindi`: Hindi biosecurity directive.
  - `recommended_containment_actions`: Array of actionable steps.
  - `inference_time_ms`: Sub-second execution duration.

---

## 3. Threat Model & Safeguards

| Threat ID | Category | Component | Description | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-07-01 | Anthrax Hallucination | triage service | AI fails to flag sudden death with bleeding, missing fatal zoonosis | Neuro-symbolic safety override: Rule Zero hardcoded check overrides AI model output to `CRITICAL_ANTHRAX_LOCK` whenever bleeding/sudden death markers appear. |
| T-07-02 | Service Denial / Latency | Gemini client | Network timeout or quota exhaustion halts field reporting | Fallback to deterministic local heuristic engine (`HybridRuleEvaluator`) with <50ms response time when Google API is unreachable. |
| T-07-03 | Unstructured Output | Pydantic parser | Gemini output fails JSON parsing | Enforce Pydantic schema validation with default schema recovery if malformed. |
