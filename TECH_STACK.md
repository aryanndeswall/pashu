# 🛡️ Pashu-Suraksha — Technology Stack Reference

> **System:** National Livestock Health Surveillance & Decision Support System
> **Problem Statement:** SIH ID 26128 — Department of Animal Husbandry & Dairying, Government of Maharashtra
> **Last Updated:** September 2026

---

## Architecture at a Glance

```
┌──────────────────────────────────────────────────────────────────────┐
│                     PASHU-SURAKSHA SYSTEM                            │
├─────────────────────────┬────────────────────────────────────────────┤
│  📱 MOBILE CLIENT (APK) │  🖥️ CLOUD BACKEND (FastAPI)               │
│  React 19 + Capacitor 6 │  Python 3.11 + PostgreSQL 16 + PostGIS    │
│  Offline-First SQLite   │  Redis 7.2 + Firebase + Gemini 3.7 Flash  │
└─────────────────────────┴────────────────────────────────────────────┘
```

---

## 📱 Mobile Client

### Core Runtime

| Technology | Version | Role |
|------------|---------|------|
| **React** | `19.x` | UI engine — concurrent rendering, transitions |
| **TypeScript** | `5.5+` | Static type safety across all payloads and events |
| **Vite** | `5.x` | Asset bundler — sub-180ms cold boot from APK flash memory |
| **Tailwind CSS** | `4.x` | Zero-runtime CSS — high-contrast sunlight-readable palette |
| **Capacitor** | `6.x` | Android APK container — hardware-accelerated WebView bridge |

### Capacitor Native Plugins

| Plugin | Version | Purpose |
|--------|---------|---------|
| `@capacitor-community/sqlite` | `6.0.2` | Encrypted SQLite — immune to OS cache eviction |
| `@capacitor/camera` | `6.1.0` | Lesion photo capture → WebP compression (≤250 KB) |
| `@capacitor/geolocation` | `6.1.0` | GPS tagging for syndromic reports |
| `@capacitor/haptics` | `6.0.3` | Vibration feedback for gloved/sunlight field use |
| `@capacitor/network` | `6.0.4` | Online/offline detection for sync queue |
| `capacitor-voice-recorder` | `6.0.1` | 15–30s vernacular voice note capture |
| `@capacitor/android` | `6.1.0` | Android platform bridge |

### State & Data

| Library | Version | Purpose |
|---------|---------|---------|
| **Zustand** | `4.5.5` | Lightweight global state (auth, navigation, sync, language) |
| **TanStack Query** | `5.50.0` | Server state caching — 5-min stale window, 2-retry policy |
| **Firebase SDK** | `12.18.0` | FCM push notifications (outbreak red alerts) |

### Mapping & Geospatial

| Library | Version | Purpose |
|---------|---------|---------|
| **MapLibre GL JS** | `6.9.0` | WebGL 60 FPS vector tile rendering |
| **react-map-gl** | `8.1.3` | React bindings for MapLibre |
| **@turf/turf** | `7.4.0` | Client-side geospatial math (buffer, distance calculations) |

### UI & Utilities

| Library | Version | Purpose |
|---------|---------|---------|
| **Lucide React** | `0.439.0` | Icon system |
| **clsx + tailwind-merge** | latest | Conditional className utilities |

### Mobile Application Screens

| Screen | File | Purpose |
|--------|------|---------|
| Role Portal | `RolePortalView.tsx` | Entry gateway — Farmer / Pashu Sakhi / Vet selection |
| Login | `LoginView.tsx` | Mobile OTP authentication |
| Dashboard | `DashboardView.tsx` | Outbreak map, alerts, incident feed |
| Report Wizard | `ReportWizardView.tsx` | 8-syndrome triage + photo + voice input |
| Animal Registry | `AnimalRegistryView.tsx` | Pashu Aadhaar RFID-tagged livestock records |
| Lab Referral | `LabReferralView.tsx` | Sample chain-of-custody + cold-chain timer |
| Nearby Doctors | `NearbyDoctorsView.tsx` | Closest vet / MVU locator |
| User Profile | `UserProfileView.tsx` | Role profile, language, sync status |

### Dev Tooling

| Tool | Purpose |
|------|---------|
| Vitest + Testing Library | Unit and component testing |
| ESLint | Code quality enforcement |
| Android Studio / Gradle | APK compilation (`assembleDebug` / `assembleRelease`) |

---

## 🖥️ Cloud Backend

### Core Runtime

| Technology | Version | Role |
|------------|---------|------|
| **FastAPI** | `≥0.115.0` | Async API gateway — 15k+ req/sec via Uvicorn + uvloop |
| **Python** | `3.11` | Runtime — native GeoPandas, SciPy, Gemini SDK integration |
| **Uvicorn** | `≥0.30.0` | ASGI server with `[standard]` extras (uvloop, httptools) |
| **Pydantic** | `v2.8.0+` | Schema validation for telemetry packets and Gemini JSON |
| **SQLAlchemy** | `≥2.0.30` | Async ORM — `asyncpg` driver for PostgreSQL |

### Database Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | `16` | Primary relational store — LGD hierarchies, case records |
| **PostGIS** | `3.4` | Geodetic spatial topology — `ST_DWithin`, `ST_Buffer` |
| **TimescaleDB** | `2.16+` | Epidemiological time-series hypertables (14-day rolling curves) |
| **Uber H3 (pg-h3)** | `4.1+` | Hexagonal spatial index — O(1) cluster lookups at Res 7/8 |
| **asyncpg** | `≥0.30.0` | High-performance async PostgreSQL driver |
| **aiosqlite** | `≥0.20.0` | Async SQLite for local dev / testing |

### AI & Intelligence

| Technology | Version | Purpose |
|------------|---------|---------|
| **Google Gemini 3.7 Flash** | Latest via `google-genai` | Multimodal triage — lesion photos + Marathi/Hindi voice |
| **Pillow** | `≥10.3.0` | Server-side image preprocessing before Gemini inference |

### Messaging & Storage

| Technology | Version | Purpose |
|------------|---------|---------|
| **Redis** | `≥5.0.0` (7.2 recommended) | Pub/Sub alert broker — red alerts → district dashboards |
| **Firebase Admin SDK** | `≥7.0.0` | FCM push notifications to field devices |

### Backend Service Modules

| Service | File | Responsibility |
|---------|------|----------------|
| Triage Engine | `triage_service.py` | 8-syndrome rules, zoonotic biohazard flagging, Gemini AI inference |
| GIS Engine | `gis_service.py` | PostGIS spatial queries, LGD boundary lookups |
| SaTScan Engine | `satscan_service.py` | Spatio-temporal cluster detection (SaTScan permutation logic) |
| Buffer Generator | `buffer_service.py` | Auto-generate 1km/5km/10km containment ring zones |
| Lab Logistics | `lab_service.py` | Sample chain-of-custody, cold-chain countdown, QR codes |
| Notification Engine | `notification_service.py` | Multi-channel alerts — FCM, Redis pub/sub, IDSP escalation |
| Pub/Sub Broker | `pubsub_service.py` | Redis streaming for live GIS dashboard updates |
| Auth Service | `auth_service.py` | Firebase Auth + JWT session management |
| Storage Service | `storage_service.py` | Photo upload pipeline + GCS integration |

### REST API Endpoints (`/api/v1/`)

| Router | File | Purpose |
|--------|------|---------|
| Auth | `auth.py` | OTP login, token refresh, profile setup |
| Cases | `cases.py` | Submit/retrieve disease reports |
| Triage | `triage.py` | AI triage invocation + response |
| Clusters | `clusters.py` | Outbreak cluster detection + alert generation |
| Animals | `animals.py` | Pashu Aadhaar registry CRUD |
| GIS | `gis.py` | Spatial buffer zones, map tile data |
| Labs | `labs.py` | Lab sample tracking, BSL routing |
| Sync | `sync.py` | Offline delta sync — Priority 1 (JSON) + Priority 2 (media) |

### Infrastructure

| Tool | Purpose |
|------|---------|
| **Docker Compose** | Local dev orchestration (PostgreSQL, Redis, backend) |
| **pytest + pytest-asyncio** | Async test suite for all service modules |
| **httpx** | Async HTTP client for test fixtures and inter-service calls |

---

## 🔒 Security & Compliance

| Concern | Implementation |
|---------|---------------|
| **DPDP Act 2023** | Farmer mobile numbers stored as SHA-256 hashes — never in plaintext |
| **Mobile Storage** | SQLCipher-encrypted SQLite on device |
| **API Auth** | Firebase Auth + short-lived JWT tokens |
| **Data Sovereignty** | LGD-coded records tied to State → District → Block → GP → Village |
| **Biohazard Protocol** | Anthrax Rule Zero: locks case, audio warning in local dialect, dispatches PPE vet team |

---

## ❌ Explicit Exclusions

| Avoided Technology | Reason |
|-------------------|--------|
| **Next.js SSR** | Fails in offline dead zones; heavy hydration overhead |
| **Raw IndexedDB** | Android OS purges WebView cache under storage pressure |
| **Pure React Native** | Cannot execute React Bits hardware-accelerated animations |
| **Leaflet DOM markers** | Drops to 5 FPS with >2,000 incident points |
| **MongoDB** | Lacks geodetic topology for PostGIS-grade spatial queries |
| **Node.js/Express backend** | No native SciPy, GeoPandas, or Gemini SDK ecosystem |
| **Rule-only triage** | Fails on vernacular voice notes and photographic lesion data |
