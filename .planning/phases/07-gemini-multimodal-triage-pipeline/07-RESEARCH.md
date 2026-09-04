# Phase 7: Google Gemini 3.7 Flash Multimodal Triage Pipeline - Research

**Phase:** 07  
**Status:** Completed  
**Domain:** Google GenAI SDK, Multimodal Vision, Indic Audio NLP, Veterinary Triage, Biohazard Safety  
**Requirements Addressed:** `AI-01`, `AI-02`, `AI-03`  

---

## 1. Google GenAI SDK Architecture (`google-genai`)

The official Google GenAI Python SDK (`google-genai`) provides:
```python
from google import genai
from google.genai import types

client = genai.Client(api_key=settings.GEMINI_API_KEY)

response = client.models.generate_content(
    model="gemini-2.5-flash", # or gemini-3.7-flash
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/webp"),
        prompt_text,
    ],
    config=types.GenerateContentConfig(
        system_instruction=VETERINARY_SYSTEM_PROMPT,
        response_mime_type="application/json",
        response_schema=TriageResultSchema,
        temperature=0.1, # Near-deterministic for clinical consistency
    ),
)
```

### Fast Image & Audio Handling:
- Lesion photos are compressed to WebP on mobile (<300 KB, 1280x720) and sent via base64 or multipart upload.
- Vernacular audio notes (15-30s) are converted to raw bytes or transcribed transcripts.
- If base64 payload is received, the backend strips the data URI prefix (`data:image/webp;base64,`) and decodes to raw bytes in microseconds.

---

## 2. Neuro-Symbolic Safety Architecture (Rule Zero Override)

To prevent hallucination of fatal zoonoses (Anthrax / Blackleg):
1. **Gemini Multimodal Inference:** Extracts syndromic classification and clinical markers.
2. **Deterministic Post-Filter (Rule Zero):**
   ```python
   # If sudden death with unclotted orifice bleeding is present in symptoms or transcript:
   if (
       "sudden death" in symptoms_lower
       or "unclotted blood" in symptoms_lower
       or "अचानक मृत्यू" in symptoms_lower
       or "रक्तस्त्राव" in symptoms_lower
   ):
       result.syndrome_code = "SARF"
       result.suspected_disease = "Anthrax (काळपुळी / पटकी)"
       result.biohazard_alert = "CRITICAL_ANTHRAX_LOCK"
       result.clinical_confidence = 1.0
       result.immediate_advisory_marathi = "तातडीने सावध रहा! जनावर कापू नका (DO NOT OPEN CARCASS). शव तातडीने पुरून टाका व ६ फूट खोल खड्यात चुना टाका."
   ```

---

## 3. High-Speed Fallback Engine (`HybridRuleEvaluator`)

When `GEMINI_API_KEY` is not provided (offline testing, CI/CD, rate limits):
- A deterministic keyword & symptom ontology parses:
  - `VSS`: "fmd", "blister", "mouth", "drool", "saliva", "खुर", "लाळ", "फोड", "पायात जखमा" -> FMD (confidence 0.92)
  - `NSLS`: "lump", "nodule", "skin", "गाठी", "लंपी", "त्वचा" -> LSD (confidence 0.95)
  - `HSDS`: "throat", "swelling", "ghatwasa", "galghotu", "घसा", "घटसर्प" -> HS (confidence 0.90)
  - `SARF`: "death", "blood", "bleeding", "anthrax", "मृत्यू", "रक्त" -> Anthrax (confidence 0.99)
- Executes in `<5ms` and produces an identical Pydantic `TriageResponse` schema.

---

## 4. Vernacular Advisory Generation (`AI-03`)

The triage output includes instant biosecurity directives tailored for Indian smallholder farmers:
- **FMD (VSS):**
  - **Marathi:** "बाधित जनावराला तात्काळ इतर जनावरांपासून वेगळे (किमान १५ मीटर) बांधा. पोटॅशियम परमँगनेटच्या पाण्याने (१:१०००) तोंड व पाय स्वच्छ धुवा. निरोगी जनावरांचे दूध आधी काढा."
  - **Hindi:** "संक्रमित पशु को तुरंत अन्य पशुओं से अलग (कम से कम 15 मीटर दूर) बांधें। पोटाश (लाल दवा) के हल्के घोल से मुंह और खुरों को धोएं।"
- **LSD (NSLS):**
  - **Marathi:** "गोठ्यात डास व माश्यांचा प्रादुर्भाव रोखण्यासाठी धूर करा. निंबोळी तेलाचा लेप अंगावरील गाठींवर लावा. जनावरांची वाहतूक पूर्णपणे थांबवा."
  - **Hindi:** "मक्खी और मच्छरों से बचाव के लिए नीम के पत्तों का धुआं करें। पशु को छायादार जगह पर रखें और नीम के तेल का लेप करें।"
- **Anthrax (SARF):**
  - **Marathi:** "धोका! मृत जनावराचे शवविच्छेदन (कापणे) अजिबात करू नका. मानवाला संसर्ग होण्याचा तीव्र धोका आहे. शव ६ फूट खोल चुन्याच्या थरात गाडा."
  - **Hindi:** "खतरा! मृत पशु का पोस्टमार्टम न करें और न ही खाल उतारें। यह बीमारी इंसानों में भी फैल सकती है। शव को गहरे गड्ढे में चूना डालकर दफनाएं।"

---

## 5. Mobile Integration Surface

- `ReportWizardView.tsx`: Displays real-time triage recommendation when photo or audio is attached.
- `AIAnalysisModal.tsx` or `TriageResultCard.tsx`: Rich feedback card showing:
  - Syndrome code pill with matching icon & color
  - Clinical confidence meter (e.g. 94%)
  - Audio summary / transcription
  - Localized Marathi & Hindi containment action pills
