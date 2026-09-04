---
phase: 4
slug: 8-syndrome-decision-tree-zero-tolerance-anthrax-lockout
status: approved
shadcn_initialized: false
preset: none
created: 2026-09-03
---

# Phase 4 — UI Design Contract: 8-Syndrome Decision Tree & Zero-Tolerance Anthrax Lockout

> Visual and interaction design contract for secondary clinical symptom chips, dual diagnostic/advisory output, and the full-screen zero-tolerance Anthrax biohazard lockout screen.

---

## Executive Summary & Design Principles

1. **Rule Zero Zero-Tolerance Visual Language**:
   - Anthrax lockout cannot be dismissed accidentally. It displays a full-screen crimson red modal (`bg-red-950/95` or `bg-slate-950/95`) with flashing animated hazard borders (`HazardBorder.tsx`).
   - Headline in bold high-contrast Devanagari typography: **"तातडीक इशारा: शव विच्छेदन करू नका! (DO NOT CUT CARCASS!)"**.
2. **Adaptive Secondary Symptom Chips**:
   - In Step 1 of the Reporting Wizard, picking a syndrome smoothly expands 3–4 secondary clinical chips below the selected syndrome card.
   - 52px thumb target chips (`.field-touch-target`) toggleable on tap with tactile light haptic feedback.
3. **Dual Role-Adaptive Guidance Cards**:
   - **Doctor Persona**: Clinical differential diagnoses with match confidence pill, ICD-11/OIE codes, and recommended laboratory diagnostic tests (ear-swab smear, Giemsa staining).
   - **Farmer Persona**: Plain-language Marathi quarantine advisories with clear pictograms (isolate animal, do not sell milk, wash hands with soap, call Sakhi `1962`).

---

## Color Contract (60-30-10 Rule)

| Component | Surface (60%) | Structure (30%) | Accent (10%) | Alert Badge Token |
|:---|:---|:---|:---|:---|
| **Anthrax Lockout Screen** | `#450a0a` (Red 950) | `#1e293b` (Slate 800) | `#dc2626` (Red 600) | `bg-red-600 text-white font-extrabold animate-pulse` |
| **Secondary Symptom Chips** | `#ffffff` / `#0f172a` | `#e2e8f0` / `#1e293b` | `#059669` (Selected Emerald) | `border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40` |
| **Doctor Clinical Guidance** | `#eff6ff` (Blue 50) | `#ffffff` (White) | `#2563eb` (Blue 600) | `bg-blue-100 text-blue-900 border-blue-300 font-mono` |
| **Farmer Advisory Card** | `#f0fdf4` (Emerald 50)| `#ffffff` (White) | `#059669` (Emerald 600) | `bg-emerald-100 text-emerald-900 border-emerald-300` |

---

## Anthrax Lockout Screen Layout (`AnthraxBiohazardModal.tsx`)

```
+-------------------------------------------------------------------+
|  [ !!! ] तातडीक जैविक इशारा (CRITICAL BIOHAZARD ALERT)           |
+-------------------------------------------------------------------+
|  [ ☠️ ] शव विच्छेदन करू नका! (DO NOT CUT CARCASS!)                |
|  ॲन्थ्रॅक्स (काळपुळी) संसर्गाचा तीव्र संशय. मृत जनावराचे शव उघडल्यास       |
|  हवेत घातक बीजाणू पसरून माणसांना व इतर जनावरांना मृत्यू ओढवू शकतो!   |
+-------------------------------------------------------------------+
|  [ 🔊 चेतावणी ऐका (Play Marathi Audio Alert) ]                     |
+-------------------------------------------------------------------+
|  कडक जैविक सुरक्षा नियम (Mandatory Biosecurity Protocol):           |
|  [✓] १. जनावराचे शव उघडणे, कापणे किंवा कातडी काढणे पूर्णपणे बंदी      |
|  [✓] २. रक्ताचा नमुना फक्त कानाच्या टोकावरून काढा (Ear-tip Smear) |
|  [✓] ३. शव ६ फूट खोल खड्ड्यात कळीच्या चुन्यासह (Lime) पुरावे          |
|  [✓] ४. १ किमी परिसरातील सर्व जनावरांची हालचाल तत्काळ थांबवा        |
|  [✓] ५. जिल्हा मानवी आरोग्य विभाग (IDSP) कडे संपर्क शोध सुरू करा     |
+-------------------------------------------------------------------+
|  [ 📞 आपत्कालीन संपर्क (Dial 1962) ]                               |
|  [ 🚨 IDSP राष्ट्रीय सूचना नोंदवा (Queue Priority-3 Alert) ]        |
+-------------------------------------------------------------------+
```

---

## Copywriting & Vernacular Action Contract

| Element | English Copy | Marathi Copy (प्राथमिक) | Action / Severity |
|---------|--------------|-------------------------|-------------------|
| Biohazard Headline | "DO NOT CUT CARCASS!" | "शव विच्छेदन करू नका!" | Flash Red Alert |
| Biohazard Subtitle | "Suspected Anthrax Zoonotic Infection" | "ॲन्थ्रॅक्स (काळपुळी) संसर्गाचा तीव्र संशय" | Red Pill |
| Audio Alert Button | "Play Voice Warning" | "ध्वनी चेतावणी ऐका" | Plays Web Audio + Marathi TTS |
| Biosecurity 1 | "Do not cut or open carcass" | "शव उघडणे किंवा कापणे पूर्णपणे बंदी" | Checklist Item |
| Biosecurity 2 | "Ear-tip blood smear only" | "केवळ कानाच्या टोकावरून रक्ताचा नमुना" | Checklist Item |
| Biosecurity 3 | "Burial at 6-foot depth with lime" | "६ फूट खोल खड्ड्यात कळीच्या चुन्यासह पुरणे" | Checklist Item |
| Biosecurity 4 | "Quarantine herd within 1 km" | "१ किमी परिसरातील जनावरांचे विलगीकरण" | Checklist Item |
| Biosecurity 5 | "Notify IDSP / NCDC immediately" | "मानवी आरोग्य विभागाला (IDSP) त्वरित सूचना" | Checklist Item |
| Farmer Emergency Dial | "Call 1962 Toll-Free" | "१९६२ टोल-फ्री संपर्क करा" | Opens Phone Dialer `tel:1962` |
| Doctor IDSP Queue | "Queue Priority-3 IDSP Alert" | "IDSP राष्ट्रीय सूचना नोंदवा" | Writes to SQLite queue with priority 3 |

---

## Checker Sign-Off Checklist

- [x] **Dimension 1 Copywriting**: Explicit Devanagari biohazard labels and containment directives. (PASS)
- [x] **Dimension 2 Visuals**: Full-screen hazard border, flashing alerts, clear checklist markers. (PASS)
- [x] **Dimension 3 Color**: 60-30-10 palette with crimson `#dc2626` dominance for Anthrax alert. (PASS)
- [x] **Dimension 4 Typography**: High-contrast, bold Devanagari headers readable in glaring sunlight. (PASS)
- [x] **Dimension 5 Spacing**: 52px touch targets on all buttons (`.field-touch-target`). (PASS)
- [x] **Dimension 6 Registry Safety**: Pure Tailwind v4 + Lucide React + Web Audio API. (PASS)

**Approval:** approved 2026-09-03
