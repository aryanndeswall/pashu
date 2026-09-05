# Pashu-Suraksha (पशु सुरक्षा) — National Livestock Health Surveillance & Decision Support System

## What This Is

Pashu-Suraksha is an offline-first, real-time animal-health surveillance and epidemiological decision-support platform designed for rural India. Delivered primarily as a standalone Android APK for livestock owners, Pashu Sakhis (para-vets), and field veterinarians, paired with an executive Web-GIS command dashboard for District and State Animal Husbandry officials, it captures field symptoms, flags outbreak clusters, automates containment zones, and prevents catastrophic livestock mortality and zoonotic disease spread.

## Core Value

The single non-negotiable priority: **Immediate, reliable early-warning outbreak identification and automated biosecurity containment—even in complete cellular dead zones—so that contagious outbreaks and fatal zoonoses (Anthrax, FMD, LSD) are contained within hours rather than days.**

## Current Milestone: v1.1 Live Cloud Integrations & Production Services

### Milestone Goals
Connect real external cloud production services into the offline-first platform:
1. **Google Gemini 3.7 Flash Live Multimodal Core:** Configure real API credentials to run live multimodal lesion image and Indic voice note triage via `google-genai` SDK.
2. **Firebase Cloud Storage & SDK:** Store binary lesion WebP photos and vernacular voice notes with resumable uploads and zero-latency `gs://` ingestion into Gemini.
3. **Cloud Database & Live Pub/Sub Alerting:** Connect cloud-hosted PostgreSQL 16 + PostGIS 3.4 database and Redis broker for real-time WebSocket/SSE alerts to district dashboards.
4. **FCM / Push Notification Bridge:** Broadcast immediate 1-5-10 km containment alerts to nearby Pashu Sakhis and livestock owners.

---

## Requirements

### Validated in Milestone v1.0 (Shipped 2026-09-05)
- [x] **REQ-01: Offline-First Android APK:** Standalone Android APK (Capacitor 6 + React 19 + Tailwind v4 + Native SQLite) booting instantly with zero network and preserving data against OS cache eviction. (Phase 1)
- [x] **REQ-02: 8 Standard Syndromic Categories:** Standardized field entry taxonomy (VSS, NSLS, HSDS, AROS, CMSS, SARF, HES, NAS) replacing error-prone freeform text entry. (Phase 2)
- [x] **REQ-03: Zero-Tolerance Anthrax / Zoonotic Lockout:** Instant edge rule flagging sudden death with unclotted bleeding, displaying local-dialect biohazard warnings ("DO NOT OPEN CARCASS"), and triggering automated IDSP alerts. (Phase 4)
- [x] **REQ-04: Gemini 3.7 Flash Multimodal Triage Architecture:** Cloud-based multimodal pipeline parsing colloquial Marathi/Hindi voice recordings and lesion photos into structured clinical JSON in <800ms. (Phase 7)
- [x] **REQ-05: Spatio-Temporal SaTScan / Cluster Engine:** Mathematical cluster detection in PostGIS evaluating 5 km moving windows over 72 hours, normalized against official village livestock census denominators. (Phase 8)
- [x] **REQ-06: Dynamic 1-5-10 km Containment Buffers:** Automated geodetic polygon generation for 1 km Infected Movement Freeze Zone, 5 km Ring-Vaccination Target Ring, and 10 km Surveillance Perimeter. (Phase 8)
- [x] **REQ-07: Two-Phase Delta Synchronization:** Priority 1 lightweight JSON telemetry (<2 KB) synced immediately over 2G/SMS; Priority 2 WebP/Opus media queued for opportunistic Wi-Fi/4G upload. (Phase 5)
- [x] **REQ-08: Diagnostic Lab Referral & Cold-Chain SLA:** Electronic lab requisitions (e-LRF) with QR code chain-of-custody tracking, 48-hour cold-chain shelf-life timers, and closed-loop result verification. (Phase 9)
- [x] **REQ-09: Digital Health Records & Pashu Aadhaar:** Animal-level and herd-level health, vaccination, and treatment records linked to 12-digit RFID ear tags and LGD administrative village codes. (Phase 6)
- [x] **REQ-11: Web-GIS Command Center for Officials:** MapLibre GL JS + Deck.gl interactive dashboard displaying live heatmaps, epi-curves, vaccination gaps, and one-click movement ban advisories. (Phase 10)
- [x] **AUTH: Role-Based Authentication & User Onboarding:** Sequential Farmer, Doctor, and Admin login flows with phone OTP, LGD onboarding, offline 4-digit PIN, and DPDP Act 2023 compliance. (Phase 11)

### Active (Milestone v1.1)
- [ ] **CLOUD-01: Live Gemini 3.7 Flash API Integration:** Inject live Gemini API key, verify end-to-end multimodal perception on real lesion images and Indic audio files, and measure sub-800ms SLA.
- [ ] **CLOUD-02: Firebase Cloud Storage Media Bridge:** Integrate Firebase Storage in client and backend for uploading and hosting lesion WebP images and vernacular audio memos with signed URLs.
- [ ] **CLOUD-03: Mobile Environment & Dynamic API Gateway:** Implement flexible environment variable configuration (`.env`, `VITE_API_BASE_URL`) with graceful network degradation between cloud and offline SQLite.
- [ ] **CLOUD-04: Cloud Database & Pub/Sub Outbreak Alerts:** Connect cloud-hosted PostgreSQL 16 + PostGIS and Redis for streaming live outbreak cluster triggers to the Web-GIS command center.
- [ ] **CLOUD-05: Push Notification / Alert Broadcast System:** Integrate Firebase Cloud Messaging (FCM) or SMS gateway to deliver containment directives to field workers.

---

## Constraints

- **Form Factor**: Standalone Android APK (`.apk`) — Field workers and Pashu Sakhis carry low-end Android smartphones (2GB-3GB RAM, Android 9-14).
- **Offline Persistence**: Native Android SQLite (`@capacitor-community/sqlite` with SQLCipher) — Must never lose reports during battery loss or OS cache clears.
- **Component Stack**: Must execute **React Bits** animations without translation errors inside Capacitor 6 container.
- **AI Processing**: Google Gemini 3.7 Flash (`google-genai` SDK) — Sub-second inference and strict schema generation for multimodal triage.
- **Spatial Topology**: PostgreSQL 16 + PostGIS 3.4 + Uber H3 (`pg-h3`) — Spatial buffering and cluster lookups must execute with geodetic precision.
- **Data Privacy**: Compliance with India's Digital Personal Data Protection (DPDP) Act 2023 — Farmer mobile numbers stored as SHA-256 hashes.
- **Offline Graceful Degradation**: Real cloud services must enhance the system when online, but 100% of emergency edge rules and offline recording must continue functioning even if API keys or cloud connections are absent or unreachable.

---

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Capacitor 6 Android APK over Pure React Native** | Allows 100% native execution of React Bits, Tailwind v4, and Stitch web design tokens while producing a real installable `.apk`. | ✓ Shipped in v1.0 |
| **3-Tier Neuro-Symbolic Triage over Pure ML Model** | Guarantees zero-tolerance Anthrax safety on the edge, leverages Gemini 3.7 Flash for vernacular voice/photo perception, and uses PostGIS SaTScan for explainable spatial epidemiology. | ✓ Shipped in v1.0 |
| **Firebase Cloud Storage for Binary Media** | Native integration with Google Cloud & Gemini SDK via `gs://` URIs, resumable uploads over flaky rural 3G/4G, without bloating relational PostGIS storage. | Active (v1.1) |
| **PostgreSQL 16 + PostGIS + Uber H3** | O(1) hexagonal spatial indexing at Resolution 7/8 eliminates slow spatial polygon intersections during high-frequency surveillance surges. | Active (v1.1) |

---
*Last updated: 2026-09-05 for Milestone v1.1 initialization*
