# Phase 6: Livestock Registry, Pashu Aadhaar & Cloud Persistence - Context & Decisions

**Phase:** 06  
**Status:** Locked  
**Created:** 2026-09-03  
**Requirements Addressed:** `REC-01`, `REC-02`  
**Mode:** Ponytail Ultra (Clean architecture, dual-engine persistence, DAHD standards)

---

## 1. Executive Summary & Core Objective

Phase 6 scaffolds the cloud ingestion engine and livestock identity registry:
- **FastAPI Cloud Backend (`backend/`):** High-speed asynchronous Python 3.11+ API with Pydantic v2 validation, PostgreSQL 16 + PostGIS 3.4 spatial database schema, TimescaleDB hypertable definitions, and automated SQLite local fallback for zero-dependency testing.
- **Pashu Aadhaar 12-Digit Registry (`REC-01`):** Complete animal entity management (tag number, species, breed, masked owner PII per DPDP Act 2023, village LGD code, vaccination ledger).
- **Vaccination Booster Tracking (`REC-02`):** DAHD national veterinary vaccination schedules (FMD biannual, LSD annual, Anthrax annual ring) with automated 14-day booster due alerts.
- **Mobile Digital Cattle Passbook (`AnimalRegistryView.tsx`):** Offline-first mobile interface supporting "माझे पशु (My Cattle)", 12-digit RFID tag lookup, vaccination history, and "+ नवीन नोंदणी (New Registration)" form persisting locally in SQLite `local_animals`.

---

## 2. Locked Architectural Decisions

### A. FastAPI Backend Architecture (`backend/`)
- **Structure:**
  - `app/main.py`: FastAPI app initialization, CORS middleware, API router mounting.
  - `app/database.py`: SQLAlchemy async engine with dual-engine support:
    - If `DATABASE_URL` is set (e.g. `postgresql+asyncpg://...`), connects to PostgreSQL/PostGIS.
    - If unset or in local tests, defaults to SQLite (`sqlite+aiosqlite:///./pashu_cloud.db`).
  - `app/models/`:
    - `animal.py`: SQLAlchemy ORM model for `animals` and `vaccination_records`.
    - `incident.py`: Incident telemetry model with PostGIS spatial geometry column.
  - `app/schemas/`:
    - `animal.py`: Pydantic v2 schemas for animal registration, tag lookup, vaccination logging.
  - `app/api/v1/`:
    - `animals.py`: Endpoints for `POST /api/v1/animals`, `GET /api/v1/animals/{tag_number}`, `POST /api/v1/animals/{tag_number}/vaccinations`.
    - `sync.py`: Ingestion endpoints for Phase 1 telemetry and Phase 2 binary media.
- **Docker Compose:**
  - `docker-compose.yml` providing PostgreSQL 16 + PostGIS 3.4 + TimescaleDB 2.16 image for production deployment.

### B. Livestock Registry & Privacy Standards (`REC-01`)
- **12-Digit Pashu Aadhaar RFID:**
  - Strictly formatted as 12 numeric digits (e.g., `100293847561`).
  - Mobile display formatted with hyphen separators: `1002-9384-7561`.
- **DPDP Act 2023 Compliance:**
  - Farmer telephone number stored as SHA-256 hash in backend database.
  - Masked phone displayed on UI: `+91-XXXXX-7890`.

### C. Vaccination Booster Rules (`REC-02`)
- **Disease Schedules:**
  - `FMD` (Foot & Mouth Disease): 6-month interval (180 days).
  - `LSD` (Lumpy Skin Disease): 12-month interval (365 days).
  - `ANTHRAX`: 12-month interval (365 days).
- **Booster Alert Threshold:**
  - `days_remaining <= 14`: Flags `BOOSTER_DUE` (Amber badge).
  - `days_remaining < 0`: Flags `OVERDUE` (Red badge).
  - Otherwise: `UP_TO_DATE` (Emerald badge).

### D. Mobile Animal Registry Experience (`AnimalRegistryView.tsx`, `animalService.ts`)
- **Offline SQLite Persistence:**
  - Queries `local_animals` table on mobile for instant zero-latency offline display.
  - New cattle registrations created offline are written to `local_animals` and queued in `offline_sync_queue`.
- **Passbook UI Segments:**
  1. **"माझे पशु (My Cattle)":** Card list showing cattle photo, breed, age, tag number, and overall vaccination status.
  2. **"पशु आधार शोध (Tag Lookup)":** Search box with health profile card and vaccination history timeline.
  3. **"+ नवीन नोंदणी (New Registration)":** Modal form with tag input, species dropdown, breed, age, and owner mobile.

---

## 3. Verification & Acceptance Criteria

1. Backend FastAPI test suite passes with pytest verifying API endpoints:
   - Animal registration (`POST /api/v1/animals`)
   - Animal lookup (`GET /api/v1/animals/{tag_number}`)
   - Vaccination recording with booster date calculation (`POST /api/v1/animals/{tag_number}/vaccinations`)
2. Mobile unit test suite verifies `animalService.ts` offline CRUD operations against SQLite `local_animals`.
3. Mobile component test suite verifies `AnimalRegistryView.tsx` rendering cattle cards, tag lookup, booster due badges, and new cattle registration modal.
4. Production build passes cleanly with 0 errors.
