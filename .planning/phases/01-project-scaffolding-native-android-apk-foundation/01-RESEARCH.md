# Phase 1: Project Scaffolding & Native Android APK Foundation - Research

**Researched:** 2026-08-30  
**Domain:** Capacitor 6 Native Android Container, React 19 Build System, Encrypted Native SQLite  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** **Unified Monorepo:** Mobile client lives in `/mobile` and cloud surveillance API lives in `/backend` within `D:\pashu sih`.
- **D-02:** **Runtime Migrations + Bundled LGD Seed:** SQLite tables are initialized on first boot via automated SQL migrations. Baseline Local Government Directory (LGD) data (Maharashtra districts, blocks, and sample villages) is bundled as local JSON assets and seeded into SQLite without network.
- **D-03:** **Protected Internal App Storage:** Native SQLite uses `@capawesome-team/capacitor-sqlite` storing the database at `/data/data/com.pashusuraksha.app/databases/pashu_offline.db`, immune to Android OS cache purges under low disk pressure.
- **D-04:** **Android SDK 28–34:** Minimum SDK set to 28 (Android 9.0 Pie) and Target SDK set to 34 (Android 14) for maximum compatibility with low-end rural smartphones (2GB–3GB RAM).
- **D-05:** **Package Identifier:** Android package ID configured as `com.pashusuraksha.app`.
- **D-06:** **TanStack Query v5 + Zustand:** Client state uses Zustand for UI/session state and TanStack Query v5 for reactive data caching and optimistic updates, synced with native SQLite.

### Agent's Discretion
- Vite rollup chunking and alias configurations (`@/`).
- TypeScript strict compiler flags.
- Diagnostic health-check UI for verifying native bridge and database connection.

### Deferred Ideas (OUT OF SCOPE)
- Hardware sensors (Camera, GPS, Voice recorder) -> Phase 3.
- Stitch UI layouts and React Bits micro-interactions -> Phase 2.
- Two-phase delta synchronization engine -> Phase 5.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Project Workspace | Build / Monorepo | — | Establishes `/mobile` and `/backend` co-located structure. |
| Vite + React 19 Bundle | Browser / WebView | Static Assets | Bundles client SPA into `dist` for embedding into APK. |
| Native Android Container | Mobile OS / Native | Android WebView | Handles native Gradle compilation, AndroidManifest, and APK generation. |
| Encrypted Offline Storage | Native Device SQLite | IndexedDB / Cache | Native SQLite via C-bindings guarantees zero eviction under low storage pressure. |
| Diagnostic Health Check | Client View | Native SQLite Bridge | Verifies native bridge communication and database table queryability. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 1 establishes the rock-solid client foundation for the Pashu-Suraksha surveillance system. The core technical hurdle is ensuring that the application compiles to a genuine native Android APK (`.apk`) that boots in <180ms from internal flash memory with **zero internet connection**, while persisting critical livestock records in a storage engine that the Android OS cannot wipe under storage pressure.

Capacitor 6 with `@capawesome-team/capacitor-sqlite` satisfies this requirement completely. Unlike browser-backed storage (`localStorage` or `IndexedDB`), Capacitor SQLite writes directly to Android's sandboxed internal app storage (`/data/data/com.pashusuraksha.app/databases/`), encrypted with SQLCipher (AES-256). The web application bundle is embedded directly inside the APK (`android/app/src/main/assets/public/`), allowing the app to execute with 100% offline autonomy.

**Primary recommendation:** Initialize `/mobile` with Vite + React 19 + TypeScript + Tailwind CSS v4, wrap with Capacitor 6 targeting Android SDK 28–34, implement the native SQLite migration and seeding pipeline, and verify the build with a diagnostic health-check screen.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@capacitor/core` | `^6.1.0` | Native Bridge Runtime | Provides cross-platform native runtime and bridge abstraction. |
| `@capacitor/android` | `^6.1.0` | Android Native Container | Houses the Android Gradle project, WebView, and native Java plugins. |
| `@capawesome-team/capacitor-sqlite` | `^6.0.0` | Encrypted Native SQLite | High-performance native Android SQLite with SQLCipher encryption, immune to OS eviction. |
| `react` / `react-dom` | `^19.0.0` | UI Runtime | Modern reactive UI runtime with concurrent transitions and Actions. |
| `vite` | `^5.4.0` | Frontend Bundler | Ultra-fast build times, lean production bundles, and instant HMR. |
| `tailwindcss` | `^4.0.0` | Utility CSS Engine | Zero-runtime CSS engine with lightning-fast style injection. |
| `@tanstack/react-query` | `^5.50.0` | Reactive Query Caching | Industry standard for managing asynchronous, cached, and offline-hydrated server state. |
| `zustand` | `^4.5.0` | Global UI State | Lightweight (1.1 KB) store for local session and navigation state. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | `^0.400.0` | Icon Primitives | Clean, accessible vector icons for mobile navigation. |
| `clsx` + `tailwind-merge` | Latest | Class Name Utility | Safe merging of conditional Tailwind CSS classes. |

### Installation Commands
```bash
# In /mobile
npm install @capacitor/core @capacitor/android @capawesome-team/capacitor-sqlite
npm install react react-dom @tanstack/react-query zustand lucide-react clsx tailwind-merge
npm install -D vite @vitejs/plugin-react typescript tailwindcss @types/react @types/react-dom
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Native APK Boot Sequence

```
[ User Taps App Icon on Android ]
                │
                ▼
[ Android OS Boots MainActivity.java (Capacitor Bridge) ]
                │
                ▼
[ WebEngine Loads file:///android_asset/public/index.html ]
  (Zero Network Call — 100% Flash Memory Boot < 180ms)
                │
                ▼
[ React 19 App Mounts in Hardware-Accelerated WebView ]
                │
                ▼
[ DatabaseService.initialize() ]
  ├── Opens /data/data/com.pashusuraksha.app/databases/pashu_offline.db
  ├── Runs DDL Schema Migrations (CREATE TABLE IF NOT EXISTS...)
  └── Checks local_lgd_hierarchy: If count == 0, loads seed_maharashtra_lgd.json
                │
                ▼
[ Diagnostic Health Screen Renders ]
  └── Green Status: Native Platform = TRUE, SQLite Connected = TRUE, LGD Seed Count = 42
```

### Recommended Directory Structure (Monorepo)
```
D:\pashu sih/
├── mobile/                        # Capacitor 6 + React 19 Client
│   ├── android/                   # Native Android Studio / Gradle Project
│   │   ├── app/
│   │   │   ├── src/main/
│   │   │   │   ├── AndroidManifest.xml
│   │   │   │   ├── java/com/pashusuraksha/app/MainActivity.java
│   │   │   │   └── res/           # Android App Icons and Splash screens
│   │   │   └── build.gradle       # compileSdkVersion 34, minSdkVersion 28
│   │   ├── build.gradle
│   │   └── variables.gradle       # minSdk=28, compileSdk=34, targetSdk=34
│   ├── src/
│   │   ├── assets/
│   │   │   └── data/seed_maharashtra_lgd.json # Pre-compiled LGD seed
│   │   ├── database/
│   │   │   ├── sqliteConnection.ts # Connection lifecycle management
│   │   │   ├── migrations.ts      # DDL schemas & versioned table creation
│   │   │   └── seedLgd.ts         # Bulk seed loader
│   │   ├── store/                 # Zustand UI stores
│   │   ├── components/            # Reusable UI widgets
│   │   ├── views/
│   │   │   └── HealthCheckView.tsx # Diagnostic verification screen
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── capacitor.config.ts        # appId: "com.pashusuraksha.app", webDir: "dist"
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                       # Reserved for Cloud Service (Phase 6)
│   └── .gitkeep
│
└── .planning/                     # GSD Specification
```
</architecture_patterns>

<validation_architecture>
## Validation Architecture

Nyquist sampling contract for Phase 1 verification:

### Automated Test Infrastructure
- **Framework:** `vitest` for TypeScript unit tests; Android Gradle CLI for native APK builds.
- **Quick run command:** `npm --prefix mobile test -- --run`
- **Full suite command:** `npm --prefix mobile run build && npx --prefix mobile cap sync android`
- **Native APK verification:** `cd mobile/android && ./gradlew assembleDebug`

### Verification Mapping
1. **REQ APK-01 (Standalone APK & Instant Offline Boot):**
   - Verified via `npm --prefix mobile run build && npx --prefix mobile cap sync android` confirming bundle generation into `mobile/android/app/src/main/assets/public/`.
   - Verified via `./gradlew assembleDebug` generating `app-debug.apk`.
2. **REQ APK-02 (Native SQLite Persistence in Protected Storage):**
   - Verified via automated unit test mocking `@capawesome-team/capacitor-sqlite` executing DDL migrations and verifying insert/query operations.
   - Verified via `HealthCheckView` displaying connected table row counts.
</validation_architecture>

<pitfalls_and_gotchas>
## Pitfalls and Gotchas

1. **Android 14 SDK 34 Quirks:** Android 14 requires explicit foreground service types and updated build tools. Ensure `variables.gradle` sets `compileSdkVersion = 34` and `targetSdkVersion = 34` with Gradle 8+.
2. **Capacitor Asset Path Mismatch:** If `vite.config.ts` has `base: '/'`, asset links in Android WebView can break. Use `base: './'` (relative paths) so all JS/CSS files resolve correctly from `file:///android_asset/public/`.
3. **SQLite Driver Native vs Web Fallback:** `@capawesome-team/capacitor-sqlite` relies on native Android libraries. In web browser development (`npm run dev`), provide a graceful mock fallback (e.g. in-memory or SQLite Web Worker) so development is not blocked without an Android device.
</pitfalls_and_gotchas>

---
*Phase: 01-project-scaffolding-native-android-apk-foundation*  
*Research completed: 2026-08-30*  
*Ready for planning: yes*
