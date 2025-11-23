# Lab Event-Driven Flow - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites

- Docker and Docker Compose running
- Node.js 18+ installed
- All services built (`npm install` in each service directory)

### Step 1: Install Dependencies

```bash
# Lab Service - Add event publishing
cd services/lab-service
npm install @emr-hms/events@file:../../common/events @nestjs/microservices nats uuid
npm install -D @types/uuid

# Aggregation Service (already configured)
cd ../aggregation-service
npm install  # Verify dependencies

# Notification Service (already configured)
cd ../notification-service
npm install  # Verify dependencies

# Provider Portal (socket.io-client already installed)
cd ../../provider-portal
npm install  # Verify dependencies
```

### Step 2: Start Infrastructure

```bash
# From project root
docker-compose up -d nats clinical-db
```

**Verify NATS is running:**

```bash
curl http://localhost:8222/healthz
# Should return: ok
```

### Step 3: Start Services

**Terminal 1 - Lab Service:**

```bash
cd services/lab-service
npm run start:dev
# Should see: Lab Service running on port 3013
```

**Terminal 2 - Aggregation Service:**

```bash
cd services/aggregation-service
npm run start:dev
# Should see:
# - Aggregation Service running on port 3020
# - Connected to NATS event bus
```

**Terminal 3 - Notification Service:**

```bash
cd services/notification-service
npm run start:dev
# Should see:
# - Notification Service running on port 3021
# - WebSocket Gateway ready for connections
# - Connected to NATS event bus
```

**Terminal 4 - Provider Portal:**

```bash
cd provider-portal
npm run dev
# Should see: Local: http://localhost:5174
```

### Step 4: Test the Flow

#### 4.1 Login to Provider Portal

1. Open http://localhost:5174
2. Login as a provider
3. The notification hook will automatically connect to WebSocket

**Browser Console should show:**

```
✅ Connected to notification service
📡 WebSocket authenticated: { userId: "provider-123" }
```

#### 4.2 Submit a Lab Result

**Option A: Using cURL**

```bash
# Get your auth token from browser localStorage
TOKEN="your-jwt-token-here"

# Submit normal result
curl -X POST http://localhost:3013/api/lab/orders/ORDER_ID/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "testId": "test-abc-123",
    "value": "95",
    "unit": "mg/dL",
    "referenceRange": "70-100",
    "abnormalFlag": "NORMAL"
  }'
```

**Option B: Using Lab Portal** (if available)

1. Open http://localhost:5176
2. Find pending lab order
3. Enter test results
4. Click "Submit Result"

#### 4.3 Submit Critical Result

```bash
curl -X POST http://localhost:3013/api/lab/orders/ORDER_ID/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "testId": "test-xyz-456",
    "value": "7.5",
    "unit": "mmol/L",
    "referenceRange": "3.5-5.0",
    "abnormalFlag": "CRITICAL",
    "comment": "Severe hyperkalemia - immediate intervention required"
  }'
```

### Step 5: Observe the Flow

#### Lab Service Console

```
📤 Published lab.result.available event for report report-abc (critical: false)
```

Or for critical:

```
📤 Published lab.result.available event for report report-xyz (critical: true)
🚨 Published lab.critical.alert event for patient patient-123
```

#### Aggregation Service Console

```
📥 Received event: lab.result.available for report report-abc
✅ Created lab result view and updated patient aggregate (unread: 1, critical: 0)
```

Or for critical:

```
🚨 Received CRITICAL event: lab.critical.alert for patient patient-123
✅ Updated lab result view with critical alert: Potassium = 7.5 mmol/L
```

#### Notification Service Console

```
📥 Received event: lab.result.available for patient patient-123
✅ Sent lab result notification to provider provider-789 (critical: false)
```

Or for critical:

```
🚨 Received CRITICAL event: lab.critical.alert for patient patient-123
✅ Sent CRITICAL lab alert to provider provider-789: Potassium = 7.5 mmol/L
```

#### Provider Portal (Browser)

**For Normal Result:**

- 🔔 Notification bell badge updates (+1)
- 📥 "New lab results are ready for review" notification appears
- 🔊 Soft notification sound plays

**For Critical Result:**

- 🔔 Notification bell badge updates with red indicator
- 🚨 Critical alert appears at top with red background
- 🔊 Urgent alert sound plays
- 💬 Browser notification: "🚨 CRITICAL LAB VALUE"
- Alert shows: Test name, value, unit, reference range

### Step 6: Verify Data Persistence

```bash
# Connect to database
docker exec -it clinical-db psql -U clinical -d clinical

# Check aggregation read models
\c clinical
SET search_path TO aggregation;

-- View lab results
SELECT * FROM "LabResultView" ORDER BY "resultDate" DESC LIMIT 5;

-- View patient aggregate
SELECT * FROM "PatientAggregateView" WHERE "unreadResults" > 0;

-- View HIPAA audit log
SELECT * FROM "AuditLog"
WHERE "action" = 'VIEW_LAB_RESULT'
ORDER BY "createdAt" DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### WebSocket Not Connecting

**Problem:** Frontend shows "Disconnected" indicator

**Solution:**

```bash
# 1. Verify notification service is running
curl http://localhost:3021

# 2. Check browser console for errors
# 3. Verify JWT token in localStorage
localStorage.getItem('access_token')

# 4. Check CORS configuration in notification service
# File: services/notification-service/src/main.ts
```

### Events Not Being Received

**Problem:** Lab service publishes but aggregation/notification services don't receive

**Solution:**

```bash
# 1. Verify NATS is running
curl http://localhost:8222/varz

# 2. Check service logs for NATS connection errors
# 3. Verify NATS_URL in .env files
echo $NATS_URL  # Should be: nats://localhost:4222

# 4. Restart services
docker-compose restart nats
```

### No Browser Notifications

**Problem:** Notifications appear in panel but not as browser notifications

**Solution:**

```javascript
// 1. Request notification permission (in browser console)
Notification.requestPermission();

// 2. Verify permission granted
Notification.permission; // Should return: "granted"

// 3. Test notification
new Notification("Test", { body: "Test message" });
```

## 📊 Monitoring

### NATS Monitoring Dashboard

Open http://localhost:8222/streaming

**Key Metrics:**

- Connected clients
- Message throughput
- Queue depth
- Consumer lag

### Service Health Checks

```bash
# Lab Service
curl http://localhost:3013/api/health

# Aggregation Service
curl http://localhost:3020/health

# Notification Service
curl http://localhost:3021/health
```

## 🎯 Success Criteria

✅ All services running without errors
✅ NATS connected (green indicator in logs)
✅ WebSocket connected (green indicator in UI)
✅ Lab result submission triggers events
✅ Notifications appear in real-time
✅ Critical alerts show prominently
✅ Browser notifications work
✅ Audio alerts play
✅ Data persisted in aggregation database
✅ HIPAA audit logs created

## 🎉 Next Steps

Once the basic flow is working:

1. **Add More Event Types:**
   - Order cancelled
   - Result corrected
   - Specimen rejected

2. **Enhance UI:**
   - Add notification preferences
   - Implement "mark as read"
   - Add notification history

3. **Add More Subscribers:**
   - Patient portal notifications
   - SMS/Email alerts
   - Analytics dashboard

4. **Performance Testing:**
   - Load test with k6
   - Measure end-to-end latency
   - Test concurrent users

## 📚 Documentation

- [LAB_EVENT_FLOW_COMPLETE.md](./LAB_EVENT_FLOW_COMPLETE.md) - Detailed architecture
- [CURSOR_SYSTEM_PROMPT.md](./CURSOR_SYSTEM_PROMPT.md) - Development standards
- [common/events/README.md](./common/events/README.md) - Event library docs

---

**Ready to test the complete event-driven flow!** 🚀
