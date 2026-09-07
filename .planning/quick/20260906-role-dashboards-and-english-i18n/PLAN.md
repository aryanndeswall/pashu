---
type: quick_plan
task_id: 20260906-role-dashboards-and-english-i18n
status: planned
date: 2026-09-06
description: Generate role-specific dashboards for Doctor and Admin, and fix English language leakage across the entire UI
---

# Quick Plan: Role-Specific Dashboards (Doctor & Admin) & Complete English Localization

## Problem Statement
1. **Missing Role-Specific Dashboards**: Currently, `DashboardView.tsx` only branches for `admin` (rendering the GIS war room) and falls back to a generic consumer view for both `doctor` and `consumer`. Field Veterinarians and Para-vets lack their own clinical dashboard (pending field investigations, cold-chain in-transit samples, today's vaccination targets, emergency triage alerts, and farmer tele-consult requests).
2. **Language Leakage in English Mode**: When a user selects English (`en`), numerous components across the application still display Marathi or Hindi text. This is caused by:
   - Binary ternaries (`currentLanguage === 'hi' ? hiText : mrText`) lacking an `=== 'en'` branch.
   - Hardcoded Devanagari labels and hybrid bilingual strings (e.g., `"QR लेबल (View QR)"`, `"PCICDA कायदा २००९ आठवडे बाजार बंदी आदेश"`, `"सल्ला समजला व स्वीकारला"`).
   - Components like `TriageResultCard` hardcoding language tabs to only `'mr'` and `'hi'`.

## User Requirements
- Generate distinct, tailored dashboards for **Doctor** (Veterinarian / Para-vet) and **Admin** (District Veterinary Officer / DVO).
- Ensure that selecting English removes ALL Devanagari leakage, making the language switcher work effortlessly and completely across the entire UI.
- Maintain 100% test compatibility: Vitest suite (30 test files) and TypeScript typecheck (`tsc --noEmit`) must remain green.

## Implementation Steps

### Step 1: Extend `languageStore.ts`
- Add dictionary entries for all new Doctor and Admin dashboard metrics, actions, and status tags in Marathi (`mr`), Hindi (`hi`), and English (`en`).
- Add clean English translations for previously un-translated or hybrid terms in `MarketClosureModal`, `LabReferralView`, `TriageResultCard`, and `AnimalRegistryView`.

### Step 2: Implement Role-Specific Dashboards in `DashboardView.tsx`
- **Admin Dashboard (`activeRole === 'admin'`)**:
  - District Biosecurity Overview & Outbreak Code.
  - 4 Executive Metric Tiles: Active Clusters (OPS 0.84), 4 Surveillance Villages (LGD), 10km Perimeter, 72h Ring Vaccination Target (3,550).
  - Web-GIS Outbreak Cluster Map with 1km, 5km, 10km buffer toggles.
  - 14-Day Rolling Epidemic Curve chart.
  - SIH Hackathon Demo Scenario Simulator card.
  - Statutory Market Closure Order Generator (`MarketClosureModal`).
- **Doctor Dashboard (`activeRole === 'doctor'`)**:
  - Urgent Clinical Attention banner (outbreak clusters & Anthrax/FMD alerts in taluka).
  - 4 Clinical Operational Tiles: Pending Investigations, Vaccinations Given Today, In-Transit Lab Samples, Tele-Consult Requests.
  - Quick Action Toolbar: Run AI Triage, New e-LRF Requisition, Record Vaccine, Call Farmer.
  - Active Clinical Field Queue (recent cases with animal tags, farmer contact, symptoms, and 1-tap action).
  - Taluka Ring-Vaccination Progress Bar (e.g., 1,240 / 3,550 doses completed).
- **Consumer Dashboard (`activeRole === 'consumer'`)**:
  - Local herd health passbook summary.
  - 5km Local Surveillance Radar (all clear / alert).
  - Upcoming booster reminder countdown.
  - Quick Helpline 1962 & Tele-Consult action.

### Step 3: Eliminate English Language Leakage Across All Views
- **`components/syndromes/TriageResultCard.tsx`**:
  - Add `'en'` to advisory language selector (`mr` | `hi` | `en`).
  - Wire syndrome name and suspect to check `currentLanguage === 'en'`.
  - Localize confidence gauge (`Confidence`), rationale (`Clinical Rationale`), and acknowledge button (`Acknowledge Advisory`).
- **`components/gis/MarketClosureModal.tsx`**:
  - Localize modal title (`PCICDA 2009 Market Closure Order`), statutory authority explanation, and checkbox labels.
- **`views/LabReferralView.tsx`**:
  - Localize action buttons (`View QR Label`, `Log Temperature`, `Enter Result`, `New e-LRF Requisition`).
- **`views/AnimalRegistryView.tsx` & `NewAnimalModal.tsx`**:
  - Fix all ternaries and labels to provide clean English strings without Marathi/Hindi text.
- **`components/gis/CommandMapView.tsx`**:
  - Ensure legend, layer toggles, and village census cards strictly adhere to English when selected.

### Step 4: Verification & Automated Tests
- Run `npx tsc --noEmit` to ensure zero compilation errors.
- Run `npm test` to ensure all Vitest test suites pass.
- Verify in browser subagent that selecting English removes Devanagari text, and switching roles displays the new doctor and admin dashboards.
