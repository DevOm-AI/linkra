from sqlalchemy import Column, String, BigInteger, DateTime
from datetime import datetime
from app.database import Base

class URL(Base):
    __tablename__ = "urls"

    # Use the 64-bit Snowflake ID as the primary key
    id = Column(BigInteger, primary_key=True, index=True)
    
    # The actual short string (e.g., "xK3p")
    short_code = Column(String, unique=True, index=True, nullable=False)
    
    long_url = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Optional: For future-proofing Phase 4 (Advanced Features)
    expires_at = Column(DateTime, nullable=True)