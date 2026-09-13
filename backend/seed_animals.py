import sqlite3
import hashlib
from datetime import datetime, timezone

def sha256_hash(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

now = datetime.now(timezone.utc).isoformat()

conn = sqlite3.connect("pashu_cloud.db")
c = conn.cursor()

ANIMALS_DATA = [
    # Ramesh Patil (9822000412)
    ("100294819201", "Ramesh Sakharam Patil", sha256_hash("9822000412"), "+91 98220-00412", "Cow (गाय)", "Gir (गिर)", 36, 558301, "Rahuri Khurd"),
    ("100294819202", "Ramesh Sakharam Patil", sha256_hash("9822000412"), "+91 98220-00412", "Cow (गाय)", "Gir (गिर)", 48, 558301, "Rahuri Khurd"),
    ("100294819203", "Ramesh Sakharam Patil", sha256_hash("9822000412"), "+91 98220-00412", "Cow (गाय)", "Khillari (खिल्लार)", 24, 558301, "Rahuri Khurd"),
    # Dnyaneshwar Shinde (9423150821)
    ("100294819301", "Dnyaneshwar Shinde", sha256_hash("9423150821"), "+91 94231-50821", "Buffalo (म्हैस)", "Murrah (मुऱ्हा)", 42, 558302, "Ashwi Budruk"),
    ("100294819302", "Dnyaneshwar Shinde", sha256_hash("9423150821"), "+91 94231-50821", "Buffalo (म्हैस)", "Jaffarabadi (जाफराबादी)", 30, 558302, "Ashwi Budruk"),
    # Balasaheb Gade (9423911109)
    ("100294819401", "Balasaheb Vitthal Gade", sha256_hash("9423911109"), "+91 94239-11109", "Buffalo (म्हैस)", "Murrah (मुऱ्हा)", 50, 558303, "Deolali Pravara"),
    ("100294819402", "Balasaheb Vitthal Gade", sha256_hash("9423911109"), "+91 94239-11109", "Cow (गाय)", "HF Cross (संकरित एच.एफ.)", 28, 558303, "Deolali Pravara"),
    # Sunita Shinde (9604188234)
    ("100294819501", "Sunita Kisan Shinde", sha256_hash("9604188234"), "+91 96041-88234", "Goat (शेळी)", "Osmanabadi (उस्मानाबादी)", 18, 558304, "Sangamner Rural"),
    ("100294819502", "Sunita Kisan Shinde", sha256_hash("9604188234"), "+91 96041-88234", "Goat (शेळी)", "Osmanabadi (उस्मानाबादी)", 14, 558304, "Sangamner Rural"),
    ("100294819503", "Sunita Kisan Shinde", sha256_hash("9604188234"), "+91 96041-88234", "Sheep (मेंढी)", "Deccani (दख्खनी)", 22, 558304, "Sangamner Rural"),
]

for tag, owner, ph_hash, ph_mask, species, breed, age, lgd, village in ANIMALS_DATA:
    c.execute(
        """
        INSERT OR REPLACE INTO animals (
            tag_number, owner_name, owner_phone_hash, owner_phone_masked,
            species, breed, age_months, village_lgd_code, village_name,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (tag, owner, ph_hash, ph_mask, species, breed, age, lgd, village, now, now)
    )

conn.commit()
count = c.execute("SELECT COUNT(*) FROM animals").fetchone()[0]
conn.close()
print(f"Animals table now contains {count} animals.")
