# Lab Event-Driven Flow - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Lab Service Configuration

- [x] Event publisher module created (`src/events/events.module.ts`)
- [x] Event publisher service created (`src/events/lab-event.publisher.ts`)
- [x] Lab orders service integrated with event publisher
- [x] Lab orders module imports EventsModule
- [x] App module imports EventsModule
- [x] `package.json` includes dependencies:
  - [x] `@emr-hms/events`
  - [x] `@nestjs/microservices`
  - [x] `nats`
  - [x] `uuid`
- [x] `.env` includes `NATS_URL=nats://localhost:4222`
- [x] Dependencies installed (`npm install`)

### 2. Aggregation Service Configuration

- [x] Lab event handler updated with all event patterns
- [x] Handles `lab.order.created`
- [x] Handles `lab.result.available`
- [x] Handles `lab.critical.alert`
- [x] Handles `lab.result.viewed`
- [x] Error handling implemented
- [x] Logging with severity levels
- [x] Idempotency checks in place
- [x] Dependencies verified (`npm install`)

### 3. Notification Service Configuration

- [x] Lab notification handler updated
- [x] Handles `lab.order.created`
- [x] Handles `lab.result.available`
- [x] Handles `lab.critical.alert`
- [x] WebSocket gateway configured
- [x] JWT authentication implemented
- [x] CORS configured for frontend portals
- [x] Dependencies verified (`npm install`)

### 4. Provider Portal Configuration

- [x] Notification hook created (`src/hooks/useNotifications.ts`)
- [x] Notification panel component created (`src/components/NotificationPanel.tsx`)
- [x] Socket.io-client dependency installed
- [x] WebSocket connection with JWT auth
- [x] Browser notification permission handling
- [x] Audio alerts implemented
- [x] Critical alert UI component

### 5. Infrastructure Configuration

- [x] NATS container in `docker-compose.yml`
- [x] NATS health check configured
- [x] NATS ports exposed (4222, 8222, 6222)
- [x] NATS volume for persistence
- [x] PostgreSQL aggregation schema configured

### 6. Documentation

- [x] Complete architecture guide (`LAB_EVENT_FLOW_COMPLETE.md`)
- [x] Quick start guide (`LAB_EVENT_QUICK_START.md`)
- [x] Implementation summary (`LAB_EVENT_IMPLEMENTATION_SUMMARY.md`)
- [x] Visual architecture diagram (`LAB_EVENT_ARCHITECTURE_DIAGRAM.md`)
- [x] This deployment checklist

### 7. Testing

- [x] Integration test created (`test/lab-events.e2e-spec.ts`)
- [x] Manual testing steps documented
- [x] Event flow verification steps documented

## 🚀 Deployment Steps

### Step 1: Start Infrastructure (5 minutes)

```bash
# From project root
cd "/Users/helal/New Project"

# Start NATS and PostgreSQL
docker-compose up -d nats clinical-db

# Verify NATS is running
curl http://localhost:8222/healthz
# Expected: ok

# Verify PostgreSQL is running
docker-compose ps
# Expected: clinical-db healthy
```

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

### Step 2: Start Backend Services (5 minutes)

```bash
# Terminal 1 - Lab Service
cd services/lab-service
npm run start:dev

# Terminal 2 - Aggregation Service
cd services/aggregation-service
npm run start:dev

# Terminal 3 - Notification Service
cd services/notification-service
npm run start:dev
```

**Verification:**

- [ ] Lab Service console shows: `Lab Service running on port 3013`
- [ ] Aggregation Service console shows: `Connected to NATS event bus`
- [ ] Notification Service console shows: `WebSocket Gateway ready`

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

### Step 3: Start Frontend (2 minutes)

```bash
# Terminal 4 - Provider Portal
cd provider-portal
npm run dev
```

**Verification:**

- [ ] Browser opens at http://localhost:5174
- [ ] Can login successfully
- [ ] WebSocket connects (green indicator in notification bell)

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

### Step 4: Test Normal Lab Result (5 minutes)

```bash
# Get auth token from browser localStorage
TOKEN=$(node -e "console.log(localStorage.getItem('access_token'))")

# Submit normal result
curl -X POST http://localhost:3013/api/lab/orders/ORDER_ID/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "testId": "test-normal-001",
    "value": "95",
    "unit": "mg/dL",
    "referenceRange": "70-100",
    "abnormalFlag": "NORMAL"
  }'
```

**Expected Results:**

- [ ] Lab Service logs: `📤 Published lab.result.available event`
- [ ] Aggregation Service logs: `✅ Created lab result view`
- [ ] Notification Service logs: `✅ Sent lab result notification`
- [ ] Frontend: Notification bell badge +1
- [ ] Frontend: "Lab Results Available" notification appears
- [ ] Browser notification displays

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

### Step 5: Test Critical Lab Result (5 minutes)

```bash
# Submit critical result
curl -X POST http://localhost:3013/api/lab/orders/ORDER_ID/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "testId": "test-critical-001",
    "value": "7.5",
    "unit": "mmol/L",
    "referenceRange": "3.5-5.0",
    "abnormalFlag": "CRITICAL",
    "comment": "Severe hyperkalemia - immediate intervention required"
  }'
```

**Expected Results:**

- [ ] Lab Service logs: `🚨 Published lab.critical.alert event`
- [ ] Aggregation Service logs: `🚨 Received CRITICAL event`
- [ ] Notification Service logs: `✅ Sent CRITICAL lab alert`
- [ ] Frontend: Critical alert with red background appears
- [ ] Frontend: Urgent sound plays
- [ ] Browser notification: "🚨 CRITICAL LAB VALUE"
- [ ] Alert shows test name, value, unit, reference range

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

### Step 6: Verify Data Persistence (5 minutes)

```bash
# Connect to database
docker exec -it clinical-db psql -U clinical -d clinical

# Check lab result views
SET search_path TO aggregation;
SELECT * FROM "LabResultView" ORDER BY "resultDate" DESC LIMIT 5;

# Check patient aggregate
SELECT * FROM "PatientAggregateView" WHERE "unreadResults" > 0;

# Check HIPAA audit log
SELECT * FROM "AuditLog"
WHERE "action" = 'VIEW_LAB_RESULT'
ORDER BY "createdAt" DESC
LIMIT 10;
```

**Expected Results:**

- [ ] Lab result views created
- [ ] Patient aggregate counters updated
- [ ] Audit log entries present

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

## 🔍 Monitoring & Troubleshooting

### NATS Monitoring

```bash
# Check NATS server status
curl http://localhost:8222/varz | jq

# Check connections
curl http://localhost:8222/connz | jq

# Check subscriptions
curl http://localhost:8222/subsz | jq
```

**Key Metrics:**

- [ ] `connections > 0` (services connected)
- [ ] `subscriptions > 0` (consumers active)
- [ ] `in_msgs > 0` (messages received)
- [ ] `out_msgs > 0` (messages delivered)

### Service Health Checks

```bash
# Lab Service
curl http://localhost:3013/api/health

# Aggregation Service
curl http://localhost:3020/health

# Notification Service
curl http://localhost:3021/health
```

**Expected:** All return `{ "status": "ok" }` or similar

### WebSocket Connection Test

```javascript
// In browser console (provider portal)

// Check connection status
const socket = io.sockets[0];
console.log("Connected:", socket.connected);
console.log("User ID:", socket.auth.token);

// Manually trigger test notification
socket.emit("test_notification");
```

## 🐛 Common Issues & Solutions

### Issue: WebSocket Not Connecting

**Symptoms:**

- Frontend shows disconnected indicator
- No notifications received

**Solutions:**

1. Check notification service is running: `curl http://localhost:3021`
2. Verify JWT token in localStorage: `localStorage.getItem('access_token')`
3. Check CORS configuration in `notification-service/src/main.ts`
4. Check browser console for errors

### Issue: Events Not Being Processed

**Symptoms:**

- Lab service publishes but consumers don't receive
- No logs in aggregation/notification services

**Solutions:**

1. Verify NATS is running: `curl http://localhost:8222/healthz`
2. Check NATS_URL in service .env files
3. Verify queue groups match in main.ts files
4. Restart NATS: `docker-compose restart nats`

### Issue: No Browser Notifications

**Symptoms:**

- Notifications appear in panel but not as browser notifications

**Solutions:**

1. Request permission: `Notification.requestPermission()`
2. Check permission: `Notification.permission` (should be "granted")
3. Test manually: `new Notification("Test", { body: "Test" })`

### Issue: Database Connection Errors

**Symptoms:**

- Services fail to start
- "Cannot connect to database" errors

**Solutions:**

1. Verify PostgreSQL is running: `docker-compose ps clinical-db`
2. Check DATABASE_URL in service .env files
3. Run migrations: `npx prisma migrate dev`
4. Check schema exists: `\dn` in psql

## 📊 Performance Verification

### Expected Latencies

```
Event Publishing:        < 10ms  (Lab Service to NATS)
Event Distribution:      < 5ms   (NATS to consumers)
Database Write:          < 20ms  (Aggregation Service)
WebSocket Delivery:      < 5ms   (Notification Service to frontend)
Total End-to-End:        < 50ms  (Submit to notification display)
```

**Measure Actual Latency:**

```bash
# In browser console, measure end-to-end time
const start = Date.now();
// Submit lab result via UI
// When notification appears:
console.log('Latency:', Date.now() - start, 'ms');
```

### Expected Throughput

```
Events per second:       1000+   (per service instance)
Concurrent WebSocket:    1000+   (per notification service instance)
Database writes:         500+    (per aggregation service instance)
```

## ✅ Sign-Off Checklist

### Development Team

- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Dependencies verified
- [ ] Security reviewed (HIPAA, FHIR)

### QA Team

- [ ] Manual testing complete
- [ ] Integration testing complete
- [ ] Performance testing complete
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness verified

### DevOps Team

- [ ] Infrastructure configured
- [ ] Monitoring setup
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Disaster recovery plan reviewed

### Product Owner

- [ ] User acceptance testing complete
- [ ] Documentation approved
- [ ] Training materials prepared
- [ ] Go-live date confirmed

## 🎉 Deployment Complete

Once all checklist items are ✅, the Lab Event-Driven Flow is ready for production!

**Congratulations! You've successfully implemented a production-ready event-driven architecture with real-time notifications!** 🚀

---

**Deployment Date:** ******\_******
**Deployed By:** ******\_******
**Version:** 1.0.0
**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete
