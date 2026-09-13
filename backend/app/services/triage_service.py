import base64
import json
import logging
import time
from typing import Optional, List
from app.config import settings
from app.schemas.triage import (
    TriageRequest,
    TriageResponse,
    SyndromeCode,
    BiohazardAlert,
    SYNDROME_METADATA,
)

logger = logging.getLogger(__name__)

VETERINARY_SYSTEM_PROMPT = """
You are Pashu-Suraksha AI, an authoritative veterinary epidemiologist and triage specialist for rural India.
Analyze the provided multimodal inputs (lesion photos, vernacular voice transcript in Marathi/Hindi, species, observed symptoms)
and map the clinical case into EXACTLY ONE of the 8 standardized national syndromic categories:
1. VSS: Vesicular Stomatitis Syndrome (Foot & Mouth Disease - blisters on tongue/mouth/feet, excessive ropy salivation).
2. NSLS: Nodular Skin Lesion Syndrome (Lumpy Skin Disease - 2-5cm round cutaneous nodules, fever, lymphadenopathy).
3. HSDS: Hemorrhagic Septicemic Disease (Ghatsarpa/Galghotu - hot painful throat swelling, severe respiratory dyspnea).
4. AROS: Acute Respiratory Outbreak Syndrome (PPR / Goat Plague - nasal discharge, crusting, pneumonia).
5. CMSS: Clinical Mastitis & Wasting Syndrome (Swollen hot painful udder, abnormal milk clots/blood).
6. SARF: Sudden Death with Bleeding Syndrome (Anthrax / Patkhi - sudden collapse with dark unclotted blood from orifices).
7. HES: Hemorrhagic Enteritis Syndrome (Blackleg/BQ - bloody foul diarrhea, crepitant muscular swelling).
8. NAS: Neurological & Abortion Syndrome (Late-term abortion, circling, blindness, tremors).

CRITICAL BIOHAZARD DIRECTIVE (RULE ZERO):
If there is ANY mention or sign of sudden unexpected death accompanied by dark, unclotted blood oozing from mouth, nostrils, or rectum:
- You MUST classify as SARF with suspected disease "Anthrax (Bacillus anthracis)".
- You MUST set biohazard_alert = "CRITICAL_ANTHRAX_LOCK".
- You MUST issue strict Marathi and Hindi directives: DO NOT OPEN OR CUT THE CARCASS (शवविच्छेदन अजिबात करू नका).

Output must strictly adhere to the requested JSON schema.
"""


class EdgeRulesEvaluator:
    """
    High-speed deterministic heuristic evaluator for rural offline dead zones
    and test runner environments. Executes in <5ms with zero external network dependencies.
    """

    @staticmethod
    def evaluate(request: TriageRequest, start_time: float) -> TriageResponse:
        # Collect all text signals for lexical evaluation
        tokens: List[str] = []
        if request.audio_transcript:
            tokens.append(request.audio_transcript.lower())
        for s in request.secondary_symptoms:
            tokens.append(s.lower())

        combined_text = " ".join(tokens)

        # 1. Rule Zero Deterministic Safety Check: Anthrax Lockout
        anthrax_keywords = [
            "sudden death",
            "unclotted blood",
            "orifice bleeding",
            "patkhi",
            "anthrax",
            "अचानक मृत्यू",
            "रक्तस्त्राव",
            "काळे रक्त",
            "पटकी",
            "काळपुळी",
            "शव",
        ]
        is_anthrax = any(k in combined_text for k in anthrax_keywords)
        if is_anthrax:
            inference_ms = max(1, int((time.time() - start_time) * 1000))
            return TriageResponse(
                syndrome_code="SARF",
                syndrome_name_en=SYNDROME_METADATA["SARF"]["en"],
                syndrome_name_marathi=SYNDROME_METADATA["SARF"]["mr"],
                suspected_disease="काळपुळी / ॲन्थ्रॅक्स (Anthrax - Bacillus anthracis)",
                suspected_disease_en="Anthrax (Bacillus anthracis)",
                clinical_confidence=0.99,
                biohazard_alert="CRITICAL_ANTHRAX_LOCK",
                clinical_rationale="तातडीचा धोका: अचानक मृत्यू व नैसर्गिक छिद्रांमधून न गोठणारे रक्तस्त्राव हे ॲन्थ्रॅक्सचे (काळपुळी) प्राथमिक लक्षण आहे. मानवास संसर्ग होण्याचा अतिधोका आहे.",
                clinical_rationale_en="Critical emergency: sudden unexpected death with unclotted orifice bleeding is characteristic of Anthrax. High zoonotic transmission risk.",
                identified_symptoms=["अचानक मृत्यू (Sudden Death)", "छिद्रांतून रक्तस्त्राव (Orifice Bleeding)"],
                immediate_advisory_marathi="धोका! मृत जनावराचे शव कापू नका (DO NOT OPEN CARCASS). मानवाला संसर्ग होण्याचा तीव्र धोका आहे. शव ६ फूट खोल चुन्याच्या थरात गाडा.",
                immediate_advisory_hindi="खतरा! मृत पशु का पोस्टमार्टम न करें। यह बीमारी इंसानों में भी फैल सकती है। शव को 6 फीट गहरे गड्ढे में चूना डालकर दफनाएं।",
                immediate_advisory_en="DANGER! DO NOT OPEN OR CUT THE CARCASS. High risk of fatal transmission. Deeply bury carcass in a 6-foot pit covered with lime.",
                recommended_containment_actions=[
                    "शवविच्छेदन त्वरित थांबवा (Movement Freeze)",
                    "परिसरात जनावरे व मानवी हालचाली प्रतिबंधित करा",
                    "तालुका पशुवैद्यकीय अधिकाऱ्यांना तात्काळ कळवा",
                    "५ किमी परिघात रिंग लसीकरण सुरू करा",
                ],
                recommended_containment_actions_en=[
                    "Halt carcass necropsy immediately (Movement Freeze)",
                    "Restrict all animal and human movement in perimeter",
                    "Notify Taluka Veterinary Officer immediately",
                    "Initiate ring vaccination within 5 km radius",
                ],
                inference_time_ms=inference_ms,
                model_used="EdgeRulesEvaluator-RuleZeroSafety",
            )

        # 2. Vesicular Stomatitis Syndrome (FMD)
        vss_keywords = [
            "fmd", "blister", "mouth", "drool", "saliva", "vesicle", "hoof",
            "तोंडात फोड", "लाळ", "लाळ्या", "खुरकूत", "पायात जखमा", "खुर", "लाळ गळणे"
        ]
        if any(k in combined_text for k in vss_keywords):
            inference_ms = max(1, int((time.time() - start_time) * 1000))
            return TriageResponse(
                syndrome_code="VSS",
                syndrome_name_en=SYNDROME_METADATA["VSS"]["en"],
                syndrome_name_marathi=SYNDROME_METADATA["VSS"]["mr"],
                suspected_disease="लाळ्या खुरकूत (Foot & Mouth Disease - FMD)",
                suspected_disease_en="Foot & Mouth Disease (FMD) / Vesicular Lesions",
                clinical_confidence=0.94,
                biohazard_alert="WARNING",
                clinical_rationale="तोंडातील फोड, पांढरी लाळ गळणे आणि पायातील खुरांच्या जखमा हे लाळ्या खुरकूत (FMD) आजाराचे स्पष्ट संकेत आहेत.",
                clinical_rationale_en="Oral blisters, profuse salivation, and hoof lesions are classic signs of Foot & Mouth Disease (FMD).",
                identified_symptoms=["तोंडात फोड (Oral Vesicles)", "लाळ गळणे (Hypersalivation)", "पायात जखमा (Foot Lesions)"],
                immediate_advisory_marathi="बाधित जनावराला तात्काळ इतर जनावरांपासून वेगळे (किमान १५ मीटर) बांधा. पोटॅशियम परमँगनेटच्या पाण्याने (१:१०००) तोंड व पाय स्वच्छ धुवा. निरोगी जनावरांचे दूध आधी काढा.",
                immediate_advisory_hindi="संक्रमित पशु को तुरंत अन्य पशुओं से अलग (कम से कम 15 मीटर दूर) बांधें। पोटाश (लाल दवा) के हल्के घोल से मुंह और खुरों को धोएं।",
                immediate_advisory_en="Isolate affected animal immediately (min 15 meters from herd). Wash mouth and foot lesions with dilute potassium permanganate (1:1000). Milk healthy animals first.",
                recommended_containment_actions=[
                    "बाधित जनावरांचे विलगीकरण (15m Isolation)",
                    "पोटॅशियम परमँगनेट द्रावणाने निर्जंतुकीकरण",
                    "दूध व जनावरांची बाजारात विक्री तात्काळ थांबवा",
                ],
                recommended_containment_actions_en=[
                    "Isolate affected livestock (15m Isolation)",
                    "Disinfect with potassium permanganate solution",
                    "Immediately halt milk and livestock market transport",
                ],
                inference_time_ms=inference_ms,
                model_used="EdgeRulesEvaluator-Heuristic",
            )

        # 3. Nodular Skin Lesion Syndrome (LSD)
        nsls_keywords = [
            "lsd", "lump", "nodule", "skin", "lumpy",
            "गाठी", "त्वचा", "लंपी", "अंगावर गाठी", "फोड"
        ]
        if any(k in combined_text for k in nsls_keywords):
            inference_ms = max(1, int((time.time() - start_time) * 1000))
            return TriageResponse(
                syndrome_code="NSLS",
                syndrome_name_en=SYNDROME_METADATA["NSLS"]["en"],
                syndrome_name_marathi=SYNDROME_METADATA["NSLS"]["mr"],
                suspected_disease="लंपी त्वचा रोग (Lumpy Skin Disease - LSD)",
                suspected_disease_en="Lumpy Skin Disease (LSD)",
                clinical_confidence=0.92,
                biohazard_alert="WARNING",
                clinical_rationale="त्वचेवर २-५ सेमी आकाराच्या कडक गाठी आणि ताप हे लंपी त्वचा रोगाचे (LSD) लक्षण आहे.",
                clinical_rationale_en="Circumscribed firm nodular skin lesions (2-5 cm) and fever indicate Lumpy Skin Disease (LSD).",
                identified_symptoms=["त्वचेवर गाठी (Nodular Skin Lesions)", "ताप (Pyrexia)"],
                immediate_advisory_marathi="गोठ्यात डास व माश्यांचा प्रादुर्भाव रोखण्यासाठी कडुनिंबाचा धूर करा. निंबोळी तेलाचा लेप अंगावरील गाठींवर लावा. जनावरांची वाहतूक पूर्णपणे थांबवा.",
                immediate_advisory_hindi="मक्खी और मच्छरों से बचाव के लिए नीम के पत्तों का धुआं करें। पशु को छायादार जगह पर रखें और नीम के तेल का लेप करें।",
                immediate_advisory_en="Burn neem leaves in the barn to repel flies and mosquitoes. Apply topical neem oil over nodules. Completely halt livestock transit.",
                recommended_containment_actions=[
                    "कीटक व माश्यांचे नियंत्रण (Vector Control)",
                    "गोठ्याची स्वच्छता व निंबोळी धूर",
                    "परिसरातील निरोगी जनावरांचे गोटपॉक्स लसीकरण",
                ],
                recommended_containment_actions_en=[
                    "Vector and biting insect control",
                    "Barn sanitation and neem smudge smoke",
                    "Ring vaccination with goat pox vaccine",
                ],
                inference_time_ms=inference_ms,
                model_used="EdgeRulesEvaluator-Heuristic",
            )

        # 4. Hemorrhagic Septicemic Disease (HS)
        hsds_keywords = [
            "hs", "throat", "swelling", "galghotu", "ghatwasa",
            "घसा", "घटसर्प", "गळघोटू", "घरघर"
        ]
        if any(k in combined_text for k in hsds_keywords):
            inference_ms = max(1, int((time.time() - start_time) * 1000))
            return TriageResponse(
                syndrome_code="HSDS",
                syndrome_name_en=SYNDROME_METADATA["HSDS"]["en"],
                syndrome_name_marathi=SYNDROME_METADATA["HSDS"]["mr"],
                suspected_disease="घटसर्प / गळघोटू (Hemorrhagic Septicemia - HS)",
                suspected_disease_en="Hemorrhagic Septicemia (HS)",
                clinical_confidence=0.91,
                biohazard_alert="WARNING",
                clinical_rationale="घशाखालील तीव्र सूज आणि श्वास घेताना घरघर आवाज हे घटसर्पाचे (HS) अतिगंभीर लक्षण आहे.",
                clinical_rationale_en="Severe submandibular throat swelling and stertorous breathing indicate Hemorrhagic Septicemia (HS).",
                identified_symptoms=["घशाखालील सूज (Submandibular Edema)", "श्वासास अडथळा (Dyspnea)"],
                immediate_advisory_marathi="अतितातडीची स्थिती! पशुवैद्यकीय डॉक्टरांकडून तातडीने प्रतिजैविके (Antibiotics) टोचून घ्या. जनावराला मोकळ्या हवेत बांधा.",
                immediate_advisory_hindi="आपातकालीन स्थिति! पशु चिकित्सक से तुरंत एंटीबायोटिक का टीका लगवाएं। पशु को खुली हवा में रखें।",
                immediate_advisory_en="EMERGENCY! Administer veterinary antibiotics immediately under professional supervision. Relocate animal to open-air shelter.",
                recommended_containment_actions=[
                    "तातडीने पशुवैद्यकीय उपचार बोलवा",
                    "पाणी व खाद्याची भांडी वेगळी करा",
                ],
                recommended_containment_actions_en=[
                    "Summon emergency veterinary medical care",
                    "Separate feed and water troughs",
                ],
                inference_time_ms=inference_ms,
                model_used="EdgeRulesEvaluator-Heuristic",
            )

        # Default fallback to VSS with moderate confidence
        inference_ms = max(1, int((time.time() - start_time) * 1000))
        return TriageResponse(
            syndrome_code="VSS",
            syndrome_name_en=SYNDROME_METADATA["VSS"]["en"],
            syndrome_name_marathi=SYNDROME_METADATA["VSS"]["mr"],
            suspected_disease="संशयित लाळ्या खुरकूत (Suspected Vesicular)",
            suspected_disease_en="Suspected Vesicular Stomatitis (FMD)",
            clinical_confidence=0.75,
            biohazard_alert="NONE",
            clinical_rationale="सर्वसाधारण लक्षणांवरून संशयित लाळ्या खुरकूत आजाराचे वर्गीकरण केले आहे.",
            clinical_rationale_en="Reported symptoms suggest possible vesicular or mucosal clinical condition.",
            identified_symptoms=request.secondary_symptoms or ["सामान्य अस्वस्थता"],
            immediate_advisory_marathi="जनावरावर लक्ष ठेवा आणि जवळच्या पशुवैद्यकीय दवाखान्याशी संपर्क साधा.",
            immediate_advisory_hindi="पशु की निगरानी करें और नजदीकी पशु चिकित्सालय से संपर्क करें।",
            immediate_advisory_en="Keep the animal under close observation, separate from healthy herd, and contact the local veterinary dispensary.",
            recommended_containment_actions=["जनावराचे विलगीकरण करा", "स्थानिक पशुवैद्यकास पाचारण करा"],
            recommended_containment_actions_en=["Isolate the animal from the herd", "Summon local veterinary doctor for examination"],
            inference_time_ms=inference_ms,
            model_used="EdgeRulesEvaluator-Default",
        )



class GeminiTriageService:
    """
    Multimodal perception client managing Google Gemini 3.7 / 2.5 Flash
    with automated Rule Zero Anthrax safety override and resilient offline heuristic fallback.
    """

    def __init__(self):
        self.client = None
        self._initialize_client()

    def initialize_client(self):
        """Initializes or reinitializes the Google GenAI client based on current settings."""
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info("Google GenAI client initialized successfully with model %s", settings.GEMINI_MODEL)
            except Exception as e:
                logger.warning("Failed to initialize Google GenAI client: %s. Using EdgeRules fallback.", e)
                self.client = None
        else:
            logger.info("GEMINI_API_KEY not configured. Running in EdgeRulesEvaluator fallback mode.")
            self.client = None

    def _initialize_client(self):
        self.initialize_client()

    async def triage(self, request: TriageRequest) -> TriageResponse:
        start_time = time.time()

        # Check for Anthrax keywords in input first (Rule Zero Pre-Filter)
        raw_text = f"{request.audio_transcript or ''} {' '.join(request.secondary_symptoms)}".lower()
        if any(w in raw_text for w in ["sudden death", "unclotted blood", "अचानक मृत्यू", "रक्तस्त्राव", "काळपुळी"]):
            return EdgeRulesEvaluator.evaluate(request, start_time)

        # If GenAI client is available, execute multimodal inference
        if self.client:
            try:
                from google.genai import types

                contents = []

                # Handle lesion photo if present (URI or base64)
                if request.photo_uri:
                    contents.append(types.Part.from_uri(file_uri=request.photo_uri, mime_type="image/webp"))
                elif request.photo_base64:
                    cleaned_b64 = request.photo_base64
                    if "," in cleaned_b64:
                        cleaned_b64 = cleaned_b64.split(",", 1)[1]
                    image_bytes = base64.b64decode(cleaned_b64)
                    contents.append(types.Part.from_bytes(data=image_bytes, mime_type="image/webp"))

                # Handle audio note if present (URI or base64)
                if request.audio_uri:
                    contents.append(types.Part.from_uri(file_uri=request.audio_uri, mime_type="audio/webm"))

                # Context prompt
                user_prompt = f"""
Animal Species: {request.species}
Secondary Symptoms: {', '.join(request.secondary_symptoms) if request.secondary_symptoms else 'None specified'}
Vernacular Voice Transcript: {request.audio_transcript or 'No audio transcript provided'}
Village LGD Code: {request.village_lgd_code or 'Unknown'}
"""
                contents.append(user_prompt)

                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=VETERINARY_SYSTEM_PROMPT,
                        response_mime_type="application/json",
                        response_schema=TriageResponse,
                        temperature=0.1,
                    ),
                )

                if response.text:
                    parsed_json = json.loads(response.text)
                    inference_ms = max(1, int((time.time() - start_time) * 1000))
                    parsed_json["inference_time_ms"] = inference_ms
                    parsed_json["model_used"] = f"Google-Gemini-{settings.GEMINI_MODEL}"

                    triage_obj = TriageResponse(**parsed_json)

                    # Post-Filter: Enforce Rule Zero hard-stop
                    if (
                        "sudden death" in raw_text
                        or "अचानक मृत्यू" in raw_text
                        or triage_obj.syndrome_code == "SARF"
                    ):
                        triage_obj.biohazard_alert = "CRITICAL_ANTHRAX_LOCK"

                    return triage_obj
            except Exception as e:
                logger.warning("Gemini GenAI inference encountered error: %s. Falling back to EdgeRules.", e)

        # Fallback to deterministic heuristic engine
        return EdgeRulesEvaluator.evaluate(request, start_time)


triage_service = GeminiTriageService()
