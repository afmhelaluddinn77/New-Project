#!/bin/bash

# EMR/HMS Complete Deployment Script
# Following DEVELOPMENT_LAW.md and FEATURE_IMPLEMENTATION_LAW.md

set -e

echo "🚀 Starting EMR/HMS Full System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
KONG_ADMIN_URL="http://localhost:8001"
KONG_PROXY_URL="http://localhost:8000"

# Function to check service health
check_health() {
    local service=$1
    local port=$2
    echo -e "${YELLOW}Checking $service on port $port...${NC}"
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✓ $service is running${NC}"
        return 0
    else
        echo -e "${RED}✗ $service is not running${NC}"
        return 1
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir=$2
    local port=$3

    echo -e "${YELLOW}Starting $service_name...${NC}"
    cd "$service_dir"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies for $service_name..."
        npm install
    fi

    # Start the service in background
    npm run dev > /dev/null 2>&1 &

    # Wait for service to be ready
    sleep 5

    if check_health "$service_name" "$port"; then
        echo -e "${GREEN}✓ $service_name started successfully${NC}"
    else
        echo -e "${RED}✗ Failed to start $service_name${NC}"
        exit 1
    fi
}

# Function to setup Kong routes
setup_kong_routes() {
    echo -e "${YELLOW}Setting up Kong API Gateway routes...${NC}"

    # Add services
    curl -i -X POST "$KONG_ADMIN_URL/services/" \
        --data "name=authentication-service" \
        --data "url=http://localhost:3001" 2>/dev/null

    curl -i -X POST "$KONG_ADMIN_URL/services/" \
        --data "name=patient-service" \
        --data "url=http://localhost:3002" 2>/dev/null

    curl -i -X POST "$KONG_ADMIN_URL/services/" \
        --data "name=encounter-service" \
        --data "url=http://localhost:3003" 2>/dev/null

    curl -i -X POST "$KONG_ADMIN_URL/services/" \
        --data "name=appointment-service" \
        --data "url=http://localhost:3004" 2>/dev/null

    curl -i -X POST "$KONG_ADMIN_URL/services/" \
        --data "name=billing-service" \
        --data "url=http://localhost:3005" 2>/dev/null

    curl -i -X POST "$KONG_ADMIN_URL/services/" \
        --data "name=fhir-service" \
        --data "url=http://localhost:3006" 2>/dev/null

    # Add routes
    curl -i -X POST "$KONG_ADMIN_URL/services/authentication-service/routes" \
        --data "paths[]=/api/auth" 2>/dev/null

    curl -i -X POST "$KONG_ADMIN_URL/services/patient-service/routes" \
        --data "paths[]=/api/patients" 2>/dev/null

    curl -i -X POST "$KONG_ADMIN_URL/services/encounter-service/routes" \
        --data "paths[]=/api/encounters" 2>/dev/null

    curl -i -X POST "$KONG_ADMIN_URL/services/appointment-service/routes" \
        --data "paths[]=/api/appointments" 2>/dev/null

    curl -i -X POST "$KONG_ADMIN_URL/services/billing-service/routes" \
        --data "paths[]=/api/billing" 2>/dev/null

    curl -i -X POST "$KONG_ADMIN_URL/services/fhir-service/routes" \
        --data "paths[]=/api/fhir" 2>/dev/null

    echo -e "${GREEN}✓ Kong routes configured${NC}"
}

# Main deployment process
main() {
    echo "===================================="
    echo "EMR/HMS System Deployment"
    echo "===================================="

    # Check prerequisites
    echo -e "\n${YELLOW}Checking prerequisites...${NC}"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed${NC}"
        exit 1
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed${NC}"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ All prerequisites met${NC}"

    # Start infrastructure services
    echo -e "\n${YELLOW}Starting infrastructure services...${NC}"

    # Start PostgreSQL
    docker run -d \
        --name emr-postgres \
        -e POSTGRES_USER=emr_user \
        -e POSTGRES_PASSWORD=emr_pass \
        -e POSTGRES_DB=emr_db \
        -p 5432:5432 \
        postgres:16 2>/dev/null || echo "PostgreSQL already running"

    # Start Redis
    docker run -d \
        --name emr-redis \
        -p 6379:6379 \
        redis:7 2>/dev/null || echo "Redis already running"

    # Start Kong
    docker run -d \
        --name kong-database \
        -e POSTGRES_USER=kong \
        -e POSTGRES_DB=kong \
        -e POSTGRES_PASSWORD=kong \
        -p 5433:5432 \
        postgres:16 2>/dev/null || echo "Kong database already running"

    sleep 5

    docker run --rm \
        --link kong-database:kong-database \
        -e KONG_DATABASE=postgres \
        -e KONG_PG_HOST=kong-database \
        -e KONG_PG_USER=kong \
        -e KONG_PG_PASSWORD=kong \
        kong:latest kong migrations bootstrap 2>/dev/null || echo "Kong migrations already done"

    docker run -d \
        --name kong \
        --link kong-database:kong-database \
        -e KONG_DATABASE=postgres \
        -e KONG_PG_HOST=kong-database \
        -e KONG_PG_USER=kong \
        -e KONG_PG_PASSWORD=kong \
        -e KONG_PROXY_ACCESS_LOG=/dev/stdout \
        -e KONG_ADMIN_ACCESS_LOG=/dev/stdout \
        -e KONG_PROXY_ERROR_LOG=/dev/stderr \
        -e KONG_ADMIN_ERROR_LOG=/dev/stderr \
        -e KONG_ADMIN_LISTEN="0.0.0.0:8001, 0.0.0.0:8444 ssl" \
        -p 8000:8000 \
        -p 8443:8443 \
        -p 8001:8001 \
        -p 8444:8444 \
        kong:latest 2>/dev/null || echo "Kong already running"

    echo -e "${GREEN}✓ Infrastructure services started${NC}"

    # Run database migrations
    echo -e "\n${YELLOW}Running database migrations...${NC}"

    # Authentication Service
    cd services/authentication-service
    npx prisma migrate deploy 2>/dev/null || echo "Auth migrations already applied"
    cd ../..

    # Patient Service
    cd services/patient-service
    npx prisma migrate deploy 2>/dev/null || echo "Patient migrations already applied"
    cd ../..

    # Encounter Service
    cd services/encounter-service
    npx prisma migrate deploy 2>/dev/null || echo "Encounter migrations already applied"
    cd ../..

    # Appointment Service
    cd services/appointment-service
    npx prisma migrate deploy 2>/dev/null || echo "Appointment migrations already applied"
    cd ../..

    # Billing Service
    cd services/billing-service
    npx prisma migrate deploy 2>/dev/null || echo "Billing migrations already applied"
    cd ../..

    echo -e "${GREEN}✓ Database migrations completed${NC}"

    # Start backend services
    echo -e "\n${YELLOW}Starting backend services...${NC}"

    start_service "Authentication Service" "services/authentication-service" 3001
    start_service "Patient Service" "services/patient-service" 3002
    start_service "Encounter Service" "services/encounter-service" 3003
    start_service "Appointment Service" "services/appointment-service" 3004
    start_service "Billing Service" "services/billing-service" 3005
    start_service "FHIR Service" "services/fhir-service" 3006

    # Setup Kong routes
    setup_kong_routes

    # Start frontend portals
    echo -e "\n${YELLOW}Starting frontend portals...${NC}"

    start_service "Patient Portal" "patient-portal" 5173
    start_service "Provider Portal" "provider-portal" 5174
    start_service "Admin Portal" "admin-portal" 5175
    start_service "Lab Portal" "lab-portal" 5176
    start_service "Pharmacy Portal" "pharmacy-portal" 5177
    start_service "Billing Portal" "billing-portal" 5178
    start_service "Radiology Portal" "radiology-portal" 5179
    start_service "Nurses Portal" "nurses-portal" 5180
    start_service "IT Portal" "it-portal" 5181

    # Display summary
    echo -e "\n${GREEN}===================================="
    echo "✓ EMR/HMS System Deployed Successfully!"
    echo "====================================${NC}"
    echo ""
    echo "Portal URLs:"
    echo "  Patient Portal:   http://localhost:5173"
    echo "  Provider Portal:  http://localhost:5174"
    echo "  Admin Portal:     http://localhost:5175"
    echo "  Lab Portal:       http://localhost:5176"
    echo "  Pharmacy Portal:  http://localhost:5177"
    echo "  Billing Portal:   http://localhost:5178"
    echo "  Radiology Portal: http://localhost:5179"
    echo "  Nurses Portal:    http://localhost:5180"
    echo "  IT Portal:        http://localhost:5181"
    echo ""
    echo "API Gateway:       http://localhost:8000"
    echo "Kong Admin:        http://localhost:8001"
    echo ""
    echo "Default credentials:"
    echo "  Username: admin@hospital.com"
    echo "  Password: Admin123!"
    echo ""
}

# Run main deployment
main "$@"
