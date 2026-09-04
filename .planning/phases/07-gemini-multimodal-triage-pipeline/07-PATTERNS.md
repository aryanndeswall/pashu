# Phase 7: Google Gemini 3.7 Flash Multimodal Triage Pipeline - Pattern Map

**Phase:** 07  
**Status:** Ready for planning  
**Analogs in Codebase:**

---

## 1. Schema & Validation Pattern: `backend/app/schemas/`
- **Analog:** `backend/app/schemas/animal.py` using Pydantic v2 strict models with validators and `ConfigDict(from_attributes=True)`.
- **Application:** `backend/app/schemas/triage.py` defines `TriageRequest` and `TriageResponse` schemas with strict syndrome code literals, confidence bounds (0.0 to 1.0), and vernacular advisory fields.

## 2. Decision Tree & Anthrax Lockout Pattern: `mobile/src/services/decisionTreeService.ts`
- **Analog:** Deterministic 8-syndrome classification and Rule Zero Anthrax hard-stop in `decisionTreeService.ts`.
- **Application:** Backend `EdgeRulesEvaluator` mirrors and extends this deterministic logic to guarantee sub-millisecond fallback when Gemini API keys are absent or network is degraded.

## 3. Router Mounting Pattern: `backend/app/api/v1/`
- **Analog:** `backend/app/api/v1/animals.py` mounted onto `backend/app/api/v1/__init__.py`.
- **Application:** `backend/app/api/v1/triage.py` mounted as `prefix="/triage"`, exposing `POST /api/v1/triage/multimodal` with CORS and async dependency injection.
