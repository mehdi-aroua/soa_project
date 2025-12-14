from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, UniqueConstraint
from datetime import datetime
from .database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    credits = Column(Integer, default=3)
    hours = Column(Integer, default=30)
    filiere = Column(String, index=True, nullable=True)  # SCI, INFO, etc.
    niveau = Column(String, index=True, nullable=True)  # L1, L2, L3, M1, M2
    enseignant_id = Column(Integer, nullable=True)
    salle = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    
    # Unique constraint: a student can only enroll once per course
    __table_args__ = (UniqueConstraint('course_id', 'student_id', name='_course_student_uc'),)


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    day_of_week = Column(String, nullable=False)  # LUNDI, MARDI, etc.
    start_time = Column(String, nullable=False)  # HH:MM format
    end_time = Column(String, nullable=False)    # HH:MM format
    room = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
