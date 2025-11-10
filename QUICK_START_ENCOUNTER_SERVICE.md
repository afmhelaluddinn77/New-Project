# Encounter Service - Quick Start Guide

## 🚀 Start Services (One Command)

```bash
cd /Users/helal/New\ Project
docker-compose up -d
```

## ✅ Verify Everything Works

```bash
# Check service status
docker-compose ps encounter-service

# Health check
curl http://localhost:3005/api/health

# View logs
docker-compose logs -f encounter-service
```

## 📚 Access API Documentation

- **Swagger UI:** http://localhost:3005/api/docs
- **Through Kong:** http://localhost:8000/api/encounters

## 🧪 Test API Endpoints

### Create Encounter
```bash
curl -X POST http://localhost:3005/api/encounters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "providerId": "550e8400-e29b-41d4-a716-446655440001",
    "encounterType": "OUTPATIENT",
    "encounterClass": "AMBULATORY",
    "chiefComplaint": "Fever and cough",
    "createdBy": "user-123"
  }'
```

### Get All Encounters
```bash
curl http://localhost:3005/api/encounters \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Patient Encounters
```bash
curl http://localhost:3005/api/encounters/patient/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Key Configuration

### Environment Variables
- **PORT:** 3005
- **DATABASE_URL:** postgresql://clinical:clinical@clinical-db:5432/clinical?schema=encounter
- **JWT_SECRET:** your-super-secret-jwt-key-change-in-production
- **CORS_ORIGIN:** http://localhost:5174,http://localhost:5173

### Docker Compose Service
- **Service Name:** encounter-service
- **Port:** 3005
- **Database:** PostgreSQL (clinical-db)
- **Schema:** encounter

### Kong API Gateway
- **Route:** /api/encounters
- **Backend:** http://localhost:3005
- **Auth:** JWT validation
- **Headers:** X-User-ID, X-User-Role, X-Portal

## 📊 Database Schema

### Tables
- **Encounter** - Main encounter records
- **Investigation** - Lab/radiology investigations
- **Prescription** - Medication prescriptions
- **EncounterNote** - Clinical notes
- **AuditLog** - Audit trail

### Schema Location
- **PostgreSQL Schema:** encounter
- **Database:** clinical

## 🔐 Security

- ✅ JWT Authentication (via Kong + NestJS Guard)
- ✅ Role-Based Access Control
- ✅ Audit Logging (all operations tracked)
- ✅ CORS Configuration
- ✅ Input Validation (class-validator)
- ✅ Non-root Docker User

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/encounters | Create encounter |
| GET | /api/encounters | List encounters |
| GET | /api/encounters/:id | Get encounter |
| GET | /api/encounters/patient/:patientId | Get patient encounters |
| PATCH | /api/encounters/:id | Update encounter |
| DELETE | /api/encounters/:id | Delete encounter |
| POST | /api/encounters/:id/finalize | Finalize encounter |
| GET | /api/health | Health check |

## 🛠️ Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs encounter-service

# Verify database connection
docker-compose logs clinical-db

# Restart service
docker-compose restart encounter-service
```

### Port already in use
```bash
# Kill process on port 3005
lsof -ti:3005 | xargs kill -9

# Restart service
docker-compose up -d encounter-service
```

### Database connection issues
```bash
# Check database status
docker-compose ps clinical-db

# Verify database is healthy
docker-compose logs clinical-db
```

## 📚 Documentation Files

1. **ENCOUNTER_SERVICE_COMPLETE.md** - Comprehensive documentation
2. **TASKS_COMPLETION_SUMMARY.md** - Detailed task completion report
3. **QUICK_START_ENCOUNTER_SERVICE.md** - This file

## ✨ What's Included

✅ **DTOs** - Complete data validation  
✅ **JWT Guards** - Authentication & authorization  
✅ **Audit Interceptor** - Comprehensive logging  
✅ **Multi-stage Dockerfile** - Production-grade build  
✅ **docker-compose.yml** - Service orchestration  
✅ **Kong Configuration** - API Gateway routing  
✅ **Swagger Docs** - API documentation  
✅ **Health Checks** - Service monitoring  

## 🎯 Next Steps

1. Start services: `docker-compose up -d`
2. Verify health: `curl http://localhost:3005/api/health`
3. Access Swagger: http://localhost:3005/api/docs
4. Create encounters using JWT token
5. Monitor logs: `docker-compose logs -f encounter-service`

---

**Status:** ✅ READY FOR DEPLOYMENT

**All Tasks Complete:** June 7, 2025
