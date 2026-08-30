# Pitfalls Research: Pashu-Suraksha (पशु सुरक्षा)

**Domain:** National Livestock Health Surveillance & Epidemiological Decision Support  
**Researched:** 2026-08-30  
**Confidence:** HIGH  

## Critical Pitfalls

### Pitfall 1: Android WebView Cache Purging Destroys Un-Synced Reports
**What goes wrong:** Field workers collect 15 disease reports in a remote village. When their phone's storage runs low, the Android OS automatically purges WebView `localStorage` and `IndexedDB` caches to free space, deleting all pending reports permanently.  
**Why it happens:** Developers treat Capacitor / hybrid apps like standard web browsers without realizing Android OS eviction policies for WebViews under disk pressure.  
**How to avoid:** Never store pending offline records in browser `localStorage` or unbacked `IndexedDB`. Use native Android SQLite (`@capawesome-team/capacitor-sqlite` or `@capacitor-community/sqlite`) which writes to protected internal app storage (`/data/data/com.pashusuraksha.app/databases/`) that the OS never evicts.  
**Warning signs:** Field reports mysteriously disappearing after low-storage system warnings.  
**Phase to address:** Phase 1 (Mobile Foundation & Native SQLite Setup).

---

### Pitfall 2: High-Resolution Photos Choke 2G Upload Queues
**What goes wrong:** A field worker takes an uncompressed 12MB photo of cattle mouth lesions. On a rural 2G/EDGE network, the HTTP upload times out repeatedly, blocking the queue and delaying life-critical symptom telemetry for days.  
**Why it happens:** Failure to separate low-bandwidth clinical telemetry from heavy binary media uploads.  
**How to avoid:** Implement a strict **Two-Phase Delta Synchronization Engine**:
1. Compress photos on-device to WebP format (<300 KB, 1280x720).
2. Transmit Phase 1 JSON telemetry (<2 KB) immediately over any connection.
3. Queue Phase 2 media uploads until a high-speed connection (>250 kbps or Wi-Fi) is detected.  
**Warning signs:** HTTP 408 / network timeout errors during field testing.  
**Phase to address:** Phase 2 (Offline Sync & Camera Pipeline).

---

### Pitfall 3: Black-Box ML Models Inducing False Negatives on Zoonotic Anthrax
**What goes wrong:** A custom-trained machine learning model classifies a sudden-death bovine case as simple acute bloat due to class imbalance in training data. The farmer or vet opens the carcass for necropsy, releasing millions of resilient Bacillus anthracis spores into grazing soil and infecting human handlers.  
**Why it happens:** Over-reliance on statistical probabilities for life-or-death biohazards.  
**How to avoid:** Implement **Rule Zero (Zero-Tolerance Deterministic Edge Lockout)**: If sudden death + unclotted dark blood from body orifices is reported, the system overrides any statistical score, displays emergency local-language biohazard warnings (*"DO NOT CUT CARCASS"*), and immediately dispatches an encrypted alert to the District Medical Officer (IDSP).  
**Warning signs:** Any machine learning model allowed to override clinical zero-tolerance rules.  
**Phase to address:** Phase 3 (Syndromic Decision Engine & Zoonotic Guard).

---

### Pitfall 4: Naive "3 Deaths = Outbreak" Triggering Rampant Alert Fatigue
**What goes wrong:** A large dairy farm with 600 cattle reports 3 calf deaths over a week (normal baseline mortality), triggering a district-wide panic alert. Meanwhile, 3 sheep dying in a flock of 30 in a tribal village goes unnoticed.  
**Why it happens:** Arbitrary static thresholds that ignore the underlying livestock population denominator.  
**How to avoid:** Normalize all case numbers against official **Local Government Directory (LGD) livestock census data**. Calculate the dynamic Poisson Attack Rate: an attack rate > 1.5% within 72 hours triggers an outbreak, regardless of raw counts.  
**Warning signs:** Veterinary officers muting notifications due to excessive false alarms.  
**Phase to address:** Phase 4 (Spatio-Temporal PostGIS Cluster Engine).

---
*Pitfalls research for: Pashu-Suraksha*  
*Researched: 2026-08-30*
