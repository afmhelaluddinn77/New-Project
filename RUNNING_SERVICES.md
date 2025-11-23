# EMR System - Running Services Guide

## ✅ Current Status: ALL SERVICES RUNNING

All backend services, frontend portals, and infrastructure components are successfully running!

---

## 🚀 Quick Start Commands

### Start Everything

```bash
./scripts/start-all.sh
```

### Check Status

```bash
./scripts/check-all-services.sh
```

### Stop Services

```bash
# Stop all portals
./scripts/stop-all-portals.sh

# Stop all backend services
./scripts/stop-backend-services.sh

# Stop Docker infrastructure
docker-compose down
```

---

## 📊 Running Services Overview

### Frontend Portals (9 Running)

| Portal              | Port | URL                   | Status     |
| ------------------- | ---- | --------------------- | ---------- |
| Common Portal       | 5172 | http://localhost:5172 | ✅ Running |
| Patient Portal      | 5173 | http://localhost:5173 | ✅ Running |
| Provider Portal     | 5174 | http://localhost:5174 | ✅ Running |
| Admin Portal        | 5175 | http://localhost:5175 | ✅ Running |
| Lab Portal          | 5176 | http://localhost:5176 | ✅ Running |
| Pharmacy Portal     | 5177 | http://localhost:5177 | ✅ Running |
| Billing Portal      | 5178 | http://localhost:5178 | ✅ Running |
| Radiology Portal    | 5179 | http://localhost:5179 | ✅ Running |
| Common Portal (Alt) | 5180 | http://localhost:5180 | ✅ Running |

### Backend Services (9 Running)

| Service           | Port | URL                   | Status     |
| ----------------- | ---- | --------------------- | ---------- |
| Authentication    | 3001 | http://localhost:3001 | ✅ Running |
| Patient           | 3011 | http://localhost:3011 | ✅ Running |
| Encounter         | 3005 | http://localhost:3005 | ✅ Running |
| Clinical Workflow | 3004 | http://localhost:3004 | ✅ Running |
| Lab               | 3013 | http://localhost:3013 | ✅ Running |
| Pharmacy          | 3012 | http://localhost:3012 | ✅ Running |
| Radiology         | 3014 | http://localhost:3014 | ✅ Running |
| Aggregation       | 3020 | http://localhost:3020 | ✅ Running |
| Notification      | 3021 | http://localhost:3021 | ✅ Running |

### Infrastructure (6 Running)

| Component     | Port | URL                   | Status     |
| ------------- | ---- | --------------------- | ---------- |
| Kong Gateway  | 8000 | http://localhost:8000 | ✅ Running |
| Kong Admin    | 8001 | http://localhost:8001 | ✅ Running |
| PostgreSQL    | 5433 | localhost:5433        | ✅ Running |
| NATS          | 4222 | localhost:4222        | ✅ Running |
| MinIO S3      | 9000 | http://localhost:9000 | ✅ Running |
| MinIO Console | 9001 | http://localhost:9001 | ✅ Running |

---

## 📝 Logs Location

All service logs are stored in `/tmp/`:

- Backend services: `/tmp/*-service.log`
- Frontend portals: `/tmp/*-portal.log`

### View Logs

```bash
# View authentication service logs
tail -f /tmp/auth-service.log

# View provider portal logs
tail -f /tmp/provider-portal.log

# View all service logs
tail -f /tmp/*-service.log

# View all portal logs
tail -f /tmp/*-portal.log
```

---

## 🔧 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using a port
lsof -i :5174

# Kill a specific port
kill -9 $(lsof -ti:5174)
```

### Service Won't Start

1. Check the logs: `tail -50 /tmp/[service-name].log`
2. Ensure Docker infrastructure is running: `docker-compose ps`
3. Restart the specific service manually

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps clinical-db

# Restart PostgreSQL
docker-compose restart clinical-db
```

---

## 🎯 Development Workflow

### Working on a Specific Portal

```bash
# Stop all portals
./scripts/stop-all-portals.sh

# Start just the one you need
cd provider-portal
npm run dev
```

### Working on a Specific Service

```bash
# Stop all services
./scripts/stop-backend-services.sh

# Start just the one you need
cd services/authentication-service
npm run start:dev
```

### Full System Development

```bash
# Start everything
./scripts/start-all.sh

# Check status
./scripts/check-all-services.sh

# Work on your code (services auto-reload with --watch)

# Check logs as needed
tail -f /tmp/[service-name].log
```

---

## 📦 Total Running Processes

- **Frontend Portals**: 9
- **Backend Services**: 9
- **Infrastructure**: 6 (Docker containers)
- **Total**: 24 processes

---

## 🔐 Security Notes

- All services are running in development mode
- JWT authentication is enabled on backend services
- Kong Gateway provides API gateway functionality
- CORS is configured for local development
- PHI data masking is implemented in logging

---

## 🌐 Key Entry Points

### For Providers

- **Provider Portal**: http://localhost:5174
- Use this for patient encounters, prescriptions, orders

### For Patients

- **Patient Portal**: http://localhost:5173
- View medical records, appointments, test results

### For Lab Technicians

- **Lab Portal**: http://localhost:5176
- Process lab orders, upload results

### For Pharmacists

- **Pharmacy Portal**: http://localhost:5177
- Verify prescriptions, check interactions, dispense medications

### For Billing Staff

- **Billing Portal**: http://localhost:5178
- Manage claims, payments, denials

### For Radiologists

- **Radiology Portal**: http://localhost:5179
- View imaging orders, upload reports

### For Administrators

- **Admin Portal**: http://localhost:5175
- System administration, user management

---

## 📚 Additional Resources

- **API Documentation**: Check individual service README files
- **Architecture**: See `docs/` directory
- **Development Laws**: `DEVELOPMENT_LAW.md`, `FEATURE_IMPLEMENTATION_LAW.md`
- **Security**: `SECURITY.md`

---

**Last Updated**: November 23, 2025, 4:15 PM
**Status**: All systems operational ✅
