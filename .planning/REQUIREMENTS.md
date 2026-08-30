# Requirements: Pashu-Suraksha (पशु सुरक्षा)

**Defined:** 2026-08-30  
**Core Value:** Immediate, reliable early-warning outbreak identification and automated biosecurity containment—even in complete cellular dead zones—so that contagious outbreaks and fatal zoonoses (Anthrax, FMD, LSD) are contained within hours rather than days.  

## v1 Requirements

Requirements for initial production-grade release and SIH hackathon demonstration.

### Mobile Android APK & Offline Core (APK)
- [ ] **APK-01**: User can install and launch standalone Android APK (`.apk`) on Android 9.0–14.0 devices with instant (<180ms) offline boot from embedded assets.
- [ ] **APK-02**: User can create, store, and query health reports locally in encrypted native Android SQLite (`@capawesome-team/capacitor-sqlite`) with zero loss during app termination or OS cache cleaning.
- [ ] **APK-03**: User receives tactile physical haptic vibrations (`@capacitor/haptics`) upon offline saves and high-risk outbreak alerts.

### 8 Standard Syndromic Categories & Field Reporting (SYN)
- [ ] **SYN-01**: User can select from 8 standardized syndromic categories (VSS, NSLS, HSDS, AROS, CMSS, SARF, HES, NAS) via an intuitive, icon-first visual selector.
- [ ] **SYN-02**: User can record 15–30 second vernacular audio notes (Marathi, Hindi) directly inside the mobile reporting flow.
- [ ] **SYN-03**: User can capture lesion photos with automatic on-device WebP compression (<300 KB, 1280x720) to prevent bandwidth saturation.
- [ ] **SYN-04**: User can capture high-accuracy GPS coordinates with automatic snapping to the nearest Local Government Directory (LGD) village unit.

### Zero-Tolerance Biohazard & Anthrax Lockout (BIO)
- [ ] **BIO-01**: System executes deterministic Rule Zero: sudden death with unclotted bleeding immediately triggers `CRITICAL_ANTHRAX_LOCK`.
- [ ] **BIO-02**: User sees an emergency local-language biohazard warning ("DO NOT CUT CARCASS") preventing post-mortem necropsy and human exposure.
- [ ] **BIO-03**: System automatically dispatches an encrypted notification to the Integrated Disease Surveillance Programme (IDSP / NCDC) for human health contact tracing.

### Multimodal AI Triage (AI)
- [ ] **AI-01**: System analyzes lesion photos and colloquial vernacular voice transcripts using Google Gemini 3.7 Flash in <800ms.
- [ ] **AI-02**: System returns strictly validated clinical JSON mapping to the 8 syndromic categories with confidence scores and clinical rationale.
- [ ] **AI-03**: System generates localized biosecurity advisories in Marathi and Hindi for immediate farmer containment action.

### Two-Phase Delta Synchronization (SYNC)
- [ ] **SYNC-01**: System monitors device connectivity transitions (Offline, 2G/EDGE, 4G/Wi-Fi) via `@capacitor/network`.
- [ ] **SYNC-02**: System syncs Phase 1 lightweight JSON telemetry (<2 KB) immediately over 2G/EDGE or SMS gateway.
- [ ] **SYNC-03**: System queues Phase 2 heavy binary media (WebP images and audio) for opportunistic background upload when Wi-Fi/4G is detected.

### Spatio-Temporal Clustering & PostGIS Containment (GEO)
- [ ] **GEO-01**: System runs Space-Time Permutation (SaTScan logic) on PostGIS evaluating 5 km moving windows over 72 hours.
- [ ] **GEO-02**: System normalizes case counts against official village livestock census denominators to calculate Poisson Attack Rates.
- [ ] **GEO-03**: System dynamically generates geodetic polygon buffers: 1 km Infected Zone (Movement Freeze), 5 km Ring-Vaccination Target Ring, and 10 km Surveillance Perimeter.

### Diagnostic Referral & Cold-Chain Chain-of-Custody (LAB)
- [ ] **LAB-01**: Field vet can generate an Electronic Lab Requisition Form (e-LRF) with a unique QR tracking barcode.
- [ ] **LAB-02**: System tracks sample preservation temperature and enforces a 48-hour cold-chain transit SLA.
- [ ] **LAB-03**: Lab pathologist can record RT-PCR/ELISA test results, automatically updating the case to `LAB_CONFIRMED` and escalating alerts.

### Livestock Registry & Pashu Aadhaar Records (REC)
- [ ] **REC-01**: User can look up and register animals by 12-digit RFID Pashu Aadhaar ear tags.
- [ ] **REC-02**: User can log vaccination events (FMD, LSD, Anthrax) and receive automated booster due-date alerts.

### Web-GIS Command Center for Officials (GIS)
- [ ] **GIS-01**: Officials can view real-time WebGL heatmaps and cluster epicenters powered by MapLibre GL JS and Deck.gl.
- [ ] **GIS-02**: Officials can view 14-day rolling epidemic curves (epi-curves) powered by TimescaleDB hypertables.
- [ ] **GIS-03**: Officials can issue one-click livestock market (haat) closure advisories and download official administrative memos.

---

## v2 Requirements

Deferred to future national scale release.

### Telephony & Drone Surveillance (TEL)
- **TEL-01**: Full bidirectional IVR telephony server integration with 1962 call center dispatch.
- **TEL-02**: Satellite NDVI & drone thermal imagery integration for illegal cattle movement monitoring.

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| **Pure Custom ML Outbreak Model from Scratch** | Historical Indian veterinary data is noisy and incomplete; black-box ML outputs are rejected by government vets. Replaced by 3-Tier Neuro-Symbolic Triage. |
| **Pure Web / Browser PWA for Field Operations** | Android OS purges browser `localStorage` and `IndexedDB` under storage pressure, destroying un-synced reports. Replaced by standalone Android APK with native SQLite. |
| **Commercial Meat / Slaughterhouse Logistics** | Beyond the scope of the disease surveillance and biosecurity decision-support mandate. |
| **Continuous Background GPS Polling** | Rapidly drains budget smartphone batteries in field conditions; geotagging is captured on-demand per report. |

---

## Traceability

Which phases cover which requirements. (Populated during roadmap creation).

| Requirement | Phase | Status |
|-------------|-------|--------|
| APK-01 | Phase 1 | Pending |
| APK-02 | Phase 1 | Pending |
| APK-03 | Phase 2 | Pending |
| SYN-01 | Phase 2 | Pending |
| SYN-02 | Phase 3 | Pending |
| SYN-03 | Phase 3 | Pending |
| SYN-04 | Phase 3 | Pending |
| BIO-01 | Phase 4 | Pending |
| BIO-02 | Phase 4 | Pending |
| BIO-03 | Phase 4 | Pending |
| SYNC-01 | Phase 5 | Pending |
| SYNC-02 | Phase 5 | Pending |
| SYNC-03 | Phase 5 | Pending |
| AI-01 | Phase 7 | Pending |
| AI-02 | Phase 7 | Pending |
| AI-03 | Phase 7 | Pending |
| GEO-01 | Phase 8 | Pending |
| GEO-02 | Phase 8 | Pending |
| GEO-03 | Phase 8 | Pending |
| LAB-01 | Phase 9 | Pending |
| LAB-02 | Phase 9 | Pending |
| LAB-03 | Phase 9 | Pending |
| REC-01 | Phase 6 | Pending |
| REC-02 | Phase 6 | Pending |
| GIS-01 | Phase 10 | Pending |
| GIS-02 | Phase 10 | Pending |
| GIS-03 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-30*  
*Last updated: 2026-08-30 after research synthesis*
