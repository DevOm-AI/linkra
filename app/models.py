# app/models.py
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Boolean, ForeignKey
from datetime import datetime
from app.database import Base
from sqlalchemy.sql import func
from app.utils.id_generator import generate_snowflake_id
from sqlalchemy.orm import relationship


class URL(Base):
    __tablename__ = "urls"
    # Keeping your genius Snowflake ID setup!
    id = Column(BigInteger, primary_key=True, index=True) 
    short_code = Column(String, unique=True, index=True, nullable=False)
    long_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    owner_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="links")

    password_hash = Column(String, nullable=True)


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
    link_id = Column(BigInteger, ForeignKey("urls.id"))



class User(Base):
    __tablename__ = "users"

    # Using your Snowflake ID generator for consistency
    id = Column(BigInteger, primary_key=True, default=generate_snowflake_id)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    links = relationship("URL", back_populates="owner")