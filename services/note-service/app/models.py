from sqlalchemy import Column, Integer, Float, String, Date, DateTime
from datetime import datetime
from .database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, index=True, nullable=False)
    course_code = Column(String, index=True, nullable=False)
    note = Column(Float, nullable=False)  # 0-20
    coefficient = Column(Float, default=1.0)
    type_exam = Column(String, default="EXAMEN")  # EXAMEN, CC, TP, RATTRAPAGE
    semester = Column(String, nullable=True)
    date_exam = Column(Date, nullable=True)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
