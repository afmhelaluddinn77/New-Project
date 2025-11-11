#!/bin/bash

# Lab Event Flow Test Script
# This demonstrates the complete event-driven flow

echo "🧪 Lab Event Flow Test"
echo "====================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Create a lab order
echo -e "${BLUE}Step 1: Creating lab order...${NC}"
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3013/api/lab/orders \
  -H "Content-Type: application/json" \
  -H "X-User-Role: PROVIDER" \
  -H "X-User-Id: provider-test-789" \
  -d '{
    "patientId": "patient-test-123",
    "providerId": "provider-test-789",
    "encounterId": "encounter-test-001",
    "tests": [
      {
        "code": "GLUC",
        "name": "Glucose",
        "category": "CHEMISTRY"
      },
      {
        "code": "K",
        "name": "Potassium",
        "category": "CHEMISTRY"
      }
    ],
    "priority": "ROUTINE"
  }')

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Order created${NC}"
  echo "$ORDER_RESPONSE" | jq .
  ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id // empty')

  if [ -z "$ORDER_ID" ]; then
    echo -e "${RED}❌ Failed to extract order ID${NC}"
    echo "Response: $ORDER_RESPONSE"
    exit 1
  fi

  echo -e "${GREEN}Order ID: $ORDER_ID${NC}"
else
  echo -e "${RED}❌ Failed to create order${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}⏳ Waiting 2 seconds for order creation event to propagate...${NC}"
sleep 2

# Step 2: Submit NORMAL lab result
echo ""
echo -e "${BLUE}Step 2: Submitting NORMAL Glucose result...${NC}"
RESULT_RESPONSE=$(curl -s -X POST "http://localhost:3013/api/lab/orders/${ORDER_ID}/results" \
  -H "Content-Type: application/json" \
  -H "X-User-Role: LAB_TECH" \
  -H "X-User-Id: lab-tech-456" \
  -d '{
    "testId": "test-gluc-1",
    "value": "95",
    "unit": "mg/dL",
    "referenceRange": "70-100",
    "abnormalFlag": "NORMAL",
    "comment": "Fasting glucose within normal limits"
  }')

echo -e "${GREEN}✅ Normal result submitted${NC}"
echo "$RESULT_RESPONSE" | jq .

echo ""
echo -e "${YELLOW}⏳ Waiting 3 seconds for events to flow through all services...${NC}"
sleep 3

echo ""
echo -e "${GREEN}🎯 Check the following:${NC}"
echo "  1. Lab Service console: '📤 Published lab.result.available event'"
echo "  2. Aggregation Service console: '📥 Received event: lab.result.available'"
echo "  3. Notification Service console: '✅ Sent lab result notification'"
echo "  4. Provider Portal: Notification bell should show badge (+1)"

# Step 3: Submit CRITICAL lab result
echo ""
echo -e "${BLUE}Step 3: Submitting CRITICAL Potassium result...${NC}"
CRITICAL_RESPONSE=$(curl -s -X POST "http://localhost:3013/api/lab/orders/${ORDER_ID}/results" \
  -H "Content-Type: application/json" \
  -H "X-User-Role: LAB_TECH" \
  -H "X-User-Id: lab-tech-456" \
  -d '{
    "testId": "test-k-2",
    "value": "7.5",
    "unit": "mmol/L",
    "referenceRange": "3.5-5.0",
    "abnormalFlag": "CRITICAL",
    "comment": "⚠️ CRITICAL: Severe hyperkalemia - immediate intervention required!"
  }')

echo -e "${RED}🚨 CRITICAL result submitted${NC}"
echo "$CRITICAL_RESPONSE" | jq .

echo ""
echo -e "${YELLOW}⏳ Waiting 3 seconds for critical alert to propagate...${NC}"
sleep 3

echo ""
echo -e "${RED}🚨 Check the following for CRITICAL alert:${NC}"
echo "  1. Lab Service console: '🚨 Published lab.critical.alert event'"
echo "  2. Aggregation Service console: '🚨 Received CRITICAL event'"
echo "  3. Notification Service console: '🚨 Sent CRITICAL lab alert'"
echo "  4. Provider Portal: RED critical alert banner at top"
echo "  5. Browser notification: '🚨 CRITICAL LAB VALUE'"
echo "  6. Audio alert should play"

echo ""
echo -e "${GREEN}✅ Test complete!${NC}"
echo ""
echo -e "${BLUE}To view the data:${NC}"
echo "  docker exec -it newproject-clinical-db-1 psql -U clinical -d clinical"
echo "  \\c clinical"
echo "  SET search_path TO aggregation;"
echo "  SELECT * FROM \"LabResultView\" ORDER BY \"resultDate\" DESC LIMIT 5;"
