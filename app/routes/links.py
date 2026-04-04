import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import URL, User
from app.cache.link_cache import get_cached_link, set_cached_link
from app.utils.click_publisher import publish_click_event

from app.utils.id_generator import generate_short_code, generate_snowflake_id

from app.utils.jwt_handler import get_current_user, hash_password, verify_password

from datetime import datetime, timedelta
from app.cache.redis_client import redis_client


logger = logging.getLogger("uvicorn")
router = APIRouter()


@router.get("/{code}")
async def redirect_to_url(
    code: str, 
    request: Request, 
    link_password: str = None, 
    db: Session = Depends(get_db)
):
    # 1. Check Cache for a JSON object (URL + Metadata)
    link_data = await get_cached_link(code)

    if not link_data:
        # 2. If not in cache, hit the DB
        db_link = db.query(URL).filter(URL.short_code == code).first()
        if not db_link:
            raise HTTPException(status_code=404, detail="Link not found")
        
        # Prepare data for the Hybrid Cache
        link_data = {
            "long_url": db_link.long_url,
            "password_hash": db_link.password_hash,
            "expires_at": db_link.expires_at.isoformat() if db_link.expires_at else None
        }
        # Save it to Redis so the NEXT click is 1ms
        await set_cached_link(code, link_data)
    
    # 3. Security Check (Fast logic using dict, no DB needed!)
    if link_data["expires_at"]:
        expiry = datetime.fromisoformat(link_data["expires_at"])
        if datetime.utcnow() > expiry:
            raise HTTPException(status_code=410, detail="This link has expired.")

    if link_data["password_hash"]:
        if not link_password or not verify_password(link_password, link_data["password_hash"]):
            raise HTTPException(status_code=401, detail="Password required for this link.")

    # 4. Analytics (Still using your background Redis Stream)
    try:
        await publish_click_event(code, {"ip": request.client.host})
    except Exception as e:
        logger.error(f"Analytics error: {e}")
    
    return RedirectResponse(url=link_data["long_url"])



@router.post("/", status_code=201)
async def create_link(
    long_url: str, 
    custom_slug: str = None, 
    expiry_days: int = None,
    link_password: str = None, # 🔒 New optional parameter
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    # --- 🛡️ RATE LIMITER (10 links per minute) ---
    limit_key = f"rate_limit:{current_user.id}"
    current_count = await redis_client.incr(limit_key)

    logger.info(f"🚨 RATE LIMIT DEBUG: User {current_user.id} is on hit #{current_count}")
    
    if current_count == 1:
        # First time this minute? Set a 60-second timer
        await redis_client.expire(limit_key, 60)
    
    if current_count > 10:
        raise HTTPException(
            status_code=429, 
            detail="Whoa there! You can only create 10 links per minute."
        )

    # 1. Handle Custom Slug or Generate Snowflake-based one
    if custom_slug:
        # Check if the slug is already taken
        existing = db.query(URL).filter(URL.short_code == custom_slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already taken!")
        short_code = custom_slug
    else:
        # Fallback to your hex-shortened Snowflake ID
        short_code = hex(generate_snowflake_id())[2:10]


    # Calculate Expiry
    expiration_date = None
    if expiry_days:
        expiration_date = datetime.utcnow() + timedelta(days=expiry_days)


    hashed_link_pw = None
    if link_password:
        hashed_link_pw = hash_password(link_password)


    new_link = URL(
        id=generate_snowflake_id(),
        short_code=short_code,
        long_url=long_url,
        owner_id=current_user.id,
        expires_at=expiration_date,
        password_hash=hashed_link_pw # 👈 Store the hashed password
    )

    
    try:
        db.add(new_link)
        db.commit()
        db.refresh(new_link)
        return new_link
    except Exception as e:
        db.rollback()
        logger.error(f"DATABASE ERROR: {e}")
        raise HTTPException(status_code=500, detail="Could not create link")