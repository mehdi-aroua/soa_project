from fastapi import FastAPI
from app.database import Base, engine, SessionLocal
from app.routes import courses
from app.models import Course

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed initial data
db = SessionLocal()
try:
    if db.query(Course).count() == 0:
        # Add sample courses
        sample_courses = [
            Course(code="CS101", name="Mathématiques", description="Analyse 1", 
                   credits=6, hours=60, filiere="SCI", niveau="L1", 
                   enseignant_id=1001, salle="A101"),
            Course(code="CS201", name="Programmation Java", description="POO et Collections", 
                   credits=5, hours=45, filiere="INFO", niveau="L2", 
                   enseignant_id=1002, salle="B202"),
            Course(code="CS301", name="Bases de Données", description="SQL et modélisation", 
                   credits=5, hours=45, filiere="INFO", niveau="L3", 
                   enseignant_id=1003, salle="C303"),
        ]
        db.add_all(sample_courses)
        db.commit()
        print("✅ Seeded initial courses")
except Exception as e:
    print(f"⚠️ Seed error: {e}")
    db.rollback()
finally:
    db.close()

app = FastAPI(
    title="Course Service",
    description="Service REST pour la gestion des cours, inscriptions et horaires",
    version="1.0.0"
)

app.include_router(courses.router)


@app.get("/health")
def health_check():
    return {"status": "Course Service is running", "version": "1.0.0"}
