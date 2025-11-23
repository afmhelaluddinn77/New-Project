# 🚀 EMR System - Quick Start Guide

## ✅ System Status: ALL SERVICES RUNNING

**24 processes running successfully:**

- 9 Frontend Portals
- 9 Backend Services
- 6 Infrastructure Components

---

## 🎯 One-Command Start

```bash
npm run start:all
```

This single command starts:

- Docker infrastructure (PostgreSQL, Kong, NATS, MinIO)
- All 9 backend microservices
- All 9 frontend portals

---

## 📊 Check Status Anytime

```bash
npm run status
```

---

## 🌐 Access Your Portals

| Portal        | URL                   | Purpose                                   | Login                   |
| ------------- | --------------------- | ----------------------------------------- | ----------------------- |
| **Provider**  | http://localhost:5174 | Patient encounters, prescriptions, orders | provider@example.com    |
| **Patient**   | http://localhost:5173 | View medical records, appointments        | TBD                     |
| **Admin**     | http://localhost:5175 | System administration                     | TBD                     |
| **Lab**       | http://localhost:5176 | Process lab orders, upload results        | labtech@example.com     |
| **Pharmacy**  | http://localhost:5177 | Verify prescriptions, dispense meds       | pharmacist@example.com  |
| **Billing**   | http://localhost:5178 | Claims, payments, denials                 | TBD                     |
| **Radiology** | http://localhost:5179 | Imaging orders, reports                   | radiologist@example.com |
| **Common**    | http://localhost:5172 | Shared components                         | N/A                     |

**Default Password for all users**: `password123`

📋 **See [CREDENTIALS.md](CREDENTIALS.md) for complete login details**

---

## 🛠️ Useful Commands

```bash
# Start everything
npm run start:all

# Check what's running
npm run status

# Stop portals only
npm run stop:portals

# Stop backend services only
npm run stop:backend

# Stop Docker infrastructure
docker-compose down

# View logs
tail -f /tmp/provider-portal.log
tail -f /tmp/auth-service.log
```

---

## 🔧 Individual Development

### Work on a Single Portal

```bash
# Stop all portals first
npm run stop:portals

# Start just the one you need
npm run dev:provider
# or
cd provider-portal && npm run dev
```

### Work on a Single Service

```bash
# Stop all services first
npm run stop:backend

# Start just the one you need
npm run dev:auth
# or
cd services/authentication-service && npm run start:dev
```

---

## 📝 Log Locations

All logs are in `/tmp/`:

- **Services**: `/tmp/*-service.log`
- **Portals**: `/tmp/*-portal.log`

```bash
# View all service logs
tail -f /tmp/*-service.log

# View specific portal
tail -f /tmp/provider-portal.log
```

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find what's using a port
lsof -i :5174

# Kill it
kill -9 $(lsof -ti:5174)
```

### Service Won't Start

1. Check logs: `tail -50 /tmp/[service-name].log`
2. Verify Docker: `docker-compose ps`
3. Restart: `npm run start:all`

### Database Issues

```bash
# Check PostgreSQL
docker-compose ps clinical-db

# Restart it
docker-compose restart clinical-db
```

---

## 📦 What's Running

### Backend Services (Port Range: 3000-3021)

- Authentication (3001)
- Patient (3011)
- Encounter (3005)
- Clinical Workflow (3004)
- Lab (3013)
- Pharmacy (3012)
- Radiology (3014)
- Aggregation (3020)
- Notification (3021)

### Frontend Portals (Port Range: 5172-5180)

- Common (5172)
- Patient (5173)
- Provider (5174)
- Admin (5175)
- Lab (5176)
- Pharmacy (5177)
- Billing (5178)
- Radiology (5179)

### Infrastructure

- Kong Gateway (8000)
- Kong Admin (8001)
- PostgreSQL (5433)
- NATS (4222)
- MinIO S3 (9000)
- MinIO Console (9001)

---

## 🎓 Next Steps

1. **Open Provider Portal**: http://localhost:5174
2. **Check API Gateway**: http://localhost:8000
3. **View MinIO Console**: http://localhost:9001 (admin/minio123456)
4. **Read Full Docs**: See `RUNNING_SERVICES.md`

---

## 🔐 Security Notes

- All services run in development mode
- JWT authentication enabled
- Kong Gateway provides API routing
- CORS configured for localhost
- PHI masking in logs

---

## 📚 More Information

- **Full Service Guide**: `RUNNING_SERVICES.md`
- **Development Laws**: `DEVELOPMENT_LAW.md`
- **Feature Implementation**: `FEATURE_IMPLEMENTATION_LAW.md`
- **Architecture**: `docs/` directory

---

**Status**: ✅ All 24 processes running
**Last Updated**: November 23, 2025, 4:15 PM
