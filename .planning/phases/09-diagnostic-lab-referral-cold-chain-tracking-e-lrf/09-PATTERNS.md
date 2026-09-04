# Phase 9: Diagnostic Lab Referral & Cold-Chain Tracking (e-LRF) - Pattern Map

**Phase:** 09  
**Status:** Ready for planning  
**Analogs in Codebase:**

---

## 1. Local SQLite Caching & Offline Drafting: `mobile/src/services/animalService.ts`
- **Analog:** `animalService.ts` initializes local SQLite tables (`offline_animals`, `offline_vaccinations`), provides in-memory mock fallback in web mode, and syncs transparently with the backend API.
- **Application:** `mobile/src/services/labService.ts` implements local `lab_requisitions` table, supports offline e-LRF creation with QR code generation, and manages cold-chain timer updates.

## 2. Pydantic Strict Validation & Status Enum: `backend/app/schemas/`
- **Analog:** `backend/app/schemas/cluster.py` with `OutbreakStatus` and `backend/app/schemas/animal.py`.
- **Application:** `backend/app/schemas/lab.py` defines `LabRequisitionCreate`, `LabRequisitionResponse`, `LabResultSubmit`, `TemperatureLogCreate`, and `ColdChainStatus`.

## 3. SLA & Countdown Time-Delta Computation: `backend/app/services/`
- **Analog:** `satscan_service.py` computing moving 72-hour temporal windows.
- **Application:** `backend/app/services/lab_service.py` calculates 48-hour SLA expiration, elapsed hours, temperature status (`OPTIMAL`, `WARNING`, `BREACHED`), and case escalation to `LAB_CONFIRMED`.

## 4. Mobile Cards & Real-Time Timers: `mobile/src/views/LabReferralView.tsx`
- **Analog:** Prototype UI in `LabReferralView.tsx` with Devanagari labels and badge styling.
- **Application:** Fully interactive `LabReferralView.tsx` with e-LRF modal generator, SVG QR code rendering, live 48-hour countdown timer, temperature checkpoint logging, and lab result entry dialog.
