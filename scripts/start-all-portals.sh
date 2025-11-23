#!/bin/bash

# EMR System - Start All Portals Script
# This script starts all 8 frontend portals in the background

# Create logs directory if it doesn't exist
mkdir -p logs

echo "=========================================="
echo "Starting All EMR Portals"
echo "=========================================="

echo "Starting Common Portal on port 5172..."
nohup npm run dev --workspace=common-portal > logs/common-portal.log 2>&1 &
COMMON_PID=$!
echo "Common Portal PID: $COMMON_PID"

sleep 2

echo "Starting Patient Portal on port 5173..."
nohup npm run dev --workspace=patient-portal > logs/patient-portal.log 2>&1 &
PATIENT_PID=$!
echo "Patient Portal PID: $PATIENT_PID"

sleep 2

echo "Starting Provider Portal on port 5174..."
nohup npm run dev --workspace=provider-portal > logs/provider-portal.log 2>&1 &
PROVIDER_PID=$!
echo "Provider Portal PID: $PROVIDER_PID"

sleep 2

echo "Starting Admin Portal on port 5175..."
nohup npm run dev --workspace=admin-portal > logs/admin-portal.log 2>&1 &
ADMIN_PID=$!
echo "Admin Portal PID: $ADMIN_PID"

sleep 2

echo "Starting Lab Portal on port 5176..."
nohup npm run dev --workspace=lab-portal > logs/lab-portal.log 2>&1 &
LAB_PID=$!
echo "Lab Portal PID: $LAB_PID"

sleep 2

echo "Starting Pharmacy Portal on port 5177..."
nohup npm run dev --workspace=pharmacy-portal > logs/pharmacy-portal.log 2>&1 &
PHARMACY_PID=$!
echo "Pharmacy Portal PID: $PHARMACY_PID"

sleep 2

echo "Starting Billing Portal on port 5178..."
nohup npm run dev --workspace=billing-portal > logs/billing-portal.log 2>&1 &
BILLING_PID=$!
echo "Billing Portal PID: $BILLING_PID"

sleep 2

echo "Starting Radiology Portal on port 5179..."
nohup npm run dev --workspace=radiology-portal > logs/radiology-portal.log 2>&1 &
RADIOLOGY_PID=$!
echo "Radiology Portal PID: $RADIOLOGY_PID"

sleep 2

echo "Starting Nurses Portal on port 5180..."
nohup npm run dev --workspace=nurses-portal > logs/nurses-portal.log 2>&1 &
NURSES_PID=$!
echo "Nurses Portal PID: $NURSES_PID"

sleep 2

echo "Starting IT Portal on port 5181..."
nohup npm run dev --workspace=it-portal > logs/it-portal.log 2>&1 &
IT_PID=$!
echo "IT Portal PID: $IT_PID"

sleep 2

echo "Starting HR Portal on port 5182..."
nohup npm run dev --workspace=hr-portal > logs/hr-portal.log 2>&1 &
HR_PID=$!
echo "HR Portal PID: $HR_PID"

sleep 2

echo "Starting Engineering Portal on port 5183..."
nohup npm run dev --workspace=engineering-portal > logs/engineering-portal.log 2>&1 &
ENGINEERING_PID=$!
echo "Engineering Portal PID: $ENGINEERING_PID"

echo ""
echo "=========================================="
echo "All portals started successfully!"
echo "=========================================="
echo ""
echo "Portal URLs:"
echo "  Common Portal:   http://localhost:5172"
echo "  Patient Portal:  http://localhost:5173"
echo "  Provider Portal: http://localhost:5174"
echo "  Admin Portal:    http://localhost:5175"
echo "  Lab Portal:      http://localhost:5176"
echo "  Pharmacy Portal: http://localhost:5177"
echo "  Billing Portal:  http://localhost:5178"
echo "  Radiology Portal: http://localhost:5179"
echo "  Nurses Portal:   http://localhost:5180"
echo "  IT Portal:       http://localhost:5181"
echo "  HR Portal:       http://localhost:5182"
echo "  Engineering:     http://localhost:5183"
echo ""
echo "Logs are available in the logs/ directory"
echo "To stop all portals, run: ./scripts/stop-all-portals.sh"
echo ""
