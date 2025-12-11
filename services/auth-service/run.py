#!/home/mehdi/Documents/lsi3/SOA/services/auth-service/venv/bin/python3
"""
Run auth-service on port 8001
Execute: ./run.py or python3 run.py
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
