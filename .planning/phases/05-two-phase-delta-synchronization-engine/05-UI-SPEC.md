---
phase: 5
slug: two-phase-delta-synchronization-engine
status: approved
shadcn_initialized: false
preset: none
created: 2026-09-03
---

# Phase 5 — UI Design Contract: Two-Phase Delta Synchronization Engine

> Visual and interaction design contract for the Header Sync Status Pill, Network Indicator, and the Slide-Up Sync Queue Drawer (`SyncQueueDrawer.tsx`).

---

## Executive Summary & Design Principles

1. **Unambiguous Rural Offline State Feedback**:
   - The user must always know if their data has been safely queued locally, partially synced (Phase 1 metadata over 2G), or completely synced (Phase 2 media over Wi-Fi).
2. **52px Thumb Targets & Touch Ergonomics**:
   - The manual `[ आताच समक्रमित करा (Sync Now) ]` action and SMS fallback button provide prominent 52px thumb target areas (`.field-touch-target`).
3. **High-Contrast Sunlight Resilience**:
   - High-contrast badges (Emerald for synced, Amber for pending Phase 2 in 2G, Crimson for offline with pending items).

---

## Color & Token Contract (60-30-10 Rule)

| Component | Surface (60%) | Structure (30%) | Accent (10%) | Status Indicator Tokens |
|:---|:---|:---|:---|:---|
| **Header Sync Pill** | Transparent / Pill | `#e2e8f0` / `#334155` | Emerald / Amber / Red | • `bg-emerald-100 text-emerald-900` (All synced)<br>• `bg-amber-100 text-amber-900` (2G Pending)<br>• `bg-red-100 text-red-900` (Offline Backlog) |
| **Sync Queue Drawer** | `#ffffff` / `#0f172a` | `#f1f5f9` / `#1e293b` | `#059669` (Emerald 600) | `border-slate-200 dark:border-slate-700` |
| **Phase 1 Synced Pill** | `#f0fdf4` (Emerald 50)| `#bbf7d0` (Emerald 200)| `#16a34a` (Emerald 600)| `text-emerald-700 font-mono text-[10px]` |
| **Phase 2 Pending Pill**| `#fffbeb` (Amber 50)  | `#fde68a` (Amber 200)  | `#d97706` (Amber 600)  | `text-amber-700 font-mono text-[10px]` |

---

## Layout Specification: Sync Queue Drawer (`SyncQueueDrawer.tsx`)

```
+-------------------------------------------------------------------+
|  [ ⚡ ] ऑफलाइन सिंक रांग (Offline Sync Queue)               [ ✕ ]  |
+-------------------------------------------------------------------+
|  नेटवर्क स्थिती (Network Status): [ 🟢 4G / Wi-Fi सक्रिय ]          |
|  एकूण रांगेतील अहवाल: ३ (१५० KB डेटा)                              |
+-------------------------------------------------------------------+
|  [ रांगेतील नोंदी (Pending Queue Items) ]                         |
|                                                                   |
|  • REP-9842 | तोंड आणि खुरांचे फोड (VSS)                            |
|    गाव: आश्वी बुद्रुक • ५ मिनिटांपूर्वी                              |
|    [ ✓ Phase 1: डेटा समक्रमित ] [ ⏳ Phase 2: फोटो प्रलंबित ]      |
|                                                                   |
|  • REP-9843 | काळपुळी (HSDS - ॲन्थ्रॅक्स)                           |
|    गाव: साकूर • १० मिनिटांपूर्वी [ 🚨 PRIORITY 3 ]                 |
|    [ ⏳ Phase 1: प्रलंबित ]     [ ⏳ Phase 2: प्रलंबित ]          |
|    [ 📲 1-टॅप SMS पाठवा (Send 140-char SMS) ]                     |
+-------------------------------------------------------------------+
|  [ 🔄 आताच सर्व समक्रमित करा (Sync Now) ]                          |
+-------------------------------------------------------------------+
```

---

## Copywriting & Vernacular Action Contract

| Element | English Copy | Marathi Copy (प्राथमिक) | Token / Action |
|---------|--------------|-------------------------|----------------|
| Header All Synced | "All Synced" | "सर्व समक्रमित" | Green Pill |
| Header 2G Pending | "2 Pending (2G)" | "२ रांगेत (2G)" | Amber Pill |
| Header Offline | "Offline Mode" | "ऑफलाइन मोड" | Red Pill |
| Header Syncing | "Syncing..." | "समक्रमित होत आहे..." | Spinning Icon |
| Drawer Title | "Offline Sync Queue" | "ऑफलाइन सिंक रांग" | Drawer Header |
| Sync Now Button | "Sync Now" | "आताच सर्व समक्रमित करा" | 52px Emerald CTA |
| SMS Emergency CTA | "Send via SMS" | "SMS द्वारे पाठवा" | 44px Amber Button |
| Phase 1 Complete | "Data Synced" | "डेटा समक्रमित" | Emerald Check |
| Phase 2 Pending | "Media Pending" | "फोटो/आवाज प्रलंबित" | Amber Clock |

---

## Checker Sign-Off Checklist

- [x] **Dimension 1 Copywriting**: Explicit Devanagari labels and clear network explanations. (PASS)
- [x] **Dimension 2 Visuals**: Fluid drawer layout, distinct Phase 1 vs Phase 2 item badges. (PASS)
- [x] **Dimension 3 Color**: 60-30-10 palette with Emerald/Amber/Red status semantics. (PASS)
- [x] **Dimension 4 Typography**: High-contrast, legible in direct sunlight. (PASS)
- [x] **Dimension 5 Spacing**: 52px thumb target on primary "Sync Now" button. (PASS)
- [x] **Dimension 6 Registry Safety**: Pure Tailwind v4 + Lucide React + FluidDrawer. (PASS)

**Approval:** approved 2026-09-03
