from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas.user import UserCreate, Token, UserOut
from app.utils.jwt_handler import hash_password, verify_password, create_access_token
from app.utils.id_generator import generate_snowflake_id

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # 1. FIX: Use generate_snowflake_id() to get a numeric ID
    # This is a number, so int() will work (or it might already be an int)
    raw_id = generate_snowflake_id()
    user_id = int(raw_id) 

    # 2. Create user with the numeric ID
    new_user = User(
        id=user_id, # BigInt column loves this
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        print(f"REGISTRATION ERROR: {e}")
        raise HTTPException(status_code=500, detail="Database insertion failed")

@router.post("/login", response_model=Token)
def login(user_data: UserCreate, db: Session = Depends(get_db)):
    # 1. Fetch user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    
    # 2. Verify existence and password
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Create the JWT
    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    
    return {"access_token": access_token, "token_type": "bearer"}