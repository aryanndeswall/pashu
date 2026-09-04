# Phase 10: Web-GIS Command Center, IDSP Bridge & SIH Demo Simulation - Context & Decisions

**Phase:** 10  
**Status:** Ready to execute  
**Created:** 2026-09-04  
**Requirements Addressed:** `GIS-01`, `GIS-02`, `GIS-03`  
**Mode:** Ponytail Ultra (High-impact executive GIS, automated statutory memos, inter-agency public health bridge, bulletproof SIH demo runner)

---

## 1. Executive Summary & Core Objective

Phase 10 delivers the crowning executive command tier and hackathon presentation experience for Pashu-Suraksha:
- **Web-GIS Outbreak Command Center (`GIS-01`):** Executive cartographic interface rendering real-time vector vector containment polygons (1 km Infected Movement Freeze, 5 km Ring Vaccination, 10 km Surveillance Perimeter), cluster epicenters with pulsating radar sweeps, affected LGD villages, and biosecurity check-posts.
- **14-Day Rolling Epidemic Curves (Epi-Curves) (`GIS-02`):** TimescaleDB time-series analysis visualizing disease incidence trajectories, daily case counts (suspected vs. lab-confirmed), mortality spikes, and the reproduction number ($R_0$) drop following ring containment.
- **Statutory PCICDA Market Closure Memos & IDSP Bridge (`GIS-03`):**
  - One-click generation of official bilingual administrative orders issued under the **Prevention and Control of Infectious and Contagious Diseases in Animals (PCICDA) Act, 2009** for District Magistrates (District Collectors) mandating livestock market (*haat*) closures and police check-posts.
  - Inter-agency bridge generating encrypted HL7/FHIR syndromic alert packets dispatched to the **Integrated Disease Surveillance Programme (IDSP / NCDC)** for human contact tracing during Anthrax/zoonotic threats.
- **Ahmednagar Outbreak SIH Live Presentation Simulator:**
  - Automated 7-step presentation runner executing the full end-to-end outbreak lifecycle in <5 minutes for the SIH jury.

---

## 2. Locked Architectural Decisions

### A. Statutory Legal Authority: PCICDA Act 2009
- Orders generated strictly cite **Sections 6, 10, and 20 of The Prevention and Control of Infectious and Contagious Diseases in Animals Act, 2009 (Act No. 27 of 2009)**:
  - Section 6: Notification of Controlled Area and Eradication Area.
  - Section 10: Prohibition on holding animal markets, fairs, and exhibitions within the surveillance zone.
  - Section 20: Police assistance and establishment of quarantine check-posts on access roads.
- Output: Formal administrative order in Devanagari (Marathi) and English with official government header, reference number, designated magistrate signatories, and affected village annexures.

### B. 14-Day Rolling Epi-Curve Specification
- 14 daily date buckets up to current timestamp.
- Metrics per day:
  - `suspected_cases`: Daily reports flagged by syndromic decision tree.
  - `confirmed_cases`: Cases verified by RT-PCR/ELISA lab results (`LAB_CONFIRMED`).
  - `mortality_count`: Animal deaths recorded.
  - `reproduction_number` ($R_t$): Epidemiological transmission factor showing $R_t \approx 2.8$ during exponential growth, dropping to $R_t < 0.8$ within 5 days of dynamic ring-vaccination and movement freeze.

### C. IDSP / NCDC Inter-Agency Public Health Bridge
- Payload Structure:
  - Notification Code: `IDSP-SURVEILLANCE-ALERT-V1`
  - Zoonotic Risk Rating: `CRITICAL` (Anthrax), `HIGH` (Brucellosis), `MODERATE` (FMD/LSD)
  - Human Exposure Contact List: Livestock owner details, family members, handling history
  - Recommended Public Health Actions: Prophylactic ciprofloxacin/doxycycline distribution, human fever survey within 5 km radius.

### D. SIH 7-Step Demonstration Pipeline
```
[1. Field Report]       ── Farmer/Sakhi logs blisters in Ashwi Budruk
       │
[2. Gemini AI Triage]   ── Sub-second 96% FMD confidence, Rule Zero Anthrax Safe
       │
[3. SaTScan Escalation] ── 5km / 72h window, Attack Rate 2.76% > 1.5% -> OUTBREAK_DECLARED
       │
[4. Dynamic Buffers]    ── 1km Red, 5km Amber, 10km Cyan Geodetic Polygons rendered
       │
[5. e-LRF Cold Chain]   ── 48h SLA timer active, sample vial QR generated
       │
[6. Lab Confirmation]   ── RT-PCR VP1 Positive -> LAB_CONFIRMED escalation
       │
[7. Statutory Action]   ── PCICDA Haat Closure Memo issued + IDSP Human Health Bridge
```

---

## 3. Threat Model & Safeguards

| Threat ID | Category | Component | Description | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-10-01 | Unauthorized Order Dispatch | gis.py | Unauthorized user issues binding legal market closure order | Role restriction: only users with `admin` (DVO / District Collector) role can issue and sign statutory administrative memos. |
| T-10-02 | Epi-Curve Rendering Failure | EpiCurveChart.tsx | Empty or negative time-series intervals crash charting component | Pre-seed full 14-day zero-padded date series ensuring smooth SVG line/bar rendering even with sparse data. |
| T-10-03 | Demo Glitch in Offline Hall | SihDemoSimulatorCard.tsx | Demo fails during SIH jury presentation due to venue network drop | Pre-bundle deterministic client-side playback runner executing 100% offline inside the APK. |
