# Pashu-Suraksha (पशु सुरक्षा) — GPT Developer Handoff Context

<project_context>
## System Overview
**Project Name:** Pashu-Suraksha (पशु सुरक्षा)
**Domain:** National Livestock Health Surveillance & Epidemiological Decision-Support System
**Target:** Smart India Hackathon (SIH) Problem Statement ID 26128 (DAHD / Govt of Maharashtra)
**Core Mission:** Provide a zero-failure, offline-first mobile surveillance application for rural field workers (*Pashu Sakhis*, para-vets) paired with a live Web-GIS Command Center. The system ensures immediate biosecurity containment of livestock outbreaks (FMD, LSD) and life-threatening zoonoses (Anthrax, Brucellosis) even in complete cellular dead zones.
</project_context>

<architecture>
## Core Architectural Principles
1. **Dual-Mode "Zero-Failure Guarantee":** The mobile application runs 100% offline via native Android SQLite. The backend supports failover logic (local SQLite/in-memory) for air-gapped demo sandboxes, while natively scaling to cloud PostgreSQL, Upstash Redis, and Firebase for production.
2. **The Neuro-Symbolic Triad:**
   - *Tier 1 (Edge Determinism):* On-device 8-syndrome decision tree with zero-tolerance Anthrax lockdown (triggers visual/audio biohazard alarms instantly offline).
   - *Tier 2 (Multimodal AI Core):* Google Gemini 3.7 / 2.5 Flash pipeline processes vernacular audio (Marathi/Hindi) and lesion photos into strict clinical JSON.
   - *Tier 3 (Geodesic Decision Core):* Cloud PostGIS + SaTScan space-time permutation scan detects outbreak clusters and calculates dynamic geodetic containment buffers (1km/5km/10km).
3. **Two-Phase Delta Synchronization:**
   - *Priority 1:* Immediate ingestion of lightweight clinical JSON telemetry (<2KB).
   - *Priority 2:* Resumable background sync of heavy binary media (WebP photos, .m4a audio) via Firebase Cloud Storage signed URLs.
   - *Priority 3:* 1-tap encrypted SMS 1962 fallback for Anthrax/Zoonotic alerts in 0G dead zones.
4. **One Health Zoonotic Circuit Breaker:** Automated inter-agency webhook escalation to the Integrated Disease Surveillance Programme (IDSP / NCDC) and FCM push notifications to local vets.
</architecture>

<tech_stack>
## Production Technology Stack
**Mobile Client (Hardware-Accelerated APK):**
- **Core Container:** Capacitor 6.1 (Camera, Geolocation, Voice Recorder, Haptics, Network)
- **Framework:** React 19 + TypeScript 5.5 + Vite 5.4
- **UI/UX:** Tailwind CSS 4.x + React Bits (radar sweeps, micro-interactions) + Lucide Icons
- **State & Data:** Zustand 4.5 + TanStack Query 5
- **Local Database:** `@capacitor-community/sqlite` (Encrypted native SQLCipher)

**Cloud API Gateway:**
- **Core:** FastAPI 0.115 + Python 3.12 (async Uvicorn/uvloop)
- **Validation:** Pydantic v2
- **AI Integration:** `google-genai` SDK (Gemini 3.7/2.5 Flash)

**Data & Infrastructure:**
- **Spatial DB:** PostgreSQL 16 + PostGIS 3.4 + Uber H3 (`pg-h3`)
- **Time-Series:** TimescaleDB 2.16 (Hypertables)
- **Message Broker:** Upstash Redis 7.2 (Pub/Sub for sub-100ms cluster event streaming)
- **Blob Storage:** Firebase Cloud Storage (GCS)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
</tech_stack>

<completed_phases>
## Current Implementation State
**Status: Milestones v1.0 and v1.1 are 100% COMPLETED and VERIFIED.**
- **Test Coverage:** 247 / 247 automated tests are passing (73 backend Pytest, 174 mobile Vitest).

**Implemented Features (Phases 1-14):**
- [x] Native Capacitor 6 Android APK scaffolding with sub-180ms boot time.
- [x] Multi-role Auth Shell (Pashu Sakhi, Field Vet, Doctor, Admin, Farmer) with LGD onboarding, OTP, and offline PIN.
- [x] Hardware Sensor Bridges (GPS, Camera WebP compression, Voice notes, Haptics).
- [x] On-device 8-Syndrome Decision Tree & Rule-Zero Anthrax Biohazard Lockout.
- [x] Two-Phase Delta Sync Engine & SQLite persistent queue.
- [x] Pashu Aadhaar (12-digit RFID) Registry with DPDP Act 2023 SHA-256 owner hashing.
- [x] Google Gemini Multimodal Triage Pipeline (Lesion photo + Indic voice).
- [x] Spatio-Temporal SaTScan Outbreak Engine & MapLibre Web-GIS Command Center.
- [x] Diagnostic Lab Referral (e-LRF) with QR barcodes & cold-chain transit tracking.
- [x] Dynamic API Gateway and Live Environment Configurations.
- [x] Firebase Cloud Storage Resumable Media Sync.
- [x] Cloud PostgreSQL Failover, Redis Live Pub/Sub Alert Stream, and FCM/SMS Bridge.
</completed_phases>

<pending_features>
## What's Left (Milestone v1.2 / Future Roadmap)
The GPT agent assigned to this project is tasked with **Feature Development & Roadmap Expansion**. Since the core infrastructure is rock-solid, focus on the following advanced capabilities:

1. **Edge Mesh Synchronization (Extreme Offline Mode):**
   - Implement Bluetooth Low Energy (BLE) or Wi-Fi Direct mesh networking.
   - Allow Pashu Sakhis deep in forest dead-zones to "bump" phones with a traveling Field Vet to securely transfer encrypted SQLite incident queues (Sneakernet data ferrying).
2. **Automated AI Veterinary Prescriptions:**
   - Extend the Gemini pipeline to generate draft e-prescriptions (Tx) for certified Field Vets to review and digitally sign.
   - Validate drug dosages based on the species, age, and syndrome context provided in the triage JSON.
3. **Hardware IoT Integrations:**
   - Build Bluetooth interfaces for connecting external hardware, such as ISO-compliant RFID ear-tag wand scanners and portable veterinary thermal imaging cameras.
</pending_features>

<agent_instructions>
## Instructions for the Assistant (GPT)
- **Context is Sovereign:** Treat the architecture defined above as the absolute truth. Do not suggest replacing Capacitor with React Native, or PostGIS with MongoDB.
- **Goal:** You are responsible for architecting and implementing the items in the `<pending_features>` section.
- **Style:** Write concise, robust code. Assume all Phase 1-14 infrastructure (sync engines, auth, Pydantic models, Zustand stores) is fully functional and should be imported/re-used rather than rebuilt.
- **Verification:** Any new feature must maintain the 100% test pass rate constraint and respect the "Zero-Failure Guarantee" (must degrade gracefully offline).
</agent_instructions>
