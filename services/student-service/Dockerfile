# Student Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Create data directory for persistent storage
RUN mkdir -p /app/data

ENV STUD_DATABASE_URL=sqlite:///./data/students.db

EXPOSE 8100

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100"]
