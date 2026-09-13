import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def test():
    db_url = os.getenv('DATABASE_URL')
    print(f"Connecting to: {db_url.split('@')[-1] if db_url else None}")
    engine = create_async_engine(db_url)
    try:
        async with engine.begin() as conn:
            res = await conn.execute(text('SELECT 1'))
            print('Database is ACTIVE: ', res.scalar() == 1)
    except Exception as e:
        print('Database connection FAILED: ', str(e))

asyncio.run(test())
