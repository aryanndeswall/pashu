# Phase 8: Spatio-Temporal SaTScan Outbreak Detection & Dynamic Buffers - Context & Decisions

**Phase:** 08  
**Status:** Ready to execute  
**Created:** 2026-09-04  
**Requirements Addressed:** `GEO-01`, `GEO-02`, `GEO-03`  
**Mode:** Ponytail Ultra (Clean mathematical epidemiology, PostGIS geodetic topology, zero-dependency test fallback)

---

## 1. Executive Summary & Core Objective

Phase 8 builds the epidemiological decision-support engine and spatial containment pipeline of Pashu-Suraksha:
- **Space-Time Permutation (SaTScan Logic) (`GEO-01`):** Analyzes incoming syndromic field reports across moving spatial (5 km) and temporal (72 hours) windows to detect statistically anomalous disease clustering beyond random baseline occurrences.
- **Village Census Denominator Normalization (`GEO-02`):** Joins against official 20th All-India Livestock Census counts at the Local Government Directory (LGD) village level to calculate the true Poisson Attack Rate:
  $$\text{Attack Rate} = \left(\frac{\sum \text{Animals Affected}}{\sum \text{Livestock Census Denominator}}\right) \times 100$$
  Triggers `OUTBREAK_DECLARED` whenever Attack Rate $> 1.5\%$ or Deaths $\ge 2$ within 72 hours.
- **Dynamic 1km / 5km / 10km Containment Buffers (`GEO-03`):** Generates geodetic vector polygons centered at the cluster epicenter:
  - **1 km Infected Zone (Movement Freeze):** Red `#dc2626` polygon prohibiting all livestock entry/exit.
  - **5 km Ring Vaccination Zone:** Warning Amber `#f59e0b` polygon targeting immediate barrier vaccination within 72h.
  - **10 km Surveillance Perimeter:** Alert Cyan `#06b6d4` polygon mandating livestock market closures and biosecurity check-posts.
- **District Alert Streaming:** Publishes outbreak alert payloads with GeoJSON containment rings for real-time Web-GIS dashboards.

---

## 2. Locked Architectural Decisions

### A. Mathematical Clustering Engine (`backend/app/services/satscan_service.py`)
- **Spatial Window:** 5,000 meters ($5\text{ km}$) ellipsoidal distance.
- **Temporal Window:** 72 hours ($3\text{ days}$).
- **Outbreak Probability Score (OPS):**
  - If $\text{Attack Rate} > 1.5\%$ or $\text{Deaths} \ge 2$:
    $$\text{OPS} = \min(0.70 + (\text{Attack Rate} \times 0.05), 0.99) \implies \mathbf{OUTBREAK\_DECLARED}$$
  - If $\text{Cases} \ge 3$:
    $$\text{OPS} = 0.55 \implies \mathbf{WARNING}$$
  - Otherwise:
    $$\text{OPS} = 0.25 \implies \mathbf{WATCH}$$

### B. Census Denominators (Ahmednagar Focus District)
- Pre-seeded village census table (`livestock_census`) for Ahmednagar district:
  - Ashwi Budruk (`558301`): Bovine Census = 1,450; Caprine = 820
  - Rahuri Rural (`558302`): Bovine Census = 2,100; Caprine = 1,150
  - Sangamner Khurd (`558303`): Bovine Census = 1,800; Caprine = 950
  - Kopargaon (`558304`): Bovine Census = 2,400; Caprine = 1,300

### C. Containment Buffers & GeoJSON Specification
- PostGIS SQL Generation:
  `ST_AsGeoJSON(ST_Buffer(geography_point, radius_meters))`
- In-memory / Python fallback:
  Geodesic polygon generation calculating 64-vertex circular coordinate rings for zero-dependency testing without PostGIS running locally.
- GeoJSON FeatureCollection output format:
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { "type": "Polygon", "coordinates": [...] },
        "properties": {
          "zone_type": "INFECTED_ZONE",
          "radius_km": 1.0,
          "color": "#dc2626",
          "action": "Movement Freeze & Clinical Search"
        }
      },
      ...
    ]
  }
  ```

### D. FastAPI Endpoints
- `POST /api/v1/clusters/evaluate`: Evaluates a new incident or batch of reports and returns outbreak status, OPS score, and cluster metrics.
- `GET /api/v1/clusters/active`: Returns all currently active outbreak clusters.
- `GET /api/v1/clusters/{cluster_id}/buffers`: Returns GeoJSON FeatureCollection containing 1km, 5km, and 10km containment rings for map rendering.

---

## 3. Threat Model & Safeguards

| Threat ID | Category | Component | Description | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-08-01 | Division by Zero | satscan_service.py | Census count missing for an unmapped hamlet causes zero-division crash | Fallback to default minimum denominator of `250` animals for unmapped rural wards. |
| T-08-02 | Geodesic Distortion | buffer_service.py | Naive planar buffer distortion at non-equatorial latitudes | Project geometry to Web Mercator (`EPSG:3857`) or calculate true ellipsoidal Vincenty geodesic buffers. |
| T-08-03 | False Alarm Panics | satscan_service.py | Single isolated animal death in high-density dairy triggers emergency lockdown | Dual-condition guard: requires either $\ge 2$ deaths OR statistical attack rate $> 1.5\%$ across multiple premises. |
