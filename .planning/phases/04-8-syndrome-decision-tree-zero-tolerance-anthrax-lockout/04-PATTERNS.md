# Phase 4: 8-Syndrome Decision Tree & Zero-Tolerance Anthrax Lockout - Pattern Map

**Phase:** 04  
**Status:** Ready for planning  
**Analogs in Codebase:**

---

## 1. Hazard Border Pattern: `HazardBorder.tsx`
- **Analog:** `mobile/src/components/animations/HazardBorder.tsx` (CSS striped repeating gradient hazard border with pulsing animation).
- **Application:** Wrap the full-screen `AnthraxBiohazardModal.tsx` in `HazardBorder isActive={true}` to provide unmissable visual danger indication.

## 2. Emergency Modal Pattern: `EmergencySOSModal.tsx`
- **Analog:** `mobile/src/components/modals/EmergencySOSModal.tsx` (modal overlay with backdrop blur, title, action buttons, and close handlers).
- **Application:** Build `AnthraxBiohazardModal.tsx` using full-screen lockdown layout with 5-point biosecurity checklist and Web Audio siren controls.

## 3. High-Priority SQLite Event Insertion: `sqliteConnection.ts`
- **Analog:** `mobile/src/database/sqliteConnection.ts` and `ReportWizardView.tsx` writing to `offline_sync_queue`.
- **Application:** `idspAlertService.ts` executes `INSERT INTO offline_sync_queue` with `priority = 3` and `entity_type = 'IDSP_ZOONOTIC_EMERGENCY'`.

## 4. Haptic Bridge Pattern: `hapticsService.ts`
- **Analog:** `mobile/src/services/hapticsService.ts` with `hapticError()`.
- **Application:** Trigger `hapticError()` in triple succession upon activating `CRITICAL_ANTHRAX_LOCK`.
