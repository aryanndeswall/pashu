# Phase 1: Project Scaffolding & Native Android APK Foundation - Context

**Gathered:** 2026-08-30  
**Status:** Ready for planning  

<domain>
## Phase Boundary

Phase 1 delivers the fundamental building blocks of the Pashu-Suraksha mobile client:
- A unified monorepo structure with `/mobile` (Capacitor 6 + React 19 + Vite + Tailwind v4) and `/backend` (FastAPI).
- Native Android Gradle project configured for standalone APK compilation (`assembleDebug` / `assembleRelease`).
- Native Android SQLite database integration via `@capawesome-team/capacitor-sqlite` in protected app storage (`/data/data/com.pashusuraksha.app/databases/`).
- Verified zero-network offline boot (<180ms) and local database persistence across app restarts.
Hardware sensors (Camera, GPS, Voice) are deferred to Phase 3; complex UI layouts and React Bits are deferred to Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Workspace & Project Layout
- **D-01:** **Unified Monorepo:** Mobile client lives in `/mobile` and cloud surveillance API lives in `/backend` within `D:\pashu sih`. Keeps types, database schemas, and git history in a single cohesive repository.

### Offline Persistence & Seeding Strategy
- **D-02:** **Runtime Migrations + Bundled LGD Seed:** SQLite tables are initialized on first boot via automated SQL migrations. Baseline Local Government Directory (LGD) data (Maharashtra districts, blocks, and sample villages) is bundled as local JSON assets and seeded into SQLite without network.
- **D-03:** **Protected Internal App Storage:** Native SQLite uses `@capawesome-team/capacitor-sqlite` storing the database at `/data/data/com.pashusuraksha.app/databases/pashu_offline.db`, immune to Android OS cache purges under low disk pressure.

### Android Platform & SDK Targets
- **D-04:** **Android SDK 28–34:** Minimum SDK set to 28 (Android 9.0 Pie) and Target SDK set to 34 (Android 14). Ensures maximum compatibility with low-end rural smartphones (2GB–3GB RAM) carried by Pashu Sakhis while meeting Google Play requirements.
- **D-05:** **Package Identifier:** Android package ID configured as `com.pashusuraksha.app`.

### State Management & Query Cache
- **D-06:** **TanStack Query v5 + Zustand:** Client state uses Zustand for UI/session state and TanStack Query v5 for reactive data caching and optimistic updates, synced with the underlying native SQLite database.

### Agent's Discretion
- Exact Vite build configuration (rollup chunk splitting, source map options, alias paths like `@/`).
- TypeScript strictness flags (`strict: true`, `noImplicitAny: true`).
- Specific test harness for verifying SQLite read/write operations during Phase 1.

</decisions>

<specifics>
## Specific Ideas

- **Offline Boot Speed:** The initial HTML/JS bundle must load directly from `android/app/src/main/assets/public/` with zero remote network calls, ensuring instant launch even in total airplane mode.
- **Clean Health Check Screen:** Phase 1 should render a clean diagnostic screen verifying:
  1. Capacitor native bridge status (`Capacitor.isNativePlatform()`).
  2. Native SQLite connection and table verification (`SELECT count(*) FROM local_lgd_hierarchy`).
  3. Device memory and platform details.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing:**

### Mobile Architecture & APK Build Pipeline
- `MOBILE_APK_PRODUCTION_TECH_STACK_AND_AUDIT.md` — Complete Capacitor 6 setup, native SQLite schema, hardware permissions, and Gradle compilation pipeline.
- `.planning/research/STACK.md` — Prescribed libraries, versions, and package installation commands.
- `.planning/research/PITFALLS.md` — Pitfall 1 (Android WebView cache purging) and prevention mechanisms.

### Domain & System Context
- `.planning/PROJECT.md` — Core value, constraints, and project scope.
- `.planning/REQUIREMENTS.md` — `APK-01` and `APK-02` acceptance criteria.
- `AUDIT_AND_COMPREHENSIVE_PRD.md` — PostGIS schema and LGD administrative hierarchy definitions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None (Greenfield project). Architecture research, PRD, and technical audit documents are committed in repository root.

### Established Patterns
- Monorepo folder convention: `/mobile` for client application and `/backend` for cloud services.

### Integration Points
- `/mobile/capacitor.config.ts`: Native Android app ID and web asset directory (`dist`).
- `/mobile/android/app/build.gradle`: Android SDK targets (minSdkVersion 28, targetSdkVersion 34).

</code_context>

<deferred>
## Deferred Ideas

- **Hardware Sensor Integrations:** Camera photo capture, WebP compression, GPS location tracking, and audio recording are deferred to **Phase 3**.
- **Stitch Layouts & React Bits:** Full mobile tabs, 8-syndrome visual selector, and animated hazard borders are deferred to **Phase 2**.
- **Two-Phase Sync:** Event queue upload to cloud is deferred to **Phase 5**.

</deferred>

---

*Phase: 01-project-scaffolding-native-android-apk-foundation*  
*Context gathered: 2026-08-30*
