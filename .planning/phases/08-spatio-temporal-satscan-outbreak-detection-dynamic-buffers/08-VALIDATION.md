# Phase 8: Spatio-Temporal SaTScan Outbreak Detection & Dynamic Buffers - Validation Strategy

**Phase:** 08  
**Status:** Approved  
**Coverage Target:** 100% automated pytest execution with dual-engine verification (PostGIS / Pure Geodesic fallback).

---

## Automated Verification Gates

### Gate 1: SaTScan Clustering & Census Normalization (Pytest)
- File: `backend/tests/test_satscan.py`
- Tests:
  1. `test_spatial_distance_calculation`: Verifies geodetic distance between Ashwi Budruk (`19.3912, 74.6521`) and nearby coordinates within/beyond 5 km.
  2. `test_census_denominator_normalization`: Confirms joining against `livestock_census` table returns accurate total population denominators.
  3. `test_attack_rate_outbreak_declaration`:
     - 40 affected cattle in Ashwi Budruk ($1,450$ census $\implies 2.76\%$ attack rate $> 1.5\%$) forces `OUTBREAK_DECLARED` with OPS $> 0.80$.
  4. `test_mortality_override`:
     - 2 deaths within 72 hours triggers `OUTBREAK_DECLARED` even if attack rate is below 1.5%.
  5. `test_low_case_count_watch_status`:
     - 1 isolated case defaults to `WATCH` status with OPS $0.25$.

### Gate 2: Dynamic Buffer Generation & Cluster APIs (Pytest)
- File: `backend/tests/test_buffers.py`
- Tests:
  1. `test_geodesic_buffer_generation`:
     - Generates 1km, 5km, and 10km concentric polygons.
     - Validates closed ring structure (first coordinate equals last coordinate).
     - Validates coordinate radius distance from center.
  2. `test_buffer_geojson_feature_collection`:
     - Verifies compliant GeoJSON output containing 3 polygon features with matching colors (`#dc2626`, `#f59e0b`, `#06b6d4`).
  3. `test_api_cluster_evaluation_endpoint`:
     - `POST /api/v1/clusters/evaluate` processes new report and returns cluster status.
  4. `test_api_get_active_clusters`:
     - `GET /api/v1/clusters/active` lists active outbreak clusters.
  5. `test_api_get_cluster_buffers_geojson`:
     - `GET /api/v1/clusters/{cluster_id}/buffers` returns valid GeoJSON FeatureCollection.

### Gate 3: Regression & Production Build
- Command: `python -m pytest backend/` passes with 0 failures across all test suites.
