# Project Research Summary: Pashu-Suraksha (पशु सुरक्षा)

**Project:** Pashu-Suraksha (पशु सुरक्षा) — National Livestock Health Surveillance & Decision Support System  
**Domain:** Offline-First Epidemiological Surveillance & Geospatial Early Warning  
**Researched:** 2026-08-30  
**Confidence:** HIGH  

## Executive Summary

Pashu-Suraksha addresses a critical vulnerability in India's agricultural and rural health ecosystem: the absence of a unified, real-time mechanism to detect, triage, and contain emerging livestock epidemics and zoonotic risks across 660,000 villages. By delivering an installable, offline-first Android APK for field workers and an executive Web-GIS command dashboard for veterinary authorities, the system bridges the gap between remote grazing pastures and central decision-makers.

The architecture is built on three core pillars:
1. **Rural-Resilient Edge Client:** Built with Capacitor 6 + React 19 + Tailwind v4 + React Bits + Native Android SQLite, enabling zero-network local boot, on-device image/audio compression, and immune-to-eviction offline persistence.
2. **3-Tier Neuro-Symbolic Triage:** Edge deterministic rules for instant Anthrax zero-tolerance biohazard lockouts; Google Gemini 3.7 Flash for sub-800ms multimodal perception of lesion photos and colloquial Marathi/Hindi voice recordings; and PostGIS space-time permutation scans (SaTScan logic) for mathematical outbreak cluster detection.
3. **Automated Biosecurity Actioning:** Dynamic 1 km Infected Zone, 5 km Ring-Vaccination Buffer, and 10 km Surveillance Perimeter generation, paired with an automated inter-agency alert bridge to the Integrated Disease Surveillance Programme (IDSP / NCDC) for zoonotic defense.

---

## Key Findings

### Recommended Stack
- **Mobile APK:** Capacitor 6, React 19, TypeScript, Vite, Tailwind CSS v4, React Bits, `@capawesome-team/capacitor-sqlite`.
- **Cloud Backend:** FastAPI (Python 3.11), Uvicorn, Pydantic v2, AsyncPG, Celery/Redis.
- **Geospatial & Persistence:** PostgreSQL 16, PostGIS 3.4, TimescaleDB, Uber H3 (`pg-h3`).
- **Multimodal AI:** Google Gemini 3.7 Flash via `google-genai` SDK.
- **Web-GIS Dashboard:** MapLibre GL JS, Deck.gl, shadcn/ui.

### Expected Features
- **Must Have (Table Stakes):** 100% offline-first APK with native SQLite, 8 standardized syndromic categories, 12-digit Pashu Aadhaar ear tag registry, two-phase delta synchronization, and QR-enabled cold-chain lab requisitions.
- **Differentiators:** Zero-tolerance Anthrax edge lockout, Gemini 3.7 Flash multimodal vision/audio triage in <800ms, automated dynamic 1-5-10 km containment buffers, and one-click IDSP human-health alerts.
- **Anti-Features to Avoid:** Pure custom ML models trained from scratch on noisy historical data, pure web/browser PWAs that lose offline reports to Android cache eviction, and continuous background GPS polling that drains phone batteries.

### Critical Pitfalls & Mitigation
1. **Android WebView Cache Purging:** Mitigated by using native Android SQLite in protected app storage.
2. **2G Upload Bottlenecks:** Mitigated by Two-Phase Delta Sync (telemetry first, media deferred).
3. **Anthrax False Negatives:** Mitigated by deterministic Rule Zero (zero-tolerance biohazard lock).
4. **Alert Fatigue:** Mitigated by Poisson Attack Rate normalization against village livestock census.

---

## Implications for Roadmap (Fine Granularity Structure)

Based on the research findings and the user's selected **Fine Granularity (8–12 phases, sequential execution)**, the recommended implementation phases are:

1. **Phase 1: Project Scaffolding & Native Android APK Foundation**
   - Capacitor 6 + React 19 + Tailwind v4 + native SQLite integration, verifying local offline boot and APK compilation.
2. **Phase 2: Mobile UI, Design System & React Bits Integration**
   - Stitch layouts, UI-UXmax rural ergonomics (52px targets, high-contrast sunlight theme), and React Bits animated hazard borders and radar sweeps.
3. **Phase 3: Native Hardware Sensor Bridges (Camera, GPS, Voice)**
   - `@capacitor/camera` with WebP compression, `@capacitor/geolocation` with LGD village snapping, and voice recording.
4. **Phase 4: 8-Syndrome Decision Tree & Zero-Tolerance Anthrax Lockout**
   - Deterministic edge rule engine running locally inside the APK, immediate Anthrax lockout screen, and Marathi voice warning.
5. **Phase 5: Two-Phase Delta Synchronization Engine**
   - Event-sourced offline queue in native SQLite, network state listener, and priority-based sync protocol.
6. **Phase 6: FastAPI Backend & Cloud Spatial Database (PostGIS + H3)**
   - High-throughput asynchronous gateway, PostgreSQL 16 + PostGIS 3.4 schema, TimescaleDB hypertables, and LGD census tables.
7. **Phase 7: Google Gemini 3.7 Flash Multimodal Triage Pipeline**
   - Cloud pipeline ingesting lesion photos and Marathi/Hindi voice recordings, returning strict clinical JSON in <800ms.
8. **Phase 8: Spatio-Temporal SaTScan Outbreak Detection & Buffers**
   - PostGIS 5 km / 72h Poisson Attack Rate algorithm, dynamic 1km, 5km, 10km buffer generation, and census denominator normalization.
9. **Phase 9: Diagnostic Lab Referral & Cold-Chain Tracking (e-LRF)**
   - QR code chain-of-custody tracking, 48-hour cold-chain shelf-life timers, and closed-loop result verification.
10. **Phase 10: Web-GIS Command Center & One-Health IDSP Bridge**
    - MapLibre GL + Deck.gl executive dashboard, real-time alert ticker, and automated webhook bridge to human health authorities (IDSP).
11. **Phase 11: End-to-End Simulation, Testing & SIH Winning Demo Polish**
    - Ahmednagar outbreak scenario seeding, offline airplane-mode rehearsal, and 7-minute live presentation dry run.

---
*Summary for: Pashu-Suraksha*  
*Researched: 2026-08-30*
