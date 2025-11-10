#!/bin/bash

# Kong Rate Limiting Configuration Script
# This script enables rate limiting on Kong Gateway for security and stability

KONG_ADMIN_URL="http://localhost:8001"

echo "🔧 Configuring Kong Rate Limiting..."
echo ""

# Enable global rate limiting for all routes
# 100 requests per minute per consumer
echo "1️⃣  Enabling global rate limiting (100 req/min)..."
curl -i -X POST "${KONG_ADMIN_URL}/plugins" \
  --data "name=rate-limiting" \
  --data "config.minute=100" \
  --data "config.policy=local" \
  --data "config.hide_client_headers=false"

echo ""
echo ""

# Get the authentication service ID
echo "2️⃣  Finding authentication service..."
AUTH_SERVICE_ID=$(curl -s "${KONG_ADMIN_URL}/services" | jq -r '.data[] | select(.name=="authentication-service") | .id')

if [ -z "$AUTH_SERVICE_ID" ]; then
  echo "❌ Error: Authentication service not found!"
  echo "   Make sure Kong is running and services are configured."
  exit 1
fi

echo "✅ Found authentication service: ${AUTH_SERVICE_ID}"
echo ""

# Enable rate limiting for authentication endpoints
# 100 requests per minute (reasonable for development/testing, prevents severe brute force)
echo "3️⃣  Enabling rate limiting for auth endpoints (100 req/min)..."
curl -i -X POST "${KONG_ADMIN_URL}/services/${AUTH_SERVICE_ID}/plugins" \
  --data "name=rate-limiting" \
  --data "config.minute=100" \
  --data "config.policy=local" \
  --data "config.hide_client_headers=false"

echo ""
echo ""
echo "✅ Kong rate limiting configured successfully!"
echo ""
echo "Rate Limits Applied:"
echo "  - Global: 100 requests/minute"
echo "  - Authentication service: 100 requests/minute"
echo ""
echo "Testing rate limiting..."
echo "You can test by making multiple requests:"
echo "  curl -i http://localhost:8000/auth/csrf-token"
echo ""
echo "After exceeding the limit, you'll receive a 429 (Too Many Requests) response."
