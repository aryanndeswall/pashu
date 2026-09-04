# Phase 4: 8-Syndrome Decision Tree & Zero-Tolerance Anthrax Lockout - Context

**Gathered:** 2026-09-03  
**Status:** Ready for planning  
**Source:** User Direction via `/gsd-discuss-phase 4`

<domain>
## Phase Boundary

Phase 4 implements the 100% offline deterministic clinical intelligence and emergency biosecurity lockout engine within the Android APK:
- **8-Syndrome Clinical Decision Tree (`decisionTreeService.ts`)**:
  - Deterministic offline rules mapping 8 syndromes + secondary clinical symptom chips into primary/secondary differential diagnoses (Anthrax, FMD, LSD, BQ, HS, PPR, Rabies, Brucellosis).
  - Produces dual outputs: technical differential diagnoses for Field Veterinarians & simplified vernacular containment advisories for Farmers.
- **Rule Zero: Anthrax Biohazard Lockout (`AnthraxBiohazardModal.tsx`)**:
  - Triggered immediately if syndrome is `HSDS` or upon selecting sudden death + unclotted bleeding from orifices.
  - Locks the UI into `CRITICAL_ANTHRAX_LOCK`, activating flashing crimson `HazardBorder`, Web Audio siren tone, and offline Web Speech Synthesis TTS speaking vernacular Marathi warnings (*"सावधान! मृत जनावराचे शव कापू नका..."*).
  - Enforces 5-point biosecurity disposal checklist (no necropsy incision, 6ft burial with unslaked lime, 1km herd freeze).
- **IDSP / NCDC One-Health Alert Dispatch (`idspAlertService.ts`)**:
  - Automatically compiles high-priority zoonotic notification packets into SQLite `offline_sync_queue` with `priority = 3` (Critical Biohazard) for national human health disease surveillance.
</domain>

<decisions>
## Implementation Decisions

### 1. Decision Tree & Adaptive Secondary Symptoms
- **D-01: Adaptive Secondary Chips:**
  - Selecting a primary syndrome dynamically presents 3–5 relevant clinical symptom chips in Step 1 of the wizard:
    - `VSS`: Hoof lesions, Oral blisters/erosion, Ropey salivation, High fever (>104°F) -> **Foot & Mouth Disease (FMD)**
    - `NSLS`: Nodular cutaneous lumps (2–5cm), Leg edema, Lacrimation, Enlarged lymph nodes -> **Lumpy Skin Disease (LSD)**
    - `HSDS`: Sudden death (<2h), Unclotted dark blood from orifices, Lack of rigor mortis -> **Anthrax (Bacillus anthracis)**
    - `RAS`: Grunting respiration, Tongue protrusion, Swollen neck/brisket, Purulent nasal discharge -> **Haemorrhagic Septicaemia (HS) / PPR**
    - `AMS`: Crepitant hot swelling on hindquarters/shoulder, Severe lameness, Rapid prostration -> **Black Quarter (BQ)**
    - `GSS`: Bloody foul-smelling diarrhea, Severe dehydration, Abdominal pain -> **Enterotoxaemia / Coccidiosis**
    - `NCS`: Abnormal aggression, Biting inanimate objects, Inability to swallow/frothing, Circling -> **Rabies (Lyssavirus)**
    - `ARS`: Late-term abortion (3rd trimester), Retained placenta, Orchitis in bulls -> **Brucellosis (Brucella abortus)**

### 2. Dual Clinical & Farmer Communication
- **D-02: Role-Adaptive Guidance Output:**
  - For **Doctor (पशुवैद्य)**: Displays ICD-11/OIE disease code, confidence tier (`CONFIRMED_ALERT` | `HIGHLY_PROBABLE` | `SUSPECTED`), and differential ranking.
  - For **Farmer (पशुपालक)**: Displays bilingual containment steps in plain Marathi (quarantine animal, isolate feed/water, stop milking/selling, wash hands with soap).

### 3. Rule Zero Anthrax Biohazard Protocol (`BIO-01`, `BIO-02`)
- **D-03: Immediate Lockout & Alarm:**
  - If `HSDS` or (sudden death + bleeding) is selected:
    - Sets `urgencyLevel = 'CRITICAL_BIOHAZARD'`.
    - Triggers full-screen lockout modal preventing standard completion.
    - Emits triple error haptic vibrations (`hapticsService.hapticError()`).
    - Synthesizes an audible siren tone using the browser Web Audio API oscillator.
    - Speaks offline Marathi voice alert via `window.speechSynthesis`: *"सावधान! मृत जनावराचे शव कापू नका. हवेत ॲन्थ्रॅक्सचे बीजाणू पसरण्याचा गंभीर धोका आहे."*
    - Displays 5-point biosecurity disposal checklist:
      1. No carcass cutting (शव विच्छेदन पूर्णपणे बंद).
      2. Ear-tip blood smear only (रक्ताचा नमुना फक्त कानाच्या टोकावरून).
      3. 6-foot deep burial with unslaked lime (६ फूट खोल खड्ड्यात कळीच्या चुन्यासह पुरणे).
      4. Quarantine remaining livestock within 1 km (१ किमी परिसरातील जनावरांचे विलगीकरण).
      5. Notify District Health & IDSP immediately (मानवी आरोग्य विभागाला त्वरित सूचना).

### 4. Encrypted IDSP Notification Payload (`BIO-03`)
- **D-04: National One-Health Transmission:**
  - When Anthrax or Rabies is identified, generates an emergency JSON packet into SQLite `offline_sync_queue`:
    - `priority: 3`
    - `entity_type: 'IDSP_ZOONOTIC_EMERGENCY'`
    - Schema contains: `incident_id`, `lgd_code`, `coordinates`, `suspected_pathogen`, `human_exposure_flag`, `livestock_dead_count`, and `quarantine_radius_km: 1.0`.

### Agent's Discretion
- Sound effects generated via HTML5 Web Audio API `AudioContext` oscillator (440Hz / 880Hz alert sweep) without relying on external `.mp3` assets.
- Fallback text speech if device TTS voice is not present.
</decisions>

<canonical_refs>
## Canonical References

### Architecture & Requirements
- `.planning/REQUIREMENTS.md` — `BIO-01`, `BIO-02`, `BIO-03`.
- `PRODUCTION_TECH_STACK_AND_AUDIT.md` — Rule Zero deterministic biosecurity lockout.
- `AUDIT_AND_COMPREHENSIVE_PRD.md` §3.1 (Edge Clinical Diagnostic Tree).

### Existing Patterns
- `mobile/src/services/hapticsService.ts` — Tactile vibration bridge.
- `mobile/src/components/animations/HazardBorder.tsx` — Flashing biohazard borders.
- `mobile/src/views/ReportWizardView.tsx` — Step 1 symptom collection flow.
- `mobile/src/database/sqliteConnection.ts` — Priority queue persistence.
</canonical_refs>

<specifics>
## Specific Ideas

- **One-Tap Emergency Dial (`1962`):** Direct phone link `tel:1962` for farmers in the Anthrax biohazard screen.
- **Audio TTS Toggle:** User can tap a speaker button `[ 🔊 पुन्हा ऐका / Replay Warning ]` to repeat the spoken Marathi voice warning.
</specifics>

<deferred>
## Deferred Ideas

- **Automated Outbreak Buffer Ring Generation:** Geodetic 1-5-10 km PostGIS ring calculations deferred to Phase 8.
</deferred>
