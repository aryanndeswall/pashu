# Phase 7: Google Gemini 3.7 Flash Multimodal Triage Pipeline - Validation Strategy

**Phase:** 07  
**Status:** Approved  
**Coverage Target:** 100% automated pytest & vitest execution with 0 external network dependencies.  

---

## Automated Verification Gates

### Gate 1: Backend Triage Services & Schemas (Pytest)
- File: `backend/tests/test_triage.py`
- Tests:
  1. `test_triage_request_validation`: Pydantic validates valid/invalid payloads.
  2. `test_rule_zero_anthrax_override`: Bleeding from orifices forces `CRITICAL_ANTHRAX_LOCK` with 1.0 confidence and biohazard instructions.
  3. `test_vernacular_marathi_fmd_inference`: Vernacular transcript mentioning "तोंडाला फोड आणि लाळ" accurately maps to `VSS` (FMD) with high confidence.
  4. `test_vernacular_lsd_inference`: Skin nodule description ("अंगावर गाठी") maps to `NSLS` (LSD).
  5. `test_gemini_client_fallback_mode`: Confirms that when `GEMINI_API_KEY` is not provided, the service falls back gracefully to `EdgeRulesEvaluator` without throwing 500 errors.
  6. `test_multimodal_api_endpoint`: `POST /api/v1/triage/multimodal` returns 200 with complete `TriageResponse` schema in <800ms.

### Gate 2: Mobile UI Triage Integration (Vitest)
- Files: `mobile/src/tests/TriageResultCard.test.tsx` (or integrated component tests)
- Tests:
  1. Displays syndrome badge with matching color & icon.
  2. Renders clinical confidence score and veterinary rationale.
  3. Renders actionable Marathi and Hindi containment advisories.
  4. Triggers heavy haptic alert if `CRITICAL_ANTHRAX_LOCK` is returned.

### Gate 3: Production Build
- Command: `npm run build` in `mobile/` and `python -m pytest backend/` passes cleanly with 0 errors.
