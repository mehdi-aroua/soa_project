from fastapi import FastAPI
from app.database import Base, engine
from app.routes import notes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Note Service",
    description="Service REST pour la gestion des notes d'examen",
    version="1.0.0"
)

app.include_router(notes.router)


@app.get("/health")
def health_check():
    return {"status": "Note Service is running", "version": "1.0.0"}
