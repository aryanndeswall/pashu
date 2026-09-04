---
phase: 6
slug: livestock-registry-pashu-aadhaar-cloud-persistence
status: approved
shadcn_initialized: false
preset: none
created: 2026-09-03
---

# Phase 6 — UI Design Contract: Digital Cattle Passbook & Animal Registry

> Visual and interaction design contract for `AnimalRegistryView.tsx`, the 12-digit Pashu Aadhaar RFID search, vaccination ledger, and new cattle registration form.

---

## Executive Summary & Design Principles

1. **Digital Cattle Passbook (पशू आधार पासबुक)**:
   - High-contrast visual cards representing the farmer's registered cattle with clear breed photos/icons, age, gender, and live vaccination status.
2. **Three-Segment Thumb Navigation**:
   - `माझे पशु (My Cattle)`: Instant list of animals belonging to the active farmer/village.
   - `पशु आधार शोध (Tag Lookup)`: 12-digit numeric search with 1-tap demo tag pills.
   - `+ नवीन नोंदणी (New Cattle)`: 52px thumb target modal for registering new cattle.
3. **Automated DAHD Vaccination Booster Badges**:
   - `UP_TO_DATE`: Emerald pill `✓ लस पूर्ण (Up to Date)`.
   - `BOOSTER_DUE`: Amber pulsing pill `⚠️ लस देण्याची वेळ (Booster Due in X Days)`.
   - `OVERDUE`: Crimson alert pill `🚨 लस थकीत (Overdue)`.

---

## Color & Token Contract (60-30-10 Rule)

| Component | Surface (60%) | Structure (30%) | Accent (10%) | Alert Badge Token |
|:---|:---|:---|:---|:---|
| **Cattle Passport Card** | `#ffffff` / `#0f172a` | `#f1f5f9` / `#1e293b` | `#059669` (Emerald 600) | `border-slate-200 dark:border-slate-800` |
| **Booster Due Badge** | `#fffbeb` (Amber 50)  | `#fef3c7` (Amber 100)  | `#d97706` (Amber 600)  | `text-amber-800 dark:text-amber-300 font-bold animate-pulse` |
| **Overdue Vaccine Badge**| `#fef2f2` (Red 50)   | `#fee2e2` (Red 100)    | `#dc2626` (Red 600)    | `bg-red-600 text-white font-extrabold` |
| **Pashu Aadhaar Tag Pill**| `#f8fafc` (Slate 50) | `#e2e8f0` (Slate 200)  | `#0f172a` (Slate 900)  | `font-mono tracking-wider font-bold` |

---

## Copywriting & Vernacular Action Contract

| Element | English Copy | Marathi Copy (प्राथमिक) | Action / Token |
|---------|--------------|-------------------------|----------------|
| Tab 1 Header | "My Cattle" | "माझे पशु" | Passbook Segment |
| Tab 2 Header | "Pashu Aadhaar Search" | "पशु आधार शोध" | Lookup Segment |
| Tab 3 Header | "New Registration" | "+ नवीन नोंदणी" | Modal Trigger |
| Tag Input Placeholder | "Ex. 1002-9384-7561" | "उदा. १००२-९३८४-७५६१" | 12-Digit Formatter |
| Register CTA | "Register Animal (Offline)" | "पशू नोंदणी करा (ऑफलाइन)" | 52px Emerald CTA |
| FMD Vaccine Label | "FMD (Foot & Mouth)" | "लाळ्या खुरकूत (FMD)" | Vaccination Item |
| LSD Vaccine Label | "LSD (Lumpy Skin)" | "लंपी त्वचा (LSD)" | Vaccination Item |
| Anthrax Vaccine Label | "Anthrax Ring Vaccine" | "काळपुळी (ॲन्थ्रॅक्स)" | Vaccination Item |

---

## Checker Sign-Off Checklist

- [x] **Dimension 1 Copywriting**: Explicit Devanagari labels for all cattle and vaccine terms. (PASS)
- [x] **Dimension 2 Visuals**: Cattle passbook layout with species icons and clear booster status. (PASS)
- [x] **Dimension 3 Color**: 60-30-10 palette with Emerald/Amber/Red status semantics. (PASS)
- [x] **Dimension 4 Typography**: High-contrast, bold Devanagari headers readable in glaring sunlight. (PASS)
- [x] **Dimension 5 Spacing**: 52px thumb target on registration button (`.field-touch-target`). (PASS)
- [x] **Dimension 6 Registry Safety**: Pure Tailwind v4 + Lucide React + Native SQLite. (PASS)

**Approval:** approved 2026-09-03
