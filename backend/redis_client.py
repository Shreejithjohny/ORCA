import redis.asyncio as redis

REDIS_URL = "redis://localhost:6379/0"

def get_redis():
    return redis.Redis.from_url(REDIS_URL, decode_responses=True)