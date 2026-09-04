# Phase 3: Hardware Sensor Bridges (Camera, GPS, Voice) - Pattern Map

**Phase:** 03  
**Status:** Ready for planning  
**Analogs in Codebase:**

---

## 1. Hardware Bridge Services (`mobile/src/services/`)

### Analog: `mobile/src/services/hapticsService.ts`
- **Pattern:** Class-based singleton service wrapping `@capacitor/*` native plugin with web fallback and error handling.
- **Application to New Services:**
  - `cameraService.ts`: Wraps `@capacitor/camera` + offscreen Canvas 2D WebP scaling pipeline.
  - `locationService.ts`: Wraps `@capacitor/geolocation` + Haversine distance calculator against SQLite `local_lgd_hierarchy`.
  - `voiceService.ts`: Wraps `@capacitor-community/voice-recorder` + HTML5 `MediaRecorder` fallback.

```typescript
// Pattern:
class SensorService {
  private isNative = Capacitor.isNativePlatform();

  async executeSensorAction(): Promise<Result> {
    if (this.isNative) {
      try {
        return await NativePlugin.action();
      } catch (err) {
        console.warn('Native sensor failed, falling back to web API:', err);
        return await this.webFallback();
      }
    }
    return await this.webFallback();
  }
}
```

---

## 2. Reporting Wizard View & Component Flow (`mobile/src/views/`)

### Analog: `mobile/src/views/ReportView.tsx` & `DashboardView.tsx`
- **Pattern:** Composable React 19 functional components utilizing Tailwind v4 sunlight tokens, 52px touch targets (`.field-touch-target`), Devanagari font adjustments (`.lang-devanagari`), and haptic confirmations on user actions.
- **Application to New Component:**
  - `ReportWizardView.tsx`: Manages 3-step state (`step: 1 | 2 | 3`), transitions, media attachments (photo preview + audio player), GPS lock status, and saving completed drafts into SQLite.

---

## 3. SQLite Draft Persistence

### Analog: `mobile/src/database/sqliteConnection.ts`
- **Pattern:** Using `dbService.execute()` to insert structured JSON telemetry payloads into `offline_sync_queue` and local draft tables with fallback to in-memory tables.

```typescript
// Pattern:
await dbService.execute(
  `INSERT INTO offline_sync_queue (sync_id, entity_type, payload_json, priority, status, retry_count, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [syncId, 'SYNDROMIC_REPORT', JSON.stringify(reportPayload), 2, 'PENDING', 0, new Date().toISOString()]
);
```
