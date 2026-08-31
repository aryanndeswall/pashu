---
phase: 02
slug: mobile-ui-design-system-react-bits-micro-interactions
status: approved
shadcn_initialized: false
preset: none
created: 2026-08-31
---

# Phase 02 — UI Design Contract: Mobile UI, Design System & React Bits Micro-Interactions

> Visual and interaction design contract for Pashu-Suraksha's rural-first Android APK. Governs sunlight-readable visual tokens, 52px ergonomic touch targets, 4-tab + SOS navigation shell, 8-syndrome visual selector, and hardware-accelerated React Bits animations with tactile haptics.

---

## Executive Summary & Design Principles

1. **Sunlight Legibility First (UI-UXmax)**: Optimized for 350–450 nit budget Android displays in direct 40°C Indian sunlight. Strict WCAG AAA contrast with high-saturation alert badges.
2. **One-Handed Field Thumb Ergonomics**: Interactive touch controls placed in the lower 40% of the screen with mandatory `52px x 52px` bounding touch targets (`.field-touch-target`).
3. **Cognitive Accessibility**: Low-literacy rural para-vets and farmers identify syndromes by anatomical location icons and colloquial Marathi/Hindi terms, not clinical English acronyms.
4. **Physical Haptic Confirmation**: Dual sensory feedback (visual + physical vibration) ensures operational confidence in noisy pastures and when wearing examination gloves.

---

## Design System & Component Foundation

| Property | Value | Notes |
|----------|-------|-------|
| Tool | none (Tailwind CSS v4 direct) | Tailwind v4 zero-runtime engine inside Capacitor 6 WebView |
| Preset | not applicable | Custom rural-optimized tokens |
| Component library | Custom accessible primitives (Radix-inspired) | Lightweight DOM primitives compatible with React 19 |
| Icon library | Lucide React (`lucide-react`) | Already installed; optimized SVG icons with stroke-width 2.25 |
| Micro-Interactions | React Bits (CSS Keyframes + WebGL/Canvas) | Hardware-accelerated GPU animations running at 60 FPS |
| Primary Font | System Sans (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) | Zero-network local bundle boot |
| Vernacular Script | Devanagari (`मराठी`, `हिन्दी`) | Tuned line-height (1.45) and bold baseline for rural clarity |

---

## Spacing Scale

Declared values (strictly multiples of 4, with 52px thumb target exception):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon-to-text gap, status badge padding |
| sm | 8px | Card interior sub-element spacing, badge margins |
| md | 16px | Standard screen padding, gap between syndrome cards |
| lg | 24px | Section separation, modal inner gutters |
| xl | 32px | Screen header separation, drawer upper buffer |
| 2xl | 48px | Bottom navigation clearance |
| 3xl | 64px | Floating SOS button vertical offset |

Exceptions:
- **`field-touch-target`**: `52px` minimum touch target (width & height) for thumb reachability on budget touchscreens (mandated by UI-UXmax rural ergonomics).
- **`tab-bar-height`**: `68px` bottom tab bar height including Android safe-area insets.

---

## Typography Hierarchy

Strictly constrained to 4 font sizes and 2 weights to maintain visual discipline:

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Body | 16px | 400 (Regular) | 1.5 (24px) / 1.45 (Devanagari) | Syndrome descriptions, advisory body text, metadata |
| Label | 12px | 600 (Semibold)| 1.25 (15px) | Tab labels, status pills, anatomical badges, tag numbers |
| Heading | 20px | 600 (Semibold)| 1.3 (26px) | Screen titles, syndrome card headers, modal titles |
| Display | 28px | 600 (Semibold)| 1.2 (34px) | Metric counters, emergency alert headers, KPI tickers |

Devanagari adjustment: Marathi and Hindi glyphs use `font-semibold` by default to ensure stroke clarity on low-DPI Android screens.

---

## Color Contract (60-30-10 Rule)

### Sunlight High-Contrast Palette (Default Outdoor Mode)

| Role | Token / Hex | % Split | Usage |
|------|-------------|---------|-------|
| **Dominant Surface (60%)** | `#f8fafc` (Slate 50) / `#ffffff` | 60% | Main background, screen viewport, modal backdrops |
| **Secondary Structure (30%)** | `#ffffff` (White) / `#f1f5f9` (Slate 100) / `#022c22` (Emerald 950 Header) | 30% | Card backgrounds, bottom tab bar container, header bars |
| **Primary Accent (10%)** | `#059669` (Emerald 600) | 10% | **Reserved strictly for**: Active bottom tab icon, primary submit action button, verified status border |
| **Safety Warning** | `#d97706` (Amber 600) / `#fef3c7` (Amber 100) | Semantic | High-contagion syndrome cards (VSS/FMD, NSLS/LSD), warning banners |
| **Critical Hazard / Destructive** | `#dc2626` (Crimson 600) / `#7f1d1d` (Crimson 900) | Semantic | **Reserved strictly for**: Anthrax / Sudden Death (HSDS) card, SOS button, biohazard lockout modal |

### High-Contrast Night / Barn Dark Mode (Single-Tap Toggle)

| Role | Token / Hex | Usage |
|------|-------------|-------|
| Dominant Surface | `#020617` (Slate 950) | Full screen dark background |
| Secondary Structure | `#0f172a` (Slate 900) / `#1e293b` (Slate 800) | Cards, bottom bar, modal sheets |
| Primary Accent | `#10b981` (Emerald 500) | Active states and primary actions |
| Critical Hazard | `#ef4444` (Crimson 500) | Glowing hazard borders and SOS trigger |

---

## Navigation Architecture

Fixed bottom bar with 4 tabs + 1 elevated center action:

```
+-------------------------------------------------------------------+
|  [ Report ]   [ Dashboard ]   ( ( SOS ) )   [ Animals ]   [ Labs ]|
|   नोंदणी        डॅशबोर्ड         तातडीक         पशु आधार     प्रयोगशाळा |
+-------------------------------------------------------------------+
```

1. **Tab 1: Report (नोंदणी / लक्षणे)** — Active default; opens 8-syndrome quick reporter.
2. **Tab 2: Dashboard (डॅशबोर्ड)** — Local village alert status, pending sync queue count, offline risk radar.
3. **Center SOS Button (तातडीक / आपत्कालीन)** — Elevated 64px circular crimson button (`#dc2626`) with pulsating hazard ring. One-tap direct launch into Hyperacute Sudden Death / Anthrax emergency lockout.
4. **Tab 3: Animals (पशु आधार)** — 12-digit RFID tag lookup, animal profile, local vaccination log.
5. **Tab 4: Labs (प्रयोगशाळा)** — e-LRF sample referral tracker, 48-hour cold-chain shelf-life timers.

---

## 8-Syndrome Visual Card Selector Specification

2-column responsive grid (`grid-cols-2 gap-3 md:gap-4`). Each card features an anatomical badge, bilingual title, colloquial symptoms, and severity border:

| Code | English Syndrome | Marathi / Hindi Name | Anatomical Badge Icon | Severity Level | Border / Accent |
|------|------------------|----------------------|-----------------------|----------------|-----------------|
| **VSS** | Vesicular & Salivation | तोंड आणि खुरांचे फोड (लाळ गळणे) | Mouth & Hoof | HIGH_CONTAGION | Amber border (`#d97706`) |
| **NSLS**| Nodular Skin Lesion | लंपी त्वचा / अंगावर गाठी | Skin Lumps | HIGH_CONTAGION | Amber border (`#d97706`) |
| **HSDS**| Hyperacute Sudden Death | अचानक मृत्यू (काळी माती / रक्तस्त्राव) | Blood Drop / Skull | CRITICAL_BIOHAZARD | Flashing Crimson Glow (`#dc2626`) |
| **AROS**| Acute Respiratory & Cough | श्वसनाचा त्रास / ठसका | Lungs & Snout | ELEVATED | Amber border (`#d97706`) |
| **CMSS**| Crepitant Muscular Swelling | मान-पायाची सूज / काळपुळी | Swollen Quarter | ELEVATED | Amber border (`#d97706`) |
| **SARF**| Storm Abortion Cluster | गाभण जनावरांचा गर्भपात | Reproductive | ELEVATED | Amber border (`#d97706`) |
| **HES** | Hemorrhagic Enteric | रक्ताची हगवण / संडास | Intestine / Droplets | ROUTINE_ENDEMIC| Emerald border (`#059669`) |
| **NAS** | Neurological / Agitation | पिसाळणे / चक्कर येणे | Head / Spiral | HIGH_CONTAGION | Amber border (`#d97706`) |

---

## React Bits Micro-Interactions Suite

1. **Radar Pulse Sweep (`RadarSweep.tsx`)**:
   - Location: Dashboard tab background & GPS location widget.
   - Behavior: 3 concentric expanding circles (5km, 10km scale) with a rotating conic-gradient sweep at 60 FPS.
   - Purpose: Visualizes real-time geodetic perimeter search without consuming network data.
2. **Hazard Card Border Glow (`HazardBorder.tsx`)**:
   - Location: HSDS (Anthrax) syndrome card and Emergency Outbreak banner.
   - Behavior: Alternating crimson glow pulse (`0 0 16px rgba(220, 38, 38, 0.6)`) at 1.2s ease-in-out cycle.
3. **Count-Up Metric Ticker (`CountUpTicker.tsx`)**:
   - Location: Dashboard sync counter (e.g. `0 → 4 अहवाल रांगेत / reports queued`).
   - Behavior: Smooth RAF-based integer roll-up over 800ms with ease-out cubic curve.
4. **Fluid Bottom Sheet Drawer (`FluidDrawer.tsx`)**:
   - Location: Syndrome detail confirmation sheet, vernacular voice recorder trigger.
   - Behavior: Hardware-accelerated CSS `translateY` spring gesture with snap points at 45% and 85% screen height.

---

## Haptic Feedback Contract (`@capacitor/haptics`)

| Event | Haptic Style | Vibration Duration | Sensory Intent |
|-------|--------------|-------------------|----------------|
| Tab Switch | `ImpactStyle.Light` | 10ms crisp tap | Navigation acknowledgement |
| Syndrome Card Tap | `ImpactStyle.Medium`| 25ms solid pulse | Selection confirmation |
| Offline Report Save | `NotificationType.Success` | Double-pulse (20ms - 40ms pause - 20ms) | Data durability confirmation |
| SOS / Anthrax Trigger | `NotificationType.Error` | Heavy triple-buzz (80ms - 30ms pause - 80ms) | Danger / biohazard awareness |

Fallback: If running in web browser during testing, haptic calls degrade gracefully to `navigator.vibrate` or no-op.

---

## Copywriting & Vernacular Action Contract

| Element | English Copy | Marathi Copy (प्राथमिक) | Solution / Next Step |
|---------|--------------|-------------------------|----------------------|
| Primary CTA | "Record Syndrome Report" | "लक्षण अहवाल नोंदवा" | Opens confirmation drawer |
| Secondary CTA | "Search Animal Tag" | "पशु आधार शोधा" | Queries local SQLite registry |
| Emergency SOS CTA | "Emergency Outbreak Alert" | "तातडीक आपत्कालीन सूचना" | Launches Biohazard lockout |
| Empty Reports State | "No Offline Reports Queued" | "एकही प्रलंबित अहवाल नाही" | "All field reports synced to cloud" |
| Empty Search State | "No Animal Found for Tag" | "या क्रमांकाचा पशु आढळला नाही" | "Check 12-digit tag or register new animal" |
| Offline Core Status | "Offline Core Active" | "ऑफलाइन मोड सक्रिय" | "Local SQLite saving enabled" |
| Anthrax Biohazard Warning | "DO NOT CUT CARCASS" | "शव विच्छेदन करू नका!" | "Blood will not clot; severe human infection risk" |

---

## Registry Safety & External Dependencies

| Registry / Source | Components Used | Safety Verification |
|-------------------|-----------------|---------------------|
| Lucide React (Official) | ShieldCheck, AlertTriangle, Activity, Stethoscope, WifiOff, FileText, PhoneCall, Radio, Eye | Official npm package verified; zero network overhead |
| React Bits (Native DOM) | CSS-based Radar Sweep, Hazard Pulse, Ticker | Direct zero-dependency CSS/Canvas primitives implemented internally |
| Third-Party Registries | None | No external unregulated registries permitted in APK core |

---

## Checker Sign-Off Checklist

- [x] **Dimension 1 Copywriting**: Specific verb+noun CTAs defined; bilingual Marathi/English; complete empty/error states. (PASS)
- [x] **Dimension 2 Visuals**: Clear focal points (center SOS button, high-contrast syndrome grid, radar sweep). (PASS)
- [x] **Dimension 3 Color**: 60/30/10 split explicitly declared; Emerald accent reserved for active navigation/submit; Crimson reserved strictly for biohazard/SOS. (PASS)
- [x] **Dimension 4 Typography**: Exactly 4 sizes (16, 12, 20, 28) and 2 weights (400, 600) declared with Devanagari line-height adjustments. (PASS)
- [x] **Dimension 5 Spacing**: Multiples of 4 strictly used (4, 8, 16, 24, 32, 48, 64) with justified 52px thumb touch target exception. (PASS)
- [x] **Dimension 6 Registry Safety**: Zero unvetted third-party blocks; native CSS and Lucide React only. (PASS)

**Approval:** approved 2026-08-31
