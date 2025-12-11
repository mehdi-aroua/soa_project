#!/bin/bash
# Start all microservices and API Gateway

echo "=== Starting SOA Microservices ==="
echo ""

# Check if dependencies are installed
echo "[1/4] Checking dependencies..."
cd services/auth-service && pip install -q -r requirements.txt 2>/dev/null || echo "⚠️  auth-service dependencies: check manually"
cd ../student-service && pip install -q -r requirements.txt 2>/dev/null || echo "⚠️  student-service dependencies: check manually"
cd ../../

# Start services in background
echo ""
echo "[2/4] Starting Auth Service on port 8001..."
cd services/auth-service
python run.py &
AUTH_PID=$!
cd ../../

echo "[3/4] Starting Student Service on port 8100..."
cd services/student-service
python run.py &
STUDENT_PID=$!
cd ../../

echo "[4/4] Starting API Gateway on port 8080..."
cd services/api-gateway
mvn spring-boot:run &
GATEWAY_PID=$!
cd ../../

echo ""
echo "=== All Services Started ==="
echo "  ✓ Auth Service:    http://localhost:8001"
echo "  ✓ Student Service: http://localhost:8100"
echo "  ✓ API Gateway:     http://localhost:8080"
echo ""
echo "Postman Collection: services/api-gateway/postman-collection.json"
echo ""
echo "To stop all services, run: kill $AUTH_PID $STUDENT_PID $GATEWAY_PID"
