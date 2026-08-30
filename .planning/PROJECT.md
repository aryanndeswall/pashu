# Pashu-Suraksha (पशु सुरक्षा) — National Livestock Health Surveillance & Decision Support System

## What This Is

Pashu-Suraksha is an offline-first, real-time animal-health surveillance and epidemiological decision-support platform designed for rural India. Delivered primarily as a standalone Android APK for livestock owners, Pashu Sakhis (para-vets), and field veterinarians, paired with an executive Web-GIS command dashboard for District and State Animal Husbandry officials, it captures field symptoms, flags outbreak clusters, automates containment zones, and prevents catastrophic livestock mortality and zoonotic disease spread.

## Core Value

The single non-negotiable priority: **Immediate, reliable early-warning outbreak identification and automated biosecurity containment—even in complete cellular dead zones—so that contagious outbreaks and fatal zoonoses (Anthrax, FMD, LSD) are contained within hours rather than days.**

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **REQ-01: Offline-First Android APK:** Standalone Android APK (Capacitor 6 + React 19 + Tailwind v4 + React Bits + Native SQLite) booting instantly with zero network and preserving data against OS cache eviction.
- [ ] **REQ-02: 8 Standard Syndromic Categories:** Standardized field entry taxonomy (VSS, NSLS, HSDS, AROS, CMSS, SARF, HES, NAS) replacing error-prone freeform text entry.
- [ ] **REQ-03: Zero-Tolerance Anthrax / Zoonotic Lockout:** Instant edge rule flagging sudden death with unclotted bleeding, displaying local-dialect biohazard warnings ("DO NOT OPEN CARCASS"), and triggering automated IDSP (Human Health) alerts.
- [ ] **REQ-04: Gemini 3.7 Flash Multimodal Triage:** Cloud-based multimodal pipeline parsing colloquial Marathi/Hindi voice recordings and lesion photos into structured clinical JSON in <800ms.
- [ ] **REQ-05: Spatio-Temporal SaTScan / Cluster Engine:** Mathematical cluster detection in PostGIS evaluating 5 km moving windows over 72 hours, normalized against official village livestock census denominators.
- [ ] **REQ-06: Dynamic 1-5-10 km Containment Buffers:** Automated geodetic polygon generation for 1 km Infected Movement Freeze Zone, 5 km Ring-Vaccination Target Ring, and 10 km Surveillance Perimeter.
- [ ] **REQ-07: Two-Phase Delta Synchronization:** Priority 1 lightweight JSON telemetry (<2 KB) synced immediately over 2G/SMS; Priority 2 WebP/Opus media queued for opportunistic Wi-Fi/4G upload.
- [ ] **REQ-08: Diagnostic Lab Referral & Cold-Chain SLA:** Electronic lab requisitions (e-LRF) with QR code chain-of-custody tracking, 48-hour cold-chain shelf-life timers, and closed-loop result verification.
- [ ] **REQ-09: Digital Health Records & Pashu Aadhaar:** Animal-level and herd-level health, vaccination, and treatment records linked to 12-digit RFID ear tags and LGD administrative village codes.
- [ ] **REQ-10: Multichannel Omnichannel Integration:** Support for WhatsApp Cloud API voice notes, 1962 toll-free IVR, and multilingual automated SMS alerts.
- [ ] **REQ-11: Web-GIS Command Center for Officials:** MapLibre GL JS + Deck.gl interactive dashboard displaying live heatmaps, epi-curves, vaccination gaps, and one-click movement ban advisories.

### Out of Scope

- **Exclusion 1: Standalone Custom Machine Learning Training from Scratch:** Deferred/Rejected — noisy historical Indian veterinary data makes custom black-box ML inaccurate and unexplainable; replaced with the validated 3-Tier Neuro-Symbolic architecture (Edge Rules + Gemini 3.7 Flash + PostGIS SaTScan).
- **Exclusion 2: Pure Web App / PWA for Field Operations:** Rejected — browser storage (localStorage/IndexedDB) is wiped by Android OS under storage pressure; field workers require a native installable Android APK with native SQLite.
- **Exclusion 3: Commercial Meat / Slaughterhouse Logistics:** Not part of the disease surveillance and decision-support mandate.

## Context

- **Target Problem Statement:** SIH Problem Statement ID 26128 (Ministry of Fisheries, Animal Husbandry & Dairying / Government of Maharashtra).
- **Scale:** India’s 536 million livestock across 660,000 villages, 750+ districts. Focus demonstration on Maharashtra (36 districts, 33M livestock).
- **Domain Reality:** Remote pastoral dead zones, low literacy, regional dialect variation (Marathi, Ahirani, Gondi, Hindi), high economic impact of livestock losses on smallholder farmers.
- **National Integration:** Complements Bharat Pashudhan (NDLM), ICAR-NIVEDI (NADRES), 1962 Mobile Veterinary Units, and Integrated Disease Surveillance Programme (IDSP / NCDC).

## Constraints

- **Form Factor**: Standalone Android APK (`.apk`) — Field workers and Pashu Sakhis carry low-end Android smartphones (2GB-3GB RAM, Android 9-14).
- **Offline Persistence**: Native Android SQLite (`@capawesome-team/capacitor-sqlite` with SQLCipher) — Must never lose reports during battery loss or OS cache clears.
- **Component Stack**: Must execute **React Bits** animations without translation errors, necessitating a Capacitor 6 hardware-accelerated WebView container rather than pure React Native.
- **AI Processing**: Google Gemini 3.7 Flash (`google-genai` SDK) — Sub-second inference and strict schema generation for multimodal triage.
- **Spatial Topology**: PostgreSQL 16 + PostGIS 3.4 + Uber H3 (`pg-h3`) — Spatial buffering and cluster lookups must execute with geodetic precision.
- **Data Privacy**: Compliance with India's Digital Personal Data Protection (DPDP) Act 2023 — Farmer mobile numbers stored as SHA-256 hashes.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Capacitor 6 Android APK over Pure React Native** | Allows 100% native execution of React Bits, Tailwind v4, and Stitch web design tokens while producing a real installable `.apk` with native SQLite and hardware sensors. | — Pending |
| **3-Tier Neuro-Symbolic Triage over Pure ML Model** | Guarantees zero-tolerance Anthrax safety on the edge, leverages Gemini 3.7 Flash for vernacular voice/photo perception, and uses PostGIS SaTScan for explainable spatial epidemiology. | — Pending |
| **Two-Phase Delta Synchronization** | Prevents large image uploads from choking 2G connections; critical telemetry (<2KB) syncs immediately. | — Pending |
| **PostgreSQL 16 + PostGIS + Uber H3** | O(1) hexagonal spatial indexing at Resolution 7/8 eliminates slow spatial polygon intersections during high-frequency surveillance surges. | — Pending |
| **GSD Model Profile set to Quality** | Ensures Opus-level architectural rigor and deep verification across all autonomous agents. | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-30 after initialization*
