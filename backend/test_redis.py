import os
import asyncio
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

async def test_redis():
    redis_url = os.getenv('REDIS_URL')
    if not redis_url:
        print("REDIS_URL not found in .env")
        return

    # Upstash URLs often use rediss:// for TLS
    # Redis python client supports it natively
    print(f"Connecting to Redis at: {redis_url.split('@')[-1] if '@' in redis_url else 'Unknown'}")
    
    try:
        r = redis.from_url(redis_url)
        # Ping the server
        response = await r.ping()
        print(f"Redis is ACTIVE and responding: {response}")
        
        # Test set/get
        await r.set('test_key', 'pashu-suraksha-online')
        val = await r.get('test_key')
        print(f"Read back test key: {val.decode('utf-8')}")
        
        # Clean up
        await r.delete('test_key')
        await r.close()
    except Exception as e:
        print("Redis connection FAILED: ", str(e))

if __name__ == "__main__":
    asyncio.run(test_redis())
