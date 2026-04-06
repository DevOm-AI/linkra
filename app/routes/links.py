import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import URL, Click, User
from app.cache.link_cache import get_cached_link, set_cached_link
from app.utils.click_publisher import publish_click_event

from app.utils.id_generator import generate_short_code, generate_snowflake_id

from app.utils.jwt_handler import get_current_user, hash_password, verify_password

from app.utils.geo import get_geo_info

from datetime import datetime, timedelta
from app.cache.redis_client import redis_client

from typing import List

from pydantic import BaseModel, HttpUrl
from typing import Optional

from fastapi.responses import RedirectResponse
from sqlalchemy import func



# 🛡️ Define the structure of the incoming JSON
class LinkCreateRequest(BaseModel):
    long_url: str
    custom_slug: Optional[str] = None
    expiry_days: Optional[int] = None
    link_password: Optional[str] = None


logger = logging.getLogger("uvicorn")
router = APIRouter()


@router.get("/{code}")
async def redirect_to_url(
    code: str, 
    request: Request, 
    link_password: str = None, 
    db: Session = Depends(get_db)
):
    # 1. Search Case-Insensitively to avoid "Shopnpoint" vs "ShopNPoint" issues
    db_link = db.query(URL).filter(func.lower(URL.short_code) == code.lower()).first()
    
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")

    # 2. Check Expiry
    if db_link.expires_at and datetime.utcnow() > db_link.expires_at:
        raise HTTPException(status_code=410, detail="This link has expired.")

    # 3. Check Password
    if db_link.password_hash:
        if not link_password or not verify_password(link_password, db_link.password_hash):
            raise HTTPException(status_code=401, detail="Password required.")
        

    # 🌍 STAGE 4: Fetch Geo-Location Data
    client_ip = request.client.host
    geo_data = await get_geo_info(client_ip)


    # 4. 📊 RECORD THE CLICK (Direct Save)
    try:
        new_click = Click(
            link_id=db_link.id,
            ip_address=request.client.host,
            browser=request.headers.get("user-agent", "unknown"),
            device_type="Desktop",
            country=geo_data["country"],
            city=geo_data["city"],
            timestamp=datetime.utcnow()
        )
        db.add(new_click)
        db.commit()
        print(f"✅ Click recorded for {code}!")
    except Exception as e:
        print(f"❌ Analytics error: {e}")
        db.rollback()

    # 5. THE MOST IMPORTANT LINE: Return the actual redirect!
    return RedirectResponse(url=db_link.long_url)


@router.post("/", status_code=201)
async def create_link(
    # long_url: str, 
    # custom_slug: str = None, 
    link_data: LinkCreateRequest,
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

    
    # 2. Use 'link_data' to access your fields
    short_code = link_data.custom_slug
    if short_code:
        existing = db.query(URL).filter(URL.short_code == short_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug taken!")
    else:
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
        long_url=link_data.long_url,
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
    

# 1. LIST ALL LINKS (Fixes your 404 error)
@router.get("/")
async def get_my_links(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Only return links that belong to the logged-in user
    links = db.query(URL).filter(URL.owner_id == current_user.id).all()
    return [
        {
            "id": str(link.id), 
            "short_code": link.short_code, 
            "long_url": link.long_url,
            "password_hash": link.password_hash
        } for link in links
    ]



# 2. DELETE A LINK (Required for the Trash button)
@router.delete("/{link_id}")
async def delete_link(
    link_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_link = db.query(URL).filter(URL.id == link_id, URL.owner_id == current_user.id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    db.delete(db_link)
    db.commit()
    return {"message": "Link deleted successfully"}