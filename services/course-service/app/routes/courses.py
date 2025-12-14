from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import Course, Enrollment, Schedule
from ..schemas import (
    CourseCreate, CourseUpdate, CourseResponse,
    EnrollmentCreate, EnrollmentResponse,
    ScheduleCreate, ScheduleResponse
)

router = APIRouter(prefix="/courses", tags=["courses"])


# ===== COURSE ENDPOINTS =====

@router.get("", response_model=List[CourseResponse])
def get_all_courses(
    filiere: Optional[str] = None,
    niveau: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all courses with optional filters"""
    query = db.query(Course)
    
    if filiere:
        query = query.filter(Course.filiere == filiere)
    if niveau:
        query = query.filter(Course.niveau == niveau)
    
    return query.all()


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get a specific course by ID"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("", response_model=CourseResponse, status_code=201)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    """Create a new course"""
    # Check if course code already exists
    existing = db.query(Course).filter(Course.code == course.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    db_course = Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(course_id: int, course: CourseUpdate, db: Session = Depends(get_db)):
    """Update a course"""
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Update only provided fields
    update_data = course.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_course, field, value)
    
    db_course.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_course)
    return db_course


@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    """Delete a course"""
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Delete related enrollments and schedules
    db.query(Enrollment).filter(Enrollment.course_id == course_id).delete()
    db.query(Schedule).filter(Schedule.course_id == course_id).delete()
    
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted successfully"}


@router.get("/filiere/{filiere}", response_model=List[CourseResponse])
def get_courses_by_filiere(filiere: str, db: Session = Depends(get_db)):
    """Get all courses for a specific filiere"""
    return db.query(Course).filter(Course.filiere == filiere).all()


# ===== ENROLLMENT ENDPOINTS =====

@router.post("/enroll", response_model=EnrollmentResponse, status_code=201)
def enroll_student(enrollment: EnrollmentCreate, db: Session = Depends(get_db)):
    """Enroll a student in a course"""
    # Check if course exists
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.course_id == enrollment.course_id,
        Enrollment.student_id == enrollment.student_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this course")
    
    db_enrollment = Enrollment(**enrollment.dict())
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment


@router.get("/enrollments/student/{student_id}", response_model=List[EnrollmentResponse])
def get_enrollments_by_student(student_id: int, db: Session = Depends(get_db)):
    """Get all enrollments for a student"""
    return db.query(Enrollment).filter(Enrollment.student_id == student_id).all()


@router.get("/enrollments/course/{course_id}", response_model=List[EnrollmentResponse])
def get_enrollments_by_course(course_id: int, db: Session = Depends(get_db)):
    """Get all enrollments for a course"""
    return db.query(Enrollment).filter(Enrollment.course_id == course_id).all()


@router.delete("/enrollments/{enrollment_id}")
def unenroll_student(enrollment_id: int, db: Session = Depends(get_db)):
    """Remove a student enrollment"""
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    db.delete(enrollment)
    db.commit()
    return {"message": "Student unenrolled successfully"}


# ===== SCHEDULE ENDPOINTS =====

@router.post("/schedules", response_model=ScheduleResponse, status_code=201)
def create_schedule(schedule: ScheduleCreate, db: Session = Depends(get_db)):
    """Create a new schedule for a course"""
    # Check if course exists
    course = db.query(Course).filter(Course.id == schedule.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check for schedule conflicts (same room, same day, overlapping time)
    existing_schedules = db.query(Schedule).filter(
        Schedule.room == schedule.room,
        Schedule.day_of_week == schedule.day_of_week
    ).all()
    
    for existing in existing_schedules:
        if _time_overlap(schedule.start_time, schedule.end_time, 
                        existing.start_time, existing.end_time):
            raise HTTPException(
                status_code=409, 
                detail=f"Schedule conflict with another course in room {schedule.room}"
            )
    
    db_schedule = Schedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule


@router.get("/schedules/course/{course_id}", response_model=List[ScheduleResponse])
def get_schedules_by_course(course_id: int, db: Session = Depends(get_db)):
    """Get all schedules for a course"""
    return db.query(Schedule).filter(Schedule.course_id == course_id).all()


@router.delete("/schedules/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Delete a schedule"""
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    db.delete(schedule)
    db.commit()
    return {"message": "Schedule deleted successfully"}


# ===== HELPER FUNCTIONS =====

def _time_overlap(start1: str, end1: str, start2: str, end2: str) -> bool:
    """Check if two time ranges overlap (HH:MM format)"""
    def to_minutes(time_str: str) -> int:
        h, m = map(int, time_str.split(':'))
        return h * 60 + m
    
    s1 = to_minutes(start1)
    e1 = to_minutes(end1)
    s2 = to_minutes(start2)
    e2 = to_minutes(end2)
    
    return s1 < e2 and s2 < e1
