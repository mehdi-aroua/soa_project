from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String, nullable=True)
    role = Column(String, default="ETUDIANT", index=True)  # ETUDIANT, ENSEIGNANT, ADMIN
    is_active = Column(Integer, default=1)  # 1=active, 0=inactive
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
