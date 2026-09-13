import asyncio
import hashlib
from datetime import datetime, timezone
from sqlalchemy import text
from app.database import AsyncSessionLocal, init_db
from app.models.user import User
from app.models.animal import Animal
from seed_firebase_users import REAL_USERS
from seed_animals import ANIMALS_DATA
from firebase_admin import credentials, auth
import firebase_admin

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-service-account.json")
    firebase_admin.initialize_app(cred)

def sha256_hash(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

now = datetime.now(timezone.utc)

async def seed_neon():
    await init_db()
    async with AsyncSessionLocal() as session:
        print("Seeding users into Neon PostgreSQL...")
        for u in REAL_USERS:
            fb_user = auth.get_user_by_email(u["email"])
            phone_hash = sha256_hash(u["phone_raw"])
            
            existing = await session.get(User, fb_user.uid)
            if existing:
                existing.name = u["display_name"]
                existing.name_marathi = u["name_marathi"]
                existing.name_hindi = u["name_hindi"]
                existing.role = u["role"]
                existing.phone_hash = phone_hash
                existing.phone_masked = u["phone_masked"]
                existing.district = u["district"]
                existing.block = u["block"]
                existing.village = u["village"]
                existing.title_marathi = u["title_marathi"]
                existing.title_hindi = u["title_hindi"]
                existing.title_english = u["title_english"]
                existing.license_or_id = u["license_or_id"]
                existing.updated_at = now
            else:
                user = User(
                    id=fb_user.uid,
                    phone_hash=phone_hash,
                    phone_masked=u["phone_masked"],
                    role=u["role"],
                    name=u["display_name"],
                    name_marathi=u["name_marathi"],
                    name_hindi=u["name_hindi"],
                    district=u["district"],
                    block=u["block"],
                    village=u["village"],
                    title_marathi=u["title_marathi"],
                    title_hindi=u["title_hindi"],
                    title_english=u["title_english"],
                    license_or_id=u["license_or_id"],
                    created_at=now,
                    updated_at=now,
                )
                session.add(user)
        
        await session.commit()
        print("Seeded all 9 users into Neon PostgreSQL.")

        print("Seeding animals into Neon PostgreSQL...")
        for tag, owner, ph_hash, ph_mask, species, breed, age, lgd, village in ANIMALS_DATA:
            existing_animal = await session.get(Animal, tag)
            if existing_animal:
                existing_animal.owner_name = owner
                existing_animal.owner_phone_hash = ph_hash
                existing_animal.owner_phone_masked = ph_mask
                existing_animal.species = species
                existing_animal.breed = breed
                existing_animal.age_months = age
                existing_animal.village_lgd_code = lgd
                existing_animal.village_name = village
                existing_animal.updated_at = now
            else:
                animal = Animal(
                    tag_number=tag,
                    owner_name=owner,
                    owner_phone_hash=ph_hash,
                    owner_phone_masked=ph_mask,
                    species=species,
                    breed=breed,
                    age_months=age,
                    village_lgd_code=lgd,
                    village_name=village,
                    created_at=now,
                    updated_at=now,
                )
                session.add(animal)
        
        await session.commit()
        print(f"Seeded {len(ANIMALS_DATA)} animals into Neon PostgreSQL.")

asyncio.run(seed_neon())
