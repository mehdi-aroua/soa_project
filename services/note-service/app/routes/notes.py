from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, Dict, Any

from app.database import SessionLocal
from app.models import Note
from app.schemas import (
    NoteCreate,
    NoteUpdate,
    NoteOut,
    StudentAverageOut,
    CourseAverageOut,
)

router = APIRouter(tags=["Notes"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =============================================
# STUDENT-SPECIFIC ROUTES (must come FIRST!)
# =============================================

# GET my notes (for logged-in students)
# This is a simplified version - in production, you'd get student_id from JWT token
@router.get("/notes/my-notes", response_model=list[NoteOut])
def get_my_notes(
    student_id: int = Query(..., description="Student ID from authentication"),
    db: Session = Depends(get_db)
):
    """
    Get all notes for the authenticated student.
    In production, student_id would come from JWT token.
    For now, it's passed as a query parameter.
    """
    notes = (
        db.query(Note)
        .filter(Note.student_id == student_id)
        .order_by(Note.course_code, Note.created_at.desc())
        .all()
    )
    return notes


# GET my average (for logged-in students)
@router.get("/notes/my-average", response_model=StudentAverageOut)
def get_my_average(
    student_id: int = Query(..., description="Student ID from authentication"),
    db: Session = Depends(get_db)
):
    """
    Get average for the authenticated student.
    In production, student_id would come from JWT token.
    For now, it's passed as a query parameter.
    """
    notes = db.query(Note).filter(Note.student_id == student_id).all()
    
    if not notes:
        raise HTTPException(status_code=404, detail="No notes found for this student")
    
    total_weighted = sum(n.note * n.coefficient for n in notes)
    total_coef = sum(n.coefficient for n in notes)
    
    average = total_weighted / total_coef if total_coef > 0 else 0
    
    return StudentAverageOut(
        student_id=student_id,
        average=round(average, 2),
        total_notes=len(notes),
        total_coefficient=total_coef
    )


# GET all notes for a student
@router.get("/notes/student/{student_id}", response_model=list[NoteOut])
def get_student_notes(student_id: int, db: Session = Depends(get_db)):
    notes = (
        db.query(Note)
        .filter(Note.student_id == student_id)
        .order_by(Note.course_code, Note.created_at.desc())
        .all()
    )
    return notes


# GET average for a student
@router.get("/notes/student/{student_id}/average", response_model=StudentAverageOut)
def get_student_average(student_id: int, db: Session = Depends(get_db)):
    notes = db.query(Note).filter(Note.student_id == student_id).all()
    
    if not notes:
        raise HTTPException(status_code=404, detail="No notes found for this student")
    
    total_weighted = sum(n.note * n.coefficient for n in notes)
    total_coef = sum(n.coefficient for n in notes)
    
    average = total_weighted / total_coef if total_coef > 0 else 0
    
    return StudentAverageOut(
        student_id=student_id,
        average=round(average, 2),
        total_notes=len(notes),
        total_coefficient=total_coef
    )


# =============================================
# COURSE-SPECIFIC ROUTES (must come BEFORE /notes/{note_id})
# =============================================

# GET all notes for a course
@router.get("/notes/course/{course_code}", response_model=list[NoteOut])
def get_course_notes(course_code: str, db: Session = Depends(get_db)):
    notes = (
        db.query(Note)
        .filter(Note.course_code == course_code)
        .order_by(Note.note.desc())
        .all()
    )
    return notes


# GET statistics for a course
@router.get("/notes/course/{course_code}/stats", response_model=CourseAverageOut)
def get_course_stats(course_code: str, db: Session = Depends(get_db)):
    notes = db.query(Note).filter(Note.course_code == course_code).all()
    
    if not notes:
        raise HTTPException(status_code=404, detail="No notes found for this course")
    
    note_values = [n.note for n in notes]
    average = sum(note_values) / len(note_values)
    
    return CourseAverageOut(
        course_code=course_code,
        average=round(average, 2),
        total_notes=len(notes),
        min_note=min(note_values),
        max_note=max(note_values)
    )


# =============================================
# GENERIC CRUD ROUTES
# =============================================

# CREATE - using explicit Body parsing for better compatibility
@router.post("/notes", response_model=NoteOut, status_code=201)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    # Check for duplicate (same student, course, type_exam)
    existing = (
        db.query(Note)
        .filter(
            Note.student_id == note.student_id,
            Note.course_code == note.course_code,
            Note.type_exam == note.type_exam,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Note already exists for student {note.student_id} in course {note.course_code} ({note.type_exam})"
        )
    
    # Use dict() for Pydantic v1/v2 compatibility
    note_data = note.model_dump() if hasattr(note, 'model_dump') else note.dict()
    new_note = Note(**note_data)
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note


# READ ALL with filters
@router.get("/notes", response_model=list[NoteOut])
def get_notes(
    student_id: Optional[int] = None,
    course_code: Optional[str] = None,
    type_exam: Optional[str] = None,
    semester: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    q = db.query(Note)
    
    if student_id:
        q = q.filter(Note.student_id == student_id)
    if course_code:
        q = q.filter(Note.course_code == course_code)
    if type_exam:
        q = q.filter(Note.type_exam == type_exam)
    if semester:
        q = q.filter(Note.semester == semester)
    
    # Pagination
    if page < 1:
        page = 1
    if limit < 1:
        limit = 50
    offset = (page - 1) * limit
    
    return q.order_by(Note.created_at.desc()).offset(offset).limit(limit).all()


# READ ONE (must come AFTER /student/ and /course/ routes)
@router.get("/notes/{note_id}", response_model=NoteOut)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


# UPDATE
@router.put("/notes/{note_id}", response_model=NoteOut)
def update_note(note_id: int, data: NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Use dict() for Pydantic v1/v2 compatibility
    update_data = data.model_dump(exclude_unset=True) if hasattr(data, 'model_dump') else data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(note, key, value)
    
    db.commit()
    db.refresh(note)
    return note


# DELETE
@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}
