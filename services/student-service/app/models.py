from sqlalchemy import Column, Integer, String, Date, DateTime
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String)
    # Added separate name fields to support search by nom/prenom
    nom = Column(String, nullable=True)
    prenom = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    age = Column(Integer)
    matricule = Column(String, unique=True, index=True)
    dateNaissance = Column(Date, nullable=True)
    telephone = Column(String, nullable=True)
    adresse = Column(String, nullable=True)
    filiere = Column(String, nullable=True)
    niveau = Column(String, nullable=True)
    anneeInscription = Column(Integer, nullable=True)
    photo = Column(String, nullable=True)  # store URL
    statut = Column(String, default="ACTIF", index=True)  # ACTIF, SUSPENDU, DIPLOME
    deleted_at = Column(DateTime, nullable=True)


class AcademicHistory(Base):
    __tablename__ = "academic_history"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, index=True)
    # basic academic record info; can be extended (semester, gpa, etc.)
    annee = Column(Integer, nullable=True)
    details = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=True)
