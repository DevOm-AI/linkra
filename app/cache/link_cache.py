from .redis_client import redis_client

CACHE_TTL = 86400  # 24 hours in seconds

async def get_cached_link(code: str):
    # Try to get URL from Redis
    return await redis_client.get(f"link:{code}")

async def set_cached_link(code: str, url: str):
    # Store URL in Redis with an expiry time
    await redis_client.setex(f"link:{code}", CACHE_TTL, url)

async def delete_cached_link(code: str):
    # For cache invalidation (Phase 4)
    await redis_client.delete(f"link:{code}")