# Phase 9: Diagnostic Lab Referral & Cold-Chain Tracking (e-LRF) - Research

**Phase:** 09  
**Status:** Completed  
**Domain:** Veterinary Pathology, Cold-Chain Logistics, Electronic Requisitions, RT-PCR/ELISA Escalation  
**Requirements Addressed:** `LAB-01`, `LAB-02`, `LAB-03`  

---

## 1. Veterinary Specimen Collection & Preservation Protocol

Under the **National Animal Disease Control Programme (NADCP)** and **FAO Field Manual on Animal Disease Surveillance**:

### Specimen Selection & Preservatives:
1. **Foot-and-Mouth Disease (FMD) (SYN_VESICULAR):**
   - **Sample:** Fresh unruptured or freshly ruptured vesicular fluid and tongue/gum/coronary band epithelial tags (at least 1–2 grams).
   - **Preservative:** 50% Glycerol Phosphate Buffered Saline (PBS) pH 7.4–7.6. (pH $< 6.5$ destroys the fragile aphthovirus capsid).
   - **Transport:** $2^\circ\text{C} - 8^\circ\text{C}$ in insulated vaccine carrier with frozen gel packs.
2. **Lumpy Skin Disease (LSD) (SYN_CUTANEOUS):**
   - **Sample:** Deep cutaneous skin scab, dermal nodule aspirate, or EDTA blood during viremic phase.
   - **Preservative:** Viral Transport Medium (VTM) or sterile transport vial.
   - **Transport:** $2^\circ\text{C} - 4^\circ\text{C}$.
3. **Haemorrhagic Septicaemia (HS) (SYN_RESPIRATORY):**
   - **Sample:** Heart blood in sterile plain tube and EDTA tube; lung lesion impression smears.
   - **Preservative:** Clot activator / EDTA anticoagulant.
4. **Anthrax Suspect (SYN_ANTHRAX_SUSPECT):**
   - **Mandatory Biohazard Rule:** **NEVER perform necropsy.** Collect drop of peripheral blood from ear vein using sterile syringe or cotton swab smear. Fix with flame or absolute methanol.

---

## 2. 48-Hour Cold-Chain SLA & Thermal Degradation

- Biological specimens collected in rural Indian heat ($> 38^\circ\text{C}$ ambient summer) degrade rapidly:
  - Viral RNA (FMDV, LSDV) experiences enzymatic lysis by endogenous RNases when temperature exceeds $10^\circ\text{C}$ for $> 12\text{ hours}$.
  - Bacterial specimens suffer overgrowth by environmental contaminants (e.g. *Proteus*, *Pseudomonas*), obscuring diagnostic culture.
- **SLA Rule:**
  - $\Delta t = \text{Current Time} - \text{Collected Time}$.
  - Maximum allowable $\Delta t = 48.0\text{ hours}$.
  - Remaining SLA $= \max(0.0, 48.0 - \Delta t)$.
  - Temperature compliance check: $T \le 8.0^\circ\text{C}$ is optimal; $8.0^\circ\text{C} < T \le 12.0^\circ\text{C}$ is warning; $T > 12.0^\circ\text{C}$ or $\Delta t \ge 48\text{h}$ flags `BREACHED`.

---

## 3. Laboratory Confirmation & Escalation Loop

- Confirmatory Diagnostic Assays:
  - **RT-PCR (Real-Time Reverse Transcription PCR):** Amplification of 5' UTR or VP1 gene (FMD) or RPO30 gene (LSD). High sensitivity and specificity.
  - **Sandwich ELISA:** Monoclonal antibody-based antigen detection for serotyping.
  - **Polychrome Methylene Blue (McFadyean Staining):** Demonstrates square-ended encapsulated *Bacillus anthracis* chains.
- **Closed-Loop Feedback:**
  - When test result is submitted as `POSITIVE`:
    1. Update Requisition status to `LAB_CONFIRMED`.
    2. Update linked `Incident` record status to `CONFIRMED`.
    3. If associated with an `OutbreakCluster`, force `ops_score = 1.0` and reinforce biosecurity buffer alerts.
    4. Emit event to Redis/Webhook for district veterinary authorities.

---

## 4. QR Code Generation in Mobile WebView

- For high-reliability offline rendering on budget Android devices without external API calls:
  - Generate clean SVG-based 2D matrix or standardized QR code encoding payload:
    ```json
    {
      "id": "LRF-20260904-4821",
      "tag": "100234567890",
      "syndrome": "SYN_VESICULAR",
      "disease": "FMD Suspect",
      "sample": "Vesicular Swab",
      "collected": "2026-09-04T09:00:00Z",
      "lab": "DDL_PUNE"
    }
    ```
  - This allows lab reception scanners to immediately deserialize patient, sample, and preservation data with a single barcode gun scan.
