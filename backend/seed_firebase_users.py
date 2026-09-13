import os
import sqlite3
import hashlib
import datetime
import firebase_admin
from firebase_admin import credentials, auth

# Initialize Firebase Admin
cred = credentials.Certificate("firebase-service-account.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# Connect to backend SQLite database
conn = sqlite3.connect("pashu_cloud.db")
c = conn.cursor()

def sha256_hash(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

now = datetime.datetime.now(datetime.timezone.utc).isoformat()

# Master list of real users to provision in Firebase & DB
REAL_USERS = [
    # --- Veterinarians & Para-Vets ---
    {
        "email": "ananya.deshmukh@ahvd.in",
        "password": "PashuDoctor@2026",
        "display_name": "Dr. Ananya Deshmukh",
        "name_marathi": "डॉ. अनन्या देशमुख",
        "name_hindi": "डॉ. अनन्या देशमुख",
        "role": "doctor",
        "phone_masked": "+91 94220-01842",
        "phone_raw": "9422001842",
        "district": "Ahmednagar",
        "block": "Rahuri",
        "village": "Rahuri Khurd",
        "title_marathi": "तालुका पशुवैद्यकीय अधिकारी (BVO)",
        "title_hindi": "ब्लॉक पशु चिकित्सा अधिकारी (BVO)",
        "title_english": "Block Veterinary Officer (BVO)",
        "license_or_id": "MH-VET-2022-4109",
    },
    {
        "email": "amit.patil@ahvd.in",
        "password": "PashuDoctor@2026",
        "display_name": "Dr. Amit Patil",
        "name_marathi": "डॉ. अमित पाटील",
        "name_hindi": "डॉ. अमित पाटिल",
        "role": "doctor",
        "phone_masked": "+91 98220-44102",
        "phone_raw": "9822044102",
        "district": "Ahmednagar",
        "block": "Rahuri",
        "village": "Ashwi Budruk",
        "title_marathi": "पशुधन विकास अधिकारी (LDO)",
        "title_hindi": "पशुधन विकास अधिकारी (LDO)",
        "title_english": "Livestock Development Officer (LDO)",
        "license_or_id": "MH-VET-2024-8819",
    },
    {
        "email": "vikram.jadhav@ahvd.in",
        "password": "PashuDoctor@2026",
        "display_name": "Dr. Vikram Jadhav",
        "name_marathi": "डॉ. विक्रम जाधव",
        "name_hindi": "डॉ. विक्रम जाधव",
        "role": "doctor",
        "phone_masked": "+91 98500-12890",
        "phone_raw": "9850012890",
        "district": "Ahmednagar",
        "block": "Sangamner",
        "village": "Sangamner Rural",
        "title_marathi": "फिरता पशुवैद्यकीय पथक अधिकारी (MVU)",
        "title_hindi": "सचल पशु चिकित्सा अधिकारी (MVU)",
        "title_english": "Mobile Veterinary Unit (MVU) Officer",
        "license_or_id": "MH-VET-2023-6521",
    },
    {
        "email": "shital.gaikwad@ahvd.in",
        "password": "PashuDoctor@2026",
        "display_name": "Shital Gaikwad",
        "name_marathi": "शितलताई गायकवाड",
        "name_hindi": "शीतल गायकवाड़",
        "role": "doctor",
        "phone_masked": "+91 97633-55201",
        "phone_raw": "9763355201",
        "district": "Ahmednagar",
        "block": "Rahuri",
        "village": "Deolali Pravara",
        "title_marathi": "प्रमाणित पशु सखी (Community Para-Vet)",
        "title_hindi": "प्रमाणित पशु सखी (पैरा-वेट)",
        "title_english": "Pashu Sakhi (Community Para-Vet)",
        "license_or_id": "MH-PARA-2023-1102",
    },

    # --- Farmers (Livestock Owners) ---
    {
        "email": "ramesh.patil@pashu.in",
        "password": "PashuFarmer@2026",
        "display_name": "Ramesh Sakharam Patil",
        "name_marathi": "रमेश सखाराम पाटील",
        "name_hindi": "रमेश सखाराम पाटिल",
        "role": "consumer",
        "phone_masked": "+91 98220-00412",
        "phone_raw": "9822000412",
        "district": "Ahmednagar",
        "block": "Rahuri",
        "village": "Rahuri Khurd",
        "title_marathi": "गिर गाय संवर्धक शेतकरी",
        "title_hindi": "गीर गाय पालक किसान",
        "title_english": "Gir Cattle Breeder & Dairy Farmer",
        "license_or_id": None,
    },
    {
        "email": "dnyaneshwar.shinde@pashu.in",
        "password": "PashuFarmer@2026",
        "display_name": "Dnyaneshwar Shinde",
        "name_marathi": "ज्ञानेश्वर विठ्ठल शिंदे",
        "name_hindi": "ज्ञानेश्वर विट्ठल शिंदे",
        "role": "consumer",
        "phone_masked": "+91 94231-50821",
        "phone_raw": "9423150821",
        "district": "Ahmednagar",
        "block": "Rahuri",
        "village": "Ashwi Budruk",
        "title_marathi": "दुग्ध उत्पादक शेतकरी",
        "title_hindi": "दुग्ध उत्पादक किसान",
        "title_english": "Dairy Cattle Farmer",
        "license_or_id": None,
    },
    {
        "email": "balasaheb.gade@pashu.in",
        "password": "PashuFarmer@2026",
        "display_name": "Balasaheb Vitthal Gade",
        "name_marathi": "बाळासाहेब विठ्ठल गाडे",
        "name_hindi": "बालासाहेब विट्ठल गाडे",
        "role": "consumer",
        "phone_masked": "+91 94239-11109",
        "phone_raw": "9423911109",
        "district": "Ahmednagar",
        "block": "Rahuri",
        "village": "Deolali Pravara",
        "title_marathi": "मुऱ्हा म्हैस दुग्ध व्यावसायिक",
        "title_hindi": "मुर्रा भैंस दुग्ध उत्पादक",
        "title_english": "Commercial Murrah Buffalo Farmer",
        "license_or_id": None,
    },
    {
        "email": "sunita.shinde@pashu.in",
        "password": "PashuFarmer@2026",
        "display_name": "Sunita Kisan Shinde",
        "name_marathi": "सुनिता किसन शिंदे",
        "name_hindi": "सुनीता किसन शिंदे",
        "role": "consumer",
        "phone_masked": "+91 96041-88234",
        "phone_raw": "9604188234",
        "district": "Ahmednagar",
        "block": "Sangamner",
        "village": "Sangamner Rural",
        "title_marathi": "उस्मानाबादी शेळी-मेंढी पालक",
        "title_hindi": "उस्मानाबादी बकरी पालक",
        "title_english": "Osmanabadi Goat & Sheep Smallholder",
        "license_or_id": None,
    },

    # --- District Admin (DVO) ---
    {
        "email": "dvo.ahmednagar@ahvd.in",
        "password": "PashuAdmin@2026",
        "display_name": "Dr. Sunil Deshmukh",
        "name_marathi": "डॉ. सुनिल देशमुख",
        "name_hindi": "डॉ. सुनील देशमुख",
        "role": "admin",
        "phone_masked": "+91 98230-55109",
        "phone_raw": "9823055109",
        "district": "Ahmednagar",
        "block": "Nagar",
        "village": "Ahmednagar HQ",
        "title_marathi": "जिल्हा पशुसंवर्धन अधिकारी (DVO)",
        "title_hindi": "जिला पशुपालन अधिकारी (DVO)",
        "title_english": "District Animal Husbandry Officer",
        "license_or_id": "DVO-AHM-001",
    },
]

print(f"Provisioning {len(REAL_USERS)} users in Firebase Authentication & Database...")

provisioned_list = []

for u in REAL_USERS:
    email = u["email"]
    password = u["password"]
    role = u["role"]
    display_name = u["display_name"]
    
    # 1. Check if user already exists in Firebase Auth
    try:
        fb_user = auth.get_user_by_email(email)
        # Update existing user password and display name
        fb_user = auth.update_user(
            fb_user.uid,
            password=password,
            display_name=display_name,
        )
        print(f"[UPDATED] Existing Firebase user: {email} (UID: {fb_user.uid})")
    except auth.UserNotFoundError:
        # Create new user
        fb_user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name,
        )
        print(f"[CREATED] New Firebase user: {email} (UID: {fb_user.uid})")

    # 2. Set authoritative custom user claims
    auth.set_custom_user_claims(fb_user.uid, {"role": role})

    # 3. Store in local SQLite database with Firebase UID
    phone_hash = sha256_hash(u["phone_raw"])
    c.execute(
        """
        INSERT OR REPLACE INTO users (
            id, phone_hash, phone_masked, role, name, name_marathi, name_hindi,
            district, block, village, title_marathi, title_hindi, title_english,
            license_or_id, offline_pin_hash, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            fb_user.uid,
            phone_hash,
            u["phone_masked"],
            role,
            display_name,
            u["name_marathi"],
            u["name_hindi"],
            u["district"],
            u["block"],
            u["village"],
            u["title_marathi"],
            u["title_hindi"],
            u["title_english"],
            u["license_or_id"],
            None,
            now,
            now,
        ),
    )

    provisioned_list.append({
        "role": role,
        "name": display_name,
        "email": email,
        "password": password,
        "secondary_id": u["license_or_id"],
        "uid": fb_user.uid,
    })

conn.commit()
conn.close()

print("\nAll users provisioned successfully in Firebase & SQLite database!")
