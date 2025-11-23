#!/bin/bash

# EMR System - Check All Services Status
# This script checks the status of all running services and portals

echo "=========================================="
echo "EMR System - Service Status Check"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_port() {
    local port=$1
    local service=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $service (Port $port) - ${GREEN}RUNNING${NC}"
        return 0
    else
        echo -e "${RED}✗${NC} $service (Port $port) - ${RED}NOT RUNNING${NC}"
        return 1
    fi
}

echo "=== DOCKER INFRASTRUCTURE ==="
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | grep -E "(NAME|kong|clinical-db|nats|minio)"
echo ""

echo "=== BACKEND SERVICES ==="
check_port 3001 "Authentication Service"
check_port 3011 "Patient Service"
check_port 3005 "Encounter Service"
check_port 3004 "Clinical Workflow Service"
check_port 3013 "Lab Service"
check_port 3012 "Pharmacy Service"
check_port 3014 "Radiology Service"
check_port 3020 "Aggregation Service"
check_port 3021 "Notification Service"
echo ""

echo "=== FRONTEND PORTALS ==="
check_port 5172 "Common Portal"
check_port 5173 "Patient Portal (or Admin)"
check_port 5174 "Provider Portal"
check_port 5175 "Admin Portal (or Patient)"
check_port 5176 "Lab Portal"
check_port 5177 "Pharmacy Portal"
check_port 5178 "Billing Portal"
check_port 5179 "Radiology Portal"
check_port 5180 "Common Portal (Alt)"
echo ""

echo "=== GATEWAY & INFRASTRUCTURE ==="
check_port 8000 "Kong Gateway (Proxy)"
check_port 8001 "Kong Admin API"
check_port 5433 "PostgreSQL (Clinical DB)"
check_port 4222 "NATS Message Bus"
check_port 9000 "MinIO S3 API"
check_port 9001 "MinIO Console"
echo ""

echo "=========================================="
echo "Quick Access URLs:"
echo "=========================================="
echo "Frontend Portals:"
echo "  Provider Portal:   http://localhost:5174"
echo "  Patient Portal:    http://localhost:5173 or 5175"
echo "  Admin Portal:      http://localhost:5173 or 5175"
echo "  Lab Portal:        http://localhost:5176"
echo "  Pharmacy Portal:   http://localhost:5177"
echo "  Billing Portal:    http://localhost:5178"
echo "  Radiology Portal:  http://localhost:5179"
echo "  Common Portal:     http://localhost:5172 or 5180"
echo ""
echo "Backend Services:"
echo "  Authentication:    http://localhost:3001"
echo "  Patient:           http://localhost:3011"
echo "  Encounter:         http://localhost:3005"
echo "  Workflow:          http://localhost:3004"
echo "  Lab:               http://localhost:3013"
echo "  Pharmacy:          http://localhost:3012"
echo "  Radiology:         http://localhost:3014"
echo ""
echo "Infrastructure:"
echo "  Kong Gateway:      http://localhost:8000"
echo "  Kong Admin:        http://localhost:8001"
echo "  PostgreSQL:        localhost:5433"
echo "  MinIO Console:     http://localhost:9001"
echo ""
echo "Logs Location: /tmp/*-service.log and /tmp/*-portal.log"
echo "=========================================="
