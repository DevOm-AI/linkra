# create_tables.py
from app.database import engine, Base
from app.models import User, URL, Click  # 👈 CRUCIAL: Must import all models here

def build_it():
    print("🔨 Building tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ clicks table is now LIVE in PostgreSQL!")

if __name__ == "__main__":
    build_it()