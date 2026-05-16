import asyncio
from redis_client import get_redis

async def test():
    r = get_redis()
    pong = await r.ping()
    print("Redis connected:", pong)

asyncio.run(test())