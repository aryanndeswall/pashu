# Phase 5: Two-Phase Delta Synchronization Engine - Pattern Map

**Phase:** 05  
**Status:** Ready for planning  
**Analogs in Codebase:**

---

## 1. Drawer Pattern: `FluidDrawer.tsx`
- **Analog:** `mobile/src/components/animations/FluidDrawer.tsx` used in `HeaderBar.tsx` for the role switcher.
- **Application:** Use `FluidDrawer` to host `SyncQueueDrawer.tsx`, providing smooth slide-up gestures from the bottom of the screen.

## 2. Store Pattern: `useAuthStore.ts`
- **Analog:** `mobile/src/store/authStore.ts` (Zustand store with SQLite query on startup and state mutations).
- **Application:** Build `useSyncStore.ts` tracking connection state, sync queue items, sync in progress, and auto-refreshing when records are added to `offline_sync_queue`.

## 3. Database Mocking & Transaction Pattern: `sqliteConnection.ts`
- **Analog:** `mobile/src/database/sqliteConnection.ts` with `dbService.query` and `dbService.execute`.
- **Application:** `syncEngineService.ts` queries `SELECT * FROM offline_sync_queue WHERE status != 'COMPLETED' ORDER BY priority DESC, created_at ASC` and updates status upon phase completion.

## 4. Haptic Feedback Pattern: `hapticsService.ts`
- **Analog:** `mobile/src/services/hapticsService.ts`.
- **Application:** `hapticLight()` on manual sync click; `hapticMedium()` upon successful queue flush.
