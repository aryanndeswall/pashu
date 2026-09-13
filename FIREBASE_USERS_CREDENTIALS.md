# Pashu-Suraksha (पशु सुरक्षा) — Master Credentials & Real User Accounts

> **Firebase Project ID:** `pashu-f51a1`  
> **Auth Type:** Email / Password + Role-Specific Secondary Credentials  
> **Role Claims:** Authoritative custom claims (`role: 'consumer' | 'doctor' | 'admin'`) stamped via Firebase Admin SDK.  
> **Local Database:** Synced with `pashu_cloud.db` & INAPH animal registration tags.

---

## 1. Veterinarians & Para-Vets (`doctor` Role)

> **Login Requirements on Mobile:**  
> - **Role Card:** Select **"पशुवैद्य / पशु सखी" (Veterinarian & Para-vet)**  
> - **Fields:** Email, Password, and **VCI License / Registration No.**  
> - **Validation Rule:** Must match standard VCI/State format (e.g., `MH-VET-YYYY-NNNN` or `MH-PARA-YYYY-NNNN`).

| # | Name (English & Devanagari) | Email | Password | VCI License / Reg No. | Phone Number | Designation & Jurisdiction |
|---|---|---|---|---|---|---|
| 1 | **Dr. Ananya Deshmukh**<br>*(डॉ. अनन्या देशमुख)* | `ananya.deshmukh@ahvd.in` | `PashuDoctor@2026` | `MH-VET-2022-4109` | `+91 94220-01842`<br>*(Raw: 9422001842)* | तालुका पशुवैद्यकीय अधिकारी (BVO)<br>Rahuri Khurd, Rahuri |
| 2 | **Dr. Amit Patil**<br>*(डॉ. अमित पाटील)* | `amit.patil@ahvd.in` | `PashuDoctor@2026` | `MH-VET-2024-8819` | `+91 98220-44102`<br>*(Raw: 9822044102)* | पशुधन विकास अधिकारी (LDO)<br>Ashwi Budruk Polyclinic, Rahuri |
| 3 | **Dr. Vikram Jadhav**<br>*(डॉ. विक्रम जाधव)* | `vikram.jadhav@ahvd.in` | `PashuDoctor@2026` | `MH-VET-2023-6521` | `+91 98500-12890`<br>*(Raw: 9850012890)* | फिरता पशुवैद्यकीय पथक अधिकारी (MVU)<br>Sangamner Rural, Sangamner |
| 4 | **Shital Gaikwad**<br>*(शितलताई गायकवाड)* | `shital.gaikwad@ahvd.in` | `PashuDoctor@2026` | `MH-PARA-2023-1102` | `+91 97633-55201`<br>*(Raw: 9763355201)* | प्रमाणित पशु सखी (Community Para-Vet)<br>Deolali Pravara, Rahuri |

### Quick Copy-Paste for Doctors:
```text
Email:       ananya.deshmukh@ahvd.in
Password:    PashuDoctor@2026
VCI License: MH-VET-2022-4109

Email:       amit.patil@ahvd.in
Password:    PashuDoctor@2026
VCI License: MH-VET-2024-8819

Email:       vikram.jadhav@ahvd.in
Password:    PashuDoctor@2026
VCI License: MH-VET-2023-6521

Email:       shital.gaikwad@ahvd.in
Password:    PashuDoctor@2026
VCI License: MH-PARA-2023-1102
```

---

## 2. Livestock Owners & Farmers (`consumer` Role)

> **Login Requirements on Mobile:**  
> - **Role Card:** Select **"पशुपालक (शेतकरी)" (Livestock Owner / Farmer)**  
> - **Fields:** Email and Password (or Phone)  
> - **Note:** Each farmer is pre-linked to their INAPH tagged cattle, buffalo, sheep, and goats in the local SQLite database.

| # | Farmer Name | Email | Password | Phone Number | Registered Animals & INAPH Tags | Village & District |
|---|---|---|---|---|---|---|
| 1 | **Ramesh Sakharam Patil**<br>*(रमेश सखाराम पाटील)* | `ramesh.patil@pashu.in` | `PashuFarmer@2026` | `+91 98220-00412`<br>*(Raw: 9822000412)* | **3 Indigenous Gir & Khillari Cows**<br>• `100294819201` (Gir, 36m)<br>• `100294819202` (Gir, 48m)<br>• `100294819203` (Khillari, 24m) | Rahuri Khurd, Ahmednagar |
| 2 | **Dnyaneshwar Shinde**<br>*(ज्ञानेश्वर विठ्ठल शिंदे)* | `dnyaneshwar.shinde@pashu.in` | `PashuFarmer@2026` | `+91 94231-50821`<br>*(Raw: 9423150821)* | **2 Murrah & Jaffarabadi Buffaloes**<br>• `100294819301` (Murrah, 42m)<br>• `100294819302` (Jaffarabadi, 30m) | Ashwi Budruk, Ahmednagar |
| 3 | **Balasaheb Vitthal Gade**<br>*(बाळासाहेब विठ्ठल गाडे)* | `balasaheb.gade@pashu.in` | `PashuFarmer@2026` | `+91 94239-11109`<br>*(Raw: 9423911109)* | **2 Murrah & Crossbred Cows**<br>• `100294819401` (Murrah, 50m)<br>• `100294819402` (HF Cross, 28m) | Deolali Pravara, Ahmednagar |
| 4 | **Sunita Kisan Shinde**<br>*(सुनिता किसन शिंदे)* | `sunita.shinde@pashu.in` | `PashuFarmer@2026` | `+91 96041-88234`<br>*(Raw: 9604188234)* | **3 Osmanabadi Goats & Deccani Sheep**<br>• `100294819501` (Osmanabadi Goat, 18m)<br>• `100294819502` (Osmanabadi Goat, 14m)<br>• `100294819503` (Deccani Sheep, 22m) | Sangamner Rural, Ahmednagar |

### Quick Copy-Paste for Farmers:
```text
Email:    ramesh.patil@pashu.in
Password: PashuFarmer@2026

Email:    dnyaneshwar.shinde@pashu.in
Password: PashuFarmer@2026

Email:    balasaheb.gade@pashu.in
Password: PashuFarmer@2026

Email:    sunita.shinde@pashu.in
Password: PashuFarmer@2026
```

---

## 3. District Animal Husbandry Officer (`admin` Role)

> **Login Requirements on Mobile / Web GIS:**  
> - **Role Card:** Select **"जिल्हा अधिकारी (DVO)" (District Officer)**  
> - **Fields:** Email, Password, and **Employee / DVO ID**  
> - **Validation Rule:** Must be an authorized DVO ID (e.g., `DVO-AHM-001`).

| # | Officer Name | Email | Password | Official DVO ID | Phone Number | Department & Jurisdiction |
|---|---|---|---|---|---|---|
| 1 | **Dr. Sunil Deshmukh**<br>*(डॉ. सुनिल देशमुख)* | `dvo.ahmednagar@ahvd.in` | `PashuAdmin@2026` | `DVO-AHM-001` | `+91 98230-55109`<br>*(Raw: 9823055109)* | जिल्हा पशुसंवर्धन अधिकारी (DVO)<br>Ahmednagar District HQ & Epidemiology Unit |

### Quick Copy-Paste for Admin:
```text
Email:       dvo.ahmednagar@ahvd.in
Password:    PashuAdmin@2026
Official ID: DVO-AHM-001
```

---

## 4. Live Firebase Auth UID Reference

All accounts are live in Firebase Project `pashu-f51a1` under Firebase Authentication:

| Email | Firebase UID | Authoritative Claim |
|---|---|---|
| `ananya.deshmukh@ahvd.in` | `zngfvzU8yiWAj8h5kydnEWUBqbu2` | `{"role": "doctor"}` |
| `amit.patil@ahvd.in` | `lSpYoRBhCoNTbFp5T2FhPojWGck2` | `{"role": "doctor"}` |
| `vikram.jadhav@ahvd.in` | `4KrJ3fCoGpNz8CeWK5vrzph8dtI2` | `{"role": "doctor"}` |
| `shital.gaikwad@ahvd.in` | `7mGPaf92VHe49cszX1sii4CGoHJ3` | `{"role": "doctor"}` |
| `ramesh.patil@pashu.in` | `Z2zLFaWnf3VUQRJM7OsSL5G0MaB3` | `{"role": "consumer"}` |
| `dnyaneshwar.shinde@pashu.in` | `2CAj5PnlbAarULJNKHMFPgSvfDm2` | `{"role": "consumer"}` |
| `balasaheb.gade@pashu.in` | `j4cMv2mWxiXJhTmJntCx20Go5Mp2` | `{"role": "consumer"}` |
| `sunita.shinde@pashu.in` | `QPkmGAd9qGSVoWA0XiGvFtZxERp1` | `{"role": "consumer"}` |
| `dvo.ahmednagar@ahvd.in` | `Na8AoBEmMgVbNUmOpa3xgzQb8SR2` | `{"role": "admin"}` |

---

## 5. Mobile Application APK Build

- **APK File Location:** `d:\pashu sih\pashu-suraksha-debug.apk`
- **Android Studio Project Path:** `d:\pashu sih\mobile\android`
- **Installation via ADB:**
  ```powershell
  adb install -r "d:\pashu sih\pashu-suraksha-debug.apk"
  ```
- **Direct Launch in Android Studio:**
  Open the project in Android Studio and press **Run 'app' (Shift + F10)**.
