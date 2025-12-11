from datetime import datetime, timedelta
import os
from typing import Optional, Dict

from jose import jwt, JWTError

# Environment-configurable settings
SECRET_KEY = os.getenv("AUTH_JWT_SECRET", "CHANGE_ME_SECRET")
ALGORITHM = os.getenv("AUTH_JWT_ALGO", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("AUTH_ACCESS_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("AUTH_REFRESH_EXPIRE_DAYS", "7"))

# In-memory blacklist for demo purposes (consider persistent storage in production)
_blacklist = set()


def _expiry(delta: timedelta) -> datetime:
    return datetime.utcnow() + delta


def create_access_token(data: Dict) -> str:
    to_encode = data.copy()
    to_encode["type"] = "access"
    to_encode["exp"] = _expiry(timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: Dict) -> str:
    to_encode = data.copy()
    to_encode["type"] = "refresh"
    to_encode["exp"] = _expiry(timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str, expected_type: Optional[str] = None) -> Optional[Dict]:
    try:
        if is_blacklisted(token):
            return None
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if expected_type and payload.get("type") != expected_type:
            return None
        return payload
    except JWTError:
        return None


def add_to_blacklist(token: str) -> None:
    _blacklist.add(token)


def is_blacklisted(token: str) -> bool:
    return token in _blacklist


def validate_password_strength(password: str) -> Optional[str]:
    """Return None if valid, else an error message string."""
    # Min length 8, at least one upper, one lower, one digit, one symbol
    if len(password) < 8:
        return "Password must be at least 8 characters"
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_symbol = any(not c.isalnum() for c in password)
    if not has_upper:
        return "Password must contain at least one uppercase letter"
    if not has_lower:
        return "Password must contain at least one lowercase letter"
    if not has_digit:
        return "Password must contain at least one digit"
    if not has_symbol:
        return "Password must contain at least one symbol"
    return None
