#!/bin/bash
# Configure Kong Gateway via Admin API
# Uses Docker service names for upstream hosts

KONG_ADMIN="http://localhost:8001"

echo "🔧 Configuring Kong Gateway..."
echo ""

# Clean up existing configuration
echo "Cleaning up existing routes and services..."
curl -s -X DELETE $KONG_ADMIN/routes/auth-login 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/routes/auth-csrf 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/routes/auth-refresh 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/routes/auth-logout 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/routes/workflow-api 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/routes/encounter-api 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/routes/fhir-api 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/services/authentication-service 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/services/clinical-workflow-service 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/services/encounter-service 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/services/fhir-service 2>/dev/null
curl -s -X DELETE $KONG_ADMIN/plugins 2>/dev/null
echo ""

# 1. Create Authentication Service (using Docker service name)
echo "📦 Creating authentication-service..."
curl -s -X POST $KONG_ADMIN/services \
  --data "name=authentication-service" \
  --data "url=http://newproject-authentication-service-1:3001" | grep -o '"name":"[^"]*"' || echo "Created"
echo ""

# 2. Create auth routes
echo "🛣️  Creating authentication routes..."

# Login route
curl -s -X POST $KONG_ADMIN/services/authentication-service/routes \
  --data "name=auth-login" \
  --data "paths[]=/api/auth/login" \
  --data "methods[]=GET" \
  --data "methods[]=POST" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"'

# CSRF token route
curl -s -X POST $KONG_ADMIN/services/authentication-service/routes \
  --data "name=auth-csrf" \
  --data "paths[]=/api/auth/csrf-token" \
  --data "methods[]=GET" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"'

# Refresh token route
curl -s -X POST $KONG_ADMIN/services/authentication-service/routes \
  --data "name=auth-refresh" \
  --data "paths[]=/api/auth/refresh" \
  --data "methods[]=POST" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"'

# Logout route
curl -s -X POST $KONG_ADMIN/services/authentication-service/routes \
  --data "name=auth-logout" \
  --data "paths[]=/api/auth/logout" \
  --data "methods[]=POST" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"'

echo ""

# 3. Create Workflow Service
echo "📦 Creating workflow-service..."
curl -s -X POST $KONG_ADMIN/services \
  --data "name=clinical-workflow-service" \
  --data "url=http://newproject-clinical-workflow-service-1:3004" | grep -o '"name":"[^"]*"' || echo "Created"
echo ""

# 4. Create workflow route
echo "🛣️  Creating workflow route..."
curl -s -X POST $KONG_ADMIN/services/clinical-workflow-service/routes \
  --data "name=workflow-api" \
  --data "paths[]=/api/workflow" \
  --data "methods[]=GET" \
  --data "methods[]=POST" \
  --data "methods[]=PUT" \
  --data "methods[]=PATCH" \
  --data "methods[]=DELETE" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"'

echo ""

# 5. Create Encounter Service
echo "📦 Creating encounter-service..."
curl -s -X POST $KONG_ADMIN/services \
  --data "name=encounter-service" \
  --data "url=http://newproject-encounter-service-1:3005" | grep -o '"name":"[^"]*"' || echo "Created"
echo ""

# 6. Create encounters route
echo "🛣️  Creating encounters route..."
curl -s -X POST $KONG_ADMIN/services/encounter-service/routes \
  --data "name=encounter-api" \
  --data "paths[]=/api/encounters" \
  --data "methods[]=GET" \
  --data "methods[]=POST" \
  --data "methods[]=PUT" \
  --data "methods[]=PATCH" \
  --data "methods[]=DELETE" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"'

echo ""

# 7. Create FHIR Service
echo "📦 Creating fhir-service..."
curl -s -X POST $KONG_ADMIN/services \
  --data "name=fhir-service" \
  --data "url=http://host.docker.internal:3022" | grep -o '"name":"[^"]*"' || echo "Created"
echo ""

# 8. Create FHIR route
echo "🛣️  Creating FHIR route..."
curl -s -X POST $KONG_ADMIN/services/fhir-service/routes \
  --data "name=fhir-api" \
  --data "paths[]=/fhir" \
  --data "methods[]=GET" \
  --data "methods[]=POST" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false" | grep -o '"name":"[^"]*"'

echo ""

# 9. Enable CORS plugin globally
echo "🌐 Configuring CORS..."
curl -s -X POST $KONG_ADMIN/plugins \
  --data "name=cors" \
  --data "config.origins=http://localhost:5173" \
  --data "config.origins=http://localhost:5174" \
  --data "config.methods=GET" \
  --data "config.methods=POST" \
  --data "config.methods=PUT" \
  --data "config.methods=PATCH" \
  --data "config.methods=DELETE" \
  --data "config.methods=OPTIONS" \
  --data "config.headers=Accept" \
  --data "config.headers=Accept-Version" \
  --data "config.headers=Content-Length" \
  --data "config.headers=Content-MD5" \
  --data "config.headers=Content-Type" \
  --data "config.headers=Date" \
  --data "config.headers=Authorization" \
  --data "config.headers=X-XSRF-TOKEN" \
  --data "config.headers=X-User-ID" \
  --data "config.headers=X-User-Role" \
  --data "config.headers=X-Portal" \
  --data "config.exposed_headers=X-Auth-Token" \
  --data "config.exposed_headers=Set-Cookie" \
  --data "config.exposed_headers=X-User-ID" \
  --data "config.exposed_headers=X-User-Role" \
  --data "config.exposed_headers=X-Portal" \
  --data "config.credentials=true" \
  --data "config.max_age=3600" > /dev/null

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
echo "  curl http://localhost:8000/api/encounters"
