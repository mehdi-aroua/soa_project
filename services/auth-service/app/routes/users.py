from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import bcrypt
import re

from app.database import SessionLocal
from app.models import User
from app.schemas import UserCreate, LoginRequest, UserOut, Token
from app.jwt_handler import (
    create_access_token,
    create_refresh_token,
    verify_token,
    add_to_blacklist,
    validate_password_strength,
)

router = APIRouter()
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# REGISTER
@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    email = payload.email
    password = payload.password
    full_name = payload.full_name or ""
    role = payload.role or "ETUDIANT"
    # Email format validation (simple regex)
    email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not re.match(email_regex, email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Uniqueness
    existing = db.query(User).filter_by(email=email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Password strength
    pwd_err = validate_password_strength(password)
    if pwd_err:
        raise HTTPException(status_code=400, detail=pwd_err)

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    db_user = User(email=email, password=hashed, full_name=full_name, role=role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# LOGIN
@router.post("/login", response_model=Token)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Login user and return JWT tokens"""
    user = db.query(User).filter_by(email=body.email).first()
    
    if not user or not bcrypt.checkpw(body.password.encode('utf-8'), user.password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "role": user.role})
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# REFRESH
@router.post("/refresh")
def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Issue a new access token using a valid refresh token in Authorization header."""
    token = credentials.credentials
    payload = verify_token(token, expected_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    new_access = create_access_token({"sub": payload.get("sub"), "role": payload.get("role")})
    return {"access_token": new_access, "token_type": "bearer"}

# LOGOUT
@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Blacklist the presented token (access or refresh)."""
    token = credentials.credentials
    add_to_blacklist(token)
    return {"message": "Logged out successfully"}

# ME (current user)
@router.get("/me")
def me(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_token(token, expected_type="access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}

# VALIDATE TOKEN (for gateway or other services)
@router.get("/validate")
def validate(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token, expected_type="access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"valid": True, "sub": payload.get("sub"), "role": payload.get("role")}

# GET ALL USERS
@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role} for u in users]
