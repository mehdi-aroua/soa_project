#gestion JWT
from datetime import datetime, timedelta
from jose import jwt, JWTError

SECRET_KEY = "SECRET_A_CHANGER"
ALGO = "HS256"
EXPIRE = 60

# Store for logout tokens (in-memory blacklist)
blacklist = set()

def create_token(data: dict, expires_delta: timedelta = None):
    payload = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=EXPIRE)
    payload["exp"] = expire
    return jwt.encode(payload, SECRET_KEY, ALGO)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGO])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None

def add_to_blacklist(token: str):
    blacklist.add(token)

def is_token_blacklisted(token: str):
    return token in blacklist
