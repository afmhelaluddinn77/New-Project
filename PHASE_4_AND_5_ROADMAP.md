# Phase 4 & 5: Database & API Integration + Security & Compliance

**Status:** 📋 READY FOR IMPLEMENTATION  
**Priority:** CRITICAL  
**Duration:** 7-9 days combined  
**Date:** November 7, 2025

---

## 📊 Phase 4: Database & API Integration

**Priority:** CRITICAL  
**Duration:** 7 days  
**Status:** ⏳ Pending

### Overview

Phase 4 focuses on implementing the database schema, API endpoints, and completing the backend-frontend integration. This phase is critical as it connects all the frontend work to the backend services.

---

## 🎯 Phase 4 Tasks

### Step 4.1: Database Schema Implementation (2 days)

**Duration:** 2 days  
**Location:** `/services/encounter-service/prisma/schema.prisma`

**Tasks:**

1. **Create Encounters Table**
   - Fields: id, encounterId, patientId, providerId, encounterType, encounterClass
   - Timestamps: createdAt, updatedAt, deletedAt (soft delete)
   - Status: draft, finalized, cancelled
   - Relations: Patient, Provider, Medications, Investigations

2. **Create Medications Table**
   - Fields: id, encounterId, medicationName, genericName, dosage, frequency
   - Duration, route, indication, notes
   - Relations: Encounter, PrescriptionHistory

3. **Create Prescriptions Table**
   - Fields: id, encounterId, medicationId, prescribedDate, expiryDate
   - Status: active, expired, cancelled
   - Relations: Encounter, Medication

4. **Create Investigations Table**
   - Fields: id, encounterId, testName, testCode, urgency, status
   - Results: value, unit, referenceRange, abnormalFlag
   - Relations: Encounter, Results

5. **Setup Foreign Keys & Indexes**
   - Foreign key: encounters.patientId → patients.id
   - Foreign key: encounters.providerId → providers.id
   - Foreign key: medications.encounterId → encounters.id
   - Foreign key: investigations.encounterId → encounters.id
   - Indexes: encounterId, patientId, providerId, createdAt

6. **Run Migrations**
   ```bash
   npx prisma migrate dev --name add_encounter_tables
   npx prisma generate
   ```

**Database Schema:**

```prisma
model Encounter {
  id                    String      @id @default(cuid())
  encounterId           String      @unique
  patientId             String
  providerId            String
  encounterType         String      // OUTPATIENT, INPATIENT, EMERGENCY, TELEMEDICINE, HOME_VISIT
  encounterClass        String      // AMBULATORY, EMERGENCY, INPATIENT, OBSERVATION
  status                String      // draft, finalized, cancelled
  
  // History
  chiefComplaint        String?
  historyOfPresentIllness Json?
  pastMedicalHistory    Json?
  medicationHistory     Json?
  familyHistory         Json?
  socialHistory         Json?
  reviewOfSystems       Json?
  
  // Examination
  vitalSigns            Json?
  generalExamination    Json?
  cardiovascularExam    Json?
  respiratoryExam       Json?
  abdominalExam         Json?
  neurologicalExam      Json?
  musculoskeletalExam   Json?
  
  // Investigations & Medications
  investigations        Investigation[]
  medications           Medication[]
  prescriptions         Prescription[]
  
  // Audit
  createdBy             String
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  deletedAt             DateTime?
  
  @@index([patientId])
  @@index([providerId])
  @@index([createdAt])
  @@index([status])
}

model Medication {
  id                    String      @id @default(cuid())
  encounterId           String
  encounter             Encounter   @relation(fields: [encounterId], references: [id])
  
  medicationName        String
  genericName           String?
  dosage                String
  frequency             String
  duration              String?
  route                 String      // Oral, IV, IM, etc.
  indication            String?
  notes                 String?
  
  prescriptions         Prescription[]
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([encounterId])
}

model Prescription {
  id                    String      @id @default(cuid())
  encounterId           String
  encounter             Encounter   @relation(fields: [encounterId], references: [id])
  medicationId          String
  medication            Medication  @relation(fields: [medicationId], references: [id])
  
  prescribedDate        DateTime    @default(now())
  expiryDate            DateTime?
  status                String      // active, expired, cancelled
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([encounterId])
  @@index([medicationId])
  @@index([status])
}

model Investigation {
  id                    String      @id @default(cuid())
  encounterId           String
  encounter             Encounter   @relation(fields: [encounterId], references: [id])
  
  testName              String
  testCode              String
  urgency               String      // routine, urgent, stat
  status                String      // pending, completed, abnormal
  
  // Results
  value                 String?
  unit                  String?
  referenceRange        String?
  abnormalFlag          Boolean?    @default(false)
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([encounterId])
  @@index([status])
}
```

---

### Step 4.2: API Endpoints Implementation (3 days)

**Duration:** 3 days  
**Location:** `/services/encounter-service/src/encounter/`

**Endpoints to Build:**

#### Encounter Endpoints

```
POST   /api/encounters
GET    /api/encounters/:id
PUT    /api/encounters/:id
PATCH  /api/encounters/:id
DELETE /api/encounters/:id
GET    /api/encounters/patient/:patientId
POST   /api/encounters/:id/finalize
GET    /api/encounters (with pagination)
```

#### Prescription Endpoints

```
POST   /api/prescriptions
GET    /api/prescriptions/:id
GET    /api/prescriptions/encounter/:encounterId
PUT    /api/prescriptions/:id
DELETE /api/prescriptions/:id
```

#### Medication Endpoints

```
GET    /api/medications/search?q=query
POST   /api/medications/interactions
GET    /api/medications/:id
```

#### Investigation Endpoints

```
POST   /api/investigations
GET    /api/investigations/:id
GET    /api/investigations/encounter/:encounterId
PUT    /api/investigations/:id
DELETE /api/investigations/:id
```

---

### Step 4.3: Frontend API Integration (2 days)

**Duration:** 2 days  
**Location:** `/provider-portal/src/`

**Tasks:**

1. **Update API Service Layer**
   - Add prescription endpoints
   - Add medication search
   - Add investigation endpoints
   - Add error handling

2. **Implement React Query Hooks**
   - Already done in Phase 3 ✅

3. **Add Error Handling**
   - Already done in Phase 3 ✅

4. **Add Loading States**
   - Already done in Phase 3 ✅

5. **Test All CRUD Operations**
   - Create encounter
   - Read encounter
   - Update encounter
   - Delete encounter
   - Finalize encounter

---

## 📊 Phase 5: Security & Compliance

**Priority:** CRITICAL  
**Duration:** 7 days  
**Status:** ⏳ Pending

### Overview

Phase 5 focuses on implementing security measures and HIPAA compliance requirements. This is critical for healthcare applications handling patient data.

---

## 🎯 Phase 5 Tasks

### Step 5.1: HIPAA Compliance (3 days)

**Duration:** 3 days

**Tasks:**

1. **Implement Encryption at Rest**
   - Database encryption (PostgreSQL pgcrypto)
   - Sensitive field encryption (PII, PHI)
   - Key management

2. **Add Audit Logging**
   - Already partially done in Phase 1 ✅
   - Enhance with HIPAA requirements
   - Track all data access
   - Track all modifications
   - Track all deletions

3. **Setup Access Controls**
   - Role-based access control (RBAC)
   - Patient data access restrictions
   - Provider authorization
   - Admin access controls

4. **Add Data Retention Policies**
   - Define retention periods
   - Implement automatic deletion
   - Archive old data
   - Comply with regulations

5. **Implement Breach Detection**
   - Monitor unauthorized access
   - Alert on suspicious activity
   - Log security events
   - Incident response procedures

**Implementation Details:**

```typescript
// Encryption example
import crypto from 'crypto';

const encryptField = (value: string, key: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptField = (encrypted: string, key: string) => {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

---

### Step 5.2: RBAC Implementation (2 days)

**Duration:** 2 days

**Tasks:**

1. **Define Roles and Permissions**
   - Admin: Full access
   - Provider: Create/edit own encounters
   - Nurse: View encounters, add notes
   - Patient: View own records
   - Pharmacist: View medications

2. **Implement Permission Guards**
   ```typescript
   @UseGuards(AuthGuard('jwt'), RolesGuard)
   @Roles('admin', 'provider')
   @Post('encounters')
   async createEncounter(@Body() data: CreateEncounterDto) {
     // Only admin and provider can create
   }
   ```

3. **Add Role-based UI Rendering**
   - Show/hide components based on role
   - Disable actions based on permissions
   - Show appropriate error messages

4. **Test Access Controls**
   - Test each role's access
   - Test permission boundaries
   - Test unauthorized access

---

### Step 5.3: API Gateway Security (2 days)

**Duration:** 2 days

**Tasks:**

1. **Configure JWT Authentication**
   - Already done in Phase 1 ✅
   - Verify implementation
   - Test token validation

2. **Add Rate Limiting**
   ```yaml
   # Kong configuration
   plugins:
     - name: rate-limiting
       config:
         minute: 100
         hour: 1000
   ```

3. **Setup CORS Policies**
   - Already done in Phase 1 ✅
   - Restrict origins
   - Allow specific methods
   - Validate headers

4. **Implement Request Validation**
   - Validate request format
   - Validate request size
   - Validate content type
   - Sanitize inputs

---

## 📈 Timeline Summary

| Phase | Duration | Priority | Status |
|-------|----------|----------|--------|
| Phase 1: Backend | 5-7 days | CRITICAL | ✅ Complete |
| Phase 2: Frontend | 11-15 days | HIGH | ✅ Complete |
| Phase 3: Integration | 6-7 days | HIGH | ✅ Complete |
| Phase 4: Database & API | 7 days | CRITICAL | ⏳ Pending |
| Phase 5: Security | 7 days | CRITICAL | ⏳ Pending |
| Phase 6: FHIR | 6 days | MEDIUM | ⏳ Pending |
| Phase 7: Testing | 7 days | HIGH | ⏳ Pending |
| Phase 8: ML & Analytics | 7 days | LOW | ⏳ Pending |

---

## 🚀 Phase 4 & 5 Checklist

### Phase 4: Database & API

**Database Schema**
- [ ] Encounters table
- [ ] Medications table
- [ ] Prescriptions table
- [ ] Investigations table
- [ ] Foreign keys & indexes
- [ ] Migrations run

**API Endpoints**
- [ ] Encounter CRUD
- [ ] Prescription CRUD
- [ ] Medication search
- [ ] Investigation CRUD
- [ ] Error handling
- [ ] Validation

**Frontend Integration**
- [ ] API service updated
- [ ] React Query hooks
- [ ] Error handling
- [ ] Loading states
- [ ] CRUD tests

### Phase 5: Security & Compliance

**HIPAA Compliance**
- [ ] Encryption at rest
- [ ] Audit logging
- [ ] Access controls
- [ ] Data retention
- [ ] Breach detection

**RBAC**
- [ ] Roles defined
- [ ] Permissions implemented
- [ ] Guards configured
- [ ] UI rendering
- [ ] Access tested

**API Security**
- [ ] JWT configured
- [ ] Rate limiting
- [ ] CORS setup
- [ ] Request validation
- [ ] Security tested

---

## 📊 Success Criteria

### Phase 4
- ✅ All database tables created
- ✅ All API endpoints working
- ✅ CRUD operations tested
- ✅ Frontend integration complete
- ✅ No errors in logs

### Phase 5
- ✅ HIPAA compliance verified
- ✅ RBAC working correctly
- ✅ Security tests passing
- ✅ No unauthorized access
- ✅ Audit logs complete

---

## 🔄 Integration Points

### Phase 4 Integration
- Backend: Encounter Service
- Database: PostgreSQL
- Frontend: React components
- API: REST endpoints

### Phase 5 Integration
- Authentication: JWT
- Authorization: RBAC
- Encryption: AES-256
- Audit: Logging system

---

## 📞 Resources

### Phase 4 References
- Prisma documentation
- NestJS database integration
- REST API best practices
- Database indexing

### Phase 5 References
- HIPAA compliance guide
- RBAC implementation patterns
- JWT security best practices
- Encryption standards

---

## 🎯 Next Steps

1. **Immediate:** Review Phase 4 requirements
2. **Week 1:** Implement Phase 4 (Database & API)
3. **Week 2:** Implement Phase 5 (Security & Compliance)
4. **Week 3:** Phase 6 (FHIR & Terminology)
5. **Week 4:** Phase 7 (Testing & QA)

---

**Status:** 📋 PHASE 4 & 5 READY FOR IMPLEMENTATION

**Estimated Start:** November 8, 2025  
**Estimated Completion:** November 22, 2025

---

*Last Updated: November 7, 2025 - 4:25 AM UTC+06:00*
*Phase 4 & 5 Roadmap Compiled from IMPLEMENTATION_ROADMAP.md*
