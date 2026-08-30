<!-- GSD:project-start source:PROJECT.md -->
## Project

**Pashu-Suraksha (पशु सुरक्षा) — National Livestock Health Surveillance & Decision Support System**

Pashu-Suraksha is an offline-first, real-time animal-health surveillance and epidemiological decision-support platform designed for rural India. Delivered primarily as a standalone Android APK for livestock owners, Pashu Sakhis (para-vets), and field veterinarians, paired with an executive Web-GIS command dashboard for District and State Animal Husbandry officials, it captures field symptoms, flags outbreak clusters, automates containment zones, and prevents catastrophic livestock mortality and zoonotic disease spread.

**Core Value:** The single non-negotiable priority: **Immediate, reliable early-warning outbreak identification and automated biosecurity containment—even in complete cellular dead zones—so that contagious outbreaks and fatal zoonoses (Anthrax, FMD, LSD) are contained within hours rather than days.**

### Constraints

- **Form Factor**: Standalone Android APK (`.apk`) — Field workers and Pashu Sakhis carry low-end Android smartphones (2GB-3GB RAM, Android 9-14).
- **Offline Persistence**: Native Android SQLite (`@capawesome-team/capacitor-sqlite` with SQLCipher) — Must never lose reports during battery loss or OS cache clears.
- **Component Stack**: Must execute **React Bits** animations without translation errors, necessitating a Capacitor 6 hardware-accelerated WebView container rather than pure React Native.
- **AI Processing**: Google Gemini 3.7 Flash (`google-genai` SDK) — Sub-second inference and strict schema generation for multimodal triage.
- **Spatial Topology**: PostgreSQL 16 + PostGIS 3.4 + Uber H3 (`pg-h3`) — Spatial buffering and cluster lookups must execute with geodetic precision.
- **Data Privacy**: Compliance with India's Digital Personal Data Protection (DPDP) Act 2023 — Farmer mobile numbers stored as SHA-256 hashes.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Capacitor** | `6.x` | Native Android APK Container | Enables 100% native execution of React Bits & Tailwind web components inside an Android APK, with zero-network local asset boot and native Java/Kotlin device bridges. |
| **React** | `19.x` | Mobile Client UI Engine | Modern reactive UI runtime supporting concurrent features, transitions, and seamless component composition. |
| **TypeScript** | `5.5+` | Static Type Safety | Eliminates runtime type errors across complex syndromic payloads, offline sync events, and GeoJSON boundaries. |
| **Vite** | `5.x` | Mobile Asset Bundler | Compiles ultra-lean, tree-shaken static bundles that boot in <180ms from Android flash memory (`assets/public/`). |
| **Tailwind CSS** | `4.x` | Mobile Styling & Tokens | Zero-runtime CSS engine with high-contrast sunlight themes and rapid styling iteration. |
| **FastAPI** | `0.115+ (Python 3.11)` | Cloud Ingestion & API Gateway | High-speed asynchronous Python (Uvicorn + uvloop) executing 15k+ req/sec with native Pydantic v2 validation and direct integration with GeoPandas and Gemini GenAI SDK. |
| **PostgreSQL + PostGIS** | `16 + 3.4` | Spatial Relational Database | Gold-standard geodetic spatial topology engine supporting true ellipsoidal math (`ST_DWithin`, `ST_Buffer`), census joins, and LGD hierarchies. |
| **TimescaleDB** | `2.16+` | Epidemiological Time-Series | Hypertables partitioned by timestamp and geography; 100x faster execution for 14-day rolling epidemic curves. |
| **Uber H3 (pg-h3)** | `4.1+` | Discrete Hexagonal Spatial Index | Replaces slow polygon-in-polygon math with O(1) integer hash lookups at Resolution 7 (~5.16 km²) and Resolution 8 (~0.74 km²). |
| **Google Gemini 3.7 Flash** | Latest via `google-genai` | Multimodal Perception Core | Sub-800ms multimodal inference parsing lesion photos and colloquial Marathi/Hindi audio into structured clinical JSON. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **`@capawesome-team/capacitor-sqlite`** | Latest | Encrypted Native Android SQLite | Primary offline persistence engine on mobile device; completely immune to OS cache eviction. |
| **`@capacitor/camera`** | `6.x` | Hardware Camera & Compression | Captures lesion photos and compresses to WebP (250 KB) on-device before storage. |
| **`@capacitor/geolocation`** | `6.x` | Hardware GPS Navigation | Captures latitude, longitude, and accuracy radius for syndromic geotagging. |
| **`@capacitor-community/voice-recorder`** | Latest | Native Audio Recorder | Records 15–30s vernacular voice notes for Gemini 3.7 Flash audio transcription. |
| **`@capacitor/haptics`** | `6.x` | Tactile Vibration Feedback | Provides physical vibration confirmations in bright sunlight or when wearing field gloves. |
| **MapLibre GL JS + Deck.gl** | `4.x / 9.x` | WebGL Geospatial Rendering | Renders 60 FPS vector tiles and dynamic 1km/5km/10km containment polygons. |
| **React Bits** | Latest | Micro-Interactions & Visual Polish | Hardware-accelerated radar sweeps, animated hazard borders, and count-up metric tickers. |
| **shadcn/ui + Radix UI** | Latest | Mobile Form Primitives | Accessible bottom sheets, dialogs, dropdowns, and toggle controls. |
| **Pydantic** | `v2.x` | Schema Validation | Validates incoming telemetry packets and strict Gemini JSON outputs in microseconds. |
| **Redis** | `7.2` | Pub/Sub & Live Alert Streaming | Low-latency message broker streaming red alerts to district veterinary dashboards. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| **GSD** | Spec-Driven Phasing & Verification | Governs development phases, enforces verification loops, and maintains project state. |
| **Stitch** | Screen & Layout Architecture | Rapidly generates mobile screens and GIS layout primitives matching government guidelines. |
| **UI-UXmax** | Design System & Rural Ergonomics | High-contrast sunlight palette (WCAG AAA), 52px thumb targets for rough field use. |
| **Android Studio / Gradle** | APK Compilation | Compiles native Android APK (`assembleDebug` / `assembleRelease`). |
## Installation
# Mobile Client Core
# Dev Dependencies
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Capacitor 6 + React 19** | Pure React Native (Expo) | Only if React Bits is abandoned and animations are rewritten from scratch in Reanimated 3. |
| **Capacitor SQLite (Native)** | IndexedDB / LocalStorage | Acceptable only in desktop browsers; strictly prohibited on Android mobile due to OS eviction risk. |
| **PostgreSQL + PostGIS + H3** | MongoDB / NoSQL | Never in this domain: MongoDB lacks geodetic topology and cannot intersect 5 km buffers with LGD polygons. |
| **FastAPI (Python 3.11)** | Node.js (Express) | Only if the project has no Python spatial/scientific dependencies (SciPy, PySal, GeoPandas). |
| **Gemini 3.7 Flash** | Custom Tabular ML Model | Only if a perfectly clean, balanced, 10-year historical dataset of 13 Indian diseases exists (which does not exist). |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Next.js 15 SSR** | Server-side rendering fails completely in offline dead zones; heavy hydration overhead. | Vite + React 19 client bundle embedded inside APK. |
| **Raw Browser IndexedDB on Android** | Android OS purges WebView caches under low storage pressure, destroying un-synced field reports. | Native Android SQLite (`@capawesome-team/capacitor-sqlite`). |
| **Leaflet DOM Markers** | Drops to 5 FPS when rendering >2,000 incident points simultaneously. | WebGL-accelerated MapLibre GL JS / Deck.gl. |
| **Pure Rule-Only Triage** | Fails on unstructured vernacular voice notes and photos of lesions. | Hybrid Neuro-Symbolic (Edge Rules + Gemini 3.7 Flash + PostGIS SaTScan). |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
