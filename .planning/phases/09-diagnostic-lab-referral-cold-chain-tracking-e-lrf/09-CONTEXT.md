# Phase 9: Diagnostic Lab Referral & Cold-Chain Tracking (e-LRF) - Context & Decisions

**Phase:** 09  
**Status:** Ready to execute  
**Created:** 2026-09-04  
**Requirements Addressed:** `LAB-01`, `LAB-02`, `LAB-03`  
**Mode:** Ponytail Ultra (Standardized veterinary laboratory protocol, offline-first mobile drafting, automated clinical escalation)

---

## 1. Executive Summary & Core Objective

Phase 9 establishes the closed-loop diagnostic laboratory workflow and sample custody tracking for Pashu-Suraksha:
- **Electronic Lab Requisition Form (e-LRF) & QR Code (`LAB-01`):** Field veterinarians generate standardized e-LRF forms for biological specimens (vesicular fluid, skin nodules, EDTA blood, swabs) linked to the 12-digit Pashu Aadhaar animal tag with a unique QR code for vial labeling and instant accessioning.
- **48-Hour Cold-Chain SLA & Temperature Monitoring (`LAB-02`):** Real-time monitoring of sample transit temperature ($2^\circ\text{C} - 8^\circ\text{C}$) and countdown of the mandatory 48-hour transit SLA, flagging temperature breaches ($> 12^\circ\text{C}$) or transit delays before RNA/antigen degradation occurs.
- **Lab Test Results & Automatic Case Escalation (`LAB-03`):** Lab technicians record diagnostic assay results (RT-PCR, Sandwich ELISA, Bacterial Staining). A `POSITIVE` result automatically escalates case status from `IN_TRANSIT` to **`LAB_CONFIRMED`**, boosts cluster probability scores, and triggers immediate veterinary biosecurity alerts.

---

## 2. Locked Architectural Decisions

### A. e-LRF Identifier & Specimen Taxonomy
- **Requisition ID Format:** `LRF-YYYYMMDD-XXXX` (e.g. `LRF-20260904-7482`).
- **Standardized Sample Types:**
  - `Vesicular Epithelium / Fluid`: For FMD (preserved in 50% Glycerol-PBS pH 7.4–7.6).
  - `Skin Scab / Nodule Biopsy`: For LSD (preserved in Viral Transport Medium / dry sterile tube).
  - `EDTA Whole Blood / Serum`: For HS, BQ, Anthrax suspect blood smears.
  - `Nasal / Ocular Swab`: For PPR and respiratory syndromes.
- **Accredited Diagnostic Laboratories:**
  - District Diagnostic Laboratory (DDL), Ahmednagar / Pune.
  - State Disease Investigation Section (DIS), Aundh, Pune.
  - ICAR-NIHSAD, Bhopal (National High Security Animal Diseases).
  - ICAR-DFMD, Mukteshwar / Bhubaneswar (Foot-and-Mouth Disease).

### B. Cold-Chain SLA & Temperature Health Rules
- **Total Transit SLA:** Strictly $48\text{ hours}$ from `collected_at` to lab accessioning.
- **Status Tiers:**
  - **`OPTIMAL` (Green `#10b981`):** $2.0^\circ\text{C} \le \text{Temp} \le 8.0^\circ\text{C}$ and Elapsed Time $< 36\text{h}$.
  - **`WARNING` (Amber `#f59e0b`):** $8.0^\circ\text{C} < \text{Temp} \le 12.0^\circ\text{C}$ or $36\text{h} \le \text{Elapsed Time} < 48\text{h}$.
  - **`BREACHED` (Red `#ef4444`):** $\text{Temp} > 12.0^\circ\text{C}$ OR Elapsed Time $\ge 48\text{h}$.
- **Countdown Display:** Dual Devanagari/English countdown display (`३२ तास शिल्लक / 32h left`) with animated SLA progress bar.

### C. Case Escalation State Machine
```
[PENDING_DISPATCH] 
       │
       ▼
  [IN_TRANSIT]  ── (Cold Chain Monitored: 2°C–8°C, 48h SLA)
       │
       ▼
 [RECEIVED_AT_LAB]
       │
       ▼
   [TESTING]  ── (RT-PCR / ELISA Assay)
       │
       ├─────────────────────────┐
       ▼                         ▼
[LAB_CONFIRMED]            [LAB_DISMISSED]
(Positive Result)         (Negative Result)
       │
       ▼
(Escalate Cluster OPS = 1.0 & Emit DVO Alert)
```

### D. Offline-First Mobile Storage
- Mobile SQLite table `lab_requisitions` enables field vets to generate e-LRF records with offline QR codes even without cellular reception.
- Background sync engine uploads drafts to backend when connection is re-established.

---

## 3. Threat Model & Safeguards

| Threat ID | Category | Component | Description | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-09-01 | Sample Invalidation | lab_service.py | Degraded samples tested after >48 hours yield false negatives | Enforce strict `BREACHED` flag; warn pathologist if sample SLA expired or temperature exceeded 12°C. |
| T-09-02 | Unverified Case Escalation | labs.py | False positive entry mistakenly declares state-wide quarantine | Require pathologist ID and test assay type (RT-PCR / ELISA) with batch number before allowing escalation to `LAB_CONFIRMED`. |
| T-09-03 | QR Tampering | LabReferralView.tsx | Damaged or unreadable paper labels cause sample mix-up | Embed alphanumeric human-readable Requisition ID alongside high-contrast SVG QR code. |
