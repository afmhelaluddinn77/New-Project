#!/bin/bash
# Configure Kong Gateway via Admin API
# This script applies the routes from kong.yml to Kong's database

KONG_ADMIN="http://localhost:8001"

echo "🔧 Configuring Kong Gateway..."
echo ""

# Clean up existing configuration (optional - comment out if you want to keep existing)
echo "Cleaning up existing routes and services..."
curl -s -X DELETE $KONG_ADMIN/routes/auth-login 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/routes/auth-csrf 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/routes/auth-refresh 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/routes/auth-logout 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/routes/workflow-api 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/services/authentication-service 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/services/clinical-workflow-service 2>/dev/null
echo ""

# 1. Create Authentication Service
echo "📦 Creating authentication-service..."
curl -s -X POST $KONG_ADMIN/services \
  --data "name=authentication-service" \
  --data "url=http://host.docker.internal:3001" | grep -o '"name":"[^"]*"' || echo "Created"
echo ""

# 2. Create auth routes
echo "🛣️  Creating authentication routes..."
curl -s -X POST $KONG_ADMIN/services/authentication-service/routes \
  --data "name=auth-login" \
  --data "paths[]=/api/auth/login" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"' || echo "  ✓ auth-login"

curl -s -X POST $KONG_ADMIN/services/authentication-service/routes \
  --data "name=auth-csrf" \
  --data "paths[]=/api/auth/csrf-token" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"' || echo "  ✓ auth-csrf"

curl -s -X POST $KONG_ADMIN/services/authentication-service/routes \
  --data "name=auth-refresh" \
  --data "paths[]=/api/auth/refresh" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"' || echo "  ✓ auth-refresh"

curl -s -X POST $KONG_ADMIN/services/authentication-service/routes \
  --data "name=auth-logout" \
  --data "paths[]=/api/auth/logout" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"' || echo "  ✓ auth-logout"
echo ""

# 3. Create Workflow Service
echo "📦 Creating workflow-service..."
curl -s -X POST $KONG_ADMIN/services \
  --data "name=clinical-workflow-service" \
  --data "url=http://host.docker.internal:3004" | grep -o '"name":"[^"]*"' || echo "Created"
echo ""

echo "🛣️  Creating workflow route..."
curl -s -X POST $KONG_ADMIN/services/clinical-workflow-service/routes \
  --data "name=workflow-api" \
  --data "paths[]=/api/workflow" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"' || echo "  ✓ workflow-api"
echo ""

# 4. Create Encounter Service
echo "📦 Creating encounter-service..."
curl -s -X POST $KONG_ADMIN/services \
  --data "name=encounter-service" \
  --data "url=http://host.docker.internal:3005" | grep -o '"name":"[^"]*"' || echo "Created"
echo ""

echo "🛣️  Creating encounters route..."
curl -s -X POST $KONG_ADMIN/services/encounter-service/routes \
  --data "name=encounter-api" \
  --data "paths[]=/api/encounters" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"' || echo "  ✓ encounter-api"
echo ""

# 5. Configure CORS plugin globally
echo "🌐 Configuring CORS..."
curl -s -X POST $KONG_ADMIN/plugins \
  --data "name=cors" \
  --data "config.origins=*" \
  --data "config.methods=GET" \
  --data "config.methods=POST" \
  --data "config.methods=PUT" \
  --data "config.methods=PATCH" \
  --data "config.methods=DELETE" \
  --data "config.methods=OPTIONS" \
  --data "config.headers=Accept" \
  --data "config.headers=Authorization" \
  --data "config.headers=Content-Type" \
  --data "config.headers=X-XSRF-TOKEN" \
  --data "config.headers=X-User-ID" \
  --data "config.headers=X-User-Role" \
  --data "config.exposed_headers=Set-Cookie" \
  --data "config.exposed_headers=X-XSRF-TOKEN" \
  --data "config.credentials=true" \
  --data "config.max_age=3600" > /dev/null || echo "  ✓ CORS configured"
echo ""

echo "✅ Kong Gateway configuration complete!"
echo ""
echo "📊 Configuration Summary:"
echo "  Gateway: http://localhost:8000"
echo "  Admin:   http://localhost:8001"
echo ""
echo "🧪 Test endpoints:"
echo "  curl http://localhost:8000/api/auth/csrf-token"
echo "  curl http://localhost:8000/api/workflow/orders"
echo ""
