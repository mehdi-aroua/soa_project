"""
Seed script to populate the course database with initial data
Run this after the service starts for the first time
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Course, Base

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if data already exists
        existing_count = db.query(Course).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} courses. Skipping seed.")
            return
        
        # Sample courses
        courses = [
            Course(
                code="CS101",
                name="Mathématiques",
                description="Analyse 1",
                credits=6,
                hours=60,
                filiere="SCI",
                niveau="L1",
                enseignant_id=1001,
                salle="A101"
            ),
            Course(
                code="CS201",
                name="Programmation Java",
                description="POO et Collections",
                credits=5,
                hours=45,
                filiere="INFO",
                niveau="L2",
                enseignant_id=1002,
                salle="B202"
            ),
            Course(
                code="CS301",
                name="Bases de Données",
                description="SQL et modélisation",
                credits=5,
                hours=45,
                filiere="INFO",
                niveau="L3",
                enseignant_id=1003,
                salle="C303"
            ),
            Course(
                code="SCI101",
                name="Physique Générale",
                description="Mécanique et thermodynamique",
                credits=6,
                hours=60,
                filiere="SCI",
                niveau="L1",
                enseignant_id=1004,
                salle="D101"
            ),
        ]
        
        db.add_all(courses)
        db.commit()
        print(f"Successfully seeded {len(courses)} courses!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
