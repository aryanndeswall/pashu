# Phase 10: Web-GIS Command Center, IDSP Bridge & SIH Demo Simulation - Validation Strategy

**Phase:** 10  
**Status:** Approved  
**Coverage Target:** 100% automated test execution across backend (pytest) and mobile client (vitest) with zero external dependencies.

---

## Automated Verification Gates

### Gate 1: Backend Web-GIS APIs & Statutory Services (Pytest)
- **File:** `backend/tests/test_gis.py`
- **Tests:**
  1. `test_get_epi_curve_data`:
     - Returns 14 daily date buckets with suspected, confirmed, and mortality metrics.
     - Verifies reproduction number ($R_t$) trajectory calculation.
  2. `test_generate_market_closure_memo_pcicda`:
     - Generates bilingual administrative memo citing Sections 6, 10, and 20 of PCICDA Act 2009.
     - Confirms inclusion of affected villages, haats, and police checkpoint orders.
  3. `test_idsp_alert_dispatch`:
     - Generates encrypted FHIR/IDSP syndromic notification packet.
     - Verifies public health action recommendations.
  4. `test_sih_demo_simulation_runner`:
     - Runs 7-step Ahmednagar outbreak scenario and confirms sequential completion.

### Gate 2: Mobile GIS Service & Utilities (Vitest)
- **File:** `mobile/src/tests/gisService.test.ts`
- **Tests:**
  1. `test_epi_curve_time_series_processing`:
     - Processes 14-day data points and computes max peak and $R_t$ drop.
  2. `test_market_closure_order_generator`:
     - Generates printable HTML/text administrative order memo.
  3. `test_sih_simulation_state_transitions`:
     - Steps through all 7 outbreak demonstration stages.

### Gate 3: Mobile UI Command Center & SIH Demo View (Vitest)
- **File:** `mobile/src/tests/CommandCenterView.test.tsx`
- **Tests:**
  1. `renders_web_gis_command_center_for_admin_role`:
     - Confirms map container, 1-5-10 km buffer legend, and epicenter widgets render.
  2. `renders_14_day_rolling_epi_curve_chart`:
     - Verifies bar/line rendering of the 14-day epidemic curve.
  3. `opens_market_closure_modal_and_generates_memo`:
     - Opens PCICDA memo generator and displays official bilingual order text.
  4. `executes_sih_demo_simulation_step_by_step`:
     - Clicks "Run SIH Demo Simulation", observes step progression, and verifies final outbreak containment state.

### Gate 4: Full System Regression
- Commands:
  - `python -m pytest backend/tests/` passes with 0 failures.
  - `npm --prefix mobile run test` passes with 0 failures.
