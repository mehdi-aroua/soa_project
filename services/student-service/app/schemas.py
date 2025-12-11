from typing import Optional
from datetime import date
from pydantic import BaseModel, EmailStr


class StudentBase(BaseModel):
    fullname: str
    # Optional split name fields for finer search
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: EmailStr
    age: int
    matricule: str
    dateNaissance: Optional[date] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    filiere: Optional[str] = None
    niveau: Optional[str] = None
    anneeInscription: Optional[int] = None
    photo: Optional[str] = None
    statut: Optional[str] = "ACTIF"  # ACTIF, SUSPENDU, DIPLOME


class StudentCreate(StudentBase):
    pass


class StudentOut(StudentBase):
    id: int

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None


class AcademicHistoryCreate(BaseModel):
    annee: Optional[int] = None
    details: Optional[str] = None


class AcademicHistoryOut(AcademicHistoryCreate):
    id: int
    student_id: int

    class Config:
        from_attributes = True
