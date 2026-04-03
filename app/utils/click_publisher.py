from app.cache.redis_client import redis_client

async def publish_click_event(code: str, request_data: dict):
    try:
        # We push a simple dictionary into the Redis Stream
        event_data = {
            "short_code": str(code),
            "ip": str(request_data.get("ip", "0.0.0.0")),
            "user_agent": str(request_data.get("user_agent", "Unknown")),
            "referrer": str(request_data.get("referrer", "Direct"))
        }
        
        # FIX: Just pass event_data directly, no 'mapping=' keyword
        await redis_client.xadd("click_stream", event_data)
        
    except Exception as e:
        # This will print the actual error if it still fails
        print(f"REDIS PUBLISH ERROR: {e}")
        raise e