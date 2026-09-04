# Phase 10: Web-GIS Command Center, IDSP Bridge & SIH Demo Simulation - Research

**Phase:** 10  
**Status:** Completed  
**Domain:** Geospatial Command Dashboards, Epidemic Curve Modeling, Statutory Administrative Orders, Public Health Surveillance  
**Requirements Addressed:** `GIS-01`, `GIS-02`, `GIS-03`  

---

## 1. Web-GIS Map Architecture & Geodetic Vector Layers

In veterinary emergency epidemiology, commanders (District Magistrates, District Veterinary Officers) need high-level geospatial clarity without overwhelming visual clutter:
- **Spatial Layers:**
  1. **Epicenter Marker:** Pulsating animated radar target at `(19.3912, 74.6521)` (Ashwi Budruk) showing active Outbreak Probability Score ($OPS = 0.84$).
  2. **1 km Infected Zone (Movement Freeze):** Red `#dc2626` polygon (30% fill opacity, 3px solid border) enclosing patient premises.
  3. **5 km Ring-Vaccination Target Zone:** Warning Amber `#f59e0b` polygon (20% fill opacity, 2px dashed border) representing the 72-hour emergency vaccination barrier.
  4. **10 km Surveillance Perimeter:** Cyan `#06b6d4` polygon (15% fill opacity, 2px dotted border) mandating animal market closures and quarantine checkpoints.
  5. **Affected Villages (LGD Hamlets):** Discrete coordinate pins for Ashwi Budruk (`558301`), Rahuri Rural (`558302`), Sangamner (`558303`), Kopargaon (`558304`).
  6. **Highway Quarantine Checkpoints:** Road access control icons on State Highway 10 and National Highway 160.

---

## 2. 14-Day Rolling Epi-Curves & TimescaleDB Hypertables

An epidemic curve is a visual representation of the onset of illness among cases associated with an outbreak over time.
- **Epi-Curve Properties:**
  - **Incubation Period Window:** For FMD, the median incubation period is 3–8 days; for LSD, 4–14 days.
  - **14-Day Trajectory:** Captures the initial index case, the exponential propagation cluster, the point of intervention (containment buffers + ring vaccination at Day 7), and the subsequent decay.
  - **Effective Reproduction Number ($R_t$):**
    - $R_t > 1.0$: Outbreak is expanding.
    - $R_t < 1.0$: Outbreak is under control.
- **TimescaleDB Query Formulation:**
  ```sql
  SELECT 
      time_bucket('1 day', reported_at) AS day,
      COUNT(*) FILTER (WHERE status = 'SUSPECTED') AS suspected_cases,
      COUNT(*) FILTER (WHERE status = 'LAB_CONFIRMED') AS confirmed_cases,
      SUM(mortality_count) AS mortality_count
  FROM syndromic_incidents
  WHERE reported_at >= NOW() - INTERVAL '14 days'
    AND district_name = 'Ahmednagar'
  GROUP BY day
  ORDER BY day ASC;
  ```

---

## 3. Statutory Authority: PCICDA Act 2009

The **Prevention and Control of Infectious and Contagious Diseases in Animals Act, 2009 (PCICDA)** governs all animal quarantine actions in the Republic of India:
- **Key Sections for Outbreak Orders:**
  - **Section 6(1):** *"The State Government or District Magistrate may, by notification, declare any area to be a Controlled Area in respect of any scheduled disease."*
  - **Section 10(1):** *"No person shall organize, hold or promote any animal market, animal fair, animal exhibition or other gathering of animals in a Controlled Area without permission of the Competent Officer."*
  - **Section 20:** *"All police officers shall, on request by an authorized veterinary officer, assist in enforcing the provisions of this Act."*
- Generating this memo with one click eliminates the typical 48-to-72-hour bureaucratic delay between veterinary alert and administrative enforcement.

---

## 4. IDSP / NCDC Inter-Agency Public Health Bridge

Under India's **One Health** mandate:
- Contagious animal pathogens frequently cross species barriers into human populations:
  - *Bacillus anthracis* (Cutaneous and gastrointestinal anthrax in farmers/butchers).
  - *Brucella abortus* (Undulant fever in dairy workers).
  - Highly Pathogenic Avian Influenza (H5N1 zoonosis).
- The Pashu-Suraksha IDSP bridge formats syndromic payloads compliant with the **Integrated Disease Surveillance Programme (IDSP / NCDC)** portal, triggering human fever surveillance within the 5 km buffer automatically.
