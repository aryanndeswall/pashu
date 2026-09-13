import asyncio
from app.database import AsyncSessionLocal, init_db
from app.models.case import ClinicalCase
from app.models.animal import Animal
from sqlalchemy import delete

async def clear():
    await init_db()
    async with AsyncSessionLocal() as session:
        await session.execute(delete(ClinicalCase))
        await session.execute(delete(Animal))
        await session.commit()
        print("Cleaned all mock cases and mock animals successfully.")

if __name__ == "__main__":
    asyncio.run(clear())
