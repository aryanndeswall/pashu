# Phase 2 Discussion Log: Mobile UI, Design System & React Bits Micro-Interactions

**Date:** 2026-08-31  
**Phase:** 02-mobile-ui-design-system-react-bits-micro-interactions  

## Areas Discussed & Selected Options

### 1. Visual Design Tokens & Sunlight High-Contrast Theme (UI-UXmax)
- **Question:** How should colors and typography be tailored for rural field use?
- **Options Presented:**
  - Outdoor High-Contrast Sunlight Theme (Recommended)
  - Strict Auto-detection OS theme
- **Selected Decision:** **Outdoor High-Contrast Sunlight Theme by default** (WCAG AAA compliant emerald, safety amber, hazard crimson) with a 52px thumb target standard and Devanagari font scaling for Marathi/Hindi.

### 2. Navigation Architecture & Bottom Tab Structure
- **Question:** How should the mobile navigation shell be structured?
- **Options Presented:**
  - 4 Tabs (Report, Dashboard, Animals, Labs) + Elevated Center SOS Action Button (Recommended)
  - 4 Flat Tabs
- **Selected Decision:** **4 Tabs with an elevated center SOS Action Button** for instant biohazard/sudden death reporting and one-handed thumb ergonomics (controls in bottom 40%).

### 3. 8-Syndrome Visual Card Selector Experience
- **Question:** How should the 8 standardized clinical syndromes be displayed for field workers?
- **Options Presented:**
  - 2-Column Visual Card Grid with Anatomical Badges & Bilingual Subtitles (Recommended)
  - Single Column Expandable Accordion List
- **Selected Decision:** **2-Column Visual Card Grid** featuring anatomical icon badges (mouth, hoof, skin, lungs, blood), bilingual Marathi/Hindi subtitles, severity color coding, and explicit Anthrax pre-warning.

### 4. React Bits & Haptic Feedback Micro-Interactions
- **Question:** Which micro-interactions and tactile feedback should be implemented in the native APK?
- **Options Presented:**
  - React Bits Suite (Radar Sweep, Hazard Border, Count-Up Tickers, Fluid Bottom Sheet) + 3-Tier Haptics (Recommended)
  - Minimal CSS Transitions
- **Selected Decision:** **Full React Bits Animation Suite** (hardware-accelerated WebGL/CSS radar pulse, flashing crimson hazard border, count-up tickers, fluid bottom sheet) paired with 3-tier `@capacitor/haptics` (light, medium, error buzz).
