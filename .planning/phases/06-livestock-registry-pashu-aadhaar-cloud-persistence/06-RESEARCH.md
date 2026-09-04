# Phase 6: Livestock Registry, Pashu Aadhaar & Cloud Persistence - Research

**Phase:** 06  
**Status:** Completed  
**Domain:** FastAPI, SQLAlchemy, PostGIS, TimescaleDB, Animal Health Records, DPDP Act  
**Requirements Addressed:** `REC-01`, `REC-02`

---

## 1. FastAPI Cloud Backend Architecture (`backend/`)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI initialization, CORS, error handlers
│   ├── config.py                # Pydantic v2 Settings (DATABASE_URL, DPDP salt)
│   ├── database.py              # Dual-Engine async SQLAlchemy session manager
│   ├── models/
│   │   ├── __init__.py
│   │   ├── animal.py            # Animal & Vaccination ORM models
│   │   └── incident.py          # PostGIS syndromic incident model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── animal.py            # Pydantic request/response schemas
│   │   └── sync.py              # Phase 1 and Phase 2 sync schemas
│   └── api/
│       ├── __init__.py
│       └── v1/
│           ├── __init__.py
│           ├── animals.py       # Tag lookup, animal registration, vaccination routes
│           └── sync.py          # Telemetry & media sync ingestion routes
├── tests/
│   ├── conftest.py              # Pytest async client fixtures
│   └── test_animals.py          # Unit & integration API tests
├── docker-compose.yml           # PostgreSQL 16 + PostGIS 3.4 + TimescaleDB 2.16
├── requirements.txt             # FastAPI, Uvicorn, SQLAlchemy, aiosqlite, pydantic
└── Dockerfile                   # Python 3.12 multi-stage production build
```

---

## 2. Pashu Aadhaar 12-Digit Registry & DPDP Compliance

- **Pashu Aadhaar RFID Specification:**
  - 12 numeric digits allocated by Department of Animal Husbandry (DAHD) under INAPH (Information Network for Animal Productivity & Health).
  - Validation: Regex `^\d{12}$`.
- **DPDP Act 2023 Compliance:**
  - Owner phone numbers must never be exposed or logged in plain text.
  - Server hashes telephone: `sha256(phone + SECRET_SALT)`.
  - Stored display field: `+91-XXXXX-` followed by last 4 digits (e.g., `+91-XXXXX-9842`).

---

## 3. DAHD Veterinary Vaccination & Booster Rules

| Vaccine | Target Disease | Frequency | Interval Days | Booster Alert Threshold |
|:---|:---|:---:|:---:|:---|
| **FMD (Trivalent)** | Foot-and-Mouth Disease | Biannual (2x/year) | 180 days | `days_remaining <= 14` |
| **Goat Pox (LSD Homologous)** | Lumpy Skin Disease | Annual (1x/year) | 365 days | `days_remaining <= 14` |
| **Sterne 34F2 Spore** | Anthrax (Endemic Zone) | Annual (1x/year) | 365 days | `days_remaining <= 14` |

- **Status Classification:**
  - `UP_TO_DATE`: `days_remaining > 14` (Emerald status)
  - `BOOSTER_DUE`: `0 <= days_remaining <= 14` (Amber alert)
  - `OVERDUE`: `days_remaining < 0` (Red warning)

---

## 4. Mobile SQLite Caching & Digital Passbook

- Mobile SQLite table `local_animals`:
  - Instant offline lookup in cellular dead zones.
  - Seeds demo cattle for Ahmednagar district (Ramesh Patil's Gir Cow and Murrah Buffalo).
- `AnimalRegistryView.tsx`:
  - Segmented interface:
    1. **"माझे पशु (My Cattle)":** Cattle passport cards with breed, age, tag number, and vaccination status.
    2. **"पशु आधार शोध (Tag Lookup)":** 12-digit search box with quick demo tag pills and vaccination history timeline.
    3. **"+ नवीन नोंदणी (New Registration)":** 52px thumb target modal for registering new animals offline into SQLite and queueing for cloud sync.
