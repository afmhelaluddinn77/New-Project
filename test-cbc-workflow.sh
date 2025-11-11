#!/bin/bash

echo "🧪 Complete Blood Count (CBC) Lab Workflow Test"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP $1]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test patient and provider data
PATIENT_ID="PAT001"
PROVIDER_ID="DR001"
ENCOUNTER_ID="ENC001"

print_step "1" "Checking service availability..."

# Check if services are running
check_service() {
    local service_name=$1
    local port=$2
    local url="http://localhost:$port"

    if curl -s --max-time 3 "$url" >/dev/null 2>&1; then
        print_success "$service_name (port $port) is running"
        return 0
    else
        print_error "$service_name (port $port) is not responding"
        return 1
    fi
}

# Check all required services
services_ok=true
check_service "Provider Portal" "5174" || services_ok=false
check_service "Lab Portal" "5176" || services_ok=false
check_service "Authentication Service" "3001" || services_ok=false
check_service "Clinical Workflow Service" "3004" || services_ok=false
check_service "Lab Service" "3013" || services_ok=false
check_service "Aggregation Service" "3020" || services_ok=false
check_service "Notification Service" "3021" || services_ok=false

if [ "$services_ok" = false ]; then
    print_error "Some services are not running. Please start all services first."
    exit 1
fi

echo ""
print_step "2" "Testing CBC lab workflow..."

print_info "This test will:"
echo "   1. Create a CBC lab order from Provider Portal"
echo "   2. Verify order is received by Lab Service"
echo "   3. Process order in Lab Portal"
echo "   4. Submit CBC results"
echo "   5. Verify provider receives results notification"
echo ""

print_info "CBC Test Details:"
echo "   - Test: Complete Blood Count (CBC)"
echo "   - LOINC Code: 24323-8"
echo "   - Specimen: Whole blood"
echo "   - Patient ID: $PATIENT_ID"
echo "   - Provider ID: $PROVIDER_ID"
echo "   - Encounter ID: $ENCOUNTER_ID"
echo ""

print_step "3" "Please follow these steps manually..."
echo ""

print_info "Provider Portal (http://localhost:5174):"
echo "   1. Navigate to Orders section"
echo "   2. Create New Unified Order with these details:"
echo "      - Patient ID: $PATIENT_ID"
echo "      - Provider ID: $PROVIDER_ID"
echo "      - Encounter ID: $ENCOUNTER_ID"
echo "      - Priority: ROUTINE"
echo "      - Enable Laboratory service"
echo "      - LOINC Code: 24323-8 (already filled)"
echo "      - Test Name: Complete Blood Count (already filled)"
echo "      - Specimen Type: Whole blood (already filled)"
echo "   3. Submit the order"
echo ""

print_info "Lab Portal (http://localhost:5176):"
echo "   1. Go to Worklist section"
echo "   2. Find the CBC order you just created"
echo "   3. Select the order and enter typical CBC results:"
echo "      - White Blood Cells: 7.2 (unit: K/μL, range: 4.5-11.0)"
echo "      - Red Blood Cells: 4.5 (unit: M/μL, range: 4.0-5.2)"
echo "      - Hemoglobin: 14.2 (unit: g/dL, range: 12.0-16.0)"
echo "      - Hematocrit: 42.1 (unit: %, range: 36.0-46.0)"
echo "      - Platelet Count: 250 (unit: K/μL, range: 150-450)"
echo "   4. Submit the results"
echo ""

print_step "4" "Monitoring endpoints for activity..."
echo ""

# Function to monitor lab orders
monitor_lab_orders() {
    echo "📊 Current Lab Orders:"
    local response=$(curl -s "http://localhost:3013/orders/pending" 2>/dev/null || echo '{"error": "Service not accessible"}')
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
}

# Function to check workflow events
monitor_workflow() {
    echo "🔄 Workflow Service Status:"
    local response=$(curl -s "http://localhost:3004/" 2>/dev/null || echo '{"error": "Service not accessible"}')
    echo "$response"
    echo ""
}

# Function to check notifications
monitor_notifications() {
    echo "📢 Notification Service Status:"
    local response=$(curl -s "http://localhost:3021/" 2>/dev/null || echo '{"error": "Service not accessible"}')
    echo "$response"
    echo ""
}

print_info "Monitoring services (press Ctrl+C to stop)..."
echo ""

# Continuous monitoring loop
while true; do
    clear
    echo "🧪 CBC Workflow - Live Monitoring"
    echo "================================="
    echo ""

    monitor_lab_orders
    monitor_workflow
    monitor_notifications

    echo "🕐 Monitoring... ($(date))"
    echo ""
    echo "👀 Watch for:"
    echo "   - New lab orders appearing in Lab Service"
    echo "   - Order status changes (NEW → IN_PROGRESS → RESULT_READY)"
    echo "   - Workflow events flowing through the system"
    echo "   - Notifications being sent to providers"

    sleep 5
done
