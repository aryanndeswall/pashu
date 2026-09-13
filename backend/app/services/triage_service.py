import base64
import json
import logging
import time
from typing import Optional, List
from app.config import settings
from app.schemas.triage import (
    TriageRequest,
    TriageResponse,
    TemporaryFirstAid,
    SyndromeCode,
    BiohazardAlert,
    SYNDROME_METADATA,
)

logger = logging.getLogger(__name__)

VETERINARY_SYSTEM_PROMPT = """
You are Pashu-Suraksha AI, an authoritative veterinary epidemiologist and triage specialist for rural India.
Analyze the provided multimodal inputs (lesion photos, Indic vernacular voice notes/audio in Marathi or Hindi, species, observed symptoms)
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

CRUCIAL REQUIREMENT — TEMPORARY FIRST-AID & SUPPORTIVE CARE (INTERIM PROTOCOL):
The livestock owner or Pashu Sakhi needs an immediate, safe, supportive temporary solution for the animal FOR THE INTERIM PERIOD while they wait for the official veterinarian's video call or formal e-prescription.
You MUST provide the 'temporary_first_aid' object:
1. summary_mr, summary_hi, summary_en: Clear 1-sentence interim care summary.
2. immediate_actions_mr, immediate_actions_hi, immediate_actions_en: 3-4 actionable, practical home first-aid measures (e.g., isolation in shaded stall, antiseptic washing of oral/foot lesions with mild potassium permanganate or alum water, topical neem oil for nodules, cool damp towel compresses for fever, electrolyte/jaggery hydration, soft rice/barley gruel).
3. do_not_do_mr, do_not_do_hi, do_not_do_en: 2-3 strict prohibitions (e.g., DO NOT puncture blisters or cut skin lumps, DO NOT give human medicines/paracetamol, DO NOT force feed dry roughage, DO NOT share water troughs).
4. warning_signs_mr, warning_signs_en: Red flag emergency symptoms requiring urgent teleconsultation or emergency doctor visit.
5. doctor_urgency: "ROUTINE", "URGENT", or "EMERGENCY".
6. teleconsult_recommended: true.

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
                temporary_first_aid=TemporaryFirstAid(
                    summary_mr="अतिधोकादायक संसर्ग! मृत जनावरास उघड्या हाताने स्पर्श करू नका किंवा कापू नका.",
                    summary_hi="अत्यंत खतरनाक संक्रमण! मृत पशु को बिना दस्ताने न छुएं और पोस्टमार्टम न करें।",
                    summary_en="CRITICAL BIOHAZARD! Do not touch or cut carcass. Awaiting emergency veterinary officer.",
                    immediate_actions_mr=[
                        "परिसरातील इतर सर्व जनावरांना त्वरित सुरक्षित अंतरावर हलवा.",
                        "मृत शरीरावर तात्काळ चुन्याची पावडर टाका आणि पोत्यांनी झाकून ठेवा.",
                        "शव हलवणे किंवा कापणे अजिबात करू नका."
                    ],
                    immediate_actions_hi=[
                        "अन्य सभी पशुओं को तुरंत सुरक्षित दूरी पर बांधें।",
                        "शव के ऊपर चूना पाउडर छिड़क कर ढक दें।",
                        "शव को काटने या हिलाने का प्रयास बिल्कुल न करें।"
                    ],
                    immediate_actions_en=[
                        "Evacuate and segregate all healthy herd animals immediately.",
                        "Cover carcass with quicklime and tarpaulin; do not disturb.",
                        "Keep children and family away from the contaminated area."
                    ],
                    do_not_do_mr=[
                        "शवविच्छेदन (Post-Mortem) किंवा कातडी काढणे अजिबात करू नका.",
                        "रक्त किंवा द्रव जमिनीवर अथवा पाण्यात वाहू देऊ नका.",
                        "उघड्या हाताने किंवा चपलांशिवाय मृत जनावराच्या जवळ जाऊ नका."
                    ],
                    do_not_do_hi=[
                        "शव का पोस्टमार्टम या खाल निकालने का प्रयास न करें।",
                        "खून या रिसाव को पानी या मिट्टी में न बहने दें।"
                    ],
                    do_not_do_en=[
                        "DO NOT perform necropsy or skin the carcass.",
                        "DO NOT allow orifice blood to contaminate soil or water bodies."
                    ],
                    warning_signs_mr=["नाक किंवा गुदद्वारातून काळे न गोठणारे रक्त येणे", "इतर जनावरांमध्ये अचानक ताप"],
                    warning_signs_en=["Unclotted dark blood oozing from orifices", "Sudden fever in herd mates"],
                    doctor_urgency="EMERGENCY",
                    teleconsult_recommended=True,
                ),
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
                clinical_rationale=" तोंडातील फोड, पांढरी लाळ गळणे आणि पायातील खुरांच्या जखमा हे लाळ्या खुरकूत (FMD) आजाराचे स्पष्ट संकेत आहेत.",
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
                temporary_first_aid=TemporaryFirstAid(
                    summary_mr="डॉक्टर येईपर्यंत बाधित जनावराचे विलगीकरण करा आणि तोंड-पायांचे व्रण सौम्य औषधाने धुवा.",
                    summary_hi="डॉक्टर के आने तक पशु को अलग रखें और मुंह व खुरों के छालों को लाल दवा से धोएं।",
                    summary_en="Isolate animal immediately, rinse oral ulcers with mild antiseptic, and provide liquid gruel.",
                    immediate_actions_mr=[
                        "बाधित जनावरास गोठ्यात इतर जनावरांपासून किमान १५ मीटर दूर सावलीत बांधा.",
                        "तोंडातील फोड सौम्य तुरटीच्या किंवा पोटॅशियम परमँगनेटच्या हलक्या गुलाबी पाण्याने (दिवसातून २ वेळा) धुवा.",
                        "पायातील खुरांच्या जखमांवर हळद व खोबरेल तेल किंवा कडुलिंबाचे तेल लावा.",
                        "कडक सुका चारा देऊ नका; मऊ भाताची पेज, गूळ-पाणी किंवा लापशी खाऊ घाला."
                    ],
                    immediate_actions_hi=[
                        "पशु को अन्य पशुओं से 15 मीटर दूर छायादार सूखी जगह पर बांधें।",
                        "मुंह के छालों को पोटाश (लाल दवा) के हल्के गुलाबी पानी या फिटकरी से धोएं।",
                        "खुरों के घाव पर हल्दी और नीम का तेल लगाएं।",
                        "सूखा चारा बंद करके पतली दलिया या चावल की मांड खाने को दें।"
                    ],
                    immediate_actions_en=[
                        "Isolate infected animal at least 15 meters from other livestock in a dry shaded stall.",
                        "Gently rinse mouth blisters twice daily with mild potassium permanganate (1:1000) or alum solution.",
                        "Apply turmeric with neem/coconut oil paste between hooves to prevent maggot infestation.",
                        "Offer soft, easily digestible gruel (cooked rice water/porridge) with jaggery electrolytes; avoid dry abrasive straw."
                    ],
                    do_not_do_mr=[
                        "तोंडातील किंवा खुरांमधील फोड सुरी किंवा ब्लेडने फोडू नका.",
                        "माणसांच्या ताप किंवा वेदनाशामक गोळ्या (पॅरासिटामॉल) डॉक्टरांच्या सल्ल्याशिवाय देऊ नका.",
                        "इतर निरोगी जनावरांसोबत एकाच पाण्याच्या हौदात पाणी पिऊ देऊ नका."
                    ],
                    do_not_do_hi=[
                        "छालों को सुई या ब्लेड से न फोड़ें।",
                        "इंसानों वाली दर्द या बुखार की दवाएं बिना डॉक्टर की सलाह के न दें।",
                        "स्वस्थ पशुओं के साथ एक ही बर्तन में पानी या चारा न दें।"
                    ],
                    do_not_do_en=[
                        "DO NOT puncture or scrape oral or interdigital blisters.",
                        "DO NOT administer human NSAIDs or paracetamol without veterinary calculation.",
                        "DO NOT allow shared communal watering or feed troughs."
                    ],
                    warning_signs_mr=["जनावराचे तापमान १०५°F पेक्षा जास्त वाढणे", "उभे राहण्यास पूर्ण असमर्थता"],
                    warning_signs_en=["Temperature exceeding 105°F", "Complete recumbency / inability to stand"],
                    doctor_urgency="URGENT",
                    teleconsult_recommended=True,
                ),
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
                temporary_first_aid=TemporaryFirstAid(
                    summary_mr="गोठ्यात डास-माश्यांचा प्रादुर्भाव रोखा आणि गाठींवर हळद व कडुलिंबाचे तेल लावा.",
                    summary_hi="मच्छर-मक्खियों से बचाव के लिए नीम का धुआं करें और गांठों पर हल्दी-नीम का लेप लगाएं।",
                    summary_en="Control biting insects with neem smoke, apply topical turmeric-neem paste on nodules, and manage fever.",
                    immediate_actions_mr=[
                        "बाधित जनावराला वेगळे बांधा आणि गोठ्यात संध्याकाळी कडुलिंबाच्या पाल्याचा धूर करा.",
                        "अंगावरील कडक गाठींवर हळद, कापूर आणि कडुलिंबाचे तेल यांचे मिश्रण हलक्या हाताने लावा.",
                        "ताप जास्त असल्यास जनावराच्या डोक्यावर व मानेवर थंड पाण्याच्या पट्ट्या ठेवा.",
                        "गूळ आणि मीठ मिश्रित स्वच्छ कोमट पाणी सतत उपलब्ध ठेवा."
                    ],
                    immediate_actions_hi=[
                        "पशु को अलग बांधें और बाड़े में शाम को नीम की पत्तियों का धुआं करें।",
                        "गांठों पर हल्दी, कपूर और नीम का तेल मिलाकर लेप करें।",
                        "बुखार होने पर सिर और गर्दन पर ठंडी पट्टी रखें।",
                        "गुड़ और नमक मिला हुआ ताजा पानी पीने को दें।"
                    ],
                    immediate_actions_en=[
                        "Isolate affected animal in mosquito-screened or well-ventilated shelter; burn neem leaves at dusk.",
                        "Apply a soothing topical paste of turmeric, neem oil, and camphor over unbroken nodular lesions.",
                        "Apply cool damp cloths across forehead and neck to safely manage elevated body temperature.",
                        "Provide constant access to clean lukewarm water enriched with jaggery and electrolytes."
                    ],
                    do_not_do_mr=[
                        "अंगावरील गाठी सुरीने कापू नका, टोचू नका किंवा बळजबरीने दाबू नका.",
                        "जनावराला उघड्यावर कडक उन्हात किंवा पावसात बांधू नका.",
                        "गावात अथवा आठवडे बाजारात जनावरांची खरेदी-विक्री करू नका."
                    ],
                    do_not_do_hi=[
                        "गांठों को दबाएं, काटें या फोड़ें नहीं।",
                        "पशु को तेज धूप या बारिश में बाहर न बांधें।",
                        "हाट-बाजार में पशु को ले जाना बंद रखें।"
                    ],
                    do_not_do_en=[
                        "DO NOT lance, incision, or squeeze the cutaneous nodules.",
                        "DO NOT expose the febrile animal to direct harsh sun or torrential rain.",
                        "DO NOT transport or trade livestock until cleared by veterinarian."
                    ],
                    warning_signs_mr=["पायांना प्रचंड सूज येणे", "श्वसनास तीव्र अडथळा"],
                    warning_signs_en=["Severe leg edema / swelling", "Labored respiratory distress"],
                    doctor_urgency="URGENT",
                    teleconsult_recommended=True,
                ),
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
                temporary_first_aid=TemporaryFirstAid(
                    summary_mr="अतितातडीची स्थिती! जनावराला मोकळ्या हवेशीर जागेत ठेवा आणि गळ्यावरील सुजेला थंड ठेवा.",
                    summary_hi="आपातकालीन स्थिति! पशु को खुली हवादार जगह रखें और गले की सूजन पर ठंडी पट्टी रखें।",
                    summary_en="CRITICAL EMERGENCY! Keep in open ventilated area; apply cold compress on neck swelling.",
                    immediate_actions_mr=[
                        "जनावरास मोकळ्या, हवेशीर व सावलीच्या जागेत बांधा जेणेकरून श्वास कोंडणार नाही.",
                        "गळ्याखालील गरम सुजेवर थंड पाण्याच्या पट्ट्या किंवा बर्फ ठेवा.",
                        "जनावराला अजिबात धावपळ करू न देता पूर्ण विश्रांती द्या."
                    ],
                    immediate_actions_hi=[
                        "पशु को हवादार खुली जगह में रखें ताकि सांस लेने में आसानी हो।",
                        "गले की गर्म सूजन पर ठंडे पानी की पट्टी रखें।",
                        "पशु को शांत और स्थिर रखें।"
                    ],
                    immediate_actions_en=[
                        "Move animal immediately to an open-air shaded stall to maximize airflow.",
                        "Apply cold water compresses or ice packs gently over submandibular throat edema.",
                        "Minimize physical exertion and keep the animal calm and seated."
                    ],
                    do_not_do_mr=[
                        "गळ्यातील सुजेला गरम शेक देऊ नका किंवा दाबू नका.",
                        "घशात बळजबरीने पाणी अथवा काढा ओतू नका (फुफ्फुसात पाणी जाऊन मृत्यू होऊ शकतो).",
                        "जनावरास जबरदस्तीने चालवू नका."
                    ],
                    do_not_do_hi=[
                        "गले की सूजन पर गर्म सेंक न दें और न ही दबाएं।",
                        "जबरदस्ती मुंह में पानी या काढ़ा न डालें (सांस नली में जाने का भारी खतरा)।"
                    ],
                    do_not_do_en=[
                        "DO NOT drench or force-feed liquids orally (high aspiration pneumonia risk).",
                        "DO NOT apply hot fomentation or press heavily against swollen throat.",
                        "DO NOT force the animal to walk long distances."
                    ],
                    warning_signs_mr=["जिभ बाहेर येऊन घरघर आवाज येणे", "तीव्र श्वासरोध"],
                    warning_signs_en=["Tongue protrusion with loud stertor", "Acute asphyxia / collapse"],
                    doctor_urgency="EMERGENCY",
                    teleconsult_recommended=True,
                ),
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
            temporary_first_aid=TemporaryFirstAid(
                summary_mr="जनावरास सावलीत वेगळे बांधून विश्रांती द्या आणि डॉक्टरांच्या सल्ल्याची वाट पहा.",
                summary_hi="पशु को छायादार स्थान पर अलग बांधें और डॉक्टर के परामर्श की प्रतीक्षा करें।",
                summary_en="Keep animal comfortable in dry shade with clean water while awaiting doctor consult.",
                immediate_actions_mr=[
                    "जनावरास कोरड्या, स्वच्छ व सावलीच्या जागेत बांधा.",
                    "ताजे, स्वच्छ पाणी मुबलक प्रमाणात उपलब्ध करा.",
                    "जनावराच्या खाण्या-पिण्यावर व तापमानावर बारीक लक्ष ठेवा."
                ],
                immediate_actions_hi=[
                    "पशु को छायादार और साफ जगह में रखें।",
                    "ताजा पानी पर्याप्त मात्रा में दें।",
                    "तापमान और लक्षणों पर नजर रखें।"
                ],
                immediate_actions_en=[
                    "Keep animal sheltered in clean, dry, shaded quarters.",
                    "Provide fresh drinking water and palatable soft feed.",
                    "Monitor body temperature and clinical signs closely."
                ],
                do_not_do_mr=[
                    "कोणतेही मानवी औषध स्वतःच्या मनाने देऊ नका.",
                    "जनावरास कडक उन्हात बांधू नका."
                ],
                do_not_do_hi=[
                    "बिना डॉक्टर के कोई भी मानवीय दवा न दें।",
                    "तेज धूप में न बांधें।"
                ],
                do_not_do_en=[
                    "DO NOT administer unauthorized drugs without prescription.",
                    "DO NOT leave animal exposed to extreme weather."
                ],
                warning_signs_mr=["तापमान अचानक १०४°F च्या वर जाणे"],
                warning_signs_en=["Temperature spike above 104°F"],
                doctor_urgency="ROUTINE",
                teleconsult_recommended=True,
            ),
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
                    img_mime = "image/webp"
                    if "data:" in cleaned_b64 and ";base64," in cleaned_b64:
                        header, cleaned_b64 = cleaned_b64.split(";base64,", 1)
                        img_mime = header.replace("data:", "")
                    elif "," in cleaned_b64:
                        cleaned_b64 = cleaned_b64.split(",", 1)[1]
                    try:
                        image_bytes = base64.b64decode(cleaned_b64)
                        contents.append(types.Part.from_bytes(data=image_bytes, mime_type=img_mime))
                    except Exception as img_err:
                        logger.warning("Failed to decode base64 photo: %s", img_err)

                # Handle audio note / voice note if present (URI or base64)
                if request.audio_uri:
                    contents.append(types.Part.from_uri(file_uri=request.audio_uri, mime_type="audio/webm"))
                elif request.audio_base64:
                    cleaned_audio = request.audio_base64
                    audio_mime = "audio/webm"
                    if "data:" in cleaned_audio and ";base64," in cleaned_audio:
                        header, cleaned_audio = cleaned_audio.split(";base64,", 1)
                        audio_mime = header.replace("data:", "")
                    elif "," in cleaned_audio:
                        cleaned_audio = cleaned_audio.split(",", 1)[1]
                    try:
                        audio_bytes = base64.b64decode(cleaned_audio)
                        contents.append(types.Part.from_bytes(data=audio_bytes, mime_type=audio_mime))
                    except Exception as audio_err:
                        logger.warning("Failed to decode base64 audio note: %s", audio_err)

                # Context prompt
                user_prompt = f"""
Animal Species: {request.species}
Secondary Symptoms: {', '.join(request.secondary_symptoms) if request.secondary_symptoms else 'None specified'}
Vernacular Voice Transcript / Field Notes: {request.audio_transcript or 'Analyze the attached voice recording and photo directly.'}
Village LGD Code: {request.village_lgd_code or 'Unknown'}

Directives:
1. Listen carefully to any attached voice note and inspect the lesion image.
2. In addition to syndromic classification, generate an actionable, safe, practical TEMPORARY FIRST-AID & SUPPORTIVE CARE protocol (in temporary_first_aid) for the farmer to perform right now while waiting for the veterinarian's video call or e-prescription.
3. Include specific local instructions in Marathi, Hindi, and English (what to do, what NOT to do, emergency warning signs).
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
