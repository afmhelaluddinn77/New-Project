#!/bin/bash

# EMR System - Stop All Portals Script
# This script stops all running portal processes

echo "=========================================="
echo "Stopping All EMR Portals"
echo "=========================================="

echo "Stopping service processes..."

# Kill processes by port (including all 12 portals)
for PORT in 5172 5173 5174 5175 5176 5177 5178 5179 5180 5181 5182 5183; do
  PID=$(lsof -ti:$PORT)
  if [ ! -z "$PID" ]; then
    echo "Killing process on port $PORT (PID: $PID)"
    kill -9 $PID 2>/dev/null
  fi
done

echo ""
echo "All portals stopped!"
echo "=========================================="

# Alternative: Kill all npm dev processes for portals
pkill -f "vite --port 517" 2>/dev/null

echo ""
echo "All portals stopped successfully!"
echo "=========================================="
