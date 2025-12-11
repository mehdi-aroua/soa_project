#!/home/mehdi/Documents/lsi3/SOA/services/student-service/venv/bin/python3
"""
Run student-service on port 8100
Execute: ./run.py or python3 run.py
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8100, reload=True)
