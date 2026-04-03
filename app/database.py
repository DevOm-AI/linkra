import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 1. Setup paths to find the .env file accurately
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(base_dir, ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL not found in .env file!")

# 2. Initialize SQLAlchemy Engine
# Update the engine creation with pool settings
engine = create_engine(
    DATABASE_URL,
    pool_size=20,        # Increase base connections from 5 to 20
    max_overflow=30,     # Allow up to 30 additional "emergency" connections
    pool_timeout=60,     # Wait longer before giving up on a connection
    pool_recycle=3600    # Refresh connections every hour
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 3. The missing function (The Dependency)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()