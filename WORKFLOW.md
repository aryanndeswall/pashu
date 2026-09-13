# 🔄 Pashu-Suraksha — System Workflow Reference

> **System:** National Livestock Health Surveillance & Decision Support System
> **Problem Statement:** SIH ID 26128 — Department of Animal Husbandry & Dairying, Government of Maharashtra
> **Last Updated:** September 2026

---

## 1. Field Data Ingestion Workflow

### 1.1 Offline-First Report Submission

```
Farmer / Pashu Sakhi Opens App
            │
            ▼
     Role Selection → Login (Firebase OTP)
            │
            ▼
     Report Wizard (ReportWizardView)
     ┌──────────────────────────────┐
     │ Step 1: Species selection    │
     │ Step 2: Primary syndrome     │  ← 8 observable field signs
     │         (8-syndrome triage)  │    (laar girna, langdaana…)
     │ Step 3: Duration & count     │
     │ Step 4: Photo capture (WebP) │  ← @capacitor/camera
     │ Step 5: Voice note (15-30s)  │  ← capacitor-voice-recorder
     │ Step 6: GPS auto-tag         │  ← @capacitor/geolocation
     └──────────────────────────────┘
            │
            ▼
     Save to Local SQLite (Encrypted)
     @capacitor-community/sqlite
            │
        Network?
       ╱         ╲
    Online       Offline
      │             │
      ▼             ▼
  Immediate     Queue in SyncStore
  Sync          (Priority 1 syncs on
  (P1 JSON      next connection;
   < 2KB)       P2 media on WiFi/3G)
```

### 1.2 Two-Phase Delta Sync Protocol

| Priority | Payload | Sync Trigger | Max Size |
|----------|---------|--------------|----------|
| **Priority 1** | JSON telemetry (symptoms, GPS, metadata) | First available connection (even 2G) | < 2 KB |
| **Priority 2** | Photos (WebP), voice notes (audio) | WiFi or stable 3G connection | ≤ 250 KB/photo |

**Conflict Resolution:** Deterministic server-authority — server timestamp wins; field `updated_at` comparison determines merge.

---

## 2. AI Triage & Risk Scoring Workflow

```
Report Received at Cloud Backend
              │
              ▼
   ┌──────────────────────────────────┐
   │  RULE ZERO CHECK (Instant)       │
   │  Sudden death + unclotted blood? │
   │           YES → ANTHRAX PROTOCOL │
   │  • Lock case (no post-mortem)    │
   │  • Audio warning in local dialect│
   │  • Dispatch PPE vet team         │
   │  • Alert District Medical Officer│
   └──────────────────────────────────┘
              │ NO
              ▼
   ┌──────────────────────────────────┐
   │  SYNDROMIC TRIAGE ENGINE         │
   │  triage_service.py               │
   │                                  │
   │  8 syndromes → 13 ICAR-NIVEDI   │
   │  priority disease probabilities  │
   │                                  │
   │  Gemini 3.7 Flash (google-genai) │
   │  • Lesion photo analysis         │
   │  • Voice note transcription      │
   │  • Structured JSON output        │
   └──────────────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │  DENOMINATOR NORMALIZATION       │
   │                                  │
   │  Risk Score = Incident Count /   │
   │              Village Livestock   │
   │              Census (LGD unit)   │
   │                                  │
   │  Prevents false alerts at large  │
   │  commercial farms                │
   └──────────────────────────────────┘
              │
              ▼
         Risk Score Written to
         PostgreSQL 16 + PostGIS
```

### 8-Syndrome to Disease Mapping

| Observable Syndrome (Vernacular) | Suspect Diseases |
|----------------------------------|-----------------|
| Laar girna — hypersalivation + oral lesions | FMD, BVD |
| Gaanthe nikalna — skin nodules | Lumpy Skin Disease (LSD) |
| Achanak maut — sudden death + dark blood | Anthrax, HS |
| Langdaana — lameness | FMD, Foot Rot |
| Khooni dast — bloody diarrhoea | Haemorrhagic Septicaemia, BVD |
| Naak se paani — nasal discharge + fever | PPR, CCPP |
| Aankh mein sujan — conjunctivitis + fever | IBR, PPR |
| Bachha girna — abortion cluster | Brucellosis, BVD |

---

## 3. Spatio-Temporal Cluster Detection Workflow

```
New Case Written to DB
              │
              ▼
   ┌──────────────────────────────────────┐
   │  SaTScan Engine (satscan_service.py) │
   │                                      │
   │  Space-Time Permutation Scan         │
   │  over PostGIS geometry + H3 index    │
   │                                      │
   │  Resolution 7  (~5.16 km² hex)       │
   │  Resolution 8  (~0.74 km² hex)       │
   │                                      │
   │  14-day rolling window               │
   │  (TimescaleDB hypertable)            │
   └──────────────────────────────────────┘
              │
    Cluster Detected?
       ╱           ╲
     YES             NO
      │               │
      ▼               ▼
  Buffer Zone      Store case,
  Generator        await more data
  (buffer_service.py)
  │
  ├─ 1 km  → Infected Zone (movement ban)
  ├─ 5 km  → Ring Vaccination Zone
  └─ 10 km → Surveillance Zone
              │
              ▼
       Alert fired via
       notification_service.py
```

---

## 4. Alert & Escalation Workflow

```
Outbreak Cluster Confirmed
              │
              ▼
   ┌──────────────────────────────────────┐
   │  MULTI-CHANNEL ALERT DISPATCH        │
   │  notification_service.py             │
   │                                      │
   │  Channel 1: Firebase FCM             │
   │    → Field device push notification  │
   │    → District veterinary app         │
   │                                      │
   │  Channel 2: Redis Pub/Sub (7.2)      │
   │    → Live Web-GIS Command Dashboard  │
   │    → District / State officials      │
   │                                      │
   │  Channel 3: IDSP / NCDC Escalation   │
   │    → Zoonotic diseases only          │
   │    → Anthrax, Brucellosis, Rabies,   │
   │      Avian Influenza                 │
   └──────────────────────────────────────┘
              │
              ▼
   District Official Receives Alert
              │
              ▼
   Web-GIS Dashboard Actions:
   ├─ View 1/5/10 km buffer rings on map
   ├─ Issue movement restriction orders
   ├─ Dispatch Mobile Veterinary Units (1962)
   ├─ Order ring vaccination campaign
   └─ Coordinate panchayat / police advisory
```

---

## 5. Lab Sample Chain-of-Custody Workflow

```
Vet Initiates Lab Referral (LabReferralView)
        │
        ▼
  QR Code Generated (lab_service.py)
        │
        ▼
  Cold-Chain Countdown Starts
  ├─ Ice-pack shelf life: 24–48 hrs
  └─ Transit viability timer visible on app
        │
        ▼
  Sample Dispatched to Lab
  (BSL routing based on disease suspicion)
        │
        ▼
  Lab Receives & Scans QR
        │
    PCR / ELISA Result?
       ╱           ╲
   POSITIVE        NEGATIVE
      │                │
      ▼                ▼
  Immediate         Close case /
  Escalation        Downgrade alert
  → Confirm outbreak
  → Trigger full containment protocol
```

---

## 6. Role-Based Access & User Journey Map

| Actor | App Entry | Core Actions | Alerts Received |
|-------|-----------|--------------|----------------|
| **Farmer** | Role Portal → OTP Login | Submit report, view animal registry, find nearby vet | FCM: local outbreak warning |
| **Pashu Sakhi (Para-Vet)** | Role Portal → OTP Login | Farmer actions + lab referral + report validation | FCM: cluster in assigned block |
| **Field Veterinarian** | Role Portal → OTP Login | Sakhi actions + case diagnosis + PPE dispatch | FCM + Redis: all red alerts in district |
| **District Official** | Web-GIS Dashboard | View cluster map, issue containment orders, track labs | Real-time Redis stream |
| **State Official** | Web-GIS Dashboard | State epidemic curves, inter-district coordination | Redis pub/sub broadcast |

---

## 7. Development & Build Workflow

### Mobile APK Build Pipeline

```
src/ (React 19 + TypeScript)
      │
      ▼  tsc && vite build
      │
  dist/ (optimized static bundle)
      │
      ▼  npx cap sync android
      │
  android/ (Capacitor Android project)
      │
      ▼  ./gradlew assembleDebug
      │
  app-debug.apk ✅
```

### Backend Dev Workflow

```
docker-compose up
  ├─ PostgreSQL 16 + PostGIS 3.4
  └─ Redis 7.2
        │
        ▼
  uvicorn app.main:app --reload  (port 8000)
        │
        ▼
  pytest tests/ -v (async test suite)
        │
        ▼
  Deploy to Cloud (GCP / Railway)
```

### Testing Strategy

| Layer | Tool | Focus |
|-------|------|-------|
| Mobile Components | Vitest + Testing Library | UI rendering, sync queue logic |
| Backend Services | pytest + pytest-asyncio | Triage rules, SaTScan, buffer math |
| API Integration | httpx test client | Route contracts, auth flows |
| Firebase | `test_firebase.py` | FCM delivery, Auth token validation |
| Redis | `test_redis.py` | Pub/Sub alert streaming |
| Database | `test_db.py` | Schema migrations, PostGIS queries |

---

## 8. Offline Resilience Contract

| Scenario | Behaviour |
|----------|-----------|
| Zero connectivity (dead zone) | All reports saved to encrypted SQLite; app fully functional |
| Battery loss mid-report | SQLite write is transactional; no data lost on crash |
| OS cache clear (Android) | Native SQLite immune to WebView cache eviction |
| Sync conflict (two vets update same case) | Server timestamp authority; latest `updated_at` wins |
| Photo too large for 2G | Queued as Priority 2; JSON telemetry synced immediately on 2G |
| Device offline 40+ days | Full delta sync replays all Priority 1 then Priority 2 queues on reconnect |
