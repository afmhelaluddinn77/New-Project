# DEVELOPMENT LAW - MANDATORY CODE STANDARDS

## 🚨 CRITICAL: ALL CODE MUST FOLLOW THESE RULES

This document defines **mandatory** standards for all development in this EMR/HMS system. **NO EXCEPTIONS**.

---

## 1. TECHNOLOGY STACK (IMMUTABLE)

### 1.1 Backend Stack

```yaml
MANDATORY:
  - Framework: NestJS 10+
  - ORM: Prisma (ONLY - NO TypeORM, NO Sequelize)
  - Database: PostgreSQL 15+
  - Authentication: Passport.js + JWT
  - Password Hashing: bcrypt
  - Validation: class-validator + class-transformer
  - API Gateway: Kong Gateway 3.x
```

### 1.2 Frontend Stack

```yaml
MANDATORY:
  - Framework: React 18.2.0
  - Build Tool: Vite 5.0.8
  - UI Library: Material-UI (MUI) v5.14.20+ (NO other UI libraries)
  - State Management: Zustand 4.5.7
  - Data Fetching: React Query 5.90.7
  - HTTP Client: Axios 1.6.2
  - Routing: React Router DOM 6.20.1
```

### 1.3 Infrastructure

```yaml
MANDATORY:
  - Containerization: Docker + Docker Compose
  - API Gateway: Kong (ports 8000, 8001)
  - Database: PostgreSQL (port 5433)
  - Message Bus: NATS JetStream (ports 4222, 8222, 6222)
  - Object Storage: MinIO S3-compatible (ports 9000, 9001)
  - Service Ports:
    * Authentication: 3001
    * Patient Service: 3011
    * Encounter Service: 3005
    * Clinical Workflow: 3004
    * Pharmacy: 3012
    * Lab: 3013
    * Radiology: 3014
    * Aggregation Service: 3020
    * Notification Service: 3021
```

### 1.4 Event-Driven Architecture

```yaml
MANDATORY:
  - Message Bus: NATS JetStream (ONLY - NO Kafka, NO RabbitMQ)
  - Event Library: @emr-hms/events (TypeScript shared package)
  - Event Pattern: Pub/Sub with at-least-once delivery
  - Event Standards: FHIR R4 compliant domain events
  - HIPAA Compliance: All events include userId, timestamp, portalType
```

### 1.5 File Storage

```yaml
MANDATORY:
  - Object Storage: MinIO S3-compatible (HIPAA-compliant)
  - Buckets:
    * radiology-images (DICOM images)
    * lab-reports (PDF reports)
    * patient-documents (consent forms, medical records)
    * prescriptions (prescription PDFs)
  - Security: All buckets private, presigned URLs for access
  - Encryption: At-rest encryption enabled
```

---

## 2. PRISMA REQUIREMENTS (STRICT)

### 2.1 Schema Design

```prisma
// MANDATORY: Every service must have:

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["multiSchema"]  // REQUIRED for multi-schema
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["service_name"]  // REQUIRED: Dedicated schema per service
}

// MANDATORY: All models must include:
model Entity {
  id          String    @id @default(uuid())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // ... entity fields

  @@map("table_name")
  @@schema("service_schema")
}
```

### 2.2 Migration Rules

```bash
# MANDATORY: Always use named migrations
npx prisma migrate dev --name descriptive_migration_name

# FORBIDDEN: Never use migrate reset in production
# FORBIDDEN: Never edit existing migrations

# MANDATORY: Migration naming convention
# Format: YYYYMMDDHHMMSS_action_entity_description
# Example: 20251110120000_add_fhir_support_to_patient
```

### 2.3 PrismaService Implementation

```typescript
// MANDATORY: Every service must have this structure

import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // MANDATORY: Transaction wrapper
  async executeTransaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return this.$transaction(fn);
  }
}
```

---

## 3. AUTHENTICATION & SECURITY (NON-NEGOTIABLE)

### 3.1 JWT Implementation

```typescript
// MANDATORY: JWT Structure
interface JWTPayload {
  sub: string; // User ID (REQUIRED)
  role: string; // User role (REQUIRED)
  portal: string; // Portal type (REQUIRED)
  iat?: number; // Issued at
  exp?: number; // Expiration
}

// MANDATORY: Token Expiry
const ACCESS_TOKEN_EXPIRY = "15m"; // FIXED
const REFRESH_TOKEN_EXPIRY = "7d"; // FIXED

// FORBIDDEN: Storing passwords in plain text
// MANDATORY: Use bcrypt with 10 rounds minimum
const hashedPassword = await bcrypt.hash(password, 10);
```

### 3.2 CSRF Protection

```typescript
// MANDATORY: All POST/PUT/DELETE requests must validate CSRF token
// Frontend must obtain token from /api/auth/csrf-token
// Include in X-XSRF-TOKEN header for all mutations
```

### 3.3 Authorization Guards

```typescript
// MANDATORY: Protected routes must use JWT guard
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/protected')
export class ProtectedController {
  // Routes here require authentication
}

// MANDATORY: Role-based access control
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR', 'NURSE')
@Get('sensitive-data')
getSensitiveData() {
  // Only doctors and nurses can access
}
```

---

## 4. FHIR R4 COMPLIANCE (MANDATORY)

### 4.1 FHIR Resource Implementation

```typescript
// MANDATORY: All patient data must support FHIR R4 resources

interface FHIRPatient {
  resourceType: "Patient";
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  identifier: Array<{
    system: string;
    value: string;
  }>;
  name: Array<{
    use: "official" | "usual" | "nickname";
    family: string;
    given: string[];
  }>;
  gender: "male" | "female" | "other" | "unknown";
  birthDate: string; // ISO 8601 date
  // ... additional FHIR fields
}

// MANDATORY: FHIR DTOs must validate against FHIR spec
```

### 4.2 FHIR Endpoints

```typescript
// MANDATORY: FHIR API endpoints must follow this pattern
@Controller("fhir/r4")
export class FHIRController {
  @Get("Patient/:id")
  getPatient(@Param("id") id: string): Promise<FHIRPatient> {
    // Return FHIR-compliant patient
  }

  @Post("Patient")
  createPatient(@Body() patient: FHIRPatient): Promise<FHIRPatient> {
    // Create FHIR-compliant patient
  }
}
```

---

## 5. EVENT-DRIVEN ARCHITECTURE (MANDATORY)

### 5.1 Event Library

```typescript
// MANDATORY: Use @emr-hms/events for all domain events
import {
  LabResultAvailableEvent,
  PatientCreatedEvent,
  DomainEvent,
} from "@emr-hms/events";

// MANDATORY: All events must extend DomainEvent
interface CustomEvent extends DomainEvent {
  eventType: "custom.event.type";
  aggregateType: "FHIRResourceType";
  data: {
    // Event-specific payload
  };
}
```

### 5.2 Event Publishing (NATS)

```typescript
// MANDATORY: Services publish events via NATS

@Injectable()
export class LabService {
  constructor(@Inject("NATS_CLIENT") private natsClient: ClientProxy) {}

  async finalizeLabResult(reportId: string) {
    const result = await this.findResult(reportId);

    // MANDATORY: Publish event after state change
    const event: LabResultAvailableEvent = {
      eventId: uuid(),
      eventType: "lab.result.available",
      aggregateId: result.id,
      aggregateType: "DiagnosticReport",
      timestamp: new Date(),
      userId: result.finalizingUserId,
      portalType: "LAB",
      data: {
        reportId: result.id,
        orderId: result.orderId,
        patientId: result.patientId,
        providerId: result.providerId,
        status: "final",
        criticalValues: result.hasCriticalValues,
        abnormalResults: result.hasAbnormalResults,
        resultCount: result.observations.length,
        fhirResource: result.toFHIR(),
      },
    };

    // Publish to NATS
    this.natsClient.emit("lab.result.available", event);
  }
}
```

### 5.3 Event Consumption

```typescript
// MANDATORY: Services consume events using @EventPattern

@Controller()
export class LabEventHandler {
  @EventPattern("lab.result.available")
  async handleLabResult(@Payload() event: LabResultAvailableEvent) {
    // MANDATORY: Idempotent event handling
    const existing = await this.checkIfProcessed(event.eventId);
    if (existing) return;

    // Process event
    await this.updateAggregateView(event);
    await this.markAsProcessed(event.eventId);
  }
}
```

### 5.4 Event Standards

```typescript
// MANDATORY: All events must include HIPAA audit fields
interface DomainEvent {
  eventId: string; // UUID v4
  eventType: string; // dot notation (e.g., 'lab.result.available')
  aggregateId: string; // Resource ID
  aggregateType: string; // FHIR resource type
  timestamp: Date; // ISO 8601
  userId: string; // HIPAA: who triggered event
  portalType:
    | "PROVIDER"
    | "PATIENT"
    | "LAB"
    | "PHARMACY"
    | "RADIOLOGY"
    | "ADMIN"
    | "BILLING";
  data: Record<string, any>; // Event payload
  correlationId?: string; // Optional: for tracing
}

// MANDATORY: Event naming convention
// Format: <domain>.<entity>.<action>
// Examples:
//   - patient.created
//   - lab.result.available
//   - pharmacy.medication.prescribed
//   - radiology.study.complete
```

### 5.5 CQRS Pattern (Aggregation Service)

```typescript
// MANDATORY: Use aggregation service for read models

// Write Side (Lab Service)
async createLabResult(data: CreateLabResultDto) {
  const result = await this.prisma.labResult.create({ data });

  // Publish event for read model update
  this.publishEvent('lab.result.available', result);

  return result;
}

// Read Side (Aggregation Service)
@EventPattern('lab.result.available')
async updateReadModel(@Payload() event: LabResultAvailableEvent) {
  // Create denormalized view
  await this.prisma.labResultView.create({
    data: {
      reportId: event.data.reportId,
      patientId: event.data.patientId,
      status: event.data.status,
      criticalValues: event.data.criticalValues,
      // ... denormalized fields
    },
  });

  // Update patient aggregate
  await this.updatePatientAggregate(event.data.patientId);
}

// MANDATORY: Frontend uses aggregation API
// GET /api/aggregate/patients/:id
// Returns: Complete patient chart in single call
```

### 5.6 MinIO File Storage

```typescript
// MANDATORY: Use MinIO for HIPAA-compliant file storage

@Injectable()
export class RadiologyService {
  constructor(private minioClient: MinioClient) {}

  async uploadDicomImage(file: Buffer, studyId: string) {
    // MANDATORY: Store medical images in MinIO
    const bucketName = "radiology-images";
    const objectName = `${studyId}/${uuid()}.dcm`;

    await this.minioClient.putObject(
      bucketName,
      objectName,
      file,
      file.length,
      { "Content-Type": "application/dicom" }
    );

    // MANDATORY: Generate presigned URL for secure access
    const url = await this.minioClient.presignedGetObject(
      bucketName,
      objectName,
      24 * 60 * 60 // 24 hours
    );

    return { objectName, url };
  }
}

// MANDATORY: MinIO bucket usage
// - radiology-images: DICOM images, imaging studies
// - lab-reports: PDF reports, attachments
// - patient-documents: Consent forms, medical records
// - prescriptions: Prescription PDFs
```

---

## 6. HIPAA COMPLIANCE (CRITICAL)

### 6.1 Audit Logging

```typescript
// MANDATORY: All access to PHI must be logged

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const action = `${request.method} ${request.url}`;

    // MANDATORY: Log before action
    await this.auditLogService.create({
      userId,
      action,
      resourceType: 'PHI',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
    });

    return next.handle();
  }
}

// MANDATORY: Audit log schema
model AuditLog {
  id            String    @id @default(uuid())
  userId        String?
  action        String    // REQUIRED
  resourceType  String?
  resourceId    String?
  ipAddress     String?
  userAgent     String?
  success       Boolean   @default(true)
  errorMessage  String?
  metadata      Json?
  timestamp     DateTime  @default(now())

  @@index([userId])
  @@index([action])
  @@index([timestamp])
  @@schema("audit")
}
```

### 5.2 Data Encryption

```typescript
// MANDATORY: Encrypt PHI at rest
// Use PostgreSQL pgcrypto extension for sensitive fields

// Example Prisma model for encrypted data
model PatientSensitiveData {
  id                String  @id @default(uuid())
  patientId         String
  ssn               String  // Store encrypted
  insuranceNumber   String  // Store encrypted

  // MANDATORY: Use application-level encryption before storing
  @@schema("patient")
}
```

### 5.3 Access Control

```typescript
// MANDATORY: Minimum necessary principle
// Users can only access data required for their job function

@Injectable()
export class DataAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestedResource = request.params.id;

    // MANDATORY: Verify user has legitimate reason to access data
    return this.accessControlService.verifyAccess(
      user.id,
      user.role,
      requestedResource
    );
  }
}
```

---

## 6. SNOMED CT & LOINC INTEGRATION

### 6.1 Clinical Terminology

```typescript
// MANDATORY: All diagnoses must use SNOMED CT codes
interface Diagnosis {
  code: string; // SNOMED CT code (REQUIRED)
  display: string; // SNOMED CT term
  system: "http://snomed.info/sct"; // FIXED
}

// MANDATORY: All lab tests must use LOINC codes
interface LabTest {
  code: string; // LOINC code (REQUIRED)
  display: string; // LOINC term
  system: "http://loinc.org"; // FIXED
}

// MANDATORY: Medication codes must use RxNorm
interface Medication {
  code: string; // RxNorm code (REQUIRED)
  display: string;
  system: "http://www.nlm.nih.gov/research/umls/rxnorm"; // FIXED
}
```

### 6.2 Code Validation

```typescript
// MANDATORY: Validate terminology codes before storage
@Injectable()
export class TerminologyService {
  async validateSNOMEDCode(code: string): Promise<boolean> {
    // Verify code exists in SNOMED CT
    // Return false for invalid codes
  }

  async validateLOINCCode(code: string): Promise<boolean> {
    // Verify code exists in LOINC
    // Return false for invalid codes
  }
}
```

---

## 7. HL7 MESSAGING (REQUIRED)

### 7.1 HL7 v2 Messages

```typescript
// MANDATORY: Support HL7 v2.x messages for interoperability

interface HL7Message {
  MSH: MessageHeader; // REQUIRED
  PID: PatientIdentification; // REQUIRED for ADT
  PV1: PatientVisit; // REQUIRED for ADT
  OBR?: ObservationRequest;
  OBX?: ObservationResult[];
}

// MANDATORY: Parse and generate HL7 messages
@Injectable()
export class HL7Service {
  parseMessage(hl7String: string): HL7Message {
    // Parse HL7 v2 format
  }

  generateADT(patient: Patient, visit: Visit): string {
    // Generate ADT^A01 message
  }
}
```

### 7.2 HL7 FHIR Conversion

```typescript
// MANDATORY: Convert between HL7 v2 and FHIR
@Injectable()
export class HL7ToFHIRConverter {
  convertPatient(hl7PID: HL7PID): FHIRPatient {
    // Map HL7 PID segment to FHIR Patient resource
  }
}
```

---

## 8. FRONTEND REQUIREMENTS (STRICT)

### 8.1 Material-UI Usage

```typescript
// MANDATORY: Use MUI components only
import {
  Button,
  TextField,
  Card,
  Typography,
  AppBar,
  Drawer,
  // ... other MUI components
} from "@mui/material";

// FORBIDDEN: Custom UI components that duplicate MUI functionality
// FORBIDDEN: Other UI libraries (Bootstrap, Ant Design, etc.)

// MANDATORY: Use MUI theme system
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Customize as needed
    },
  },
});
```

### 8.2 State Management

```typescript
// MANDATORY: Use Zustand for global state
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Authentication store example
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);

// MANDATORY: Use React Query for server state
import { useQuery, useMutation } from "@tanstack/react-query";

const usePatient = (id: string) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => fetchPatient(id),
  });
};
```

### 8.3 Protected Routes

```typescript
// MANDATORY: All routes except login must be protected
import { Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// FORBIDDEN: Exposing protected data without authentication check
```

### 8.4 API Integration

```typescript
// MANDATORY: All API calls must go through Kong Gateway
const API_BASE_URL = "http://localhost:8000"; // Kong Gateway

// MANDATORY: Include authentication token in all requests
import axios from "axios";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // REQUIRED for cookies
});

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// MANDATORY: Handle token refresh on 401
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      // If refresh fails, redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## 9. ERROR HANDLING (MANDATORY)

### 9.1 Backend Error Structure

```typescript
// MANDATORY: Use standard HTTP exception filters
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    // MANDATORY: Log all errors
    console.error("Error:", exception);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 9.2 Frontend Error Handling

```typescript
// MANDATORY: Use Error Boundary for React errors
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <h1>Sorry, something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

---

## 10. DATABASE SCHEMA REQUIREMENTS

### 10.1 Schema Separation

```
MANDATORY: Each service must have its own schema
- auth schema: Authentication service
- patient schema: Patient service
- encounter schema: Encounter service
- lab schema: Lab service
- pharmacy schema: Pharmacy service
- radiology schema: Radiology service
- audit schema: Audit logs (cross-service)
```

### 10.2 Common Fields

```prisma
// MANDATORY: All entities must include these fields
model BaseEntity {
  id          String    @id @default(uuid())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdBy   String?   // User ID who created
  updatedBy   String?   // User ID who last updated
  isActive    Boolean   @default(true)
  isDeleted   Boolean   @default(false) // Soft delete
  deletedAt   DateTime?
  deletedBy   String?
}
```

---

## 11. TESTING REQUIREMENTS (NON-NEGOTIABLE)

### 11.1 Unit Tests

```typescript
// MANDATORY: All services must have unit tests
// Coverage target: 80%+ for critical paths

describe("PatientService", () => {
  let service: PatientService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
  });

  it("should create patient with FHIR data", async () => {
    // Test FHIR compliance
  });

  it("should log PHI access for HIPAA", async () => {
    // Test audit logging
  });
});
```

### 11.2 E2E Tests

```typescript
// MANDATORY: Critical user flows must have E2E tests
import { test, expect } from "@playwright/test";

test("provider can login and view patient", async ({ page }) => {
  await page.goto("http://localhost:5174/login");

  await page.fill('[name="email"]', "provider@example.com");
  await page.fill('[name="password"]', "password");
  await page.selectOption('[name="portalType"]', "PROVIDER");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator("text=Welcome")).toBeVisible();
});
```

---

## 12. DOCUMENTATION REQUIREMENTS

### 12.1 Code Documentation

```typescript
// MANDATORY: All public methods must have JSDoc
/**
 * Creates a new patient record with FHIR R4 compliance
 * @param createPatientDto - Patient data following FHIR Patient resource
 * @returns Promise<FHIRPatient> - Created patient in FHIR format
 * @throws {BadRequestException} If SNOMED codes are invalid
 * @throws {ConflictException} If patient with same identifier exists
 * @audit Logs patient creation for HIPAA compliance
 */
async createPatient(createPatientDto: CreatePatientDto): Promise<FHIRPatient> {
  // Implementation
}
```

### 12.2 API Documentation

```typescript
// MANDATORY: Use Swagger/OpenAPI
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("patients")
@Controller("api/patients")
export class PatientController {
  @ApiOperation({ summary: "Create new patient" })
  @ApiResponse({ status: 201, description: "Patient created successfully" })
  @ApiResponse({ status: 400, description: "Invalid patient data" })
  @Post()
  create(@Body() dto: CreatePatientDto) {
    return this.patientService.create(dto);
  }
}
```

---

## 13. BREAKING CHANGE PREVENTION

### 13.1 Login Flow Protection

```typescript
// FORBIDDEN: Changing authentication endpoints
// These endpoints are FIXED and must not be modified:
POST / api / auth / login;
POST / api / auth / refresh;
POST / api / auth / logout;
GET / api / auth / csrf - token;

// FORBIDDEN: Changing login request/response structure
interface LoginRequest {
  email: string;
  password: string;
  portalType:
    | "PROVIDER"
    | "PATIENT"
    | "ADMIN"
    | "LAB"
    | "PHARMACY"
    | "BILLING"
    | "RADIOLOGY";
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    portal: string;
  };
}
```

### 13.2 Dashboard Loading Protection

```typescript
// MANDATORY: Dashboard must load without errors
// Check before deploying:
1. Authentication token is valid
2. User data is fetched successfully
3. All API endpoints return 200 or handle errors gracefully
4. No CORS errors
5. No missing dependencies

// MANDATORY: Loading states
function Dashboard() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return <DashboardContent user={user} />;
}
```

---

## 14. DEPLOYMENT CHECKLIST

### Before ANY deployment:

- [ ] All tests passing (unit + E2E)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Prisma migrations applied
- [ ] Environment variables configured
- [ ] Kong Gateway configured
- [ ] Login flow tested manually
- [ ] Dashboard loads without errors
- [ ] FHIR endpoints return valid resources
- [ ] Audit logs are being created
- [ ] HIPAA compliance verified
- [ ] No sensitive data in logs
- [ ] API documentation updated
- [ ] Version number incremented

---

## 15. CODE REVIEW REQUIREMENTS

Every pull request MUST:

1. Pass all automated tests
2. Include tests for new functionality
3. Follow this development law
4. Update documentation if API changes
5. Include migration if schema changes
6. Be reviewed by at least one other developer
7. Verify FHIR compliance for patient data changes
8. Verify HIPAA compliance for PHI access
9. Not break existing login flow
10. Not break existing dashboard loading

---

## 16. VIOLATION CONSEQUENCES

**Code that violates this law:**

- ❌ Will be rejected in code review
- ❌ Will not be merged to main
- ❌ May be reverted if merged accidentally
- ❌ May cause production incidents
- ❌ May result in HIPAA violations
- ❌ May compromise patient data security

**This law is MANDATORY and NON-NEGOTIABLE.**

---

## 17. QUICK REFERENCE

### Stack Summary

```
Backend:  NestJS + Prisma + PostgreSQL
Frontend: React + MUI + Zustand + React Query
Gateway:  Kong
Auth:     JWT + Passport + bcrypt
Standards: FHIR R4, HIPAA, SNOMED CT, LOINC, HL7
```

### Port Reference

```
Kong Proxy:       8000
Kong Admin:       8001
PostgreSQL:       5433
Auth Service:     3001
Patient Service:  3011
Encounter:        3005
Workflow:         3004
Pharmacy:         3012
Lab:              3013
Radiology:        3014
Provider Portal:  5174
```

### Essential Commands

```bash
# Prisma
npx prisma generate
npx prisma migrate dev --name migration_name
npx prisma studio

# Docker
docker-compose up -d
docker-compose logs -f service_name

# Frontend
npm run dev (Vite)
npm test (Jest)
npx playwright test (E2E)

# Backend
npm run start:dev (NestJS)
npm test (Jest)
npm run test:e2e (E2E)
```

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0
**Status**: ACTIVE AND ENFORCED
