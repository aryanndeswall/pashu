# Phase 12: Live Environment Configuration & Gemini 3.7 Flash Cloud Perception - Validation Strategy

**Phase:** 12  
**Status:** Approved  
**Coverage Target:** 100% automated pytest & vitest execution with 0 external network dependencies in default mode, plus live integration test capability when `GEMINI_API_KEY` is present.  

---

## Automated Verification Gates

### Gate 1: Backend Live Configuration & Gemini Service (Pytest)
- File: `backend/tests/test_live_gemini.py` & `backend/tests/test_triage.py`
- Tests:
  1. `test_settings_gemini_config`: Verifies `settings.GEMINI_MODEL` defaults to `gemini-2.5-flash` and loads environment variables.
  2. `test_gemini_client_fallback_when_no_key`: Verifies `GeminiTriageService` falls back to `EdgeRulesEvaluator` without error when key is empty.
  3. `test_gemini_client_mock_live_inference`: Mocks `genai.Client` to verify request formatting, `Part.from_bytes`, and `TriageResponse` schema parsing.
  4. `test_gemini_live_call_if_key_available`: Conditional live test that invokes Google GenAI API when `GEMINI_API_KEY` is set in environment, asserting `<800ms` or valid response structure.

### Gate 2: Mobile Centralized Dynamic API Gateway (Vitest)
- Files: `mobile/src/tests/apiConfig.test.ts` & `mobile/src/tests/aiTriageFallback.test.ts`
- Tests:
  1. `test_api_config_defaults`: Ensures `API_CONFIG.baseUrl` defaults to `http://localhost:8000/api/v1` when `VITE_API_BASE_URL` is undefined.
  2. `test_api_url_builder`: Ensures `getApiUrl` handles trailing and leading slashes properly.
  3. `test_triage_uses_dynamic_gateway`: Ensures `aiTriageService` dispatches requests to `getApiUrl('triage/multimodal')`.
  4. `test_triage_offline_fallback_on_network_error`: Simulates network abort/failure and ensures on-device heuristic evaluation returns valid `TriageResponse`.

### Gate 3: Production Build & Lint Checks
- Command: `python -m pytest backend/tests/` passes cleanly with 0 errors.
- Command: `npm test` and `npm run build` in `mobile/` pass cleanly with 0 errors.
