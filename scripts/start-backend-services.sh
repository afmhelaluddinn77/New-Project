#!/bin/bash

# EMR System - Start Backend Services Script
# This script starts all backend microservices

echo "=========================================="
echo "Starting Backend Services"
echo "=========================================="

# Create logs directory
mkdir -p logs

# Check if Docker services are running
echo "Checking Docker infrastructure..."
docker-compose ps | grep -q "clinical-db.*Up" || {
    echo "Starting Docker infrastructure (PostgreSQL, Kong, NATS, MinIO)..."
    docker-compose up -d kong-database clinical-db nats minio
    echo "Waiting for databases to be ready..."
    sleep 10
}

echo ""
echo "Starting microservices..."
echo ""

# Authentication Service (Port 3001)
echo "Starting Authentication Service on port 3001..."
cd services/authentication-service
nohup npm run start:dev > ../../logs/auth-service.log 2>&1 &
cd ../..
sleep 3

# Patient Service (Port 3011)
echo "Starting Patient Service on port 3011..."
cd services/patient-service
nohup npm run start:dev > ../../logs/patient-service.log 2>&1 &
cd ../..
sleep 3

# Encounter Service (Port 3005)
echo "Starting Encounter Service on port 3005..."
cd services/encounter-service
nohup npm run start:dev > ../../logs/encounter-service.log 2>&1 &
cd ../..
sleep 3

# Clinical Workflow Service (Port 3004)
echo "Starting Clinical Workflow Service on port 3004..."
cd services/clinical-workflow-service
nohup npm run start:dev > ../../logs/workflow-service.log 2>&1 &
cd ../..
sleep 3

# Lab Service (Port 3013)
echo "Starting Lab Service on port 3013..."
cd services/lab-service
nohup npm run start:dev > ../../logs/lab-service.log 2>&1 &
cd ../..
sleep 3

# Pharmacy Service (Port 3012)
echo "Starting Pharmacy Service on port 3012..."
cd services/pharmacy-service
nohup npm run start:dev > ../../logs/pharmacy-service.log 2>&1 &
cd ../..
sleep 3

# Radiology Service (Port 3014)
echo "Starting Radiology Service on port 3014..."
cd services/radiology-service
nohup npm run start:dev > ../../logs/radiology-service.log 2>&1 &
cd ../..
sleep 3

echo ""
echo "=========================================="
echo "Backend Services Started!"
echo "=========================================="
echo ""
echo "Service URLs:"
echo "  Authentication: http://localhost:3001"
echo "  Patient:        http://localhost:3011"
echo "  Encounter:      http://localhost:3005"
echo "  Workflow:       http://localhost:3004"
echo "  Lab:            http://localhost:3013"
echo "  Pharmacy:       http://localhost:3012"
echo "  Radiology:      http://localhost:3014"
echo ""
echo "Infrastructure:"
echo "  PostgreSQL:     localhost:5433"
echo "  Kong Gateway:   http://localhost:8000"
echo "  Kong Admin:     http://localhost:8001"
echo "  NATS:           localhost:4222"
echo "  MinIO:          http://localhost:9000"
echo "  MinIO Console:  http://localhost:9001"
echo ""
echo "Logs are available in the logs/ directory"
echo ""
