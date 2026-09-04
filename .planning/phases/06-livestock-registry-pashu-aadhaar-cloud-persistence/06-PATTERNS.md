# Phase 6: Livestock Registry, Pashu Aadhaar & Cloud Persistence - Pattern Map

**Phase:** 06  
**Status:** Ready for planning  
**Analogs in Codebase:**

---

## 1. Local SQLite Caching Pattern: `sqliteConnection.ts`
- **Analog:** `mobile/src/database/sqliteConnection.ts` handling `local_lgd_hierarchy` and `auth_session`.
- **Application:** `animalService.ts` queries `SELECT * FROM local_animals` and `INSERT INTO local_animals` to guarantee 100% offline cattle passbook access.

## 2. Queue Insertion Pattern: `syncEngineService.ts`
- **Analog:** `mobile/src/services/syncEngineService.ts` enqueueing reports to `offline_sync_queue`.
- **Application:** Registering a new animal offline queues an `ANIMAL_REGISTRATION` payload into `offline_sync_queue` for cloud sync.

## 3. Fast Validation Pattern: Pydantic v2
- **Analog:** Pydantic strict model parsing.
- **Application:** `backend/app/schemas/animal.py` parses and validates 12-digit tags and DPDP phone numbers.
