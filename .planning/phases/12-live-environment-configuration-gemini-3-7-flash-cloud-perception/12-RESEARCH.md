# Phase 12: Live Environment Configuration & Gemini 3.7 Flash Cloud Perception - Research

**Phase:** 12  
**Status:** Completed  
**Domain:** Live Environment Configuration, Google GenAI SDK (`google-genai`), Dynamic Mobile API Gateway, Multimodal Latency Benchmarking, Offline/Online Fallback  
**Requirements Addressed:** `CLOUD-01`, `CLOUD-03`  

---

## 1. Google GenAI SDK (`google-genai`) Live Architecture

The FastAPI backend uses the official Google GenAI Python SDK (`google-genai` v1.0+):

```python
from google import genai
from google.genai import types
from app.config import settings
from app.schemas.triage import TriageResponse, TriageRequest

# Client initialization with api_key
client = genai.Client(api_key=settings.GEMINI_API_KEY)

response = client.models.generate_content(
    model=settings.GEMINI_MODEL,  # default: gemini-2.5-flash
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/webp"),
        clinical_prompt,
    ],
    config=types.GenerateContentConfig(
        system_instruction=VETERINARY_SYSTEM_PROMPT,
        response_mime_type="application/json",
        response_schema=TriageResponse,
        temperature=0.1,
    ),
)
```

### Key Technical Insights:
1. **Model Selection**: `gemini-2.5-flash` provides <800ms multimodal inference, robust schema adherence, and generous rate limits. `gemini-3.7-flash` can be selected via `GEMINI_MODEL="gemini-3.7-flash"` in `.env`.
2. **Dual-Path Initialization**:
   - If `settings.GEMINI_API_KEY` is non-empty, initialize `genai.Client`.
   - If `settings.GEMINI_API_KEY` is None or empty string, retain `self.client = None` and seamlessly route all calls to `EdgeRulesEvaluator`.
   - If an API call fails (network timeout, invalid key, rate limit), log a warning and fall back to `EdgeRulesEvaluator` without dropping the request or raising a 500 error.
3. **Rule Zero Anthrax Override**:
   - Pre-filter: Before calling Gemini, if tokens indicate sudden death or unclotted blood, evaluate immediately via `EdgeRulesEvaluator` (<5ms).
   - Post-filter: If Gemini returns `SARF` or sudden death symptoms, lock `biohazard_alert = "CRITICAL_ANTHRAX_LOCK"`.

---

## 2. Dynamic Mobile API Gateway Architecture

The mobile client is built with Vite + React 19 and compiled into an Android APK via Capacitor 6.
In mobile apps, the backend host depends on the deployment context:
- **Local Browser Dev**: `http://localhost:8000/api/v1`
- **Android Emulator**: `http://10.0.2.2:8000/api/v1` (maps to host localhost)
- **Physical Device over Wi-Fi**: `http://<HOST_IP>:8000/api/v1`
- **Production Cloud**: `https://api.pashusuraksha.gov.in/api/v1`

### Centralized Config Pattern:
Instead of hardcoding `http://localhost:8000/api/v1` inside individual services, create `mobile/src/config/api.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 2500,
};

export const getApiUrl = (endpoint: string): string => {
  const base = API_CONFIG.baseUrl.replace(/\/+$/, '');
  const path = endpoint.replace(/^\/+/, '');
  return `${base}/${path}`;
};
```

All services (`aiTriageService.ts`, `syncEngineService.ts`) import `getApiUrl` or `API_CONFIG.baseUrl`.

---

## 3. Client-Side Online/Offline Fallback & Timeout Strategy

When a field worker is in a cellular dead zone:
1. `AbortController` enforces a 2500ms timeout on cloud triage requests.
2. If `fetch()` aborts or throws a network error:
   - Catch block transparently triggers `evaluateOnDevice()` heuristic rule engine.
   - User gets instantaneous triage output (<20ms) with syndrome classification and biosecurity instructions.
   - Result flag indicates local heuristic model used.

---

## 4. Threat Model & Security Considerations (ASVS Level 1)

1. **API Key Security**:
   - `GEMINI_API_KEY` must NEVER be placed in client-side code (`mobile/src/`). All Gemini calls occur server-side through FastAPI.
   - `.env` files must be listed in `.gitignore` to prevent secret leaks into version control.
   - Only `.env.example` templates with empty placeholders are committed.
2. **Input Sanitization**:
   - Base64 image payloads are stripped of header prefixes, validated for size (<5 MB), and safely decoded.
   - Transcripts and symptom strings are stripped and bounded to prevent prompt injection.
3. **Data Privacy (DPDP Act 2023)**:
   - Farmer phone numbers are hashed using SHA-256 with `DPDP_PHONE_SALT`.

---

## 5. Validation Architecture

Automated tests will verify:
1. **Backend Environment & Config**:
   - Loads `.env` using Pydantic settings.
   - Configures default `GEMINI_MODEL = "gemini-2.5-flash"`.
2. **Gemini Service Dual-Path Execution**:
   - Fallback mode works flawlessly when key is empty.
   - Mocked Gemini client returns validated `TriageResponse` schema matching live structure.
   - Live test runner (`test_live_gemini.py`) executes when `GEMINI_API_KEY` is provided in environment or skips cleanly.
3. **Mobile Gateway & Triage**:
   - `mobile/src/config/api.ts` correctly reads environment variable and falls back.
   - `aiTriageService.ts` queries the configured endpoint.
   - Network failure falls back to on-device heuristic evaluation without throwing uncaught exceptions.
