# Feature Research: Pashu-Suraksha (पशु सुरक्षा)

**Domain:** National Livestock Health Surveillance & Epidemiological Decision Support  
**Researched:** 2026-08-30  
**Confidence:** HIGH  

## Feature Landscape

### Table Stakes (Users Expect These)

Features users and veterinary authorities assume exist. Missing these = product fails government acceptance.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Offline-First Field Reporting** | Rural grazing pastures and tribal areas have 0G/2G connectivity; reports must never be lost. | HIGH | Requires native SQLite event queue, on-device image compression, and two-phase delta sync. |
| **8 Standard Syndromic Categories** | Farmers cannot diagnose specific diseases; they observe physical syndromes (salivation, skin lumps, sudden death). | MEDIUM | Replaces error-prone freeform text with standardized veterinary syndromic decision trees. |
| **Pashu Aadhaar Tag Registry** | Government mandates 12-digit ear tag tracking for every bovine under Bharat Pashudhan (NDLM). | MEDIUM | Validates 12-digit RFID ear tags and links reports to individual animals and herds. |
| **Multilingual Audio/Voice Input** | Rural farmers and Pashu Sakhis speak local dialects (Marathi, Ahirani, Gondi, Hindi) and struggle with complex forms. | HIGH | Uses native voice recording + Gemini 3.7 Flash for conversational intent extraction. |
| **Geospatial Outbreak Heatmaps** | District officials (DAHOs) need immediate visual awareness of emerging clusters across villages. | MEDIUM | Interactive WebGL map rendering incident pins, cluster centroids, and village boundaries. |
| **Lab Referral & e-LRF Requisition** | Field vets must send morbid samples to diagnostic laboratories (DDLs) with chain-of-custody. | MEDIUM | QR-code enabled electronic requisition with 48-hour cold-chain shelf-life timers. |

### Differentiators (Competitive Advantage)

Features that set Pashu-Suraksha apart and win hackathons / government tenders.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Zero-Tolerance Anthrax Biohazard Lockout** | Prevents human fatalities and multi-decade soil contamination by immediately forbidding post-mortem necropsy. | MEDIUM | Immediate audio warning in Marathi (*"DO NOT OPEN CARCASS"*) + automated alert to District Medical Officer (IDSP). |
| **Gemini 3.7 Flash Multimodal Lesion Vision** | Validates photos of oral blisters, foot lesions, and skin nodules in <800ms directly against clinical reference features. | HIGH | Sub-second visual classification combined with colloquial vernacular voice transcription. |
| **Dynamic 1-5-10 km Containment Buffers** | Replaces passive pins on a map with automated biosecurity rings (1 km Movement Freeze, 5 km Ring-Vaccination, 10 km Surveillance). | HIGH | PostGIS geodetic `ST_Buffer` generating downloadable administrative action memos for District Magistrates. |
| **Two-Phase Delta Synchronization** | Prevents heavy image uploads from stalling critical telemetry over 2G networks. | HIGH | Phase 1 (<2 KB JSON) syncs immediately; Phase 2 (WebP images & audio) syncs opportunistically over Wi-Fi. |
| **H3 Hexagonal Spatial Indexing** | Enables instant O(1) mathematical cluster detection across millions of historical records without slow spatial joins. | MEDIUM | Uber H3 Resolution 7/8 spatial partitioning integrated directly into PostgreSQL. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem appealing on paper but create severe operational problems in rural India.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Pure Custom ML Outbreak Prediction from Scratch** | Sounds technically advanced in presentations. | Historical Indian veterinary data is noisy, biased, and incomplete; black-box ML outputs are rejected by government vets. | 3-Tier Neuro-Symbolic Triage: Edge Rules + Gemini 3.7 Flash + PostGIS SaTScan. |
| **Pure Web App / Browser PWA for Field Operations** | Avoids app store builds and native code. | Android OS automatically wipes browser `localStorage` and `IndexedDB` when device disk space gets low, destroying un-synced reports. | Standalone Android APK (`.apk`) backed by native Android SQLite (`@capawesome-team/capacitor-sqlite`). |
| **Complex Multi-Step Symptom Questionnaires** | Medical experts want granular data. | Overwhelms low-literacy farmers; leads to high abandonment rates in the field. | Icon-first, single-screen syndromic selector with voice note and photo capture. |
| **Continuous Background GPS Polling** | Real-time tracking of livestock movement. | Rapidly drains budget smartphone batteries in field conditions within 3–4 hours. | Geotagging captured on-demand upon report creation, with fallback to LGD village centroid. |

---

## MVP Definition (Milestone 1)

### Launch With (v1)
- [x] Standalone Android APK booting 100% offline with native SQLite.
- [x] 8 Standard Syndromic Categories with photo/voice capture.
- [x] Zero-Tolerance Anthrax biohazard lockout and IDSP notification bridge.
- [x] Gemini 3.7 Flash cloud triage pipeline (multimodal photo + Marathi voice).
- [x] Two-Phase Delta Synchronization Engine (telemetry first, media deferred).
- [x] Web-GIS Command Center with dynamic 1km, 5km, 10km containment buffers.
- [x] QR-code enabled Electronic Lab Requisition Form (e-LRF) with 48h cold-chain SLA.

---
*Feature research for: Pashu-Suraksha*  
*Researched: 2026-08-30*
