# Phase 9: Diagnostic Lab Referral & Cold-Chain Tracking (e-LRF) - Validation Strategy

**Phase:** 09  
**Status:** Approved  
**Coverage Target:** 100% automated test execution across backend (pytest) and mobile client (vitest) with zero external network dependencies.

---

## Automated Verification Gates

### Gate 1: Backend e-LRF Requisition & SLA Engine (Pytest)
- **File:** `backend/tests/test_labs.py`
- **Tests:**
  1. `test_create_lab_requisition_success`:
     - Creates new e-LRF with unique ID format `LRF-YYYYMMDD-XXXX`.
     - Confirms QR payload generation containing tag ID, sample type, and destination lab.
  2. `test_cold_chain_sla_computation`:
     - Validates 48-hour countdown logic: sample collected 10 hours ago returns 38h remaining and `OPTIMAL` status.
     - Sample collected 40 hours ago returns 8h remaining and `WARNING` status.
     - Sample collected 50 hours ago returns 0h remaining and `BREACHED` status.
  3. `test_temperature_logging_and_breach`:
     - Logging 4.5°C maintains `OPTIMAL`.
     - Logging 14.2°C immediately flips status to `BREACHED` with alert flag.
  4. `test_submit_lab_result_positive_escalation`:
     - Submitting `POSITIVE` RT-PCR result updates requisition status to `LAB_CONFIRMED`.
     - Confirms confirmation timestamp and disease classification.
  5. `test_submit_lab_result_negative`:
     - Submitting `NEGATIVE` result sets status to `NEGATIVE`.

### Gate 2: Mobile Offline Lab Service & Requisition Flow (Vitest)
- **File:** `mobile/src/tests/labService.test.ts`
- **Tests:**
  1. `test_local_requisition_generation`:
     - Generates e-LRF record offline in SQLite/in-memory store.
     - Generates deterministic QR payload string.
  2. `test_cold_chain_sla_timer_utility`:
     - Computes remaining hours, percentage of 48h SLA elapsed, and bilingual labels.
  3. `test_offline_temperature_logging`:
     - Records temperature checkpoints and updates cold-chain compliance status.

### Gate 3: Mobile UI LabReferralView Component (Vitest)
- **File:** `mobile/src/tests/LabReferralView.test.tsx`
- **Tests:**
  1. `renders_requisition_list_and_cold_chain_cards`:
     - Displays active sample tracking cards with Devanagari labels and remaining hours.
  2. `opens_e_lrf_generator_modal_and_creates_requisition`:
     - Opens requisition modal, inputs sample details, and renders generated QR code.
  3. `allows_logging_temperature_checkpoint`:
     - Inputs temperature (e.g. 5.2°C) and verifies updated status.
  4. `submits_lab_test_result_and_displays_confirmed_badge`:
     - Selects RT-PCR Positive and verifies `LAB_CONFIRMED` badge appears.

### Gate 4: Full System Regression
- Commands:
  - `python -m pytest backend/tests/` passes with 0 errors.
  - `npm --prefix mobile run test` passes with 0 errors.
