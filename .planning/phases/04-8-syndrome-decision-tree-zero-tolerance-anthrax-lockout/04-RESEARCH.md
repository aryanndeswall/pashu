# Phase 4: 8-Syndrome Decision Tree & Zero-Tolerance Anthrax Lockout - Research

**Phase:** 04  
**Status:** Completed  
**Domain:** Deterministic Clinical Rules, Zoonotic Biohazard Protocols, Audio Synthesis, One-Health IDSP Integration  
**Requirements Addressed:** `BIO-01`, `BIO-02`, `BIO-03`

---

## 1. Veterinary Clinical Decision Tree Matrix

The rule engine executes 100% locally on the device with zero network dependency, transforming reported syndromes and secondary symptoms into clinical differential diagnoses and farmer containment advisories.

```
+--------------------------------------------------------------------------------------------------+
|                            Deterministic 8-Syndrome Rule Engine                                  |
+--------------------------------------------------------------------------------------------------+
| Input: Syndrome Code + Checked Secondary Symptoms + Species                                      |
|                                                                                                  |
| [ Rule Zero Check ] ---> Is HSDS? OR (Sudden Death + Unclotted Dark Orifice Bleeding)?          |
|      |                                                                                           |
|      +-- YES --> [ CRITICAL_ANTHRAX_LOCK ]                                                       |
|      |           * Lockout normal flow                                                           |
|      |           * Trigger Web Audio siren + Marathi TTS speech                                  |
|      |           * Render AnthraxBiohazardModal with 5-point disposal checklist                   |
|      |           * Queue Priority-3 IDSP alert packet into offline_sync_queue                    |
|      |                                                                                           |
|      +-- NO  --> [ Standard Evaluation ]                                                         |
|                  * Calculate match score per differential disease                                |
|                  * Assign urgency (HIGH_CONTAGION | ELEVATED | ROUTINE_ENDEMIC)                  |
|                  * Generate Doctor Guidance (ICD-11/OIE) + Farmer Vernacular Advisory            |
+--------------------------------------------------------------------------------------------------+
```

### 8 Syndromes Clinical Mapping:

| Code | Syndrome | Secondary Symptom Chips | Primary Differential | Urgency | IDSP Notifiable |
|:---|:---|:---|:---|:---|:---:|
| **VSS** | तोंड आणि खुरांचे फोड (Vesicular & Salivation) | • `oral_vesicles` (तोंडातील फोड)<br>• `hoof_lesions` (खुरांमधील जखमा)<br>• `fever_high` (तीव्र ताप >104°F)<br>• `ropey_salivation` (लाळेच्या तारा) | **Foot-and-Mouth Disease (FMD / लाळ्या खुरकूत)** | `HIGH_CONTAGION` | No |
| **NSLS** | लंपी त्वचा / अंगावर गाठी (Nodular Skin Lesion) | • `cutaneous_nodules` (२-५ सेमी गाठी)<br>• `limb_edema` (पायांना सूज)<br>• `lacrimation` (डोळ्यातून घाण/पाणी)<br>• `fever` (ताप) | **Lumpy Skin Disease (LSD / लंपी त्वचा)** | `HIGH_CONTAGION` | No |
| **HSDS** | हायपरअक्यूट अचानक मृत्यू (Sudden Death) | • `sudden_death` (अचानक मृत्यू <२ तासात)<br>• `unclotted_dark_blood` (न गोठणारे काळे रक्त)<br>• `rapid_bloat` (पोट फुगणे व आकडणे) | **Anthrax (काळपुळी / ॲन्थ्रॅक्स)** | `CRITICAL_BIOHAZARD` | **YES** |
| **RAS** | श्वसन विकार व गळसुजी (Respiratory) | • `swollen_throat_brisket` (घसा व छातीवर सूज)<br>• `grunting_dyspnea` (घोरणे व धाप लागणे)<br>• `tongue_protrusion` (जीभ बाहेर पडणे) | **Haemorrhagic Septicaemia (HS / गळसुजी) / PPR** | `HIGH_CONTAGION` | No |
| **AMS** | स्नायू सूज व लंगडणे (Myositis) | • `crepitant_swelling` (हवेची सूज व तडतड आवाज)<br>• `severe_lameness` (तीव्र लंगडेपणा)<br>• `fever_depression` (ताप व सुस्ती) | **Black Quarter (BQ / फऱ्या)** | `HIGH_CONTAGION` | No |
| **GSS** | तीव्र हगवण व रक्तमिश्रित विष्ठा (Gastrointestinal) | • `bloody_diarrhea` (रक्तमिश्रित दुर्गंधीयुक्त हगवण)<br>• `severe_dehydration` (तीव्र अशक्तपणा)<br>• `colic_pain` (पोटदुखी व कण्हणे) | **Enterotoxaemia (आंत्रविषार) / Coccidiosis** | `ELEVATED` | No |
| **NCS** | मज्जासंस्था व लाळ गळणे (Neurological) | • `aggressive_behavior` (अचानक आक्रमक पिसाळणे)<br>• `hypersalivation_choking` (गिळता न येणे/फेस)<br>• `paralysis_circling` (चक्कर/पक्षाघात) | **Rabies (रेबीज / पिसाळणे)** | `CRITICAL_BIOHAZARD` | **YES** |
| **ARS** | गर्भपात व पुनरुत्पादन (Reproductive) | • `late_term_abortion` (७-९ महिन्यांत गर्भपात)<br>• `retained_placenta` (वार अडकून सडणे)<br>• `testicular_swelling` (वळूच्या अंडवृद्धी) | **Brucellosis (ब्रुसेलोसिस)** | `ELEVATED` | **YES** |

---

## 2. Audio Synthesis & Offline Vernacular Speech

### A. Web Audio Warbling Biohazard Siren (`alarmAudioService.ts`)
- Utilizes browser native `AudioContext` and `OscillatorNode`.
- Zero network dependencies, zero asset files.
- Warbles frequency between 440 Hz and 880 Hz every 350ms, producing a penetrating, unmistakable emergency alarm tone.
- Includes safe volume ramp-up (gain node) to prevent harsh pops.
- Tested and resilient in jsdom headless test runner with mock audio context.

### B. Offline Web Speech Synthesis (`speechService.ts`)
- Uses `window.speechSynthesis` API.
- Automatically queries available voices, prioritizing Marathi (`mr-IN` / `mr`), Hindi (`hi-IN`), or standard Indian English (`en-IN`).
- Speaks the life-saving advisory:
  > *"सावधान! मृत जनावराचे शव कापू नका. हवेत ॲन्थ्रॅक्सचे बीजाणू पसरण्याचा गंभीर धोका आहे. त्वरित पशुवैद्यकीय अधिकाऱ्यांशी संपर्क साधा."*
- Repeat trigger button allows field workers to replay the message to livestock owners standing near the carcass.

---

## 3. IDSP / NCDC Encrypted Outbreak Alert Schema

Whenever a critical zoonotic event (`Anthrax`, `Rabies`, `Brucellosis`) is flagged, `idspAlertService.ts` automatically packages an emergency notification into SQLite `offline_sync_queue` with `priority = 3`.

```json
{
  "sync_id": "IDSP-2026-AHM-9842",
  "entity_type": "IDSP_ZOONOTIC_EMERGENCY",
  "priority": 3,
  "status": "PENDING",
  "payload": {
    "protocol_version": "1.0",
    "alert_type": "CRITICAL_ANTHRAX_LOCK",
    "icd11_code": "1B90",
    "suspected_pathogen": "Bacillus anthracis",
    "disease_name_marathi": "काळपुळी (ॲन्थ्रॅक्स)",
    "timestamp": "2026-09-03T10:30:00.000Z",
    "location": {
      "lgd_code": 558301,
      "village_name": "Ashwi Budruk",
      "block": "Sangamner",
      "district": "Ahmednagar",
      "latitude": 19.6234,
      "longitude": 74.3356
    },
    "animal_info": {
      "species": "Bovine",
      "pashu_aadhaar": "1234-5678-9012"
    },
    "clinical_indicators": {
      "sudden_death": true,
      "unclotted_orifice_bleeding": true,
      "rapid_bloat": true
    },
    "quarantine_order": {
      "movement_freeze_radius_km": 1.0,
      "deep_burial_with_lime_enforced": true,
      "post_mortem_strictly_prohibited": true
    },
    "one_health": {
      "human_contact_tracing_required": true,
      "notified_agency": "IDSP_NCDC_MAHARASHTRA"
    }
  }
}
```

---

## 4. Testing & Validation Strategy

1. **Rule Engine Suite (`decisionTreeService.test.ts`):**
   - Tests all 8 syndromes evaluate to correct primary differential diagnoses.
   - Tests Rule Zero: `HSDS` or `sudden_death + unclotted_dark_blood` yields `CRITICAL_BIOHAZARD` with Anthrax.
   - Tests role output: Doctor gets ICD-11 codes; Farmer gets plain vernacular containment instructions.
2. **Audio & Siren Suite (`alarmAudioService.test.ts`):**
   - Tests Web Audio siren start and stop cycles.
   - Tests speech synthesis voice dispatch with graceful headless fallback.
3. **Anthrax Biohazard Modal Integration (`AnthraxBiohazardModal.test.tsx`):**
   - Tests rendering of full-screen biohazard modal with flashing hazard border.
   - Tests 5-point biosecurity checklist items.
   - Tests 1-tap emergency dial (`1962`) and IDSP queue persistence.
4. **Wizard Integration (`ReportWizardView.test.tsx`):**
   - Tests selecting HSDS locks normal progression and immediately opens the Biohazard Modal.
