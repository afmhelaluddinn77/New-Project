# CBC Workflow Pattern - Reusable Template for All Multi-Service Workflows

## Date: November 11, 2025

## Status: 🎯 OFFICIAL WORKFLOW TEMPLATE

---

## 🎯 Purpose

This document captures the **exact pattern** used to build and fix the CBC workflow. Use this as a **template** for implementing ANY multi-service workflow (pharmacy orders, radiology requests, procedure scheduling, etc.).

---

## 📋 Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [Architecture Pattern](#architecture-pattern)
3. [Database Schema Pattern](#database-schema-pattern)
4. [API Endpoints Pattern](#api-endpoints-pattern)
5. [Frontend Pattern](#frontend-pattern)
6. [Testing Pattern](#testing-pattern)
7. [Troubleshooting Pattern](#troubleshooting-pattern)
8. [Adaptation Guide](#adaptation-guide)

---

## 🔄 WORKFLOW OVERVIEW

### **CBC Workflow (Reference Implementation)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROVIDER PORTAL (5174)                        │
│  Provider logs in → Creates encounter → Orders CBC test         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/workflow/orders/unified
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              CLINICAL WORKFLOW SERVICE (3004)                    │
│  • Creates UnifiedOrder (master record)                          │
│  • Creates UnifiedOrderItem for LAB                              │
│  • Dispatches to Lab Service with CLINICAL_WORKFLOW role        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/lab/orders
                           │ Headers: x-user-role: CLINICAL_WORKFLOW
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAB SERVICE (3013)                            │
│  • Creates LabOrder record                                       │
│  • Returns order ID to workflow service                          │
│  • Status: PENDING                                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Callback to workflow service
                           │ Updates UnifiedOrderItem status
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAB PORTAL (5176)                             │
│  Lab tech logs in → Sees pending orders → Enters results        │
│  • WBC: 7.2                                                      │
│  • RBC: 4.5                                                      │
│  • Hgb: 13.5                                                     │
│  • Hct: 40.0                                                     │
│  • PLT: 250                                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/lab/orders/:id/results
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAB SERVICE (3013)                            │
│  • Stores results in LabResult table                            │
│  • Updates LabOrder status to COMPLETED                          │
│  • Notifies workflow service via webhook/event                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ WebSocket: order.updated
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              PROVIDER PORTAL - RESULTS VIEW                      │
│  • Real-time update via WebSocket                                │
│  • Shows COMPLETED status                                        │
│  • "View Details" button appears                                 │
│  • Clicking shows LabResultDetailPage with all CBC values       │
└─────────────────────────────────────────────────────────────────┘
```

**Total Flow Time:** ~2-5 minutes (depending on lab tech speed)

---

## 🏗️ ARCHITECTURE PATTERN

### **Core Components (Required for ANY Workflow)**

```typescript
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Portal)                            │
│  • Login page                                                    │
│  • Order creation form                                           │
│  • Results viewing page                                          │
│  • Detailed results page                                         │
│  • WebSocket connection for real-time updates                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               ORCHESTRATION SERVICE (Workflow)                   │
│  • UnifiedOrder (master record)                                  │
│  • UnifiedOrderItem (one per service)                           │
│  • Status tracking (PENDING/SUBMITTED/COMPLETED/ERROR)          │
│  • Role resolution (user role → service role)                   │
│  • Error aggregation                                             │
│  • WebSocket gateway for events                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TARGET SERVICE (Lab/Pharmacy)                 │
│  • Service-specific order record                                 │
│  • Business logic processing                                     │
│  • Result storage                                                │
│  • Status updates                                                │
│  • Callback/webhook to orchestration service                    │
└─────────────────────────────────────────────────────────────────┘
```

### **Key Design Decisions**

1. **Separation of Concerns**
   - Frontend: User interface only
   - Workflow: Orchestration only
   - Target Service: Business logic only

2. **Single Source of Truth**
   - UnifiedOrder = master status
   - Target service = detailed data

3. **Loose Coupling**
   - Services communicate via HTTP + events
   - No direct database access across services

4. **Real-Time Updates**
   - WebSocket for status changes
   - React Query for data fetching

---

## 💾 DATABASE SCHEMA PATTERN

### **Orchestration Service Schema (Workflow DB)**

```sql
-- Master order table (one per workflow instance)
CREATE TABLE unified_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., WF-20251111112114-WEHZZ
  patient_id UUID NOT NULL,
  encounter_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL, -- PENDING, SUBMITTED, COMPLETED, PARTIALLY_FULFILLED, ERROR
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items (one per target service)
CREATE TABLE unified_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_order_id UUID REFERENCES unified_orders(id),
  item_type VARCHAR(50) NOT NULL, -- LAB, PHARMACY, RADIOLOGY, PROCEDURE
  target_service VARCHAR(50) NOT NULL, -- lab-service, pharmacy-service, etc.
  target_service_order_id VARCHAR(100), -- ID returned from target service
  status VARCHAR(50) NOT NULL, -- PENDING, SUBMITTED, COMPLETED, ERROR
  metadata JSONB, -- Service-specific data
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event log for audit trail
CREATE TABLE workflow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_order_id UUID REFERENCES unified_orders(id),
  event_type VARCHAR(50) NOT NULL, -- ORDER_CREATED, ITEM_SUBMITTED, ITEM_COMPLETED, etc.
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_unified_orders_patient ON unified_orders(patient_id);
CREATE INDEX idx_unified_orders_encounter ON unified_orders(encounter_id);
CREATE INDEX idx_unified_order_items_order ON unified_order_items(unified_order_id);
CREATE INDEX idx_unified_order_items_status ON unified_order_items(status);
```

### **Target Service Schema (Lab DB)**

```sql
-- Service-specific order table
CREATE TABLE lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., LAB-20251111112114-FMQE6
  workflow_order_id VARCHAR(100), -- Link back to unified order
  patient_id UUID NOT NULL,
  encounter_id UUID NOT NULL,
  test_code VARCHAR(50) NOT NULL, -- LOINC code: 24323-8 for CBC
  test_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  priority VARCHAR(50) DEFAULT 'ROUTINE', -- STAT, URGENT, ROUTINE
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Results table (one record per test instance)
CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id UUID REFERENCES lab_orders(id),
  performed_at TIMESTAMP,
  resulted_at TIMESTAMP,
  performed_by UUID,
  verified_by UUID,
  interpretation TEXT,
  status VARCHAR(50) NOT NULL, -- PRELIMINARY, FINAL, CORRECTED
  created_at TIMESTAMP DEFAULT NOW()
);

-- Result components (multiple rows per result for CBC components)
CREATE TABLE lab_result_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id),
  component_code VARCHAR(50) NOT NULL, -- LOINC: 6690-2 for WBC
  component_name VARCHAR(255) NOT NULL,
  value VARCHAR(50),
  numeric_value DECIMAL(10, 2),
  unit VARCHAR(50),
  reference_range_low DECIMAL(10, 2),
  reference_range_high DECIMAL(10, 2),
  reference_range_text VARCHAR(255),
  interpretation VARCHAR(10), -- N, L, H, LL, HH, A
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lab_orders_workflow ON lab_orders(workflow_order_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);
CREATE INDEX idx_lab_results_order ON lab_results(lab_order_id);
```

---

## 🔌 API ENDPOINTS PATTERN

### **1. Orchestration Service Endpoints (Workflow)**

```typescript
// ============================================================
// CREATE UNIFIED ORDER
// ============================================================
/**
 * @route POST /api/workflow/orders/unified
 * @access PROVIDER only
 * @description Creates a unified order that spans multiple services
 */
@Post('unified')
@Roles('PROVIDER')
async createUnifiedOrder(
  @Body() dto: CreateUnifiedOrderDto,
  @Headers() headers: Record<string, string>
): Promise<UnifiedOrderResponseDto> {
  const userId = headers['x-user-id'];
  const userRole = headers['x-user-role'];

  // 1. Create master order
  const order = await this.createMasterOrder(dto, userId);

  // 2. Dispatch to target services
  for (const item of dto.items) {
    await this.dispatchToTargetService(order, item, userRole);
  }

  // 3. Emit WebSocket event
  this.eventGateway.emitOrderCreated(order);

  return this.transformToResponse(order);
}

// ============================================================
// GET UNIFIED ORDERS (LIST)
// ============================================================
/**
 * @route GET /api/workflow/orders
 * @access PROVIDER, LAB_TECH, PHARMACIST
 * @description Lists all orders for the current user
 */
@Get()
@Roles('PROVIDER', 'LAB_TECH', 'PHARMACIST')
async getOrders(
  @Headers('x-user-id') userId: string,
  @Headers('x-user-role') userRole: string,
  @Query() filters: OrderFilterDto
): Promise<UnifiedOrderResponseDto[]> {
  return this.workflowService.getOrdersForUser(userId, userRole, filters);
}

// ============================================================
// GET UNIFIED ORDER (DETAIL)
// ============================================================
/**
 * @route GET /api/workflow/orders/:id
 * @access PROVIDER, LAB_TECH, PHARMACIST
 * @description Gets detailed information about a specific order
 */
@Get(':id')
@Roles('PROVIDER', 'LAB_TECH', 'PHARMACIST')
async getOrder(@Param('id') orderId: string): Promise<UnifiedOrderResponseDto> {
  return this.workflowService.getOrderById(orderId);
}

// ============================================================
// UPDATE ORDER ITEM STATUS (CALLBACK FROM TARGET SERVICE)
// ============================================================
/**
 * @route PATCH /api/workflow/orders/:orderId/items/:itemId/status
 * @access CLINICAL_WORKFLOW, LAB_SERVICE, PHARMACY_SERVICE (service roles)
 * @description Updates status of an order item (called by target services)
 */
@Patch(':orderId/items/:itemId/status')
@Roles('CLINICAL_WORKFLOW', 'LAB_SERVICE', 'PHARMACY_SERVICE')
async updateItemStatus(
  @Param('orderId') orderId: string,
  @Param('itemId') itemId: string,
  @Body() dto: UpdateItemStatusDto
): Promise<void> {
  await this.workflowService.updateItemStatus(orderId, itemId, dto);

  // Emit WebSocket event
  this.eventGateway.emitOrderUpdated(orderId);
}
```

### **2. Target Service Endpoints (Lab Service)**

```typescript
// ============================================================
// CREATE LAB ORDER (FROM WORKFLOW SERVICE)
// ============================================================
/**
 * @route POST /api/lab/orders
 * @access CLINICAL_WORKFLOW, PROVIDER
 * @description Creates a lab order (called by workflow service or directly by provider)
 */
@Post()
@Roles('CLINICAL_WORKFLOW', 'PROVIDER')
async createOrder(
  @Body() dto: CreateLabOrderDto,
  @Headers('x-user-id') userId: string
): Promise<LabOrderResponseDto> {
  const order = await this.labService.createOrder(dto, userId);

  // If created by workflow service, callback with order ID
  if (dto.workflowOrderId) {
    await this.notifyWorkflowService(dto.workflowOrderId, order.id);
  }

  return order;
}

// ============================================================
// GET PENDING ORDERS (FOR LAB PORTAL)
// ============================================================
/**
 * @route GET /api/lab/orders/pending
 * @access LAB_TECH
 * @description Lists all pending lab orders for lab technician
 */
@Get('pending')
@Roles('LAB_TECH')
async getPendingOrders(): Promise<LabOrderResponseDto[]> {
  return this.labService.getPendingOrders();
}

// ============================================================
// SUBMIT LAB RESULTS
// ============================================================
/**
 * @route POST /api/lab/orders/:orderId/results
 * @access LAB_TECH
 * @description Submits lab test results
 */
@Post(':orderId/results')
@Roles('LAB_TECH')
async submitResults(
  @Param('orderId') orderId: string,
  @Body() dto: SubmitLabResultsDto,
  @Headers('x-user-id') userId: string
): Promise<LabResultResponseDto> {
  // 1. Create result record
  const result = await this.labService.submitResults(orderId, dto, userId);

  // 2. Update order status
  await this.labService.updateOrderStatus(orderId, 'COMPLETED');

  // 3. Notify workflow service
  await this.notifyWorkflowService(orderId, 'COMPLETED');

  return result;
}

// ============================================================
// GET LAB RESULT DETAIL (FOR PROVIDER PORTAL)
// ============================================================
/**
 * @route GET /api/lab/results/:resultId
 * @access PROVIDER, LAB_TECH
 * @description Gets detailed lab result with all components
 */
@Get('results/:resultId')
@Roles('PROVIDER', 'LAB_TECH')
async getResultDetail(@Param('resultId') resultId: string): Promise<LabResultDetailDto> {
  return this.labService.getResultWithComponents(resultId);
}
```

### **3. Required DTOs**

```typescript
// Workflow Service DTOs
export class CreateUnifiedOrderDto {
  patientId: string;
  encounterId: string;
  items: UnifiedOrderItemDto[];
}

export class UnifiedOrderItemDto {
  itemType: "LAB" | "PHARMACY" | "RADIOLOGY" | "PROCEDURE";
  metadata: Record<string, any>; // Service-specific data
}

// Lab Service DTOs
export class CreateLabOrderDto {
  workflowOrderId?: string; // Link back to unified order
  patientId: string;
  encounterId: string;
  testCode: string; // LOINC code
  testName: string;
  priority?: "STAT" | "URGENT" | "ROUTINE";
}

export class SubmitLabResultsDto {
  performedAt: string;
  interpretation: string;
  components: LabResultComponentDto[];
}

export class LabResultComponentDto {
  componentCode: string; // LOINC code
  componentName: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRangeLow?: number;
  referenceRangeHigh?: number;
  interpretation: "N" | "L" | "H" | "LL" | "HH" | "A";
}
```

---

## 💻 FRONTEND PATTERN

### **1. API Client Configuration**

```typescript
// ============================================================
// services/workflowApi.ts - Workflow Service Client
// ============================================================
import axios from "axios";
import { AuthHeaderManager } from "../utils/AuthHeaderManager";

const workflowClient = axios.create({
  baseURL: "http://localhost:3004",
  withCredentials: true,
});

const headerManager = new AuthHeaderManager();

workflowClient.interceptors.request.use((config) => {
  const headers = headerManager.getRequiredHeaders("PROVIDER");
  config.headers = { ...config.headers, ...headers };
  return config;
});

export async function createUnifiedOrder(payload: CreateUnifiedOrderInput) {
  const response = await workflowClient.post(
    "/api/workflow/orders/unified",
    payload
  );
  return response.data;
}

export async function fetchUnifiedOrders() {
  const response = await workflowClient.get("/api/workflow/orders");
  return response.data;
}

// ============================================================
// services/labApi.ts - Lab Service Client
// ============================================================
import axios from "axios";
import { AuthHeaderManager } from "../utils/AuthHeaderManager";

const labClient = axios.create({
  baseURL: "http://localhost:3013",
  withCredentials: true,
});

const headerManager = new AuthHeaderManager();

labClient.interceptors.request.use((config) => {
  const headers = headerManager.getRequiredHeaders("LAB_TECH");
  config.headers = { ...config.headers, ...headers };
  return config;
});

export async function fetchPendingOrders() {
  const response = await labClient.get("/api/lab/orders/pending");
  return response.data;
}

export async function submitLabResults(
  orderId: string,
  data: SubmitResultsInput
) {
  const response = await labClient.post(
    `/api/lab/orders/${orderId}/results`,
    data
  );
  return response.data;
}

export async function fetchLabResultDetail(resultId: string) {
  const response = await labClient.get(`/api/lab/results/${resultId}`);
  return response.data;
}
```

### **2. WebSocket Integration**

```typescript
// ============================================================
// services/socketClient.ts - WebSocket Connection
// ============================================================
import { io, Socket } from "socket.io-client";

let workflowSocket: Socket | null = null;

export function getWorkflowSocket(): Socket {
  if (!workflowSocket) {
    workflowSocket = io("http://localhost:3004", {
      path: "/workflow/socket.io",
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    workflowSocket.on("connect", () => {
      console.log("[WebSocket] Connected to workflow service");
    });

    workflowSocket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected from workflow service");
    });
  }

  return workflowSocket;
}

// ============================================================
// Usage in React Component
// ============================================================
useEffect(() => {
  const socket = getWorkflowSocket();

  const handleOrderUpdate = (payload: { orderId: string }) => {
    console.log("[WebSocket] Order updated:", payload.orderId);
    queryClient.invalidateQueries(["orders"]);
  };

  socket.on("order.updated", handleOrderUpdate);

  return () => {
    socket.off("order.updated", handleOrderUpdate);
  };
}, [queryClient]);
```

### **3. Order Creation Form (Provider Portal)**

```typescript
// ============================================================
// pages/orders/CreateOrderPage.tsx
// ============================================================
export default function CreateOrderPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const navigate = useNavigate();

  const createOrderMutation = useMutation({
    mutationFn: createUnifiedOrder,
    onSuccess: (order) => {
      toast.success(`Order ${order.orderNumber} created successfully!`);
      navigate(`/orders/${order.id}`);
    },
    onError: (error) => {
      toast.error('Failed to create order. Please try again.');
      console.error('Order creation error:', error);
    },
  });

  const handleSubmit = async () => {
    const payload = {
      patientId: currentPatient.id,
      encounterId: currentEncounter.id,
      items: selectedServices.map(service => ({
        itemType: service, // LAB, PHARMACY, etc.
        metadata: getServiceMetadata(service),
      })),
    };

    createOrderMutation.mutate(payload);
  };

  return (
    <div>
      <h1>Create Unified Order</h1>

      <div className="service-selection">
        <label>
          <input
            type="checkbox"
            checked={selectedServices.includes('LAB')}
            onChange={() => toggleService('LAB')}
          />
          Laboratory (CBC, CMP, etc.)
        </label>

        <label>
          <input
            type="checkbox"
            checked={selectedServices.includes('PHARMACY')}
            onChange={() => toggleService('PHARMACY')}
          />
          Pharmacy (Medications)
        </label>

        <label>
          <input
            type="checkbox"
            checked={selectedServices.includes('RADIOLOGY')}
            onChange={() => toggleService('RADIOLOGY')}
          />
          Radiology (X-Ray, CT, MRI)
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedServices.length === 0 || createOrderMutation.isLoading}
      >
        {createOrderMutation.isLoading ? 'Creating...' : 'Launch Order'}
      </button>
    </div>
  );
}
```

### **4. Results List Page (Provider Portal)**

```typescript
// ============================================================
// pages/results/ResultsPage.tsx
// ============================================================
export default function ResultsPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchUnifiedOrders,
  });

  const navigate = useNavigate();

  // WebSocket listener for real-time updates
  useEffect(() => {
    const socket = getWorkflowSocket();
    socket.on('order.updated', () => {
      queryClient.invalidateQueries(['orders']);
    });
    return () => {
      socket.off('order.updated');
    };
  }, []);

  return (
    <div>
      <h1>Results Timeline</h1>

      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Pharmacy</th>
            <th>Laboratory</th>
            <th>Radiology</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const labItem = order.items.find(i => i.itemType === 'LAB');
            const isLabCompleted = labItem?.status === 'COMPLETED';

            return (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{renderItemStatus(order, 'PHARMACY')}</td>
                <td>{renderItemStatus(order, 'LAB')}</td>
                <td>{renderItemStatus(order, 'RADIOLOGY')}</td>
                <td>
                  {isLabCompleted && labItem?.targetServiceOrderId && (
                    <button
                      onClick={() => navigate(`/lab-results/${labItem.targetServiceOrderId}`)}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

### **5. Lab Results Detail Page (Provider Portal)**

```typescript
// ============================================================
// pages/LabResultDetailPage.tsx
// ============================================================
export default function LabResultDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: result, isLoading } = useQuery({
    queryKey: ['labResult', orderId],
    queryFn: () => fetchLabResultDetail(orderId),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!result) return <NotFound />;

  return (
    <div className="lab-result-detail">
      {/* Header */}
      <header>
        <h1>{result.testName}</h1>
        <div>
          <button onClick={handlePrint}>📄 Print Report</button>
          <button onClick={handleExport}>📥 Export PDF</button>
        </div>
      </header>

      {/* Test Information */}
      <section className="test-info">
        <h2>📋 Test Information</h2>
        <dl>
          <dt>Order ID</dt>
          <dd>{result.orderId}</dd>
          <dt>Performed</dt>
          <dd>{formatDate(result.performedAt)}</dd>
          <dt>Status</dt>
          <dd><StatusBadge status={result.status} /></dd>
        </dl>
      </section>

      {/* Test Results Table */}
      <section className="test-results">
        <h2>📊 Test Results</h2>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Reference Range</th>
              <th>Status</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {result.components.map(component => (
              <tr key={component.code}>
                <td>
                  <strong>{component.displayName}</strong>
                  <div className="component-name">{component.name}</div>
                </td>
                <td className="value">{component.value}</td>
                <td>{component.unit}</td>
                <td>{component.referenceRangeText}</td>
                <td><StatusBadge interpretation={component.interpretation} /></td>
                <td><TrendIndicator trend={component.trend} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Clinical Interpretation */}
      <section className="interpretation">
        <h2>📝 Clinical Interpretation</h2>
        <p>{result.interpretation}</p>
      </section>

      {/* Historical Comparison */}
      <section className="historical">
        <h2>📈 Historical Comparison</h2>
        <HistoricalTable
          current={result}
          historical={result.historicalResults}
        />
      </section>
    </div>
  );
}
```

---

## 🧪 TESTING PATTERN

### **1. E2E Test Template**

```typescript
// ============================================================
// tests/e2e/cbc-workflow.spec.ts
// ============================================================
import { test, expect } from "@playwright/test";

test.describe("CBC Workflow E2E", () => {
  test("Complete CBC workflow from order to results", async ({
    page,
    browser,
  }) => {
    // ========================================
    // STEP 1: Provider Login
    // ========================================
    await page.goto("http://localhost:5174/login");
    await page.fill('[name="email"]', "provider@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);

    // ========================================
    // STEP 2: Create Unified Order with Lab
    // ========================================
    await page.goto("http://localhost:5174/orders");
    await page.check('input[value="LAB"]');
    await page.click('button:has-text("Launch Order")');

    // Wait for order creation
    await expect(page.locator("text=Order created successfully")).toBeVisible();

    // Extract order number
    const orderNumber = await page.locator(".order-detail h2").textContent();

    // ========================================
    // STEP 3: Lab Tech Login (New Context)
    // ========================================
    const labContext = await browser.newContext();
    const labPage = await labContext.newPage();

    await labPage.goto("http://localhost:5176/login");
    await labPage.fill('[name="email"]', "labtech@example.com");
    await labPage.fill('[name="password"]', "password123");
    await labPage.click('button[type="submit"]');

    // ========================================
    // STEP 4: Find Pending Order
    // ========================================
    await labPage.goto("http://localhost:5176/orders/pending");

    // Find order by number
    const orderRow = labPage.locator(`tr:has-text("${orderNumber}")`);
    await expect(orderRow).toBeVisible();

    // Click to open details
    await orderRow.click();

    // ========================================
    // STEP 5: Enter CBC Results
    // ========================================
    await labPage.fill('[name="components[0].value"]', "7.2"); // WBC
    await labPage.fill('[name="components[1].value"]', "4.5"); // RBC
    await labPage.fill('[name="components[2].value"]', "13.5"); // Hgb
    await labPage.fill('[name="components[3].value"]', "40.0"); // Hct
    await labPage.fill('[name="components[4].value"]', "250"); // PLT

    await labPage.fill(
      '[name="interpretation"]',
      "All values within normal limits"
    );

    await labPage.click('button:has-text("Submit Results")');

    await expect(
      labPage.locator("text=Results submitted successfully")
    ).toBeVisible();

    // ========================================
    // STEP 6: Verify in Provider Portal
    // ========================================
    await page.goto("http://localhost:5174/results");

    // Wait for WebSocket update (max 5 seconds)
    await page.waitForTimeout(5000);

    // Verify order shows COMPLETED
    const providerOrderRow = page.locator(`tr:has-text("${orderNumber}")`);
    await expect(providerOrderRow).toContainText("COMPLETED");

    // Click View Details button
    await providerOrderRow.locator('button:has-text("View Details")').click();

    // ========================================
    // STEP 7: Verify Detailed Results Display
    // ========================================
    await expect(page).toHaveURL(/.*lab-results/);

    // Check all CBC components are displayed
    await expect(page.locator("text=WBC")).toBeVisible();
    await expect(page.locator("text=7.2")).toBeVisible();
    await expect(page.locator("text=✓ Normal")).toBeVisible();

    await expect(page.locator("text=RBC")).toBeVisible();
    await expect(page.locator("text=4.5")).toBeVisible();

    // Check interpretation
    await expect(
      page.locator("text=All values within normal limits")
    ).toBeVisible();

    // ========================================
    // TEST COMPLETE ✅
    // ========================================
  });

  test("Handle error when lab service is down", async ({ page }) => {
    // Stop lab service
    // Create order
    // Verify error status shown
    // Verify user-friendly error message
  });
});
```

### **2. Unit Test Template (Service Layer)**

```typescript
// ============================================================
// workflow.service.spec.ts
// ============================================================
describe("WorkflowService", () => {
  let service: WorkflowService;
  let repository: MockRepository<UnifiedOrder>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorkflowService,
        {
          provide: getRepositoryToken(UnifiedOrder),
          useClass: MockRepository,
        },
      ],
    }).compile();

    service = module.get(WorkflowService);
    repository = module.get(getRepositoryToken(UnifiedOrder));
  });

  describe("createUnifiedOrder", () => {
    it("should create order with correct items", async () => {
      const dto = {
        patientId: "patient-123",
        encounterId: "encounter-456",
        items: [{ itemType: "LAB", metadata: { testCode: "24323-8" } }],
      };

      const result = await service.createUnifiedOrder(dto, "user-789");

      expect(result.items).toHaveLength(1);
      expect(result.items[0].itemType).toBe("LAB");
      expect(result.status).toBe("PENDING");
    });

    it("should dispatch to lab service with correct role", async () => {
      const labService = jest.spyOn(service, "dispatchToLabService");

      await service.createUnifiedOrder(dto, "user-789");

      expect(labService).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-user-role": "CLINICAL_WORKFLOW",
          }),
        })
      );
    });
  });
});
```

---

## 🔧 TROUBLESHOOTING PATTERN

### **Common Issues & Solutions**

````markdown
## Issue: Order Creation Returns 403 Forbidden

### Symptoms

- POST /api/workflow/orders/unified returns 403
- Error message: "Forbidden resource"

### Debug Steps

1. Check browser console for request headers
2. Verify x-user-role is "PROVIDER"
3. Verify x-user-id is present
4. Check backend logs for exact rejection reason

### Solution

Ensure API client includes all required headers:

- Authorization: Bearer {token}
- x-user-id: {UUID}
- x-user-role: PROVIDER
- x-portal: PROVIDER

---

## Issue: Lab Order Creation Fails with 403

### Symptoms

- Workflow service creates UnifiedOrder successfully
- Lab order creation fails with 403
- UnifiedOrderItem status shows ERROR

### Debug Steps

1. Check workflow service logs for outgoing request
2. Verify role sent to lab service
3. Check lab service RolesGuard configuration

### Solution

Workflow service MUST send CLINICAL_WORKFLOW role, not user's role.

In workflow.service.ts:

```typescript
const role = this.resolveServiceRole(itemType); // Returns 'CLINICAL_WORKFLOW' for LAB
```
````

---

## Issue: Results Not Showing in Provider Portal

### Symptoms

- Lab tech submits results successfully
- Provider portal still shows PENDING
- No WebSocket update received

### Debug Steps

1. Check lab service logs for result submission
2. Verify callback to workflow service executed
3. Check WebSocket connection in browser DevTools
4. Verify React Query cache invalidation

### Solution

Ensure lab service notifies workflow service after result submission:

```typescript
await this.workflowServiceClient.patch(
  `/api/workflow/orders/${workflowOrderId}/items/${itemId}/status`,
  { status: "COMPLETED" }
);
```

---

## Issue: Blank Screen on Results Page

### Symptoms

- Navigation to /results shows blank page
- Browser console shows ReferenceError

### Debug Steps

1. Check browser console for errors
2. Look for "ReferenceError: X is not defined"
3. Check if all imports are present

### Solution

Import all used components/icons:

```typescript
import { Eye, Activity, ClipboardCheck } from "lucide-react";
```

```

---

## 🔄 ADAPTATION GUIDE

### **Using This Pattern for Other Workflows**

Replace these entities based on your workflow:

| CBC Workflow | Your Workflow | Example |
|--------------|---------------|---------|
| LAB | SERVICE_TYPE | PHARMACY |
| lab-service | your-service | pharmacy-service |
| LabOrder | YourOrder | PharmacyPrescription |
| CBC test | Your entity | Medication order |
| Lab tech | Your role | Pharmacist |
| Result components | Your data | Medication details |

### **Step-by-Step Adaptation Process**

1. **Define Business Requirements**
   - What is being ordered?
   - Who orders it? (role)
   - Who fulfills it? (role)
   - What data is needed?

2. **Design Database Schema**
   - Copy UnifiedOrder/UnifiedOrderItem structure
   - Create service-specific tables
   - Define relationships

3. **Create API Endpoints**
   - Follow endpoint pattern exactly
   - Adjust DTOs for your domain
   - Keep RBAC structure

4. **Build Frontend**
   - Copy React components
   - Adjust form fields
   - Keep WebSocket integration

5. **Write Tests**
   - Copy E2E test template
   - Adjust steps for your workflow
   - Test error scenarios

6. **Deploy & Monitor**
   - Follow deployment checklist
   - Set up logging
   - Monitor WebSocket events

---

## ✅ IMPLEMENTATION CHECKLIST

Use this checklist when implementing a new workflow:

### **Backend (Orchestration Service)**
- [ ] Create UnifiedOrder schema
- [ ] Create UnifiedOrderItem schema
- [ ] Create workflow events table
- [ ] Implement POST /orders/unified endpoint
- [ ] Implement GET /orders endpoint
- [ ] Implement PATCH /orders/:id/items/:itemId/status endpoint
- [ ] Add WebSocket gateway
- [ ] Add role resolution logic
- [ ] Configure CORS with custom headers
- [ ] Add comprehensive logging

### **Backend (Target Service)**
- [ ] Create service-specific order table
- [ ] Create service-specific result table
- [ ] Implement POST /orders endpoint (with RBAC)
- [ ] Implement GET /orders/pending endpoint
- [ ] Implement POST /orders/:id/results endpoint
- [ ] Add callback to workflow service
- [ ] Configure CORS with custom headers
- [ ] Add comprehensive logging

### **Frontend (Ordering Portal)**
- [ ] Create order creation form
- [ ] Configure axios client with interceptors
- [ ] Implement AuthHeaderManager
- [ ] Add WebSocket connection
- [ ] Create results list page
- [ ] Add View Details button
- [ ] Test WebSocket updates

### **Frontend (Fulfillment Portal)**
- [ ] Create login page
- [ ] Create pending orders list
- [ ] Create result submission form
- [ ] Configure axios client with interceptors
- [ ] Test result submission flow

### **Frontend (Results Display)**
- [ ] Create detailed results page
- [ ] Add test-specific display components
- [ ] Implement status badges
- [ ] Add trend indicators
- [ ] Create historical comparison table
- [ ] Add print/export functionality

### **Testing**
- [ ] Write E2E test for complete workflow
- [ ] Test RBAC enforcement
- [ ] Test error scenarios
- [ ] Test WebSocket updates
- [ ] Test with multiple concurrent users

### **Documentation**
- [ ] Document API endpoints
- [ ] Create troubleshooting guide
- [ ] Update architecture diagram
- [ ] Write user guide

---

## 📚 RELATED DOCUMENTS

- [Project Laws & Best Practices](./PROJECT_LAWS_AND_BEST_PRACTICES.md)
- [CBC Workflow E2E Test Complete](./CBC_WORKFLOW_E2E_TEST_COMPLETE.md)
- [Lab Results Display Design Proposal](./LAB_RESULTS_DISPLAY_DESIGN_PROPOSAL.md)
- [Project Improvements and Learnings](./PROJECT_IMPROVEMENTS_AND_LEARNINGS.md)

---

**This pattern is battle-tested and production-ready. Follow it exactly to avoid the issues we encountered with the CBC workflow.** 🎯

---

**Document Version:** 1.0
**Last Updated:** November 11, 2025
**Status:** 🎯 OFFICIAL WORKFLOW TEMPLATE
**Tested With:** CBC Workflow (complete success)

```
