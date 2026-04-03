from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, HttpUrl

from app.database import get_db
from app.models.url import URL
from app.utils.id_generator import generator, encode_base62

router = APIRouter()

class URLCreate(BaseModel):
    target_url: HttpUrl

@router.post("/shorten")
def shorten_url(url_data: URLCreate, db: Session = Depends(get_db)):
    # 1. Generate Snowflake ID
    snowflake_id = generator.generate()
    
    # 2. Convert to Base62 short code
    short_code = encode_base62(snowflake_id)
    
    # 3. Save to Postgres
    new_url = URL(
        id=snowflake_id,
        short_code=short_code,
        long_url=str(url_data.target_url)
    )
    db.add(new_url)
    db.commit()
    db.refresh(new_url)
    
    return {"short_url": f"http://localhost:8000/{short_code}", "code": short_code}

@router.get("/{code}")
def redirect_to_url(code: str, db: Session = Depends(get_db)):
    # Look up the code in the DB
    db_url = db.query(URL).filter(URL.short_code == code).first()
    
    if not db_url:
        raise HTTPException(status_code=404, detail="Short link not found")
    
    # Simple redirect for now (Analytics comes in Phase 3!)
    return RedirectResponse(url=db_url.long_url)