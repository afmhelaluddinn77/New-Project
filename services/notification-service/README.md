# Notification Service

Real-time WebSocket notification service for critical alerts.

## Purpose

Sends real-time notifications to connected users when critical events occur (lab results, imaging findings, etc.).

## Development Law Compliance

✅ **NestJS 10+** - Modern TypeScript framework
✅ **Socket.IO** - WebSocket implementation
✅ **JWT Authentication** - Secure socket connections
✅ **NATS** - Event consumption
✅ **FHIR R4** - Event data structure

## Features

### Real-Time Notifications

- **Lab Results** - Instant notification when results available
- **Critical Values** - URGENT alerts for critical lab/imaging findings
- **Imaging Reports** - Notification when radiologist finalizes report

### Security

- **JWT Authentication** - All socket connections must authenticate
- **User Isolation** - Notifications only sent to authorized users
- **Multi-Device Support** - User can connect from multiple tabs/devices

### Architecture

- **Event-Driven** - Consumes NATS events
- **Stateful Connections** - Maintains user → socket mapping
- **Room-Based** - Uses Socket.IO rooms for user-specific broadcasts

## Setup

```bash
# Install dependencies
npm install

# Start service
npm run start:dev
```

## Environment Variables

```env
NATS_URL="nats://localhost:4222"
JWT_SECRET="your-secret-key-here"
PORT=3021
```

## WebSocket Client Example

### Frontend Connection (React)

```typescript
import io from "socket.io-client";

// Get JWT token from authentication
const token = localStorage.getItem("accessToken");

// Connect to notification service
const socket = io("http://localhost:3021", {
  auth: {
    token,
  },
});

// Listen for connection
socket.on("connected", (data) => {
  console.log("Connected to notifications:", data);
});

// Listen for notifications
socket.on("notification", (notification) => {
  console.log("New notification:", notification);
  // Show toast/alert to user
  showToast(notification.title, notification.message);
});

// Listen for CRITICAL alerts
socket.on("critical_alert", (alert) => {
  console.log("CRITICAL ALERT:", alert);
  // Show urgent alert modal
  showCriticalAlertModal(alert);
});
```

### Notification Types

#### Lab Result Available

```json
{
  "type": "lab_result_available",
  "priority": "normal" | "high",
  "title": "Lab Results Available",
  "message": "New lab results are ready for review",
  "patientId": "uuid",
  "reportId": "uuid",
  "action": {
    "type": "view_lab_result",
    "url": "/patients/{patientId}/labs/{reportId}"
  }
}
```

#### Critical Lab Value

```json
{
  "type": "critical_lab_value",
  "priority": "urgent",
  "title": "🚨 CRITICAL LAB VALUE",
  "message": "CRITICAL: Potassium = 6.5 mmol/L",
  "patientName": "John Doe",
  "patientId": "uuid",
  "details": {
    "testName": "Potassium",
    "loincCode": "2823-3",
    "value": 6.5,
    "unit": "mmol/L",
    "referenceRange": "3.5-5.0",
    "criticalReason": "Severe hyperkalemia"
  },
  "requiresAcknowledgment": true
}
```

## Event Handlers

### Lab Events

- `lab.result.available` → Send notification to provider
- `lab.critical.alert` → Send URGENT notification

### Radiology Events

- `radiology.report.finalized` → Send notification
- `radiology.critical.alert` → Send URGENT notification

## User Connection Management

The gateway maintains a `Map<userId, socketId[]>` to support:

- Multiple devices per user
- Offline detection
- Targeted notifications

## Development

```bash
# Watch mode
npm run start:dev

# Debug mode
npm run start:debug
```

## Docker

```yaml
notification-service:
  build: ./services/notification-service
  ports:
    - "3021:3021"
  environment:
    - NATS_URL=nats://nats:4222
    - JWT_SECRET=your-secret-key
  depends_on:
    - nats
```

## Testing

```bash
# Test WebSocket connection
npm install -g wscat
wscat -c ws://localhost:3021 -H "Authorization: Bearer <your-jwt-token>"
```
