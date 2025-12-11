# Auth Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY app ./app

# Create data directory for persistent storage
RUN mkdir -p /app/data

# Environment
ENV AUTH_DATABASE_URL=sqlite:///./data/auth.db \
    AUTH_JWT_SECRET=dev_secret \
    AUTH_ACCESS_EXPIRE_MINUTES=15 \
    AUTH_REFRESH_EXPIRE_DAYS=7

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
