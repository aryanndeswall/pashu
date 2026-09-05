# Phase 12: Live Environment Configuration & Gemini 3.7 Flash Cloud Perception - Context

**Gathered:** 2026-09-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire live Google Gemini API key into the FastAPI backend (`google-genai` SDK), establish dynamic API gateway resolution on the mobile client (`VITE_API_BASE_URL`), and verify end-to-end multimodal perception on real lesion photos and Indic voice notes with sub-800ms response times.
Covers requirements CLOUD-01 and CLOUD-03.
Cloud storage uploads (Firebase SDK) belong in Phase 13, and Cloud DB / Redis clustering belong in Phase 14.

</domain>

<decisions>
## Implementation Decisions

### Gemini API Credentials & Live Test Harness
- **D-01:** Create `backend/.env` from `backend/.env.example` with clear inline documentation and placeholder fields.
- **D-02:** Develop an integration test suite / live test runner in `backend/tests/test_live_gemini.py` that checks:
  - When `GEMINI_API_KEY` is present: invokes the live Google GenAI API with sample lesion photo / vernacular audio prompt and verifies schema conformance (<800ms target).
  - When `GEMINI_API_KEY` is absent or unconfigured: cleanly verifies graceful fallback to `EdgeRulesEvaluator` without throwing 500 errors.
- **D-03:** The user will supply or test with their live `GEMINI_API_KEY` at their convenience. The system must operate seamlessly in both live and fallback states.

### Gemini Model Selection
- **D-04:** Default model is set to `gemini-2.5-flash` in `backend/app/config.py` (`GEMINI_MODEL: str = "gemini-2.5-flash"`) for ultra-low latency (<800ms) and high multimodal throughput.
- **D-05:** `GEMINI_MODEL` remains dynamically overridable via `.env` so users can switch to `gemini-3.7-flash` when advanced reasoning or high-tier models are desired.

### Mobile Dynamic API Gateway Resolution
- **D-06:** Implement a centralized configuration module in `mobile/src/config/api.ts` that reads `import.meta.env.VITE_API_BASE_URL`.
- **D-07:** Provide a default fallback of `http://localhost:8000/api/v1` when the environment variable is not defined.
- **D-08:** Refactor `mobile/src/services/aiTriageService.ts` and `mobile/src/services/syncEngineService.ts` to consume this centralized gateway config rather than hardcoding `http://localhost:8000`.
- **D-09:** Create `mobile/.env` from `mobile/.env.example` with `VITE_API_BASE_URL="http://localhost:8000/api/v1"` and comments explaining Android Emulator (`10.0.2.2`) and physical LAN device configurations.

### the agent's Discretion
- Exact integration test payload structure (lesion image fixture, audio note fixture).
- Timeout duration for cloud AI inference (defaulting to 2.5-3.0s abort controller before fallback to on-device rules).
- Detailed logging formatting for backend GenAI client initialization and latency metrics.

</decisions>

<canonical_refs>
## Canonical References

### Multimodal Triage & API Gateway Specifications
- `PRODUCTION_TECH_STACK_AND_AUDIT.md` §2.3 & §3 — Google Gemini 3.7 / 2.5 Flash multimodal perception architecture, sub-second latency constraints, and Indic voice note processing.
- `MOBILE_APK_PRODUCTION_TECH_STACK_AND_AUDIT.md` §3 — Mobile client API networking, offline SQLite fallback, and Capacitor HTTP handling.
- `backend/app/services/triage_service.py` — `GeminiTriageService` implementation and `EdgeRulesEvaluator` fallback engine.
- `backend/app/schemas/triage.py` — `TriageRequest` and `TriageResponse` Pydantic schemas.
- `mobile/src/services/aiTriageService.ts` — Client-side multimodal triage and heuristic fallback.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/services/triage_service.py`: Already implements `GeminiTriageService` with `google-genai` client, `GenerateContentConfig(response_mime_type="application/json", response_schema=TriageResponse)`, and `EdgeRulesEvaluator`.
- `mobile/src/services/aiTriageService.ts`: Contains client-side `runMultimodalTriage`, Rule Zero Anthrax check, fetch call with abort timeout, and on-device heuristic evaluation.
- `backend/app/config.py`: Uses `pydantic-settings` with `.env` file loading for `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_INFERENCE_TIMEOUT_SECONDS`.

### Established Patterns
- Pydantic v2 schemas governing backend request/response validation.
- Dual-layer Anthrax Rule Zero safety check (pre-filter before AI call + post-filter after response).
- Fast failover from cloud AI gateway to deterministic heuristic rules when offline or on network error.

### Integration Points
- `backend/.env` loaded by `app.config.settings`.
- `mobile/.env` loaded by Vite (`import.meta.env`).
- `mobile/src/config/api.ts` imported by `aiTriageService.ts` and `syncEngineService.ts`.

</code_context>

<specifics>
## Specific Ideas

- Ensure `.env` files are ignored by git (already in `.gitignore`) so secret API keys are never accidentally committed.
- Provide a standalone CLI verification script or test command so developers can run `pytest backend/tests/test_live_gemini.py` or `python -m backend.verify_gemini` to quickly test their API key against Google Cloud.

</specifics>

<deferred>
## Deferred Ideas

- Firebase Cloud Storage upload integration for binary assets (`gs://` URIs) — Phase 13.
- PostgreSQL + PostGIS cloud hosting and Redis cluster pub/sub streaming — Phase 14.

</deferred>

---

*Phase: 12-live-environment-configuration-gemini-3-7-flash-cloud-perception*
*Context gathered: 2026-09-06*
