# Phase 8: Spatio-Temporal SaTScan Outbreak Detection & Dynamic Buffers - Pattern Map

**Phase:** 08  
**Status:** Ready for planning  
**Analogs in Codebase:**

---

## 1. Dual-Engine Persistence Pattern: `backend/app/database.py`
- **Analog:** Dual-engine async SQLAlchemy session manager in Phase 6 allowing PostgreSQL with PostGIS in production and SQLite in memory for pytest.
- **Application:** `satscan_service.py` supports PostGIS spatial geometry in Docker and pure Python Haversine/geodesic fallback in memory tests.

## 2. Pydantic Strict Schema Pattern: `backend/app/schemas/`
- **Analog:** Strict models in `animal.py` and `triage.py`.
- **Application:** `backend/app/schemas/cluster.py` defines schemas for `ClusterEvaluationRequest`, `ClusterEvaluationResponse`, and GeoJSON `FeatureCollection` for buffer zones.

## 3. Router Mounting Pattern: `backend/app/api/v1/`
- **Analog:** `animals.py` and `triage.py` in `backend/app/api/v1/`.
- **Application:** `backend/app/api/v1/clusters.py` mounted as prefix `/clusters`, exposing cluster evaluation, active clusters query, and buffer GeoJSON retrieval.
