#!/bin/bash

echo "🧬 CBC WORKFLOW TEST - COMPREHENSIVE LAB EVENT FLOW"
echo "=================================================="
echo ""

# Test portal accessibility
echo "📍 STEP 1: Testing Portal Accessibility"
echo "----------------------------------------"

echo "Testing Provider Portal (5174)..."
PROVIDER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5174 2>/dev/null || echo "000")
echo "Provider Portal Status: $PROVIDER_STATUS"

echo "Testing Lab Portal (5176)..."
LAB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5176 2>/dev/null || echo "000")
echo "Lab Portal Status: $LAB_STATUS"

echo "Testing Authentication Service (3001)..."
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
echo "Authentication Service Status: $AUTH_STATUS"

echo ""

if [ "$PROVIDER_STATUS" != "200" ] || [ "$LAB_STATUS" != "200" ] || [ "$AUTH_STATUS" != "200" ]; then
    echo "❌ Some services are not accessible. Please ensure all portals and services are running."
    exit 1
fi

echo "✅ All portals and services are accessible!"
echo ""

# Test CSRF token retrieval
echo "🔐 STEP 2: Testing CSRF Authentication"
echo "--------------------------------------"

echo "Getting CSRF token from authentication service..."
CSRF_RESPONSE=$(curl -s -c /tmp/lab_cookies.txt -b /tmp/lab_cookies.txt http://localhost:3001/api/auth/csrf-token 2>/dev/null)
echo "CSRF Response: $CSRF_RESPONSE"

if [[ $CSRF_RESPONSE == *"csrfToken"* ]]; then
    echo "✅ CSRF token retrieved successfully"
else
    echo "❌ CSRF token retrieval failed"
fi

echo ""

# Test workflow service
echo "⚡ STEP 3: Testing Workflow Service"
echo "-----------------------------------"

echo "Testing Workflow Service (3004)..."
WORKFLOW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/api/health 2>/dev/null || echo "000")
echo "Workflow Service Status: $WORKFLOW_STATUS"

echo "Testing Lab Service (3013)..."
LAB_SERVICE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3013/api/health 2>/dev/null || echo "000")
echo "Lab Service Status: $LAB_SERVICE_STATUS"

echo ""

# Create a sample CBC lab order
echo "🧪 STEP 4: Creating CBC Lab Order"
echo "---------------------------------"

CBC_ORDER='{
  "patientId": "patient-123",
  "providerId": "provider-456",
  "testType": "CBC",
  "priority": "routine",
  "clinicalInfo": "Annual physical examination",
  "tests": [
    {
      "code": "CBC001",
      "name": "Complete Blood Count",
      "components": [
        "WBC", "RBC", "Hemoglobin", "Hematocrit", "Platelets",
        "MCV", "MCH", "MCHC", "RDW", "Neutrophils", "Lymphocytes",
        "Monocytes", "Eosinophils", "Basophils"
      ]
    }
  ]
}'

echo "Sending CBC order to workflow service..."
ORDER_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$CBC_ORDER" \
  http://localhost:3004/api/lab/orders 2>/dev/null || echo "Error")

echo "Order Response: $ORDER_RESPONSE"

if [[ $ORDER_RESPONSE == *"orderId"* ]] || [[ $ORDER_RESPONSE == *"id"* ]]; then
    echo "✅ CBC lab order created successfully"
else
    echo "❌ CBC lab order creation failed"
    echo "Note: This may be expected if the endpoint requires authentication"
fi

echo ""

echo "🎯 STEP 5: Manual Test Instructions"
echo "==================================="
echo ""
echo "To complete the CBC workflow test manually:"
echo ""
echo "1. 🏥 Provider Portal (http://localhost:5174)"
echo "   - Login with provider credentials"
echo "   - Navigate to Lab Orders section"
echo "   - Create a new CBC (Complete Blood Count) order for a patient"
echo "   - Fill in patient details and clinical information"
echo "   - Submit the order"
echo ""
echo "2. 🔬 Lab Portal (http://localhost:5176)"
echo "   - Login with lab technician credentials:"
echo "     Email: lab@example.com"
echo "     Password: password"
echo "   - View incoming lab orders"
echo "   - Select the CBC order created from Provider Portal"
echo "   - Enter CBC results with these sample values:"
echo ""
echo "     📊 CBC Results:"
echo "     - WBC: 7.2 K/μL (Normal: 4.0-10.0)"
echo "     - RBC: 4.8 M/μL (Normal: 4.2-5.4)"
echo "     - Hemoglobin: 14.5 g/dL (Normal: 12.0-16.0)"
echo "     - Hematocrit: 42.0% (Normal: 36.0-46.0)"
echo "     - Platelets: 280 K/μL (Normal: 150-450)"
echo "     - MCV: 88 fL (Normal: 82-98)"
echo "     - MCH: 30 pg (Normal: 27-32)"
echo "     - MCHC: 34 g/dL (Normal: 32-36)"
echo ""
echo "   - Mark the order as complete"
echo "   - Upload/attach the formatted report"
echo ""
echo "3. 🏥 Provider Portal - Results Review"
echo "   - Return to Provider Portal"
echo "   - Check for completed lab results"
echo "   - View the CBC report in formatted display"
echo "   - Verify all values and reference ranges are shown"
echo ""
echo "🔄 Expected Workflow:"
echo "Provider Creates Order → Lab Receives → Lab Processes → Lab Completes → Provider Reviews Results"
echo ""
echo "✅ Test completed! Please follow the manual steps above to complete the full CBC workflow."
