# Phase 1: Project Scaffolding & Native Android APK Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-30  
**Phase:** 01-project-scaffolding-native-android-apk-foundation  
**Areas discussed:** Workspace Layout, Offline Database Strategy, Android Device & SDK Targets, Local State & Query Management  

---

## Workspace Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Unified Monorepo | `/mobile` (Capacitor/React) and `/backend` (FastAPI) co-located in this repository | ✓ |
| Mobile-Only Root | Root is the mobile app; cloud backend is developed in an external repository | |

**User's choice:** Unified Monorepo: /mobile (Capacitor/React) and /backend (FastAPI) co-located in this repository  
**Notes:** Co-locating mobile and backend preserves atomic commits, shared GeoJSON types, and synchronized phase tracking.

---

## Offline Database Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Runtime Migrations + Bundled LGD Seed Data | Tables created at boot with pre-bundled Maharashtra village codes in local assets | ✓ |
| Blank DB + Network Sync | Empty database created at boot; fetches LGD records on first online sync | |

**User's choice:** Runtime Migrations + Bundled LGD Seed Data: Tables created at boot with pre-bundled Maharashtra village codes in local assets  
**Notes:** Ensures field workers in cellular dead zones can immediately select districts, talukas, and sample villages offline.

---

## Android Platform & SDK Targets

| Option | Description | Selected |
|--------|-------------|----------|
| Min SDK 28 (Android 9.0) + Target SDK 34 (Android 14) | Maximizes coverage for budget rural smartphones (2GB RAM) | ✓ |
| Min SDK 29 (Android 10) + Target SDK 34 | Omits Android 9 devices for slightly newer WebView baseline | |

**User's choice:** Min SDK 28 (Android 9.0) + Target SDK 34 (Android 14): Maximizes coverage for budget rural smartphones (2GB RAM)  
**Notes:** Critical for field adoption where Pashu Sakhis carry low-end Android 9–14 devices.

---

## Local State Management

| Option | Description | Selected |
|--------|-------------|----------|
| TanStack Query v5 + Zustand | High-performance caching, optimistic updates, and reactive offline state | ✓ |
| Zustand + Direct SQLite Service | Lightweight state store directly interfacing with Capacitor SQLite | |

**User's choice:** TanStack Query v5 + Zustand: High-performance caching, optimistic updates, and reactive offline state  
**Notes:** Provides reactive query caching with offline hydration plugin, syncing seamlessly with the native SQLite store.

---

## the agent's Discretion

- Vite chunking and build configuration.
- TypeScript compiler options and path aliases.
- Diagnostic screen testing methodology.

## Deferred Ideas

- Camera capture and WebP compression -> Phase 3.
- Stitch UI layouts and React Bits animations -> Phase 2.
- Two-Phase Delta Sync engine -> Phase 5.
