# Architecture Research: Pashu-Suraksha (पशु सुरक्षा)

**Domain:** National Livestock Health Surveillance & Epidemiological Decision Support  
**Researched:** 2026-08-30  
**Confidence:** HIGH  

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT & MOBILE APK TIER                                │
├───────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │  Capacitor 6 Android  │  │  React 19 + React     │  │  Native SQLite Engine │  │
│  │  Hardware Sensors     │  │  Bits + Tailwind v4   │  │  (SQLCipher Encrypted)│  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └───────────┬───────────┘  │
│              │                          │                          │              │
├──────────────┴──────────────────────────┴──────────────────────────┴──────────────┤
│                           INGESTION & GATEWAY TIER                                │
├───────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │      FastAPI Asynchronous Gateway (Uvicorn + uvloop + Pydantic v2)          │  │
│  │      - Two-Phase Delta Sync Processor (Telemetry vs Media)                  │  │
│  │      - Local Government Directory (LGD) Jurisdictional Scoping              │  │
│  └──────────────────────────────────────┬──────────────────────────────────────┘  │
├─────────────────────────────────────────┼─────────────────────────────────────────┤
│                           INTELLIGENCE & SPATIAL DB TIER                          │
├─────────────────────────────────────────┴─────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐  │
│  │ Google Gemini 3.7 Flash│  │ PostgreSQL 16 +        │  │ Redis 7.2 Pub/Sub & │  │
│  │ Multimodal Triage API  │  │ PostGIS 3.4 + H3       │  │ Live Alert Broker   │  │
│  └────────────────────────┘  └────────────────────────┘  └─────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Mobile APK (Field Client)** | Offline form capture, hardware camera shutter, voice recording, local SQLite storage, tactile haptics. | Capacitor 6 + React 19 + Tailwind v4 + React Bits + `@capawesome-team/capacitor-sqlite`. |
| **Two-Phase Sync Engine** | Prioritizes mission-critical JSON telemetry over 2G/SMS; queues heavy images/audio for Wi-Fi. | Custom event-sourced delta sync worker with client-side `UUIDv4`. |
| **FastAPI Gateway** | High-throughput endpoint handling, authentication, rate-limiting, and background task scheduling. | Python 3.11, AsyncPG, Pydantic v2. |
| **Gemini 3.7 Flash Engine** | Multimodal perception: analyzes lesion images and Marathi/Hindi voice recordings to output strict clinical JSON. | Google GenAI SDK (`google-genai`), structured outputs with JSON schema. |
| **PostGIS Spatial Cluster Engine** | Runs space-time permutation scan statistics (SaTScan logic) and generates 1km, 5km, 10km containment buffers. | PostgreSQL 16, PostGIS 3.4, TimescaleDB, Uber H3 (`pg-h3`). |
| **Web-GIS Command Dashboard** | Real-time map visualization, epidemic curve analytics, cold-chain lab tracking, and official memo generation. | React 19, MapLibre GL JS, Deck.gl, shadcn/ui. |

---

## Recommended Project Structure

```
pashu-suraksha/
├── mobile/                        # Android APK Source (Capacitor + React 19)
│   ├── android/                   # Native Android Gradle Project
│   │   ├── app/src/main/          # AndroidManifest.xml, Native Java plugins
│   │   └── build.gradle           # APK compilation rules & SDK 34 targets
│   ├── src/
│   │   ├── components/            # UI Components (shadcn/ui + React Bits)
│   │   ├── services/
│   │   │   ├── sqlite.ts          # Native SQLite wrapper & schema migrations
│   │   │   ├── syncManager.ts     # Two-Phase Delta Sync orchestrator
│   │   │   ├── camera.ts          # WebP photo compression pipeline
│   │   │   └── voice.ts           # Native audio memo recorder
│   │   ├── views/                 # Mobile Screens (Report, Dashboard, Animals, Labs)
│   │   └── App.tsx                # Mobile routing & network listener
│   ├── capacitor.config.ts        # Capacitor native bridge configuration
│   └── package.json
│
├── backend/                       # Cloud Surveillance Server (FastAPI)
│   ├── app/
│   │   ├── api/v1/                # REST & WebSocket Route Handlers
│   │   │   ├── sync.py            # Telemetry & Media sync endpoints
│   │   │   ├── triage.py          # Gemini 3.7 Flash multimodal pipeline
│   │   │   ├── spatial.py         # PostGIS cluster & buffer generation
│   │   │   └── lab.py             # e-LRF cold-chain tracking
│   │   ├── core/                  # Database connections, config, JWT security
│   │   ├── models/                # SQLAlchemy 2.0 Async & PostGIS models
│   │   ├── schemas/               # Pydantic v2 strictly typed schemas
│   │   └── services/              # SaTScan math, Gemini client, SMS dispatch
│   ├── Dockerfile
│   └── requirements.txt
│
└── .planning/                     # GSD Specification & Milestone Memory
```

---

## Architectural Patterns

### Pattern 1: Event-Sourced Two-Phase Offline Sync
**What:** Client-side mutations are stored as immutable event records in native Android SQLite. When network is detected, telemetry (<2 KB) syncs first; heavy media (WebP) is deferred.  
**Trade-offs:** Requires maintaining client queue status (`PENDING`, `SYNCING`, `SYNCED`), but eliminates network timeouts and chokes on 2G connections.

### Pattern 2: 3-Tier Neuro-Symbolic Triage
**What:** Combines deterministic edge rules (Anthrax zero-tolerance lock), multimodal LLM intelligence (Gemini 3.7 Flash for vision and voice), and mathematical spatial statistics (PostGIS SaTScan).  
**Trade-offs:** Three distinct code layers, but provides 100% safety, high conversational ease, and rigorous spatial epidemiology.

---
*Architecture research for: Pashu-Suraksha*  
*Researched: 2026-08-30*
