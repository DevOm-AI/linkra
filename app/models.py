# app/models.py
from sqlalchemy import Column, Integer, String, BigInteger, DateTime
from datetime import datetime
from app.database import Base

class URL(Base):
    __tablename__ = "urls"
    # Keeping your genius Snowflake ID setup!
    id = Column(BigInteger, primary_key=True, index=True) 
    short_code = Column(String, unique=True, index=True, nullable=False)
    long_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

class Click(Base):
    __tablename__ = "clicks"
    id = Column(Integer, primary_key=True, index=True)
    short_code = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)
    country = Column(String, default="Unknown")
    city = Column(String, default="Unknown")
    device_type = Column(String, default="Desktop")
    browser = Column(String, default="Unknown")
    referrer = Column(String, default="Direct")