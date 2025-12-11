from fastapi import FastAPI
from app.database import Base, engine, SessionLocal
from app.models import User
from app.routes import users
import bcrypt

Base.metadata.create_all(bind=engine)

# Seed default users if not exist
def seed_users():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter_by(email="admin@university.com").first()
        if not admin:
            hashed = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
            admin_user = User(
                email="admin@university.com",
                password=hashed.decode('utf-8'),
                full_name="Administrator",
                role="ADMIN"
            )
            db.add(admin_user)
            db.commit()
            print("Seeded admin user: admin@university.com / admin123")

        # Check if teacher exists
        teacher = db.query(User).filter_by(email="teacher@university.com").first()
        if not teacher:
            hashed = bcrypt.hashpw("teacher123".encode('utf-8'), bcrypt.gensalt())
            teacher_user = User(
                email="teacher@university.com",
                password=hashed.decode('utf-8'),
                full_name="Teacher",
                role="ENSEIGNANT"
            )
            db.add(teacher_user)
            db.commit()
            print("Seeded teacher user: teacher@university.com / teacher123")

        # Check if student exists
        student = db.query(User).filter_by(email="student@university.com").first()
        if not student:
            hashed = bcrypt.hashpw("student123".encode('utf-8'), bcrypt.gensalt())
            student_user = User(
                email="student@university.com",
                password=hashed.decode('utf-8'),
                full_name="Student",
                role="ETUDIANT"
            )
            db.add(student_user)
            db.commit()
            print("Seeded student user: student@university.com / student123")
    finally:
        db.close()

seed_users()

app = FastAPI(title="Auth Service - JWT Enabled")

# CORS est géré par l'API Gateway - ne pas ajouter ici pour éviter les doublons

app.include_router(users.router, prefix="/auth", tags=["authentication"])

@app.get("/health")
def health_check():
    return {"status": "Auth Service is running", "version": "1.0.0"}
