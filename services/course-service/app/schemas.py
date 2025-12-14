from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Course Schemas
class CourseBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    credits: int = 3
    hours: int = 30
    filiere: Optional[str] = None
    niveau: Optional[str] = None
    enseignant_id: Optional[int] = None
    salle: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    credits: Optional[int] = None
    hours: Optional[int] = None
    filiere: Optional[str] = None
    niveau: Optional[str] = None
    enseignant_id: Optional[int] = None
    salle: Optional[str] = None


class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Enrollment Schemas
class EnrollmentCreate(BaseModel):
    course_id: int
    student_id: int


class EnrollmentResponse(BaseModel):
    id: int
    course_id: int
    student_id: int
    enrolled_at: datetime

    class Config:
        from_attributes = True


# Schedule Schemas
class ScheduleBase(BaseModel):
    course_id: int
    day_of_week: str
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    room: Optional[str] = None


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleResponse(ScheduleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
