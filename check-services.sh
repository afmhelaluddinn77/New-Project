#!/bin/bash

# Service Status Checker
# Verifies all 17 services (9 backend + 8 frontend) are running

echo "========================================="
echo "🔍 EMR SERVICES STATUS CHECK"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

backend_running=0
backend_total=9
frontend_running=0
frontend_total=8

echo "📦 BACKEND SERVICES:"
echo "-------------------"

# Backend Services
declare -A backend_services=(
    [3001]="Authentication Service"
    [3004]="Clinical Workflow Service"
    [3005]="Encounter Service"
    [3011]="Patient Service"
    [3012]="Pharmacy Service"
    [3013]="Lab Service (Event Publisher)"
    [3014]="Radiology Service"
    [3020]="Aggregation Service (Event Consumer)"
    [3021]="Notification Service (WebSocket)"
)

for port in 3001 3004 3005 3011 3012 3013 3014 3020 3021; do
    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Port $port: ${backend_services[$port]}${NC}"
        ((backend_running++))
    else
        echo -e "${RED}❌ Port $port: ${backend_services[$port]}${NC}"
    fi
done

echo ""
echo "🌐 FRONTEND PORTALS:"
echo "-------------------"

# Frontend Portals
declare -A frontend_portals=(
    [5173]="Admin Portal"
    [5174]="Provider Portal (Notifications)"
    [5175]="Patient Portal"
    [5176]="Lab Portal (Submit Results)"
    [5177]="Pharmacy Portal"
    [5178]="Billing Portal"
    [5179]="Radiology Portal"
    [5180]="Common Portal"
)

for port in 5173 5174 5175 5176 5177 5178 5179 5180; do
    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Port $port: ${frontend_portals[$port]}${NC}"
        ((frontend_running++))
    else
        echo -e "${RED}❌ Port $port: ${frontend_portals[$port]}${NC}"
    fi
done

echo ""
echo "========================================="
echo "📊 SUMMARY:"
echo "========================================="
echo -e "Backend Services: ${GREEN}$backend_running${NC}/$backend_total running"
echo -e "Frontend Portals: ${GREEN}$frontend_running${NC}/$frontend_total running"
echo ""

total_running=$((backend_running + frontend_running))
total_services=$((backend_total + frontend_total))

if [ $total_running -eq $total_services ]; then
    echo -e "${GREEN}✅ ALL SERVICES RUNNING ($total_running/$total_services)${NC}"
    echo ""
    echo "🎯 Ready to test Lab Event Flow!"
    echo ""
    echo "Next steps:"
    echo "  1. Open Provider Portal: http://localhost:5174"
    echo "  2. Open Lab Portal: http://localhost:5176"
    echo "  3. Run: ./test-lab-event-flow.sh"
    exit 0
else
    echo -e "${YELLOW}⚠️  SOME SERVICES NOT RUNNING ($total_running/$total_services)${NC}"
    echo ""
    echo "To start missing services, see: START_ALL_SERVICES.md"
    exit 1
fi
