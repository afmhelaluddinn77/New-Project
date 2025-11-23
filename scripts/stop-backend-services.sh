#!/bin/bash

# EMR System - Stop Backend Services Script
# This script stops all running backend microservices

echo "=========================================="
echo "Stopping Backend Services"
echo "=========================================="

# Kill all node processes running NestJS services
echo "Stopping service processes..."

# Find and kill processes on specific ports
for port in 3001 3004 3005 3011 3012 3013 3014; do
    PID=$(lsof -ti:$port)
    if [ ! -z "$PID" ]; then
        echo "Killing process on port $port (PID: $PID)"
        kill -9 $PID 2>/dev/null
    fi
done

# Alternative: Kill all nest start processes
pkill -f "nest start" 2>/dev/null

echo ""
echo "All backend services stopped!"
echo "=========================================="
echo ""
echo "Note: Docker infrastructure (PostgreSQL, Kong, NATS, MinIO) is still running."
echo "To stop Docker services, run: docker-compose down"
echo ""
