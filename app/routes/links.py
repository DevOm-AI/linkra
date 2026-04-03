import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import URL
from app.cache.link_cache import get_cached_link, set_cached_link
from app.utils.click_publisher import publish_click_event

from app.utils.id_generator import generate_short_code

import base64


logger = logging.getLogger("uvicorn")
router = APIRouter()

@router.get("/{code}")
async def redirect_to_url(code: str, request: Request, db: Session = Depends(get_db)):
    # 1. Try Cache first
    target_url = await get_cached_link(code)
    
    # 2. If not in cache, hit the DB
    if not target_url:
        db_link = db.query(URL).filter(URL.short_code == code).first()
        if not db_link:
            raise HTTPException(status_code=404, detail="Link not found")
        target_url = db_link.long_url
        # Cache it for next time
        await set_cached_link(code, target_url)

    # 3. Capture Analytics Data
    analytics_data = {
        "ip": request.client.host,
        "user_agent": request.headers.get("user-agent", "Unknown"),
        "referrer": request.headers.get("referer", "Direct")
    }

    # 4. PUBLISH TO REDIS (Every click is logged)
    try:
        await publish_click_event(code, analytics_data)
        logger.info(f"✅ Click event published for {code}")
    except Exception as e:
        logger.error(f"❌ Failed to publish click: {e}")
    
    return RedirectResponse(url=target_url)



@router.post("/", status_code=201)
async def create_link(long_url: str, db: Session = Depends(get_db)):
    # 1. Generate the Snowflake ID
    raw_id = generate_short_code()
    
    # 2. FORCE to integer (fixes the TypeError and the BigInt error)
    # Snowflake IDs are numbers, but sometimes generators return them as strings
    try:
        numeric_id = int(raw_id)
    except (ValueError, TypeError):
        # Emergency fallback if your generator returns non-numeric strings
        import time
        numeric_id = int(time.time() * 1000)

    # 3. Create the short code from the numeric ID
    short_code = hex(numeric_id)[2:10]
    
    new_link = URL(
        id=numeric_id,        # PostgreSQL BigInt needs this to be an int
        short_code=short_code, # String
        long_url=long_url
    )
    
    try:
        db.add(new_link)
        db.commit()
        db.refresh(new_link)
        return new_link
    except Exception as e:
        db.rollback()
        print(f"DATABASE ERROR: {e}")
        raise HTTPException(status_code=500, detail="Could not create link")