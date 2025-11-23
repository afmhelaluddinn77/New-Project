# Complete Blood Count (CBC) Lab Workflow Test Guide

## 🩺 Overview

This guide will walk you through testing the complete lab workflow for a CBC test from order creation to result delivery.

## 🎯 Workflow Steps

### Phase 1: Create Lab Order (Provider Portal)

**Portal:** http://localhost:5174

1. **Navigate to Provider Portal**
   - Open: http://localhost:5174
   - Go to "Orders" section (Unified Orders)

2. **Create New CBC Order**
   - Click "New Unified Order"
   - Fill in patient details:
     - **Patient ID:** `PAT001`
     - **Provider ID:** `DR001`
     - **Encounter ID:** `ENC001`
     - **Priority:** `ROUTINE`
     - **Notes:** `CBC for routine checkup`

3. **Configure Laboratory Service**
   - ✅ Enable "Laboratory" service
   - The form should be pre-populated with:
     - **LOINC Code:** `24323-8`
     - **Test Name:** `Complete Blood Count`
     - **Specimen Type:** `Whole blood`
   - Leave other services (Pharmacy, Radiology) disabled

4. **Submit Order**
   - Click "Create Order" button
   - ✅ **Expected:** Order appears in the worklist with status "NEW"

### Phase 2: Process Order (Lab Portal)

**Portal:** http://localhost:5176

1. **Access Lab Portal**
   - Open: http://localhost:5176
   - Go to "Worklist" section

2. **Locate CBC Order**
   - ✅ **Expected:** See the CBC order you just created
   - Patient: PAT001
   - Test: Complete Blood Count
   - Status: NEW or PENDING

3. **Select Order for Processing**
   - Click on the CBC order
   - Review order details
   - ✅ **Expected:** Order details show correctly

### Phase 3: Enter CBC Results

**Typical CBC Reference Values:**

| Parameter            | Value | Unit | Reference Range | Flag   |
| -------------------- | ----- | ---- | --------------- | ------ |
| White Blood Cells    | 7.2   | K/μL | 4.5-11.0        | NORMAL |
| Red Blood Cells      | 4.5   | M/μL | 4.0-5.2         | NORMAL |
| Hemoglobin           | 14.2  | g/dL | 12.0-16.0       | NORMAL |
| Hematocrit           | 42.1  | %    | 36.0-46.0       | NORMAL |
| Platelet Count       | 250   | K/μL | 150-450         | NORMAL |
| Mean Cell Volume     | 88.5  | fL   | 80.0-100.0      | NORMAL |
| Mean Cell Hemoglobin | 31.6  | pg   | 27.0-32.0       | NORMAL |
| Mean Cell Hgb Conc   | 35.7  | g/dL | 32.0-36.0       | NORMAL |

1. **Enter Results in Lab Portal**
   - For each parameter, enter:
     - **Value:** (from table above)
     - **Unit:** (from table above)
     - **Reference Range:** (from table above)
     - **Abnormal Flag:** NORMAL
     - **Comment:** (optional)

2. **Submit Results**
   - Click "Submit Results"
   - ✅ **Expected:** Order status changes to "RESULT_READY"

### Phase 4: View Results (Provider Portal)

**Portal:** http://localhost:5174

1. **Return to Provider Portal**
   - Navigate to "Results" section
   - OR check "Orders" section for status updates

2. **Locate Completed CBC**
   - ✅ **Expected:** CBC order shows status "COMPLETED"
   - Results should be available for review

3. **Review Formatted Results**
   - Click on the completed order
   - ✅ **Expected:** See properly formatted CBC results with:
     - All parameter values
     - Reference ranges
     - Normal/abnormal flags
     - Professional formatting

## 🔍 Monitoring Points

During the test, monitor these aspects:

### Backend Services

```bash
# Check Lab Service for new orders
curl -s http://localhost:3013/orders/pending

# Check Workflow Service for processing
curl -s http://localhost:3004/

# Check Aggregation Service
curl -s http://localhost:3020/
```

### Expected System Behavior

1. **Order Creation:**
   - Provider Portal → Workflow Service → Lab Service
   - Order stored with status "NEW"

2. **Order Processing:**
   - Lab Portal queries Lab Service for pending orders
   - Lab tech processes and enters results

3. **Result Submission:**
   - Lab Portal → Lab Service (results storage)
   - Lab Service → NATS → Aggregation Service
   - Aggregation Service → Notification Service
   - Notification → Provider Portal (via WebSocket)

4. **Result Display:**
   - Provider Portal shows formatted results
   - Proper medical formatting with ranges and flags

## ✅ Success Criteria

- [ ] Order successfully created in Provider Portal
- [ ] Order appears in Lab Portal worklist
- [ ] CBC results can be entered with proper formatting
- [ ] Results are saved and order status updates
- [ ] Provider Portal displays completed results
- [ ] Results show proper medical formatting
- [ ] All reference ranges and abnormal flags display correctly

## 🚨 Troubleshooting

**If order doesn't appear in Lab Portal:**

- Check if Lab Service is running (port 3013)
- Check browser console for API errors
- Verify authentication if required

**If results don't save:**

- Check Lab Service logs
- Verify all required fields are filled
- Check database connectivity

**If Provider Portal doesn't show results:**

- Check Workflow Service (port 3004)
- Check Aggregation Service (port 3020)
- Check WebSocket connections
- Check browser console for updates

## 🎉 Expected Final Result

A complete lab workflow demonstrating:

1. ✅ Seamless order creation from Provider Portal
2. ✅ Real-time order processing in Lab Portal
3. ✅ Professional CBC result formatting
4. ✅ End-to-end result delivery to provider
5. ✅ Proper medical data presentation with reference ranges

---

**Start the test by opening both portals:**

- Provider Portal: http://localhost:5174
- Lab Portal: http://localhost:5176
