# Pharmacy Portal - Complete Design Specification

## Date: November 11, 2025
## Status: 🏥 OFFICIAL DESIGN SPECIFICATION

---

## 🎯 Purpose

Complete design specification for the Pharmacy Portal based on international EMR standards (Epic, Cerner) and modern pharmacy management best practices. This portal enables pharmacists to receive, process, and fulfill medication orders from providers.

---

## 📋 Table of Contents

1. [Portal Overview](#portal-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Core Features](#core-features)
4. [Workflow Design](#workflow-design)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Design](#frontend-design)
8. [Implementation Roadmap](#implementation-roadmap)

---

## 🏥 PORTAL OVERVIEW

### **Purpose**
Enable pharmacists to:
- Receive medication orders from providers
- Verify prescriptions
- Check drug interactions & allergies
- Dispense medications
- Track medication inventory
- Communicate with providers

### **Key Requirements**
- **Medication Order Types**: 4 modern EMR requisition types
- **Drug Database Integration**: Formulary, interactions, contraindications
- **Allergy Checking**: Real-time allergy alerts
- **Inventory Management**: Track stock levels
- **Provider Communication**: Secure messaging for clarifications

---

## 👥 USER ROLES & PERMISSIONS

### **1. Pharmacist (Primary User)**
**Permissions:**
- ✅ View pending medication orders
- ✅ Verify prescriptions
- ✅ Check drug interactions
- ✅ Dispense medications
- ✅ Update order status
- ✅ Communicate with providers
- ✅ Manage inventory
- ❌ Cannot delete orders
- ❌ Cannot modify patient information

### **2. Pharmacy Technician**
**Permissions:**
- ✅ View pending orders
- ✅ Prepare medications
- ✅ Update inventory
- ❌ Cannot dispense (pharmacist verification required)
- ❌ Cannot modify prescriptions

### **3. Pharmacy Manager**
**Permissions:**
- ✅ All pharmacist permissions
- ✅ Manage inventory
- ✅ Generate reports
- ✅ Manage user accounts

---

## 🎯 CORE FEATURES

### **Feature 1: Medication Order Reception**

**4 Modern EMR Order Types:**

#### **1. Standard Prescription Order**
- Regular medication with clear dosing
- Example: Metformin 500mg, 1 tablet twice daily, 30-day supply
- **Fields:**
  - Medication name
  - Strength & form
  - Dosing instructions (SIG)
  - Quantity
  - Refills
  - Duration

#### **2. PRN (As Needed) Order**
- Medication taken as symptoms require
- Example: Ibuprofen 400mg, take as needed for pain, max 3 doses/day
- **Fields:**
  - Medication name
  - Strength & form
  - PRN indication (pain, nausea, etc.)
  - Maximum frequency
  - Maximum daily dose
  - Duration

#### **3. Taper Order**
- Medication with decreasing doses over time
- Example: Prednisone taper: 40mg x 3 days, 30mg x 3 days, 20mg x 3 days, 10mg x 3 days
- **Fields:**
  - Medication name
  - Taper schedule (doses & durations)
  - Total duration
  - Special instructions

#### **4. Compound Medication Order**
- Custom formulation requiring preparation
- Example: Custom cream with multiple ingredients
- **Fields:**
  - Ingredient list with quantities
  - Compounding instructions
  - Final quantity
  - Expiration guidance

---

### **Feature 2: Drug Interaction Checking**

**Real-Time Checks:**
- Drug-drug interactions
- Drug-allergy interactions
- Drug-disease interactions
- Duplicate therapy detection

**Alert Levels:**
- 🔴 **Critical**: Contraindicated, do not dispense
- 🟡 **Moderate**: Caution required, document override
- 🟢 **Minor**: Informational only

**Example Workflow:**
```
1. Pharmacist selects order
2. System checks patient's current medications
3. System checks patient's allergies
4. System checks patient's diagnoses
5. Display interaction alerts
6. Pharmacist reviews and documents action
```

---

### **Feature 3: Medication Dispensing**

**Verification Steps:**
1. Verify patient identity
2. Verify medication selection
3. Verify dosage & quantity
4. Check for interactions
5. Provide counseling
6. Document dispensing

**Barcode Scanning:**
- Scan patient wristband/ID
- Scan medication barcode
- Confirm match before dispensing

---

### **Feature 4: Provider Communication**

**Secure Messaging:**
- Clarification requests
- Dosage questions
- Alternative medication suggestions
- Prior authorization support

**Example Messages:**
- "Metformin 500mg is out of stock. OK to substitute with 850mg?"
- "Patient has sulfa allergy. Recommend alternative antibiotic?"

---

### **Feature 5: Inventory Management**

**Stock Tracking:**
- Current stock levels
- Low stock alerts
- Expiration date tracking
- Automatic reorder points

**Medication Search:**
- Search by name, NDC code, or therapeutic class
- Filter by availability
- Sort by expiration date

---

## 🔄 WORKFLOW DESIGN

### **Complete Pharmacy Workflow (Provider → Pharmacy → Provider)**

```
┌─────────────────────────────────────────────────────────────────┐
│               PROVIDER PORTAL (Port 5174)                        │
│  Provider creates medication order for patient                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/workflow/orders/unified
                           │ itemType: PHARMACY
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│         CLINICAL WORKFLOW SERVICE (Port 3004)                    │
│  • Creates UnifiedOrder record                                   │
│  • Creates UnifiedOrderItem (type: PHARMACY)                     │
│  • Dispatches to Pharmacy Service                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/pharmacy/prescriptions
                           │ Headers: x-user-role: CLINICAL_WORKFLOW
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               PHARMACY SERVICE (Port 3014)                       │
│  • Creates Prescription record                                   │
│  • Status: PENDING_VERIFICATION                                  │
│  • Returns prescription ID                                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Appears in Pharmacy Portal
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               PHARMACY PORTAL (Port 5177)                        │
│  Pharmacist sees new order:                                      │
│  1. Views prescription details                                   │
│  2. Checks drug interactions                                     │
│  3. Checks patient allergies                                     │
│  4. Verifies medication availability                             │
│  5. Counsels patient (if applicable)                             │
│  6. Dispenses medication                                         │
│  7. Updates status to DISPENSED                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/pharmacy/prescriptions/:id/dispense
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               PHARMACY SERVICE (Port 3014)                       │
│  • Updates Prescription status to DISPENSED                      │
│  • Records dispensing details (date, pharmacist, quantity)       │
│  • Notifies workflow service                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ WebSocket: order.updated
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│         PROVIDER PORTAL - MEDICATION ORDERS VIEW                 │
│  • Real-time status update via WebSocket                         │
│  • Order status: PENDING → DISPENSED                             │
│  • Provider sees medication was dispensed                        │
│  • Dispensing details available                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 DATABASE SCHEMA

### **Pharmacy Service Database**

```sql
-- ============================================================
-- PRESCRIPTIONS TABLE
-- ============================================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., RX-20251111-ABCD1
  workflow_order_id VARCHAR(100), -- Link back to unified order
  patient_id UUID NOT NULL,
  encounter_id UUID NOT NULL,
  provider_id UUID NOT NULL,

  -- Prescription Details
  medication_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  strength VARCHAR(50), -- e.g., "500mg"
  form VARCHAR(50), -- e.g., "Tablet", "Capsule", "Liquid"
  ndc_code VARCHAR(50), -- National Drug Code

  -- Dosing Instructions
  sig TEXT NOT NULL, -- Signa (directions for use)
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50), -- e.g., "tablets", "ml"
  days_supply INTEGER,
  refills INTEGER DEFAULT 0,

  -- Order Type (from 4 modern EMR types)
  order_type VARCHAR(50) NOT NULL, -- STANDARD, PRN, TAPER, COMPOUND
  order_metadata JSONB, -- Type-specific data (e.g., taper schedule, PRN indication)

  -- Status
  status VARCHAR(50) NOT NULL, -- PENDING_VERIFICATION, VERIFIED, IN_PROGRESS, DISPENSED, CANCELLED
  priority VARCHAR(50) DEFAULT 'ROUTINE', -- STAT, URGENT, ROUTINE

  -- Verification
  verified_by UUID, -- Pharmacist who verified
  verified_at TIMESTAMP,
  dispensed_by UUID, -- Pharmacist who dispensed
  dispensed_at TIMESTAMP,
  dispensing_notes TEXT,

  -- Drug Interaction Checks
  interaction_check_performed BOOLEAN DEFAULT FALSE,
  interaction_alerts JSONB, -- Array of interaction alerts
  allergy_check_performed BOOLEAN DEFAULT FALSE,
  allergy_alerts JSONB, -- Array of allergy alerts
  override_reason TEXT, -- If interactions/allergies overridden

  -- Inventory
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity DECIMAL(10, 2),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- DISPENSING HISTORY TABLE
-- ============================================================
CREATE TABLE dispensing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES prescriptions(id),

  -- Dispensing Details
  dispensed_quantity DECIMAL(10, 2) NOT NULL,
  dispensed_by UUID NOT NULL,
  dispensed_at TIMESTAMP NOT NULL,

  -- Patient Verification
  patient_verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50), -- BARCODE, MANUAL, PHOTO_ID

  -- Counseling
  counseling_provided BOOLEAN DEFAULT FALSE,
  counseling_notes TEXT,

  -- Refill Info
  refill_number INTEGER,
  refills_remaining INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- DRUG INTERACTIONS TABLE (Reference Data)
-- ============================================================
CREATE TABLE drug_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_a_name VARCHAR(255) NOT NULL,
  drug_b_name VARCHAR(255) NOT NULL,
  interaction_severity VARCHAR(50) NOT NULL, -- CRITICAL, MODERATE, MINOR
  interaction_description TEXT,
  clinical_effect TEXT,
  management_recommendation TEXT,
  reference_source VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MEDICATION INVENTORY TABLE
-- ============================================================
CREATE TABLE medication_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  ndc_code VARCHAR(50) UNIQUE NOT NULL,
  strength VARCHAR(50),
  form VARCHAR(50),

  -- Inventory
  current_stock DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50),
  reorder_level DECIMAL(10, 2),
  reorder_quantity DECIMAL(10, 2),

  -- Expiration Tracking
  lot_number VARCHAR(100),
  expiration_date DATE,

  -- Pricing
  cost_per_unit DECIMAL(10, 2),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PROVIDER MESSAGES TABLE (for clarifications)
-- ============================================================
CREATE TABLE provider_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES prescriptions(id),
  sender_id UUID NOT NULL,
  sender_role VARCHAR(50), -- PHARMACIST, PROVIDER
  recipient_id UUID NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'UNREAD', -- UNREAD, READ, RESPONDED
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_provider ON prescriptions(provider_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_workflow ON prescriptions(workflow_order_id);
CREATE INDEX idx_inventory_ndc ON medication_inventory(ndc_code);
CREATE INDEX idx_inventory_stock ON medication_inventory(current_stock);
```

---

## 🔌 API ENDPOINTS

### **Pharmacy Service Endpoints**

```typescript
// ============================================================
// CREATE PRESCRIPTION (FROM WORKFLOW SERVICE)
// ============================================================
/**
 * @route POST /api/pharmacy/prescriptions
 * @access CLINICAL_WORKFLOW, PROVIDER
 */
@Post()
@Roles('CLINICAL_WORKFLOW', 'PROVIDER')
async createPrescription(
  @Body() dto: CreatePrescriptionDto,
  @Headers('x-user-id') userId: string
) {
  const prescription = await this.pharmacyService.createPrescription(dto, userId);

  // Notify workflow service if from unified order
  if (dto.workflowOrderId) {
    await this.notifyWorkflowService(dto.workflowOrderId, prescription.id);
  }

  return prescription;
}

// ============================================================
// GET PENDING PRESCRIPTIONS (FOR PHARMACY PORTAL)
// ============================================================
/**
 * @route GET /api/pharmacy/prescriptions/pending
 * @access PHARMACIST, PHARMACY_TECH
 */
@Get('pending')
@Roles('PHARMACIST', 'PHARMACY_TECH')
async getPendingPrescriptions() {
  return this.pharmacyService.getPendingPrescriptions();
}

// ============================================================
// GET PRESCRIPTION DETAIL
// ============================================================
/**
 * @route GET /api/pharmacy/prescriptions/:id
 * @access PHARMACIST, PHARMACY_TECH, PROVIDER
 */
@Get(':id')
@Roles('PHARMACIST', 'PHARMACY_TECH', 'PROVIDER')
async getPrescription(@Param('id') id: string) {
  return this.pharmacyService.getPrescriptionById(id);
}

// ============================================================
// CHECK DRUG INTERACTIONS
// ============================================================
/**
 * @route POST /api/pharmacy/prescriptions/:id/check-interactions
 * @access PHARMACIST
 */
@Post(':id/check-interactions')
@Roles('PHARMACIST')
async checkInteractions(
  @Param('id') id: string,
  @Body() dto: CheckInteractionsDto
) {
  // Get patient's current medications
  const patientMeds = await this.getPatientMedications(dto.patientId);

  // Check interactions
  const interactions = await this.drugInteractionService.checkInteractions(
    dto.medicationName,
    patientMeds
  );

  // Check allergies
  const allergies = await this.allergyCheckService.checkAllergies(
    dto.patientId,
    dto.medicationName
  );

  // Update prescription with checks
  await this.pharmacyService.updateInteractionChecks(id, interactions, allergies);

  return { interactions, allergies };
}

// ============================================================
// VERIFY PRESCRIPTION
// ============================================================
/**
 * @route POST /api/pharmacy/prescriptions/:id/verify
 * @access PHARMACIST
 */
@Post(':id/verify')
@Roles('PHARMACIST')
async verifyPrescription(
  @Param('id') id: string,
  @Body() dto: VerifyPrescriptionDto,
  @Headers('x-user-id') pharmacistId: string
) {
  await this.pharmacyService.verifyPrescription(id, pharmacistId, dto);
  return { message: 'Prescription verified successfully' };
}

// ============================================================
// DISPENSE MEDICATION
// ============================================================
/**
 * @route POST /api/pharmacy/prescriptions/:id/dispense
 * @access PHARMACIST
 */
@Post(':id/dispense')
@Roles('PHARMACIST')
async dispenseMedication(
  @Param('id') id: string,
  @Body() dto: DispenseMedicationDto,
  @Headers('x-user-id') pharmacistId: string
) {
  // 1. Record dispensing
  const dispensing = await this.pharmacyService.dispenseMedication(
    id,
    pharmacistId,
    dto
  );

  // 2. Update inventory
  await this.inventoryService.decrementStock(dto.ndcCode, dto.quantity);

  // 3. Update prescription status
  await this.pharmacyService.updatePrescriptionStatus(id, 'DISPENSED');

  // 4. Notify workflow service
  await this.notifyWorkflowService(id, 'DISPENSED');

  return dispensing;
}

// ============================================================
// SEND MESSAGE TO PROVIDER
// ============================================================
/**
 * @route POST /api/pharmacy/prescriptions/:id/messages
 * @access PHARMACIST
 */
@Post(':id/messages')
@Roles('PHARMACIST')
async sendMessageToProvider(
  @Param('id') prescriptionId: string,
  @Body() dto: SendMessageDto,
  @Headers('x-user-id') pharmacistId: string
) {
  const message = await this.messagingService.sendMessage({
    prescriptionId,
    senderId: pharmacistId,
    senderRole: 'PHARMACIST',
    recipientId: dto.providerId,
    subject: dto.subject,
    message: dto.message,
  });

  // Send notification to provider
  await this.notificationService.notifyProvider(dto.providerId, message);

  return message;
}
```

---

## 🎨 FRONTEND DESIGN

### **Page 1: Pharmacy Dashboard**

```typescript
// pharmacy-portal/src/pages/DashboardPage.tsx

export default function PharmacyDashboardPage() {
  return (
    <DashboardLayout>
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<ClipboardList />}
          title="Pending Orders"
          value="12"
          change="+3 from yesterday"
          color="blue"
        />
        <StatCard
          icon={<CheckCircle />}
          title="Dispensed Today"
          value="47"
          change="+12% from average"
          color="green"
        />
        <StatCard
          icon={<AlertTriangle />}
          title="Low Stock Items"
          value="8"
          change="Action required"
          color="orange"
        />
        <StatCard
          icon={<Clock />}
          title="Avg. Wait Time"
          value="15 min"
          change="-5 min from last week"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions>
        <QuickActionButton
          icon={<FileText />}
          label="View Pending Orders"
          to="/pending"
        />
        <QuickActionButton
          icon={<Search />}
          label="Search Medications"
          to="/inventory"
        />
        <QuickActionButton
          icon={<MessageSquare />}
          label="Provider Messages"
          to="/messages"
        />
      </QuickActions>

      {/* Recent Orders Table */}
      <RecentOrdersWidget />
    </DashboardLayout>
  );
}
```

---

### **Page 2: Pending Prescriptions**

```typescript
// pharmacy-portal/src/pages/PendingPrescriptionsPage.tsx

export default function PendingPrescriptionsPage() {
  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['pendingPrescriptions'],
    queryFn: fetchPendingPrescriptions,
  });

  return (
    <PageLayout>
      <PageHeader
        title="Pending Prescriptions"
        subtitle="Review and process medication orders"
      />

      {/* Filters */}
      <FilterBar>
        <Select label="Priority" options={['All', 'STAT', 'URGENT', 'ROUTINE']} />
        <Select label="Type" options={['All', 'Standard', 'PRN', 'Taper', 'Compound']} />
        <SearchInput placeholder="Search by patient or medication..." />
      </FilterBar>

      {/* Prescriptions Table */}
      <Table>
        <thead>
          <tr>
            <th>Rx Number</th>
            <th>Patient</th>
            <th>Medication</th>
            <th>Provider</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map(rx => (
            <tr key={rx.id}>
              <td>
                <Link to={`/prescriptions/${rx.id}`}>
                  {rx.prescriptionNumber}
                </Link>
              </td>
              <td>
                <PatientInfo patient={rx.patient} />
              </td>
              <td>
                <MedicationInfo
                  name={rx.medicationName}
                  strength={rx.strength}
                  form={rx.form}
                />
              </td>
              <td>{rx.provider.name}</td>
              <td>
                <TypeBadge type={rx.orderType} />
              </td>
              <td>
                <PriorityBadge priority={rx.priority} />
              </td>
              <td>
                <TimeAgo date={rx.createdAt} />
              </td>
              <td>
                <ActionButtons>
                  <Button size="sm" onClick={() => navigate(`/prescriptions/${rx.id}`)}>
                    Review
                  </Button>
                </ActionButtons>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </PageLayout>
  );
}
```

---

### **Page 3: Prescription Detail & Verification**

```typescript
// pharmacy-portal/src/pages/PrescriptionDetailPage.tsx

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: prescription, isLoading } = useQuery({
    queryKey: ['prescription', id],
    queryFn: () => fetchPrescription(id),
  });

  const [interactionResults, setInteractionResults] = useState(null);
  const [showDispensingModal, setShowDispensingModal] = useState(false);

  const checkInteractions = async () => {
    const results = await checkDrugInteractions(id, {
      patientId: prescription.patientId,
      medicationName: prescription.medicationName,
    });
    setInteractionResults(results);
  };

  return (
    <PageLayout>
      {/* Header */}
      <PageHeader
        title={`Prescription ${prescription.prescriptionNumber}`}
        subtitle={`${prescription.patient.name} - ${prescription.medicationName}`}
        backLink="/pending"
      />

      {/* Two-Column Layout */}
      <div className="prescription-detail-grid">
        {/* Left Column: Prescription Details */}
        <Card title="📋 Prescription Details">
          <DetailRow label="Medication" value={prescription.medicationName} />
          <DetailRow label="Generic Name" value={prescription.genericName} />
          <DetailRow label="Strength" value={prescription.strength} />
          <DetailRow label="Form" value={prescription.form} />
          <DetailRow label="NDC Code" value={prescription.ndcCode} />

          <Divider />

          <DetailRow label="Directions (SIG)" value={prescription.sig} />
          <DetailRow label="Quantity" value={`${prescription.quantity} ${prescription.unit}`} />
          <DetailRow label="Days Supply" value={prescription.daysSupply} />
          <DetailRow label="Refills" value={prescription.refills} />

          <Divider />

          <DetailRow label="Order Type">
            <TypeBadge type={prescription.orderType} />
          </DetailRow>

          {prescription.orderType === 'TAPER' && (
            <TaperSchedule schedule={prescription.orderMetadata.taperSchedule} />
          )}

          {prescription.orderType === 'PRN' && (
            <PRNDetails metadata={prescription.orderMetadata} />
          )}
        </Card>

        {/* Right Column: Patient & Provider Info */}
        <Card title="👤 Patient Information">
          <PatientDetails patient={prescription.patient} />

          <Divider />

          <SectionTitle>Provider</SectionTitle>
          <ProviderDetails provider={prescription.provider} />

          <Divider />

          <SectionTitle>Encounter</SectionTitle>
          <EncounterDetails encounterId={prescription.encounterId} />
        </Card>
      </div>

      {/* Interaction Checking Section */}
      <Card title="⚠️ Drug Interaction & Allergy Checking">
        <Button onClick={checkInteractions} variant="primary">
          Run Interaction Check
        </Button>

        {interactionResults && (
          <InteractionResults results={interactionResults} />
        )}
      </Card>

      {/* Current Medications */}
      <Card title="💊 Patient's Current Medications">
        <CurrentMedicationsList patientId={prescription.patientId} />
      </Card>

      {/* Action Buttons */}
      <ActionBar>
        <Button variant="secondary" onClick={() => navigate('/pending')}>
          Back to Queue
        </Button>

        <Button variant="warning" onClick={() => setShowMessageModal(true)}>
          <MessageCircle size={16} />
          Contact Provider
        </Button>

        <Button variant="success" onClick={() => setShowDispensingModal(true)}>
          <CheckCircle size={16} />
          Dispense Medication
        </Button>
      </ActionBar>

      {/* Dispensing Modal */}
      {showDispensingModal && (
        <DispensingModal
          prescription={prescription}
          onClose={() => setShowDispensingModal(false)}
          onSuccess={() => {
            toast.success('Medication dispensed successfully!');
            navigate('/pending');
          }}
        />
      )}
    </PageLayout>
  );
}
```

---

### **Component: Dispensing Modal**

```typescript
// pharmacy-portal/src/components/DispensingModal.tsx

export function DispensingModal({ prescription, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    dispensedQuantity: prescription.quantity,
    verificationMethod: 'BARCODE',
    counselingProvided: false,
    counselingNotes: '',
    refillNumber: 0,
  });

  const dispenseMutation = useMutation({
    mutationFn: (data) => dispenseMedication(prescription.id, data),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Dispense Medication"
      size="large"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        dispenseMutation.mutate(formData);
      }}>
        {/* Medication Summary */}
        <Card variant="info">
          <h4>{prescription.medicationName} {prescription.strength}</h4>
          <p>Patient: {prescription.patient.name}</p>
          <p>Quantity: {prescription.quantity} {prescription.unit}</p>
        </Card>

        {/* Patient Verification */}
        <FormSection title="1. Patient Verification">
          <RadioGroup
            label="Verification Method"
            name="verificationMethod"
            value={formData.verificationMethod}
            onChange={(value) => setFormData({ ...formData, verificationMethod: value })}
            options={[
              { value: 'BARCODE', label: 'Barcode Scan' },
              { value: 'PHOTO_ID', label: 'Photo ID' },
              { value: 'MANUAL', label: 'Manual Verification' },
            ]}
          />
        </FormSection>

        {/* Quantity Verification */}
        <FormSection title="2. Quantity Verification">
          <InputField
            type="number"
            label="Dispensed Quantity"
            value={formData.dispensedQuantity}
            onChange={(e) => setFormData({ ...formData, dispensedQuantity: e.target.value })}
            required
          />
        </FormSection>

        {/* Patient Counseling */}
        <FormSection title="3. Patient Counseling">
          <Checkbox
            label="Counseling Provided"
            checked={formData.counselingProvided}
            onChange={(checked) => setFormData({ ...formData, counselingProvided: checked })}
          />

          {formData.counselingProvided && (
            <TextArea
              label="Counseling Notes"
              value={formData.counselingNotes}
              onChange={(e) => setFormData({ ...formData, counselingNotes: e.target.value })}
              placeholder="Document what was discussed with patient..."
            />
          )}
        </FormSection>

        {/* Actions */}
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={dispenseMutation.isLoading}>
            Complete Dispensing
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
```

---

## 🗺️ IMPLEMENTATION ROADMAP

### **Phase 1: Foundation (Week 1)**
- [ ] Set up pharmacy service (NestJS)
- [ ] Create database schema (Prisma)
- [ ] Implement basic CRUD endpoints
- [ ] Create pharmacy portal structure (Vite + React)
- [ ] Set up authentication
- [ ] Configure CORS headers

### **Phase 2: Core Features (Week 2-3)**
- [ ] Implement pending prescriptions list
- [ ] Create prescription detail page
- [ ] Add drug interaction checking
- [ ] Implement dispensing workflow
- [ ] Add inventory management

### **Phase 3: Provider Integration (Week 4)**
- [ ] Create unified order integration
- [ ] Implement WebSocket updates
- [ ] Add provider messaging
- [ ] Test end-to-end workflow

### **Phase 4: Advanced Features (Week 5-6)**
- [ ] Add all 4 order types (Standard, PRN, Taper, Compound)
- [ ] Implement barcode scanning
- [ ] Add reporting & analytics
- [ ] Implement batch processing

### **Phase 5: Testing & Documentation (Week 7)**
- [ ] E2E test suite
- [ ] User acceptance testing
- [ ] Documentation completion
- [ ] Training materials

---

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Order Processing Time | < 5 minutes |
| Interaction Check Coverage | 100% |
| Allergy Check Coverage | 100% |
| Dispensing Error Rate | < 0.1% |
| Provider Response Time | < 30 minutes |
| User Satisfaction | > 4.5/5 |

---

**Document Version:** 1.0
**Last Updated:** November 11, 2025
**Status:** 🏥 READY FOR IMPLEMENTATION
**Next Review:** December 11, 2025

