# Radiology Portal - Complete Design Specification

## Date: November 11, 2025

## Status: 🏥 OFFICIAL DESIGN SPECIFICATION

---

## 🎯 Purpose

Complete design specification for the Radiology Portal based on PACS (Picture Archiving and Communication System) standards, DICOM protocols, and modern imaging workflows from Epic, Cerner, and other leading EMR systems.

---

## 📋 Table of Contents

1. [Portal Overview](#portal-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Core Features](#core-features)
4. [Imaging Modalities](#imaging-modalities)
5. [Workflow Design](#workflow-design)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Frontend Design](#frontend-design)
9. [DICOM Integration](#dicom-integration)
10. [Implementation Roadmap](#implementation-roadmap)

---

## 🏥 PORTAL OVERVIEW

### **Purpose**

Enable radiologists and imaging technicians to:

- Receive imaging orders from providers
- Schedule imaging appointments
- Capture and store medical images
- Generate radiology reports
- Share images and reports with ordering providers

### **Key Imaging Modalities**

1. **Ultrasound (USG)** - Real-time soft tissue imaging
2. **X-Ray (CXR)** - Chest radiography
3. **CT Scan** - Computed Tomography
4. **MRI** - Magnetic Resonance Imaging

### **Standards Compliance**

- **DICOM 3.0** - Digital Imaging and Communications in Medicine
- **HL7 FHIR** - Healthcare interoperability
- **HIPAA** - Patient privacy and security
- **ACR** - American College of Radiology guidelines

---

## 👥 USER ROLES & PERMISSIONS

### **1. Radiologist (Primary Reader)**

**Permissions:**

- ✅ View imaging orders
- ✅ View all images
- ✅ Create radiology reports
- ✅ Dictate findings
- ✅ Sign reports (e-signature)
- ✅ Communicate with ordering providers
- ✅ Mark studies as FINAL
- ❌ Cannot delete images
- ❌ Cannot modify patient information

### **2. Radiology Technician (RT)**

**Permissions:**

- ✅ View scheduled orders
- ✅ Capture images
- ✅ Upload images to PACS
- ✅ Mark study as COMPLETE (ready for read)
- ❌ Cannot create reports
- ❌ Cannot sign reports

### **3. Radiology Manager**

**Permissions:**

- ✅ All radiologist permissions
- ✅ Manage schedules
- ✅ Assign studies
- ✅ Generate reports
- ✅ Manage equipment

### **4. Referring Provider (Read-Only)**

**Permissions:**

- ✅ View their ordered studies
- ✅ View reports
- ✅ Download images
- ❌ Cannot modify reports

---

## 🎯 CORE FEATURES

### **Feature 1: Imaging Order Reception**

**Order Information:**

- Patient demographics
- Ordering provider
- Clinical indication (reason for exam)
- Priority (STAT, URGENT, ROUTINE)
- Body part/region
- Imaging modality
- Contrast requirements
- Prior studies for comparison

**Example Order:**

```
Order Type: CT Scan - Abdomen & Pelvis with Contrast
Patient: John Doe, 45M
Indication: Abdominal pain, rule out appendicitis
Priority: URGENT
Ordering Provider: Dr. Smith
Scheduled: 2025-11-12 10:00 AM
```

---

### **Feature 2: Image Capture & Upload**

**Workflow:**

1. Technician selects order
2. Performs imaging procedure
3. Captures images (DICOM format)
4. Uploads to PACS via DICOM protocol
5. Marks study as "Ready for Read"

**Image Metadata (DICOM Tags):**

- Patient ID
- Study ID
- Series ID
- Modality
- Body Part
- Acquisition Date/Time
- Image Orientation
- Pixel Data

---

### **Feature 3: Image Viewer (DICOM Viewer)**

**Core Capabilities:**

- Multi-planar reconstruction (MPR)
- Window/Level adjustment
- Zoom, pan, rotate
- Measurement tools (distance, angle, area)
- Annotation tools
- Cine mode (for dynamic studies)
- Comparison with prior studies

**Viewer Layout:**

- Single image view
- 2x2 grid (compare 4 images)
- Side-by-side (current vs prior)
- Stack mode (scroll through series)

---

### **Feature 4: Report Generation**

**Report Sections (ACR Template):**

```
RADIOLOGY REPORT

Patient: [Name], [Age], [Gender]
Exam: [Modality] - [Body Part]
Date: [Date/Time]
Ordering Provider: [Name]
Indication: [Clinical reason]

TECHNIQUE:
[Imaging protocol used]

COMPARISON:
[Prior studies if available]

FINDINGS:
[Detailed observations organized by system/region]

IMPRESSION:
[Summary and clinical significance]

[Radiologist Name, MD]
[E-Signature]
[Date/Time Signed]
```

**Report Status:**

- PRELIMINARY - Draft, not yet finalized
- FINAL - Signed and ready for provider
- AMENDED - Corrected after initial final

---

### **Feature 5: Critical Results Notification**

**STAT Findings (Immediate Provider Notification):**

- Pulmonary embolism
- Pneumothorax
- Acute stroke
- Major fracture
- Acute hemorrhage
- Bowel perforation

**Notification Methods:**

- In-app alert
- SMS to provider
- Email to provider
- Phone call (for STAT findings)

---

## 🖼️ IMAGING MODALITIES

### **1. Ultrasound (USG)**

**Common Studies:**

- Abdominal USG
- Pelvic USG
- Obstetric USG (fetal imaging)
- Vascular USG (Doppler)
- Thyroid USG
- Breast USG

**Image Characteristics:**

- Real-time dynamic imaging
- No radiation exposure
- Video clips (cine loops)
- Color Doppler for blood flow

**Report Focus:**

- Organ size and echotexture
- Presence of masses or cysts
- Fluid collections
- Blood flow patterns (for Doppler)

---

### **2. Chest X-Ray (CXR)**

**Common Views:**

- PA (Posterior-Anterior)
- Lateral
- AP (Anterior-Posterior) - for portable exams

**Report Checklist:**

- Heart size
- Lung fields (infiltrates, masses, consolidation)
- Pleural spaces (effusion, pneumothorax)
- Mediastinum
- Bones (ribs, clavicles, spine)
- Lines and tubes (if present)

**Critical Findings:**

- Pneumothorax
- Large pleural effusion
- Pneumonia
- Pulmonary edema
- Misplaced tubes/lines

---

### **3. CT Scan (Computed Tomography)**

**Common Studies:**

- CT Head (stroke protocol)
- CT Chest (PE protocol)
- CT Abdomen/Pelvis (with or without contrast)
- CT Angiography (CTA)
- CT Spine

**Contrast Considerations:**

- IV contrast for vascular studies
- Oral contrast for bowel opacification
- Allergy screening (iodine contrast)
- Renal function check (creatinine)

**Image Series:**

- Non-contrast phase
- Arterial phase
- Venous phase
- Delayed phase (for urography)

**Report Organization:**

- By anatomic region
- By organ system
- Comparison with prior CTs

---

### **4. MRI (Magnetic Resonance Imaging)**

**Common Studies:**

- Brain MRI (stroke, tumor)
- Spine MRI (back pain, radiculopathy)
- Joint MRI (knee, shoulder)
- Abdominal MRI (liver, pancreas)
- MR Angiography (MRA)

**Sequences:**

- T1-weighted
- T2-weighted
- FLAIR
- DWI (Diffusion-Weighted Imaging)
- Gradient Echo
- Post-contrast sequences

**Advantages:**

- No radiation
- Excellent soft tissue contrast
- Multiplanar capability
- Functional imaging (fMRI)

**Contraindications Check:**

- Pacemaker
- Metallic implants
- Cochlear implants
- Aneurysm clips
- Claustrophobia screening

---

## 🔄 WORKFLOW DESIGN

### **Complete Radiology Workflow (Provider → Radiology → Provider)**

```
┌─────────────────────────────────────────────────────────────────┐
│               PROVIDER PORTAL (Port 5174)                        │
│  Provider orders imaging study for patient                       │
│  Example: CT Abdomen/Pelvis with Contrast                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/workflow/orders/unified
                           │ itemType: RADIOLOGY
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│         CLINICAL WORKFLOW SERVICE (Port 3004)                    │
│  • Creates UnifiedOrder record                                   │
│  • Creates UnifiedOrderItem (type: RADIOLOGY)                    │
│  • Dispatches to Radiology Service                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/radiology/orders
                           │ Headers: x-user-role: CLINICAL_WORKFLOW
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               RADIOLOGY SERVICE (Port 3015)                      │
│  • Creates ImagingOrder record                                   │
│  • Status: SCHEDULED                                             │
│  • Returns order ID with appointment details                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Appears in Radiology Portal
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               RADIOLOGY PORTAL (Port 5178)                       │
│  STEP 1: Technician performs imaging                             │
│  1. Views scheduled appointment                                  │
│  2. Verifies patient identity                                    │
│  3. Performs imaging procedure                                   │
│  4. Uploads images to PACS/MinIO                                 │
│  5. Updates status to IMAGES_AVAILABLE                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/radiology/orders/:id/images
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               RADIOLOGY SERVICE (Port 3015)                      │
│  • Stores image metadata                                         │
│  • Links to MinIO storage location                               │
│  • Notifies radiologist: "Ready for Read"                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Assignment to radiologist
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               RADIOLOGY PORTAL (Port 5178)                       │
│  STEP 2: Radiologist creates report                              │
│  1. Views images in DICOM viewer                                 │
│  2. Reviews clinical indication                                  │
│  3. Compares with prior studies (if available)                   │
│  4. Dictates/types findings                                      │
│  5. Creates impression                                           │
│  6. Signs report (e-signature)                                   │
│  7. Updates status to FINAL                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/radiology/orders/:id/report
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               RADIOLOGY SERVICE (Port 3015)                      │
│  • Creates Report record                                         │
│  • Status: FINAL                                                 │
│  • Notifies workflow service                                     │
│  • If CRITICAL finding → STAT notification to provider          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ WebSocket: order.updated
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│         PROVIDER PORTAL - IMAGING RESULTS VIEW                   │
│  • Real-time notification: "Report available"                    │
│  • Provider views report                                         │
│  • Provider views images in web viewer                           │
│  • Can download images/report                                    │
│  • Status: COMPLETED                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 DATABASE SCHEMA

### **Radiology Service Database**

```sql
-- ============================================================
-- IMAGING ORDERS TABLE
-- ============================================================
CREATE TABLE imaging_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., IMG-20251111-ABCD1
  workflow_order_id VARCHAR(100), -- Link back to unified order
  patient_id UUID NOT NULL,
  encounter_id UUID NOT NULL,
  ordering_provider_id UUID NOT NULL,

  -- Order Details
  modality VARCHAR(50) NOT NULL, -- USG, XRAY, CT, MRI
  study_type VARCHAR(255) NOT NULL, -- e.g., "CT Abdomen/Pelvis with Contrast"
  body_part VARCHAR(100) NOT NULL, -- e.g., "ABDOMEN", "CHEST", "HEAD"
  laterality VARCHAR(20), -- LEFT, RIGHT, BILATERAL

  -- Clinical Information
  clinical_indication TEXT NOT NULL, -- Reason for exam
  clinical_history TEXT, -- Patient history

  -- Contrast & Special Instructions
  contrast_required BOOLEAN DEFAULT FALSE,
  contrast_type VARCHAR(50), -- IODINE, GADOLINIUM, ORAL
  contrast_allergy_checked BOOLEAN DEFAULT FALSE,
  creatinine_checked BOOLEAN DEFAULT FALSE, -- For renal function
  special_instructions TEXT,

  -- Scheduling
  priority VARCHAR(50) DEFAULT 'ROUTINE', -- STAT, URGENT, ROUTINE
  scheduled_date TIMESTAMP,
  scheduled_time TIME,
  appointment_duration INTEGER, -- minutes

  -- Status Tracking
  status VARCHAR(50) NOT NULL, -- SCHEDULED, IN_PROGRESS, IMAGES_AVAILABLE,
                                -- PRELIMINARY_REPORT, FINAL_REPORT, CANCELLED

  -- Technical Details
  performing_technician_id UUID,
  images_captured_at TIMESTAMP,

  -- Radiologist Assignment
  assigned_radiologist_id UUID,
  reading_started_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- IMAGING STUDIES TABLE (DICOM Metadata)
-- ============================================================
CREATE TABLE imaging_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imaging_order_id UUID REFERENCES imaging_orders(id),

  -- DICOM Study Information
  study_instance_uid VARCHAR(255) UNIQUE NOT NULL, -- DICOM UID
  study_date DATE NOT NULL,
  study_time TIME NOT NULL,
  study_description TEXT,

  -- Patient & Equipment
  patient_position VARCHAR(50), -- SUPINE, PRONE, etc.
  modality VARCHAR(50) NOT NULL,
  manufacturer VARCHAR(100),
  equipment_model VARCHAR(100),

  -- Technical Parameters
  kvp DECIMAL(10, 2), -- For X-Ray/CT
  mas DECIMAL(10, 2), -- For X-Ray/CT
  slice_thickness DECIMAL(10, 2), -- For CT/MRI (mm)

  -- Number of Images
  number_of_series INTEGER,
  number_of_instances INTEGER, -- Total images

  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- IMAGING SERIES TABLE (DICOM Series)
-- ============================================================
CREATE TABLE imaging_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imaging_study_id UUID REFERENCES imaging_studies(id),

  -- DICOM Series Information
  series_instance_uid VARCHAR(255) UNIQUE NOT NULL,
  series_number INTEGER NOT NULL,
  series_description TEXT,

  -- Sequence Details
  sequence_name VARCHAR(100), -- For MRI: T1, T2, FLAIR, etc.
  contrast_phase VARCHAR(50), -- For CT: ARTERIAL, VENOUS, DELAYED

  -- Image Count
  number_of_instances INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- IMAGING INSTANCES TABLE (Individual Images)
-- ============================================================
CREATE TABLE imaging_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imaging_series_id UUID REFERENCES imaging_series(id),

  -- DICOM Instance Information
  sop_instance_uid VARCHAR(255) UNIQUE NOT NULL, -- DICOM Image UID
  instance_number INTEGER NOT NULL,

  -- Image Storage (MinIO)
  storage_path VARCHAR(500) NOT NULL, -- MinIO object path
  storage_bucket VARCHAR(100) DEFAULT 'radiology-images',
  file_size BIGINT, -- bytes

  -- Image Dimensions
  rows INTEGER, -- Image height
  columns INTEGER, -- Image width
  bits_allocated INTEGER,

  -- Window/Level (Display Settings)
  window_center INTEGER,
  window_width INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- RADIOLOGY REPORTS TABLE
-- ============================================================
CREATE TABLE radiology_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imaging_order_id UUID REFERENCES imaging_orders(id),

  -- Report Details
  report_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., RAD-20251111-ABCD1

  -- Report Sections (ACR Template)
  technique TEXT, -- How the exam was performed
  comparison TEXT, -- Prior studies comparison
  findings TEXT NOT NULL, -- Detailed observations
  impression TEXT NOT NULL, -- Summary and clinical significance

  -- Status
  status VARCHAR(50) NOT NULL, -- PRELIMINARY, FINAL, AMENDED

  -- Critical Findings
  has_critical_findings BOOLEAN DEFAULT FALSE,
  critical_findings_text TEXT,
  critical_findings_notified BOOLEAN DEFAULT FALSE,
  critical_findings_notified_at TIMESTAMP,

  -- Radiologist Information
  radiologist_id UUID NOT NULL,
  dictated_at TIMESTAMP,
  signed_at TIMESTAMP,

  -- E-Signature
  electronic_signature VARCHAR(500),
  signature_timestamp TIMESTAMP,

  -- Amendments (if report corrected after signing)
  is_amendment BOOLEAN DEFAULT FALSE,
  amended_from UUID REFERENCES radiology_reports(id),
  amendment_reason TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PRIOR STUDIES COMPARISON TABLE
-- ============================================================
CREATE TABLE prior_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_study_id UUID REFERENCES imaging_studies(id),
  prior_study_id UUID REFERENCES imaging_studies(id),
  comparison_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_imaging_orders_patient ON imaging_orders(patient_id);
CREATE INDEX idx_imaging_orders_provider ON imaging_orders(ordering_provider_id);
CREATE INDEX idx_imaging_orders_status ON imaging_orders(status);
CREATE INDEX idx_imaging_orders_modality ON imaging_orders(modality);
CREATE INDEX idx_imaging_orders_scheduled ON imaging_orders(scheduled_date, scheduled_time);
CREATE INDEX idx_imaging_studies_order ON imaging_studies(imaging_order_id);
CREATE INDEX idx_imaging_series_study ON imaging_series(imaging_study_id);
CREATE INDEX idx_imaging_instances_series ON imaging_instances(imaging_series_id);
CREATE INDEX idx_radiology_reports_order ON radiology_reports(imaging_order_id);
```

---

## 🔌 API ENDPOINTS

### **Radiology Service Endpoints**

```typescript
// ============================================================
// CREATE IMAGING ORDER (FROM WORKFLOW SERVICE)
// ============================================================
/**
 * @route POST /api/radiology/orders
 * @access CLINICAL_WORKFLOW, PROVIDER
 */
@Post()
@Roles('CLINICAL_WORKFLOW', 'PROVIDER')
async createImagingOrder(
  @Body() dto: CreateImagingOrderDto,
  @Headers('x-user-id') userId: string
) {
  const order = await this.radiologyService.createOrder(dto, userId);

  // Schedule appointment
  const appointment = await this.schedulingService.scheduleAppointment(order);

  // Notify workflow service
  if (dto.workflowOrderId) {
    await this.notifyWorkflowService(dto.workflowOrderId, order.id);
  }

  return { ...order, appointment };
}

// ============================================================
// GET SCHEDULED ORDERS (FOR TECHNICIANS)
// ============================================================
/**
 * @route GET /api/radiology/orders/scheduled
 * @access RADIOLOGY_TECH, RADIOLOGIST
 */
@Get('scheduled')
@Roles('RADIOLOGY_TECH', 'RADIOLOGIST')
async getScheduledOrders(@Query() filters: OrderFilterDto) {
  return this.radiologyService.getScheduledOrders(filters);
}

// ============================================================
// UPLOAD IMAGES (TECHNICIAN)
// ============================================================
/**
 * @route POST /api/radiology/orders/:id/images
 * @access RADIOLOGY_TECH
 */
@Post(':id/images')
@Roles('RADIOLOGY_TECH')
@UseInterceptors(FileInterceptor('image'))
async uploadImage(
  @Param('id') orderId: string,
  @UploadedFile() file: Express.Multer.File,
  @Body() metadata: ImageMetadataDto,
  @Headers('x-user-id') technicianId: string
) {
  // 1. Upload to MinIO
  const storagePath = await this.minioService.uploadImage(file);

  // 2. Create DICOM metadata records
  const instance = await this.dicomService.createInstance({
    orderId,
    storagePath,
    metadata,
  });

  // 3. Update order status
  await this.radiologyService.updateOrderStatus(orderId, 'IMAGES_AVAILABLE');

  // 4. Notify radiologist
  await this.notificationService.notifyRadiologist(orderId);

  return instance;
}

// ============================================================
// GET ORDERS READY FOR READ (RADIOLOGIST)
// ============================================================
/**
 * @route GET /api/radiology/orders/ready-for-read
 * @access RADIOLOGIST
 */
@Get('ready-for-read')
@Roles('RADIOLOGIST')
async getOrdersReadyForRead(@Headers('x-user-id') radiologistId: string) {
  return this.radiologyService.getOrdersReadyForRead(radiologistId);
}

// ============================================================
// GET IMAGE VIEWER DATA
// ============================================================
/**
 * @route GET /api/radiology/orders/:id/viewer-data
 * @access RADIOLOGIST, PROVIDER
 */
@Get(':id/viewer-data')
@Roles('RADIOLOGIST', 'PROVIDER')
async getViewerData(@Param('id') orderId: string) {
  // Get all images for this order
  const study = await this.radiologyService.getStudyByOrderId(orderId);
  const series = await this.dicomService.getSeriesByStudy(study.id);
  const instances = await this.dicomService.getInstancesBySeries(series.map(s => s.id));

  // Generate pre-signed URLs for MinIO images
  const imagesWithUrls = await Promise.all(
    instances.map(async (instance) => ({
      ...instance,
      imageUrl: await this.minioService.getPreSignedUrl(instance.storagePath),
    }))
  );

  return {
    study,
    series,
    instances: imagesWithUrls,
  };
}

// ============================================================
// CREATE REPORT (RADIOLOGIST)
// ============================================================
/**
 * @route POST /api/radiology/orders/:id/report
 * @access RADIOLOGIST
 */
@Post(':id/report')
@Roles('RADIOLOGIST')
async createReport(
  @Param('id') orderId: string,
  @Body() dto: CreateReportDto,
  @Headers('x-user-id') radiologistId: string
) {
  // 1. Create report
  const report = await this.radiologyService.createReport(orderId, radiologistId, dto);

  // 2. Update order status
  await this.radiologyService.updateOrderStatus(orderId, 'FINAL_REPORT');

  // 3. Check for critical findings
  if (dto.hasCriticalFindings) {
    await this.notificationService.sendCriticalFindingsAlert({
      orderId,
      providerId: order.orderingProviderId,
      findings: dto.criticalFindingsText,
    });
  }

  // 4. Notify workflow service
  await this.notifyWorkflowService(orderId, 'COMPLETED');

  return report;
}

// ============================================================
// GET REPORT (PROVIDER)
// ============================================================
/**
 * @route GET /api/radiology/reports/:id
 * @access RADIOLOGIST, PROVIDER
 */
@Get('reports/:id')
@Roles('RADIOLOGIST', 'PROVIDER')
async getReport(@Param('id') reportId: string) {
  return this.radiologyService.getReportById(reportId);
}

// ============================================================
// SEARCH PRIOR STUDIES
// ============================================================
/**
 * @route GET /api/radiology/patients/:patientId/prior-studies
 * @access RADIOLOGIST
 */
@Get('patients/:patientId/prior-studies')
@Roles('RADIOLOGIST')
async getPriorStudies(
  @Param('patientId') patientId: string,
  @Query('modality') modality?: string,
  @Query('bodyPart') bodyPart?: string
) {
  return this.radiologyService.getPriorStudies(patientId, { modality, bodyPart });
}
```

---

## 🎨 FRONTEND DESIGN

### **Page 1: Radiology Dashboard**

```typescript
// radiology-portal/src/pages/DashboardPage.tsx

export default function RadiologyDashboardPage() {
  return (
    <DashboardLayout>
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<Calendar />}
          title="Scheduled Today"
          value="28"
          subtitle="12 USG, 8 X-Ray, 5 CT, 3 MRI"
          color="blue"
        />
        <StatCard
          icon={<Image />}
          title="Ready for Read"
          value="15"
          subtitle="Images captured, awaiting report"
          color="purple"
        />
        <StatCard
          icon={<FileText />}
          title="Reports Signed Today"
          value="42"
          subtitle="+8% from yesterday"
          color="green"
        />
        <StatCard
          icon={<AlertCircle />}
          title="Critical Findings"
          value="3"
          subtitle="Requires immediate attention"
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions>
        <QuickActionButton
          icon={<Calendar />}
          label="View Schedule"
          to="/schedule"
        />
        <QuickActionButton
          icon={<Upload />}
          label="Upload Images"
          to="/upload"
        />
        <QuickActionButton
          icon={<Eye />}
          label="Read Studies"
          to="/worklist"
        />
      </QuickActions>

      {/* Today's Schedule Widget */}
      <TodayScheduleWidget />

      {/* Recent Reports */}
      <RecentReportsWidget />
    </DashboardLayout>
  );
}
```

---

### **Page 2: Scheduled Orders (Technician View)**

```typescript
// radiology-portal/src/pages/ScheduledOrdersPage.tsx

export default function ScheduledOrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['scheduledOrders'],
    queryFn: fetchScheduledOrders,
  });

  return (
    <PageLayout>
      <PageHeader
        title="Scheduled Imaging Orders"
        subtitle="Today's appointments"
      />

      {/* Filters */}
      <FilterBar>
        <Select
          label="Modality"
          options={['All', 'USG', 'X-Ray', 'CT', 'MRI']}
        />
        <Select
          label="Priority"
          options={['All', 'STAT', 'URGENT', 'ROUTINE']}
        />
        <DatePicker label="Date" />
      </FilterBar>

      {/* Timeline View */}
      <TimelineView>
        {orders.map(order => (
          <TimelineItem
            key={order.id}
            time={order.scheduledTime}
            duration={order.appointmentDuration}
          >
            <OrderCard
              order={order}
              onStartExam={() => navigate(`/exam/${order.id}`)}
            />
          </TimelineItem>
        ))}
      </TimelineView>
    </PageLayout>
  );
}
```

---

### **Page 3: Image Upload (Technician)**

```typescript
// radiology-portal/src/pages/ImageUploadPage.tsx

export default function ImageUploadPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order } = useQuery({
    queryKey: ['imagingOrder', id],
    queryFn: () => fetchImagingOrder(id),
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const uploadMutation = useMutation({
    mutationFn: (data: { orderId: string; images: File[] }) =>
      uploadImagesToPACS(data),
    onSuccess: () => {
      toast.success('Images uploaded successfully!');
      navigate('/schedule');
    },
  });

  const handleUpload = () => {
    uploadMutation.mutate({
      orderId: id,
      images: uploadedImages,
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title="Upload Images"
        subtitle={`${order.studyType} - ${order.patient.name}`}
      />

      {/* Patient & Order Info */}
      <Card title="Study Information">
        <DetailRow label="Patient" value={order.patient.name} />
        <DetailRow label="MRN" value={order.patient.mrn} />
        <DetailRow label="Study Type" value={order.studyType} />
        <DetailRow label="Body Part" value={order.bodyPart} />
        <DetailRow label="Indication" value={order.clinicalIndication} />
      </Card>

      {/* Image Upload */}
      <Card title="Upload Images">
        <Dropzone
          onDrop={(files) => setUploadedImages([...uploadedImages, ...files])}
          accept="image/*,.dcm"
          multiple
        >
          <div className="dropzone-content">
            <Upload size={48} />
            <p>Drag & drop DICOM images here, or click to browse</p>
            <p className="text-sm text-gray-500">
              Supports: .dcm, .jpg, .png (DICOM preferred)
            </p>
          </div>
        </Dropzone>

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <ImagePreviewGrid images={uploadedImages} />
        )}
      </Card>

      {/* DICOM Metadata */}
      <Card title="Study Metadata">
        <Form>
          <InputField label="Study Description" required />
          <InputField label="Series Number" type="number" required />
          <Select
            label="Sequence Name"
            options={['T1', 'T2', 'FLAIR', 'DWI']} // For MRI
          />
        </Form>
      </Card>

      {/* Actions */}
      <ActionBar>
        <Button variant="secondary" onClick={() => navigate('/schedule')}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={uploadedImages.length === 0}
          loading={uploadMutation.isLoading}
        >
          Upload {uploadedImages.length} Images
        </Button>
      </ActionBar>
    </PageLayout>
  );
}
```

---

### **Page 4: DICOM Viewer (Radiologist)**

```typescript
// radiology-portal/src/pages/DICOMViewerPage.tsx

export default function DICOMViewerPage() {
  const { id } = useParams<{ id: string }>();
  const { data: viewerData } = useQuery({
    queryKey: ['viewerData', id],
    queryFn: () => fetchViewerData(id),
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [windowLevel, setWindowLevel] = useState({ center: 40, width: 400 });
  const [zoom, setZoom] = useState(1.0);

  return (
    <ViewerLayout>
      {/* Top Toolbar */}
      <ViewerToolbar>
        <ToolButton icon={<ZoomIn />} onClick={() => setZoom(zoom + 0.1)} />
        <ToolButton icon={<ZoomOut />} onClick={() => setZoom(zoom - 0.1)} />
        <ToolButton icon={<RotateCw />} label="Rotate" />
        <ToolButton icon={<Maximize2 />} label="Full Screen" />

        <Divider />

        <ToolButton icon={<Ruler />} label="Measure" />
        <ToolButton icon={<Edit />} label="Annotate" />

        <Divider />

        <WindowLevelControl
          center={windowLevel.center}
          width={windowLevel.width}
          onChange={setWindowLevel}
        />
      </ViewerToolbar>

      {/* Main Viewer Area */}
      <div className="viewer-grid">
        {/* Left Sidebar: Thumbnails */}
        <div className="thumbnail-panel">
          <h3>Series ({viewerData.series.length})</h3>
          {viewerData.series.map((series, idx) => (
            <SeriesThumbnail
              key={series.id}
              series={series}
              isActive={idx === currentImageIndex}
              onClick={() => setCurrentImageIndex(idx)}
            />
          ))}
        </div>

        {/* Center: Image Display */}
        <div className="image-display">
          <DICOMCanvas
            image={viewerData.instances[currentImageIndex]}
            windowLevel={windowLevel}
            zoom={zoom}
          />

          {/* Image Navigation */}
          <ImageNavigator
            current={currentImageIndex + 1}
            total={viewerData.instances.length}
            onPrevious={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
            onNext={() =>
              setCurrentImageIndex(
                Math.min(viewerData.instances.length - 1, currentImageIndex + 1)
              )
            }
          />
        </div>

        {/* Right Sidebar: Report Editor */}
        <div className="report-panel">
          <ReportEditor orderId={id} />
        </div>
      </div>

      {/* Bottom: Prior Studies Comparison */}
      <PriorStudiesPanel patientId={viewerData.study.patientId} />
    </ViewerLayout>
  );
}
```

---

### **Component: Report Editor**

```typescript
// radiology-portal/src/components/ReportEditor.tsx

export function ReportEditor({ orderId }) {
  const [report, setReport] = useState({
    technique: '',
    comparison: '',
    findings: '',
    impression: '',
    hasCriticalFindings: false,
    criticalFindingsText: '',
  });

  const [status, setStatus] = useState<'PRELIMINARY' | 'FINAL'>('PRELIMINARY');

  const createReportMutation = useMutation({
    mutationFn: (data) => createRadiologyReport(orderId, data),
    onSuccess: () => {
      toast.success('Report saved successfully!');
    },
  });

  const handleSubmit = () => {
    createReportMutation.mutate({ ...report, status });
  };

  return (
    <div className="report-editor">
      <h3>Radiology Report</h3>

      {/* Template Selection */}
      <Select
        label="Report Template"
        options={['CT Abdomen', 'MRI Brain', 'CXR', 'Custom']}
        onChange={(template) => loadTemplate(template)}
      />

      {/* Report Sections */}
      <FormSection title="TECHNIQUE">
        <TextArea
          value={report.technique}
          onChange={(e) => setReport({ ...report, technique: e.target.value })}
          placeholder="Describe imaging protocol..."
          rows={3}
        />
      </FormSection>

      <FormSection title="COMPARISON">
        <TextArea
          value={report.comparison}
          onChange={(e) => setReport({ ...report, comparison: e.target.value })}
          placeholder="Prior studies for comparison..."
          rows={2}
        />
        <Button size="sm" variant="ghost" onClick={() => loadPriorStudies()}>
          Load Prior Studies
        </Button>
      </FormSection>

      <FormSection title="FINDINGS">
        <TextArea
          value={report.findings}
          onChange={(e) => setReport({ ...report, findings: e.target.value })}
          placeholder="Detailed observations..."
          rows={10}
          required
        />
      </FormSection>

      <FormSection title="IMPRESSION">
        <TextArea
          value={report.impression}
          onChange={(e) => setReport({ ...report, impression: e.target.value })}
          placeholder="Summary and clinical significance..."
          rows={5}
          required
        />
      </FormSection>

      {/* Critical Findings */}
      <FormSection title="CRITICAL FINDINGS">
        <Checkbox
          label="This study has critical findings requiring immediate notification"
          checked={report.hasCriticalFindings}
          onChange={(checked) =>
            setReport({ ...report, hasCriticalFindings: checked })
          }
        />

        {report.hasCriticalFindings && (
          <TextArea
            value={report.criticalFindingsText}
            onChange={(e) =>
              setReport({ ...report, criticalFindingsText: e.target.value })
            }
            placeholder="Describe critical findings..."
            required
          />
        )}
      </FormSection>

      {/* Actions */}
      <div className="report-actions">
        <Button
          variant="secondary"
          onClick={() => {
            setStatus('PRELIMINARY');
            handleSubmit();
          }}
        >
          Save as Preliminary
        </Button>

        <Button
          variant="primary"
          onClick={() => {
            setStatus('FINAL');
            handleSubmit();
          }}
        >
          <CheckCircle size={16} />
          Sign and Finalize Report
        </Button>
      </div>

      {/* E-Signature */}
      {status === 'FINAL' && (
        <ESignatureModal
          onSign={(signature) => {
            createReportMutation.mutate({ ...report, status, signature });
          }}
        />
      )}
    </div>
  );
}
```

---

## 🔧 DICOM INTEGRATION

### **MinIO Configuration for Image Storage**

```typescript
// radiology-service/src/services/minio.service.ts

import { Injectable } from "@nestjs/common";
import * as Minio from "minio";

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || "localhost",
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });

    this.ensureBucketExists();
  }

  async ensureBucketExists() {
    const bucketName = "radiology-images";
    const exists = await this.minioClient.bucketExists(bucketName);

    if (!exists) {
      await this.minioClient.makeBucket(bucketName, "us-east-1");
      console.log(`Created MinIO bucket: ${bucketName}`);
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const bucketName = "radiology-images";

    await this.minioClient.putObject(
      bucketName,
      fileName,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype,
      }
    );

    return `${bucketName}/${fileName}`;
  }

  async getPreSignedUrl(
    storagePath: string,
    expirySeconds = 3600
  ): Promise<string> {
    const [bucketName, ...filePathParts] = storagePath.split("/");
    const fileName = filePathParts.join("/");

    return this.minioClient.presignedGetObject(
      bucketName,
      fileName,
      expirySeconds
    );
  }

  async deleteImage(storagePath: string): Promise<void> {
    const [bucketName, ...filePathParts] = storagePath.split("/");
    const fileName = filePathParts.join("/");

    await this.minioClient.removeObject(bucketName, fileName);
  }
}
```

---

## 🗺️ IMPLEMENTATION ROADMAP

### **Phase 1: Foundation (Week 1)**

- [ ] Set up radiology service (NestJS)
- [ ] Create database schema (Prisma)
- [ ] Configure MinIO for image storage
- [ ] Create radiology portal structure (Vite + React)
- [ ] Set up authentication & RBAC
- [ ] Configure CORS headers

### **Phase 2: Order Management (Week 2)**

- [ ] Implement order creation from workflow
- [ ] Create scheduled orders list
- [ ] Add order detail page
- [ ] Implement technician workflow

### **Phase 3: Image Management (Week 3)**

- [ ] Implement image upload to MinIO
- [ ] Create DICOM metadata storage
- [ ] Build basic image viewer
- [ ] Add image download functionality

### **Phase 4: Report Generation (Week 4)**

- [ ] Create report editor
- [ ] Implement ACR report templates
- [ ] Add e-signature functionality
- [ ] Implement critical findings alerts

### **Phase 5: Advanced Features (Week 5-6)**

- [ ] Advanced DICOM viewer (zoom, pan, window/level)
- [ ] Prior studies comparison
- [ ] Measurement tools
- [ ] Annotation tools
- [ ] Multi-planar reconstruction (for CT/MRI)

### **Phase 6: Provider Integration (Week 7)**

- [ ] Provider view of reports
- [ ] Provider image viewer
- [ ] Download reports as PDF
- [ ] WebSocket notifications

### **Phase 7: Testing & Documentation (Week 8)**

- [ ] E2E test suite
- [ ] Performance optimization
- [ ] Documentation completion
- [ ] Training materials

---

## 📊 Success Metrics

| Metric                         | Target               |
| ------------------------------ | -------------------- |
| Image Upload Time              | < 30 seconds         |
| Report Turnaround Time         | < 2 hours (routine)  |
| Critical Findings Notification | < 5 minutes          |
| Image Viewer Load Time         | < 3 seconds          |
| Provider Satisfaction          | > 4.5/5              |
| Image Quality                  | 100% DICOM compliant |

---

## 🎯 Sample Test Data Sources

For development and testing, use these free medical imaging resources:

**Free DICOM Image Datasets:**

1. **Cancer Imaging Archive (TCIA)** - cancerimagingarchive.net
2. **OpenNeuro** - openneuro.org
3. **Radiopaedia** - radiopaedia.org (educational cases)
4. **DICOM Library** - dicomlibrary.com

**Sample Images for Each Modality:**

- **X-Ray**: Chest X-rays from TCIA
- **CT**: Abdominal CT scans from TCIA
- **MRI**: Brain MRI from OpenNeuro
- **Ultrasound**: Sample clips from Radiopaedia

---

**Document Version:** 1.0
**Last Updated:** November 11, 2025
**Status:** 🏥 READY FOR IMPLEMENTATION
**Next Review:** December 11, 2025
