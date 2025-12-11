from fastapi import FastAPI
from app.database import Base, engine
from app.routes import students

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Service")

app.include_router(students.router)
