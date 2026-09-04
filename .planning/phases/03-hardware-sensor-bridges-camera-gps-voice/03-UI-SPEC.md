---
phase: 03
slug: hardware-sensor-bridges-camera-gps-voice
status: approved
shadcn_initialized: false
preset: none
created: 2026-09-03
---

# Phase 03 — UI Design Contract: Hardware Sensor Bridges (Camera, GPS, Voice) & 3-Step Wizard

> Visual and interaction design contract for Pashu-Suraksha's multi-sensor reporting wizard, camera WebP preview badge, vernacular voice waveform recorder, and GPS LGD village snapping card.

---

## Executive Summary & Design Principles

1. **Streamlined 3-Step Flow**: Replaces complex forms with a linear, focused wizard tailored for rural field workers and Pashu Sakhis.
2. **Instant Media Confirmation**: Every captured lesion photo shows an immediate visual thumbnail and a green `WebP • [size] KB` compression badge to assure the worker that the photo is optimized.
3. **Tactile & Visual Voice Feedback**: Voice recording provides live pulsating waveform bars, a 30-second countdown ring, and one-tap audio playback verification before report submission.
4. **Resilient Geolocation Snapping**: GPS displays auto-snapped LGD village names with an immediate manual dropdown override if accuracy is low or indoors.

---

## Design System & Component Foundation

| Property | Value | Notes |
|----------|-------|-------|
| Tool | none (Tailwind CSS v4 direct) | Embedded inside Capacitor 6 container |
| Preset | not applicable | Custom rural-optimized tokens |
| Component library | Custom accessible primitives | Lightweight DOM primitives compatible with React 19 |
| Icon library | Lucide React (`lucide-react`) | Camera, Mic, Square, Play, RefreshCw, MapPin, Navigation, CheckCircle2, ChevronRight, ChevronLeft, Sparkles |
| Micro-Interactions | React Bits (CSS Keyframes + SVG Canvas) | Waveform equalizer bars, pulsing GPS satellite radar, WebP badge flash |
| Primary Font | System Sans (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) | Zero-network local bundle boot |
| Vernacular Script | Devanagari (`मराठी`, `हिन्दी`) | Tuned line-height (1.45) and font-semibold baseline |

---

## Spacing Scale

Strictly adheres to the 4px baseline grid with 52px thumb target ergonomics:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Wave bar gap, pill badge padding |
| sm | 8px | Button icons gap, countdown ring margin |
| md | 16px | Wizard step card padding, grid gap |
| lg | 24px | Wizard step navigation bar margin |
| xl | 32px | Wizard header separation |
| 2xl | 48px | Bottom navigation clearance |
| 3xl | 64px | Voice recording action trigger circular button |

Exceptions:
- **`field-touch-target`**: `52px` minimum touch target (width & height) for thumb reachability on budget touchscreens.

---

## Typography Hierarchy

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Body | 16px | 400 (Regular) | 1.5 (24px) / 1.45 (Devanagari) | Village details, guidance text, audio status |
| Label | 12px | 600 (Semibold)| 1.25 (15px) | Step indicators, WebP badge, timer countdown, tag helper |
| Heading | 20px | 600 (Semibold)| 1.3 (26px) | Wizard step titles, media card titles |
| Display | 28px | 600 (Semibold)| 1.2 (34px) | Audio countdown ticker (`00:24`), GPS accuracy badge |

---

## Color Contract (60-30-10 Rule)

### Sunlight High-Contrast Outdoor Palette

| Role | Token / Hex | % Split | Usage |
|------|-------------|---------|-------|
| **Dominant Surface (60%)** | `#f8fafc` (Slate 50) / `#ffffff` | 60% | Step viewport background, card surfaces |
| **Secondary Structure (30%)** | `#ffffff` (White) / `#f1f5f9` (Slate 100) / `#e2e8f0` (Slate 200) | 30% | Wizard step containers, audio player card, GPS info box |
| **Primary Accent (10%)** | `#059669` (Emerald 600) | 10% | **Reserved strictly for**: Active step number, Next button, WebP badge, GPS auto-lock pill |
| **Recording State** | `#dc2626` (Crimson 600) / `#fee2e2` (Crimson 100) | Semantic | Active recording pulse, microphone live state, countdown text |
| **Warning / Low GPS** | `#d97706` (Amber 600) / `#fef3c7` (Amber 100) | Semantic | GPS accuracy >100m warning, manual village selection prompt |

---

## 3-Step Reporting Wizard UX Specification (`ReportWizardView.tsx`)

```
+-------------------------------------------------------------------+
|  [ < मागे / Back ]     टप्पा २/३: पुरावे जोडणी      [ X रद्द करा ] |
|  [=== Step 1 ===] ---- [=== Step 2 ===] ---- [--- Step 3 ---]     |
+-------------------------------------------------------------------+
|  1. फोटो पुरावा (Lesion Photo)                                      |
|  +-------------------------------------------------------------+  |
|  |  [ WebP Preview Thumbnail ]   | [ 📸 कॅमेरा उघडा (Camera) ] |  |
|  |  Badge: [ ✓ 184 KB • WebP ]   | [ 🖼️ गॅलरी (Gallery)     ] |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
|  2. स्थानिक व्हॉइस नोट (Vernacular Audio Note - Max 30s)          |
|  +-------------------------------------------------------------+  |
|  |    ( ( 🎙️ ) )  [ ||| | |||| | || ]  वेळ: 00:18 / 00:30      |  |
|  |    [ ▶️ ऐका (Play) ]   [ 🔄 पुन्हा रेकॉर्ड (Re-record) ]      |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
|  [ पुढे जा: स्थान व टॅग / Next: Location & Tag  -> ]             |
+-------------------------------------------------------------------+
```

### Step 1: लक्षण निवड (Syndrome Selection)
- Visual 2-column grid selecting 1 of 8 standardized syndromes (from Phase 2).
- Validates selection before allowing navigation to Step 2.

### Step 2: पुरावे जोडणी (Photo & Voice Evidence)
- **Camera Card:**
  - Default: Single tap button "📸 जनावराचा फोटो काढा (Take Photo)".
  - Captured: Shows compressed image thumbnail, green pill `WebP • 184 KB (720p)`, and "🔄 बदला (Change)" button.
- **Voice Memo Card:**
  - Default: Big microphone icon with text "🎙️ ३० सेकंद ऑडिओ रेकॉर्ड करा (Record Voice Note)".
  - Recording: Animated 8-bar equalizer oscillating in red with active countdown (`00:12 / 00:30`).
  - Recorded: Audio playback controls with play/pause button, audio scrubber bar, and re-record button.

### Step 3: स्थान व पशू आधार (Location & Pashu Aadhaar)
- **GPS Centroid Card:**
  - Top: Satellite lock icon with live accuracy (`GPS अचूकता: ±6m`).
  - Middle: Auto-detected LGD village badge (`गाव: राहुरी खुर्द, ता. राहुरी, जि. अहमदनगर • LGD: 556601`).
  - Bottom: "गाव बदला / Change Village" accordion allowing manual selection from 26 seeded Maharashtra villages.
- **Pashu Aadhaar RFID Card:**
  - 12-digit numeric input with auto-formatting (`1234-5678-9012`).
  - Helper copy: "इअर टॅग क्रमांक उपलब्ध नसल्यास रिकामा ठेवा (Optional)".
- **Final Submission CTA:**
  - "अहवाल जतन करा (Save Offline Report)" with tactile haptic feedback.

---

## Copywriting & Vernacular Action Contract

| Element | English Copy | Marathi Copy (प्राथमिक) | Solution / Next Step |
|---------|--------------|-------------------------|----------------------|
| Wizard Step 1 | "Step 1: Select Syndrome" | "टप्पा १: लक्षण निवडा" | Choose from 8 visual syndrome cards |
| Wizard Step 2 | "Step 2: Attach Evidence" | "टप्पा २: पुरावे जोडा" | Attach photo and vernacular voice memo |
| Wizard Step 3 | "Step 3: Location & Tag" | "टप्पा ३: स्थान व टॅग" | Confirm GPS LGD village & Pashu Aadhaar |
| Camera Button | "Take Lesion Photo" | "जनावराचा फोटो काढा" | Launches camera hardware |
| Voice Record CTA | "Record 30s Voice Note" | "आवाज नोंदवा (कमाल ३० सेकंद)" | Starts audio capture |
| Voice Recording | "Recording... Tap to Stop" | "रेकॉर्डिंग सुरू आहे... थांबवण्यासाठी दाबा" | Captures audio with timer |
| GPS Locked | "GPS Location Locked" | "GPS स्थान निश्चित झाले" | Displays snapped LGD village |
| Low GPS Warning | "Low GPS Accuracy (>50m)" | "GPS सिग्नल कमजोर आहे" | Prompts manual village selection |
| Save Report CTA | "Save Offline Report" | "अहवाल जतन करा (ऑफलाइन)" | Saves report draft to SQLite queue |

---

## Checker Sign-Off Checklist

- [x] **Dimension 1 Copywriting**: Explicit step-by-step Marathi/English copy with unambiguous verbs. (PASS)
- [x] **Dimension 2 Visuals**: Clear hierarchical flow from Step 1 to Step 3 with visual indicators for media and GPS lock. (PASS)
- [x] **Dimension 3 Color**: 60/30/10 rule enforced; Emerald for valid progression/badges, Crimson for recording, Amber for GPS warnings. (PASS)
- [x] **Dimension 4 Typography**: Exactly 4 sizes (16, 12, 20, 28) and 2 weights (400, 600) with Devanagari baseline adjustments. (PASS)
- [x] **Dimension 5 Spacing**: Multiples of 4 strictly used with 52px thumb touch target for all buttons and inputs. (PASS)
- [x] **Dimension 6 Registry Safety**: Pure Tailwind CSS v4, Lucide React icons, zero third-party external UI bloat. (PASS)

**Approval:** approved 2026-09-03
