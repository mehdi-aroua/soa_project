# SOA Microservices - Setup & Test Guide

## Architecture Overview
```
┌─────────────────────────────────────────────────────┐
│           API Gateway (Spring Boot)                 │
│              Port: 8080                             │
├──────────┬──────────────────┬──────────────────────┤
│          │                  │                      │
v          v                  v                      v
Auth      Student           Course                   
Service   Service           Service                  
Port 8000 Port 8100        Port 8200                
(FastAPI) (FastAPI)        (Java)                   
```

## Setup Instructions

### 1. Install Dependencies

**Auth Service:**
```bash
cd services/auth-service
pip install -r requirements.txt
```

**Student Service:**
```bash
cd services/student-service
pip install -r requirements.txt
```

**API Gateway (Spring Boot):**
```bash
cd services/api-gateway
# Already configured with Maven pom.xml
```

### 2. Start Services (in separate terminals or background)

**Terminal 1 - Auth Service (port 8000):**
```bash
cd services/auth-service
python run.py
```

**Terminal 2 - Student Service (port 8100):**
```bash
cd services/student-service
python run.py
```

**Terminal 3 - API Gateway (port 8080):**
```bash
cd services/api-gateway
mvn spring-boot:run
```

Or use the automated script:
```bash
chmod +x start-services.sh
./start-services.sh
```

### 3. Verify Services Are Running

```bash
# Check Auth Service
curl http://localhost:8000/docs

# Check Student Service
curl http://localhost:8100/docs

# Check Gateway (should return 404 if gateway running)
curl http://localhost:8080/auth/users
```

## Testing with Postman

### Option A: Import Collection
1. Open Postman
2. Click **Import** → select `services/api-gateway/postman-collection.json`
3. Run requests from the collection

### Option B: Test Manually

#### Via API Gateway (Recommended for Production)

**1. Register User (Auth Service)**
```
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User"
}
```

**2. Login**
```
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**3. Get All Users**
```
GET http://localhost:8080/auth/users
```

**4. Get All Students**
```
GET http://localhost:8080/students
```

**5. Create Student**
```
POST http://localhost:8080/students
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "matricule": "2024001"
}
```

**6. Get Student by ID**
```
GET http://localhost:8080/students/1
```

#### Direct Service Access (for debugging)

**Auth Service directly (port 8000):**
```
GET http://localhost:8000/users
POST http://localhost:8000/register
POST http://localhost:8000/login
```

**Student Service directly (port 8100):**
```
GET http://localhost:8100/
POST http://localhost:8100/
```

## Gateway Configuration Details

The Spring Boot Gateway (`application.yml`) is configured with:

- **Route Stripping**: Removes path prefix before forwarding to microservices
  - `/auth/**` → `http://localhost:8000/**`
  - `/students/**` → `http://localhost:8100/**`
  - `/courses/**` → `http://localhost:8200/**`

- **CORS Support**: Allows requests from any origin
- **Global Filters**: Applied to all routes

## Troubleshooting

**Port already in use:**
```bash
# Find process using port 8080, 8000, 8100
lsof -i :8080
lsof -i :8000
lsof -i :8100

# Kill process
kill -9 <PID>
```

**Gateway not forwarding requests:**
- Ensure all microservices are running on correct ports
- Check logs in each service terminal
- Verify `application.yml` routes are correct

**CORS Issues:**
- Gateway has global CORS enabled for all origins
- Each service may need CORS headers (add if needed)

**Database issues:**
- Auth service creates `auth.db` automatically
- Student service creates `students.db` automatically
- Delete `.db` files to reset data

## Files Changed

1. **API Gateway**
   - `src/main/resources/application.yml` - Updated routes with StripPrefix and CORS

2. **Auth Service**
   - `run.py` (new) - Startup script for port 8000

3. **Student Service**
   - `run.py` (new) - Startup script for port 8100

4. **Postman Collection**
   - `postman-collection.json` (new) - Ready-to-import test collection

## Next Steps

1. Test all endpoints via Postman
2. Verify data flows correctly through gateway
3. Add course-service integration (currently listening on 8200)
4. Consider adding service discovery (Eureka) for dynamic registration
5. Add authentication token validation in gateway filters
