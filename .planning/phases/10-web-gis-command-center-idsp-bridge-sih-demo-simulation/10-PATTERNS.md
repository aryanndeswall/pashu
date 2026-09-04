# Phase 10: Web-GIS Command Center, IDSP Bridge & SIH Demo Simulation - Pattern Map

**Phase:** 10  
**Status:** Ready for planning  
**Analogs in Codebase:**

---

## 1. Role-Adaptive Views: `mobile/src/App.tsx` & `views/DashboardView.tsx`
- **Analog:** In Phase 3.1, `App.tsx` adapts navigation tabs and greetings based on `activeRole` (`consumer`, `doctor`, `admin`).
- **Application:** `DashboardView.tsx` renders localized status for `consumer`/`doctor`, but unlocks the full **Web-GIS Outbreak War Room & SIH Demo Simulator** when `activeRole === 'admin'`.

## 2. Dynamic Geodetic Buffers & Vector Layers: `backend/app/services/buffer_service.py`
- **Analog:** Phase 8 `buffer_service.py` produces standard GeoJSON `FeatureCollection` with 1km, 5km, and 10km polygons.
- **Application:** `CommandMapView.tsx` consumes this GeoJSON FeatureCollection to render interactive biosecurity rings, epicenter markers, and village pins.

## 3. Pydantic Strict Schemas & Endpoints: `backend/app/schemas/` & `api/v1/`
- **Analog:** `backend/app/schemas/cluster.py` and `backend/app/schemas/lab.py`.
- **Application:** `backend/app/schemas/gis.py` defines schemas for `EpiCurveResponse`, `MarketClosureMemoRequest`, and `IdspDispatchResponse`. Mounted in `backend/app/api/v1/gis.py`.

## 4. SIH Multi-Step Presentation Runner: `mobile/src/components/gis/SihDemoSimulatorCard.tsx`
- **Analog:** Decision tree steps in Phase 4 and two-phase delta sync steps in Phase 5.
- **Application:** Step-by-step interactive simulator card showcasing the 7-step outbreak journey with real-time state transitions and live badges for hackathon judges.
