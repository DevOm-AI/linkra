# app/cache/link_cache.py
import json
from .redis_client import redis_client # Use this one or the other, not both

CACHE_TTL = 86400  # 24 hours in seconds

async def set_cached_link(code: str, data: dict, expire: int = 3600):
    await redis_client.set(f"link:{code}", json.dumps(data), ex=expire)

async def get_cached_link(code: str):
    cached = await redis_client.get(f"link:{code}")
    return json.loads(cached) if cached else None

async def delete_cached_link(code: str):
    await redis_client.delete(f"link:{code}")