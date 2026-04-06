# app/routes/analytics.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Click, URL, User
from app.utils.jwt_handler import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

# app/routes/analytics.py

@router.get("/overview")
async def get_analytics_overview(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Get user links
    user_links = db.query(URL.id).filter(URL.owner_id == current_user.id).all()
    link_ids = [l[0] for l in user_links]

    if not link_ids:
        return {"total_clicks": 0, "total_links": 0, "timeline": [], "devices": [], "countries": []}

    # 2. Total Clicks
    total_clicks = db.query(Click).filter(Click.link_id.in_(link_ids)).count()
    
    # 3. Timeline Query (Fix: changed clicked_at to timestamp)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    clicks_over_time = db.query(
        func.to_char(Click.timestamp, 'YYYY-MM-DD').label('date'),
        func.count(Click.id).label('clicks') # 👈 Label it 'clicks' to match frontend
    ).filter(Click.link_id.in_(link_ids), Click.timestamp >= seven_days_ago)\
     .group_by('date').order_by('date').all()

    # 4. Device breakdown (Fix: changed clicked_at to timestamp)
    device_data = db.query(
        Click.device_type, func.count(Click.id)
    ).filter(Click.link_id.in_(link_ids)).group_by(Click.device_type).all()

    # 5. Country breakdown
    country_data = db.query(
        Click.country, func.count(Click.id)
    ).filter(Click.link_id.in_(link_ids)).group_by(Click.country).limit(5).all()

    # ✅ FIXED: Returning ACTUAL variables instead of empty []
    return {
        "total_clicks": total_clicks,
        "total_links": len(link_ids),
        "timeline": [{"date": c[0], "clicks": c[1]} for c in clicks_over_time],
        "devices": [{"name": d[0] or "Unknown", "value": d[1]} for d in device_data],
        "countries": [{"name": co[0] or "Unknown", "value": co[1]} for co in country_data]
    }

@router.get("/{link_id}")
async def get_single_link_analytics(
    link_id: str, # 🛡️ Accept as String
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    int_id = int(link_id) # Convert back to Int for DB query
    link = db.query(URL).filter(URL.id == int_id, URL.owner_id == current_user.id).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    clicks = db.query(Click).filter(Click.link_id == int_id).all()
    device_data = db.query(Click.device_type, func.count(Click.id)).filter(Click.link_id == int_id).group_by(Click.device_type).all()

    return {
        "short_code": link.short_code,
        "long_url": link.long_url,
        "total_clicks": len(clicks),
        "devices": [{"name": d[0] or "Unknown", "value": d[1]} for d in device_data],
        "history": [
            {
                "timestamp": c.timestamp, 
                "browser": c.browser,
                "country": c.country,
                "city": c.city
            } for c in clicks
        ]
    }