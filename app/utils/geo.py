import httpx

async def get_geo_info(ip: str):
    # 🕵️ Localhost Hack: Since 127.0.0.1 has no location, we'll mock Pune
    if ip == "127.0.0.1":
        return {"country": "India", "city": "Pune"}

    try:
        async with httpx.AsyncClient() as client:
            # We use ip-api.com (free for development)
            response = await client.get(f"http://ip-api.com/json/{ip}")
            data = response.json()
            
            if data.get("status") == "success":
                return {
                    "country": data.get("country", "Unknown"),
                    "city": data.get("city", "Unknown")
                }
    except Exception as e:
        print(f"GeoIP Error: {e}")
    
    return {"country": "Unknown", "city": "Unknown"}