from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field


class NoteBase(BaseModel):
    student_id: int
    course_code: str
    note: float = Field(..., ge=0, le=20, description="Note sur 20")
    coefficient: Optional[float] = 1.0
    type_exam: Optional[str] = "EXAMEN"  # EXAMEN, CC, TP, RATTRAPAGE
    semester: Optional[str] = None
    date_exam: Optional[date] = None
    comment: Optional[str] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    note: Optional[float] = Field(None, ge=0, le=20)
    coefficient: Optional[float] = None
    type_exam: Optional[str] = None
    semester: Optional[str] = None
    date_exam: Optional[date] = None
    comment: Optional[str] = None


class NoteOut(NoteBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StudentAverageOut(BaseModel):
    student_id: int
    average: float
    total_notes: int
    total_coefficient: float


class CourseAverageOut(BaseModel):
    course_code: str
    average: float
    total_notes: int
    min_note: float
    max_note: float
