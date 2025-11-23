#!/bin/bash

echo "🔄 Restarting Authentication Service..."
echo "======================================="
echo ""

# Kill existing auth service
echo "Stopping existing authentication service..."
pkill -f "authentication-service" || true
sleep 2

# Start auth service
echo "Starting authentication service on port 3001..."
cd "$(dirname "$0")/../services/authentication-service"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the service in the background
npm run start:dev > /tmp/auth-service.log 2>&1 &
AUTH_PID=$!

echo "Authentication service starting (PID: $AUTH_PID)..."
echo "Waiting for service to be ready..."

# Wait for service to be ready
for i in {1..30}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo ""
        echo "✅ Authentication service is ready!"
        echo ""
        echo "Service Details:"
        echo "  URL: http://localhost:3001"
        echo "  PID: $AUTH_PID"
        echo "  Log: /tmp/auth-service.log"
        echo ""
        echo "Test login with:"
        echo "  curl -X POST http://localhost:3001/api/auth/login \\"
        echo "    -H 'Content-Type: application/json' \\"
        echo "    -d '{\"email\":\"it@example.com\",\"password\":\"password123\",\"portalType\":\"ADMIN\"}'"
        echo ""
        exit 0
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "❌ Authentication service failed to start"
echo "Check logs: tail -f /tmp/auth-service.log"
exit 1
