from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime

from app.database import SessionLocal
from app.models import Student, AcademicHistory
from app.schemas import (
    StudentCreate,
    StudentOut,
    ProfileUpdate,
    AcademicHistoryCreate,
    AcademicHistoryOut,
)

router = APIRouter(tags=["Students"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CREATE
@router.post("/students", response_model=StudentOut)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    # Uniqueness checks (only among non-deleted)
    exists_email = (
        db.query(Student)
        .filter(and_(Student.email == student.email, Student.deleted_at.is_(None)))
        .first()
    )
    if exists_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    exists_matricule = (
        db.query(Student)
        .filter(and_(Student.matricule == student.matricule, Student.deleted_at.is_(None)))
        .first()
    )
    if exists_matricule:
        raise HTTPException(status_code=400, detail="Matricule already exists")

    new_student = Student(**student.dict())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

# READ ALL with optional filters and pagination
@router.get("/students", response_model=list[StudentOut])
def get_students(
    filiere: str | None = None,
    niveau: str | None = None,
    anneeInscription: int | None = Query(None, alias="annee"),
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    q = db.query(Student).filter(Student.deleted_at.is_(None))
    if filiere:
        q = q.filter(Student.filiere == filiere)
    if niveau:
        q = q.filter(Student.niveau == niveau)
    if anneeInscription is not None:
        q = q.filter(Student.anneeInscription == anneeInscription)

    # pagination
    if page < 1:
        page = 1
    if limit < 1:
        limit = 10
    offset = (page - 1) * limit
    return q.offset(offset).limit(limit).all()


# SEARCH endpoint by q across fullname and matricule
# IMPORTANT: This must come BEFORE /students/{student_id} to avoid route conflicts
@router.get("/students/search", response_model=list[StudentOut])
def search_students(
    q: str = Query(..., min_length=1),
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    base = db.query(Student).filter(Student.deleted_at.is_(None))
    base = base.filter(
        or_(
            Student.fullname.ilike(f"%{q}%"),
            Student.nom.ilike(f"%{q}%"),
            Student.prenom.ilike(f"%{q}%"),
            Student.matricule.ilike(f"%{q}%"),
            Student.email.ilike(f"%{q}%"),
        )
    )
    if page < 1:
        page = 1
    if limit < 1:
        limit = 10
    offset = (page - 1) * limit
    return base.offset(offset).limit(limit).all()

# GET STUDENT BY EMAIL (must come before /students/{student_id})
@router.get("/students/by-email/{email}", response_model=StudentOut)
def get_student_by_email(email: str, db: Session = Depends(get_db)):
    student = (
        db.query(Student)
        .filter(and_(Student.email == email, Student.deleted_at.is_(None)))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

# READ ONE (exclude soft-deleted)
@router.get("/students/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = (
        db.query(Student)
        .filter(and_(Student.id == student_id, Student.deleted_at.is_(None)))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

# UPDATE (exclude soft-deleted) with uniqueness checks
@router.put("/students/{student_id}", response_model=StudentOut)
def update_student(student_id: int, data: StudentCreate, db: Session = Depends(get_db)):
    student = (
        db.query(Student)
        .filter(and_(Student.id == student_id, Student.deleted_at.is_(None)))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Enforce uniqueness for email and matricule among other active records
    other_email = (
        db.query(Student)
        .filter(and_(Student.email == data.email, Student.id != student_id, Student.deleted_at.is_(None)))
        .first()
    )
    if other_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    other_matricule = (
        db.query(Student)
        .filter(and_(Student.matricule == data.matricule, Student.id != student_id, Student.deleted_at.is_(None)))
        .first()
    )
    if other_matricule:
        raise HTTPException(status_code=400, detail="Matricule already exists")

    for key, value in data.dict().items():
        setattr(student, key, value)
    
    db.commit()
    db.refresh(student)
    return student

# SOFT DELETE
@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = (
        db.query(Student)
        .filter(and_(Student.id == student_id, Student.deleted_at.is_(None)))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Student soft-deleted"}


# Profile management endpoints
@router.patch("/students/{student_id}/profile", response_model=StudentOut)
def update_profile(
    student_id: int,
    data: ProfileUpdate,
    db: Session = Depends(get_db),
):
    student = (
        db.query(Student)
        .filter(and_(Student.id == student_id, Student.deleted_at.is_(None)))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # email uniqueness check if updating email
    if data.email:
        exists_email = (
            db.query(Student)
            .filter(and_(Student.email == data.email, Student.id != student_id, Student.deleted_at.is_(None)))
            .first()
        )
        if exists_email:
            raise HTTPException(status_code=400, detail="Email already exists")

    if data.email is not None:
        student.email = data.email
    if data.telephone is not None:
        student.telephone = data.telephone
    if data.adresse is not None:
        student.adresse = data.adresse

    db.commit()
    db.refresh(student)
    return student


# Academic history endpoints
@router.get("/students/{student_id}/history", response_model=list[AcademicHistoryOut])
def list_academic_history(student_id: int, db: Session = Depends(get_db)):
    # ensure student exists
    student = (
        db.query(Student)
        .filter(and_(Student.id == student_id, Student.deleted_at.is_(None)))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return (
        db.query(AcademicHistory)
        .filter(AcademicHistory.student_id == student_id)
        .order_by(AcademicHistory.created_at.desc())
        .all()
    )


@router.post("/students/{student_id}/history", response_model=AcademicHistoryOut, status_code=201)
def add_academic_history(
    student_id: int,
    payload: AcademicHistoryCreate,
    db: Session = Depends(get_db),
):
    student = (
        db.query(Student)
        .filter(and_(Student.id == student_id, Student.deleted_at.is_(None)))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    record = AcademicHistory(
        student_id=student_id,
        annee=payload.annee,
        details=payload.details,
        created_at=datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/students/{student_id}/history/{history_id}")
def delete_academic_history(student_id: int, history_id: int, db: Session = Depends(get_db)):
    student = (
        db.query(Student)
        .filter(and_(Student.id == student_id, Student.deleted_at.is_(None)))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    record = (
        db.query(AcademicHistory)
        .filter(and_(AcademicHistory.id == history_id, AcademicHistory.student_id == student_id))
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="History record not found")

    db.delete(record)
    db.commit()
    return {"message": "History record deleted"}
