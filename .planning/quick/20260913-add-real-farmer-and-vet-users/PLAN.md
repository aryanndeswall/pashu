---
task_id: 20260913-add-real-farmer-and-vet-users
title: Add Real Users for Farmers and Veterinarians with Direct Switcher & Persistence
status: complete
created_at: 2026-09-13T18:48:00.000Z
completed_at: 2026-09-13T18:53:00.000Z
type: quick
---

# Quick Task: Add Real Users for Farmers and Veterinarians

## Context
The user requested: "add a few users in farmer and vet real users".
Currently, the app only had 1 hardcoded demo farmer and 1 demo doctor in `authStore.ts`. Evaluators and field testers need real, authentic user personas for both Livestock Owners (Farmers) and Veterinarians (BVO, LDO, Mobile Vet, Pashu Sakhi) with realistic credentials, locations (Ahmednagar, Rahuri, Sangamner), registered cattle herds, and 1-tap switching.

## Objectives
1. Define comprehensive real user datasets for Farmers and Veterinarians in `mobile/src/store/authStore.ts`:
   - **4 Real Veterinarians**:
     - Dr. Ananya Deshmukh (Block Veterinary Officer, Rahuri Dispensary, VCI: MH-VET-2022-4109)
     - Dr. Amit Patil (Livestock Development Officer, Ashwi Budruk Polyclinic, VCI: MH-VET-2024-8819)
     - Dr. Vikram Jadhav (Mobile Veterinary Unit Specialist, Sangamner, VCI: MH-VET-2023-6521)
     - Shital Gaikwad (Pashu Sakhi / Para-Vet, Deolali Pravara, ID: MH-PARA-2023-1102)
   - **4 Real Farmers**:
     - Dnyaneshwar Shinde (Ashwi Budruk, Dairy Cattle Owner)
     - Ramesh Sakharam Patil (Rahuri Khurd, Gir Cattle Breeder)
     - Balasaheb Vitthal Gade (Deolali Pravara, Commercial Murrah Buffalo Farmer)
     - Sunita Kisan Shinde (Sangamner, Osmanabadi Goat & Sheep Smallholder)
2. Add interactive Real User Switcher in `RolePortalView.tsx` & `LoginView.tsx` so users can select and sign in as any real farmer or veterinarian with 1 tap.
3. Seed corresponding cattle and buffalo herds in `mobile/src/services/animalService.ts` for each real farmer.
4. Populate `NearbyDoctorsView.tsx` with all 4 real doctors/para-vets as offline fallback.
5. Seed real users into backend SQLite database (`backend/pashu_cloud.db`).
6. Build frontend bundle and re-compile native Android APK.
