# Roadmap: Pashu-Suraksha (पशु सुरक्षा)

## Overview

Pashu-Suraksha is built in 10 sequential, highly focused phases adhering to the **Fine Granularity** specification. The journey moves from establishing an offline-first Android APK core, through mobile ergonomics, hardware sensor bridges, deterministic edge biohazard rules, two-phase delta synchronization, cloud database persistence, Gemini 3.7 Flash multimodal triage, PostGIS spatio-temporal cluster containment, and cold-chain lab workflows, culminating in an executive Web-GIS command center and an Ahmednagar outbreak demo simulation.

---

## Phases

- [x] **Phase 1: Project Scaffolding & Native Android APK Foundation** - Initialize Capacitor 6 + React 19 + Tailwind v4 + Native SQLite container. (completed 2026-08-30)
- [x] **Phase 2: Mobile UI, Design System & React Bits Micro-Interactions** - Implement Stitch layouts, UI-UXmax rural ergonomics, and React Bits animations. (completed 2026-08-31)
- [x] **Phase 3: Hardware Sensor Bridges (Camera, GPS, Voice)** - On-device WebP camera compression, GPS geotagging with LGD snapping, and native audio recording. (completed 2026-09-03)
- [x] **Phase 3.1: Multi-Role Authentication Shell (Doctor, Consumer, Admin) & SIH Demo Role-Switcher** - Login screen, persistent auth store, SIH demo role-switcher header, and role-filtered navigation. (completed 2026-09-03)
- [x] **Phase 4: 8-Syndrome Decision Tree & Zero-Tolerance Anthrax Lockout** - Deterministic offline edge rules, Anthrax biohazard screen, and Marathi voice warnings. (completed 2026-09-03)
- [x] **Phase 5: Two-Phase Delta Synchronization Engine** - Event-sourced SQLite queue, network state monitor, and low-bandwidth telemetry sync. (completed 2026-09-03)
- [x] **Phase 6: Livestock Registry, Pashu Aadhaar & Cloud Persistence** - FastAPI backend, PostgreSQL 16 + PostGIS 3.4 schema, TimescaleDB, and 12-digit tag records. (completed 2026-09-04)
- [x] **Phase 7: Google Gemini 3.7 Flash Multimodal Triage Pipeline** - Cloud multimodal perception parsing lesion photos and colloquial Marathi audio in <800ms. (completed 2026-09-04)
- [x] **Phase 9: Diagnostic Lab Referral & Cold-Chain Tracking (e-LRF)** - QR chain-of-custody tracking, 48-hour cold-chain shelf-life timers, and closed-loop result verification. (completed 2026-09-04)
- [ ] **Phase 10: Web-GIS Command Center, IDSP Bridge & SIH Demo Simulation** - MapLibre GL executive dashboard, automated IDSP bridge, and Ahmednagar outbreak presentation script.



---

## Phase Details

### Phase 1: Project Scaffolding & Native Android APK Foundation
**Goal**: Establish the core client repository with Capacitor 6, React 19, TypeScript, and native Android SQLite, verifying standalone APK compilation and offline launch.  
**Depends on**: Nothing (first phase)  
**Requirements**: APK-01, APK-02  
**Success Criteria**:
1. Standalone `.apk` compiles via Gradle and boots in <180ms on Android with zero network connectivity.
2. Native Android SQLite database is initialized in protected storage (`/data/data/com.pashusuraksha.app/databases/`) with SQLCipher encryption.
3. Local database survives app termination and OS cache clearing with zero data loss.  
**Plans**: 2 plans

Plans:
- [x] 01-01: Scaffold Vite + React 19 + TypeScript + Tailwind v4 project and configure Capacitor 6 native Android container.
- [x] 01-02: Integrate `@capawesome-team/capacitor-sqlite` with local schema migrations and verify offline persistence.

---

### Phase 2: Mobile UI, Design System & React Bits Micro-Interactions
**Goal**: Build the mobile screen layouts using Stitch blueprints, UI-UXmax rural ergonomics, and React Bits hardware-accelerated micro-interactions.  
**Depends on**: Phase 1  
**Requirements**: APK-03, SYN-01  
**Success Criteria**:
1. User can navigate through mobile bottom tabs (Report, Dashboard, Animals, Labs) with fluid micro-interactions.
2. User can select from 8 standardized syndromic categories (VSS, NSLS, HSDS, AROS, CMSS, SARF, HES, NAS) via an icon-first visual selector.
3. User experiences tactile haptic vibration feedback (`@capacitor/haptics`) upon button interactions and high-risk alerts.  
**Plans**: 2 plans

Plans:
- [x] 02-01: Build Stitch-based mobile navigation shell with UI-UXmax high-contrast sunlight tokens and 52px touch targets.
- [x] 02-02: Integrate React Bits animated hazard cards, pulsating GPS radar sweeps, and the 8-syndrome visual selector.

---

### Phase 3: Hardware Sensor Bridges (Camera, GPS, Voice)
**Goal**: Connect native Android hardware plugins for on-device WebP camera compression, GPS geotagging with LGD village snapping, and vernacular audio recording.  
**Depends on**: Phase 2  
**Requirements**: SYN-02, SYN-03, SYN-04  
**Success Criteria**:
1. Camera captures cattle lesion photos and automatically compresses them on-device to WebP (<300 KB, 1280x720).
2. GPS captures latitude, longitude, and accuracy radius, snapping coordinates to the nearest Local Government Directory (LGD) village.
3. Audio recorder captures 15–30s vernacular voice memos in Marathi/Hindi, saving compressed audio locally.  
**Plans**: 2 plans

Plans:
- [x] 03-01: Implement `@capacitor/camera` capture with HTML5 Canvas WebP compression and `@capacitor-community/voice-recorder` audio capture.
- [x] 03-02: Implement `@capacitor/geolocation` service with local LGD spatial distance calculation.

---

### Phase 3.1: Multi-Role Authentication Shell (Doctor, Consumer, Admin) & SIH Demo Role-Switcher
**Goal**: Implement the 3-role authentication shell (Consumer/Farmer, Doctor/Vet, Admin/DVO) with instant demo role-switcher, persistent auth state in SQLite, and dynamic role-filtered navigation.  
**Depends on**: Phase 3  
**Requirements**: APK-03, AUTH-01  
**Success Criteria**:
1. User can select or switch between 3 distinct roles (Consumer, Doctor, Admin) from a dedicated Login screen and an instant 1-tap header demo switcher.
2. Active role and district context persist locally in SQLite and memory across app restarts.
3. Mobile navigation and action tabs dynamically filter based on active role (e.g., Clinical Triage and Lab Requisitions restricted to Doctor/Admin).  
**Plans**: 2 plans

Plans:
- [x] 03.1-01: Build `useAuthStore.ts` with SQLite persistence and the dedicated Login & Role Selection screen (`RoleSelectionView.tsx`).
- [x] 03.1-02: Implement the Header Demo Role-Switcher bar and role-filtered mobile navigation (`BottomBar.tsx` / `HeaderBar.tsx`).

---

### Phase 4: 8-Syndrome Decision Tree & Zero-Tolerance Anthrax Lockout
**Goal**: Implement the deterministic edge clinical rule engine running 100% offline inside the APK, enforcing the zero-tolerance Anthrax biohazard lockout.  
**Depends on**: Phase 3.1  
**Requirements**: BIO-01, BIO-02, BIO-03  
**Success Criteria**:
1. Reporting sudden death with unclotted bleeding immediately triggers `CRITICAL_ANTHRAX_LOCK`.
2. Mobile UI displays emergency Marathi/Hindi biohazard warnings (*"DO NOT CUT CARCASS"*) preventing post-mortem cutting.
3. System queues an immediate high-priority alert payload for the Integrated Disease Surveillance Programme (IDSP / NCDC).  
**Plans**: 2 plans

Plans:
- [x] 04-01: Build offline TypeScript syndromic rule evaluation engine covering the 8 veterinary decision trees.
- [x] 04-02: Build the Anthrax emergency biohazard modal with Marathi audio advisory and IDSP payload generator.

---

### Phase 5: Two-Phase Delta Synchronization Engine
**Goal**: Build the event-sourced offline queue in native SQLite and orchestrate two-phase synchronization based on network connection type.  
**Depends on**: Phase 4  
**Requirements**: SYNC-01, SYNC-02, SYNC-03  
**Success Criteria**:
1. Network state transitions (Offline, 2G/EDGE, 4G/Wi-Fi) are accurately detected via `@capacitor/network`.
2. Phase 1 lightweight JSON telemetry (<2 KB) syncs immediately over 2G/EDGE or SMS gateway.
3. Phase 2 binary WebP photos and audio memos are queued and uploaded opportunistically over Wi-Fi/4G.  
**Plans**: 2 plans

Plans:
- [x] 05-01: Build the event-sourced `offline_sync_queue` table and synchronization state machine.
- [x] 05-02: Implement two-phase upload manager with automatic retries and exponential backoff.

---

### Phase 6: Livestock Registry, Pashu Aadhaar & Cloud Persistence
**Goal**: Scaffold the FastAPI backend, PostgreSQL 16 + PostGIS 3.4 database schema, TimescaleDB hypertables, and 12-digit Pashu Aadhaar livestock records.  
**Depends on**: Phase 5  
**Requirements**: REC-01, REC-02  
**Success Criteria**:
1. User can look up and register cattle via 12-digit Pashu Aadhaar RFID ear tags.
2. Vaccination records (FMD, LSD, Anthrax) are logged with automated booster due-date alerts.
3. PostgreSQL + PostGIS schema persists relational, temporal, and spatial records with full indexing.  
**Plans**: 2 plans

Plans:
- [x] 06-01: Scaffold FastAPI cloud backend with async dual-engine database (Postgres/SQLite), 12-digit animal models, and DAHD vaccination booster endpoints.
- [x] 06-02: Implement mobile offline animal service, SQLite caching, and digital cattle passbook UI with vaccination timeline and registration modal.

---

### Phase 7: Google Gemini 3.7 Flash Multimodal Triage Pipeline
**Goal**: Implement cloud multimodal triage pipeline ingesting cattle lesion photos and Marathi/Hindi voice recordings to output strict clinical JSON in <800ms.  
**Depends on**: Phase 6  
**Requirements**: AI-01, AI-02, AI-03  
**Success Criteria**:
1. Gemini 3.7 Flash extracts clinical syndrome codes (e.g. `VSS` for FMD) from colloquial Marathi audio.
2. Multimodal vision classifies oral blisters, foot lesions, and skin lumps with clinical confidence scores.
3. Generates localized biosecurity advisories in Marathi/Hindi for immediate farmer action.  
**Plans**: 2 plans

Plans:
- [x] 07-01: Implement Google GenAI SDK integration with Gemini 3.7 Flash using structured JSON schema output.
- [x] 07-02: Build the multimodal triage endpoint ingesting WebP lesion photos and audio transcripts with vernacular advisory generation.

---

### Phase 8: Spatio-Temporal SaTScan Outbreak Detection & Dynamic Buffers
**Goal**: Build the PostGIS space-time permutation scan algorithm (5 km window over 72h) normalized against LGD village census, and generate 1-5-10 km containment buffers.  
**Depends on**: Phase 7  
**Requirements**: GEO-01, GEO-02, GEO-03  
**Success Criteria**:
1. PostGIS detects anomalous spatial clustering when Poisson Attack Rate exceeds 1.5%.
2. Automatically generates geodetic polygons: 1 km Infected Movement Freeze, 5 km Ring-Vaccination, and 10 km Surveillance Zone.
3. Triggers automated Redis pub/sub alerts to district veterinary command screens.  
**Plans**: 2 plans

Plans:
- [ ] 08-01: Implement PostGIS spatial clustering query with LGD village census denominator normalization.
- [ ] 08-02: Implement dynamic 1km, 5km, 10km `ST_Buffer` polygon generator and Redis alert publisher.

---

### Phase 9: Diagnostic Lab Referral & Cold-Chain Tracking (e-LRF)
**Goal**: Build the closed-loop laboratory workflow with QR-code chain-of-custody tracking, 48-hour cold-chain shelf-life timers, and test result escalations.  
**Depends on**: Phase 8  
**Requirements**: LAB-01, LAB-02, LAB-03  
**Success Criteria**:
1. Field vet generates an Electronic Lab Requisition Form (e-LRF) with scannable QR code.
2. Cold-chain countdown timer monitors 48-hour transit SLA, flagging temperature breaches.
3. Lab technician enters RT-PCR/ELISA test results, escalating positive cases to `LAB_CONFIRMED`.  
**Plans**: 2 plans

Plans:
- [ ] 09-01: Build e-LRF requisition generator with QR code creation and cold-chain countdown timers.
- [ ] 09-02: Build laboratory result entry interface with automatic case status escalation.

---

### Phase 10: Web-GIS Command Center, IDSP Bridge & SIH Demo Simulation
**Goal**: Build the MapLibre GL + Deck.gl executive dashboard, one-click market closure advisory generator, IDSP inter-agency bridge, and Ahmednagar outbreak simulation script.  
**Depends on**: Phase 9  
**Requirements**: GIS-01, GIS-02, GIS-03  
**Success Criteria**:
1. Officials view real-time WebGL heatmaps, cluster epicenters, and 14-day rolling epi-curves.
2. One-click generation of official administrative memos for District Magistrates.
3. Pre-seeded Ahmednagar FMD outbreak demo simulation executes end-to-end in <7 minutes for SIH jury presentation.  
**Plans**: 2 plans

Plans:
- [ ] 10-01: Build executive Web-GIS dashboard with MapLibre GL JS, Deck.gl, and TimescaleDB epi-curves.
- [ ] 10-02: Implement automated IDSP webhook bridge and assemble the Ahmednagar live hackathon demo script.

---

## Progress

**Execution Order:**
Phases execute sequentially in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffolding & Native Android APK | 2/2 | Complete    | 2026-08-30 |
| 2. Mobile UI & React Bits | 2/2 | Complete | 2026-08-31 |
| 3. Hardware Sensor Bridges | 2/2 | Complete | 2026-09-03 |
| 3.1. Multi-Role Auth Shell | 2/2 | Complete | 2026-09-03 |
| 4. Decision Tree & Anthrax Lockout | 2/2 | Complete | 2026-09-03 |
| 5. Two-Phase Delta Sync | 2/2 | Complete | 2026-09-03 |
| 6. Livestock Registry & Cloud DB | 2/2 | Complete | 2026-09-04 |
| 7. Gemini 3.7 Flash Triage | 2/2 | Complete | 2026-09-04 |
| 9. Lab Referral & Cold-Chain | 2/2 | Complete | 2026-09-04 |
| 10. Web-GIS Dashboard & SIH Demo | 0/2 | Not started | - |



---
*Roadmap created: 2026-08-30*
