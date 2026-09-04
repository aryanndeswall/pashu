# Phase 8: Spatio-Temporal SaTScan Outbreak Detection & Dynamic Buffers - Research

**Phase:** 08  
**Status:** Completed  
**Domain:** Spatial Epidemiology, SaTScan, PostGIS Topology, Denominator Normalization, Geodesic Buffers  
**Requirements Addressed:** `GEO-01`, `GEO-02`, `GEO-03`  

---

## 1. SaTScan & Space-Time Permutation Scan Statistic

Traditional surveillance relies on arbitrary administrative thresholds (e.g. "3 sick cows = alert"). This produces rampant false positives in high-density livestock belts and missed outbreaks in sparse pastoral areas.

The **Space-Time Permutation Scan Statistic** (Martin Kulldorff, Harvard Medical School / NCI) detects whether disease cases are clustered in space and time simultaneously by evaluating cylindrical windows:
- **Circular Base:** Spatial window centered on village centroids up to $5\text{ km}$ radius.
- **Cylinder Height:** Temporal window of $72\text{ hours}$ ($3\text{ days}$).

### Attack Rate Calculation:
$$\text{Attack Rate (\%)} = \left(\frac{\text{Total Affected Animals in Window}}{\text{Total Census Denominator of Affected LGD Villages}}\right) \times 100$$

### Decision Thresholds:
- **`OUTBREAK_DECLARED` (OPS $\ge 0.75$):**
  - Triggered if $\text{Attack Rate} > 1.5\%$ OR $\text{Total Deaths} \ge 2$.
  - Generates containment buffers and ring-vaccination dispatch.
- **`WARNING` (OPS $0.55$):**
  - Triggered if $\text{Total Affected} \ge 3$ within $5\text{ km}$ in $72\text{h}$.
  - Triggers intensified monitoring.
- **`WATCH` (OPS $0.25$):**
  - Baseline background incidents.

---

## 2. Geodesic Containment Buffers (1-5-10 km)

When an outbreak is declared, government biosecurity protocols (National Action Plan for FMD & African Swine Fever / Avian Influenza) prescribe three concentric zones:

| Zone | Radius | Primary Color | Tactical Action Mandate |
|---|:---:|:---:|---|
| **Infected Zone** | $0 - 1\text{ km}$ | `#dc2626` (Red) | Total livestock movement freeze. Daily house-to-house clinical search. Strict ban on carcass movement and manure transport. |
| **Ring Vaccination Zone** | $1 - 5\text{ km}$ | `#f59e0b` (Amber) | 72-hour emergency blanket barrier vaccination of all susceptible livestock to create an immune firebreak. |
| **Surveillance Perimeter** | $5 - 10\text{ km}$ | `#06b6d4` (Cyan) | Closure of animal markets (haats), veterinary check-posts on access roads, weekly syndromic audits. |

---

## 3. PostGIS vs. Python Dual-Engine Implementation

### Production PostGIS SQL:
```sql
-- Dynamic Ellipsoidal Buffer
SELECT 
    zone_type,
    radius_km,
    ST_AsGeoJSON(ST_Buffer(ST_SetSRID(ST_Point(lon, lat), 4326)::geography, radius_meters)) as geojson
FROM (
    VALUES 
        ('INFECTED_ZONE', 1.0, 1000),
        ('RING_VACCINATION_ZONE', 5.0, 5000),
        ('SURVEILLANCE_ZONE', 10.0, 10000)
) AS zones(zone_type, radius_km, radius_meters);
```

### In-Memory / Python Test Fallback:
For isolated pytest runs with zero database dependencies:
```python
def generate_geodesic_circle(lat: float, lon: float, radius_meters: float, num_points: int = 64) -> List[List[float]]:
    coords = []
    lat_rad = math.radians(lat)
    for i in range(num_points + 1):
        angle = 2 * math.pi * i / num_points
        d_lat = (radius_meters * math.cos(angle)) / 111320.0
        d_lon = (radius_meters * math.sin(angle)) / (111320.0 * math.cos(lat_rad))
        coords.append([round(lon + d_lon, 6), round(lat + d_lat, 6)])
    return coords
```

---

## 4. Pre-Seeded Census Data (Ahmednagar District)

| LGD Code | Village Name | Block Name | Bovine Population | Caprine Population | Total Census |
|:---:|:---|:---|:---:|:---:|:---:|
| `558301` | Ashwi Budruk | Rahuri | 1,450 | 820 | 2,270 |
| `558302` | Rahuri Rural | Rahuri | 2,100 | 1,150 | 3,250 |
| `558303` | Sangamner Khurd | Sangamner | 1,800 | 950 | 2,750 |
| `558304` | Kopargaon Rural | Kopargaon | 2,400 | 1,300 | 3,700 |
