# MANDATORY System Prompt for Cursor IDE - EMR/HMS Development

## 🚨 CRITICAL: DEVELOPMENT LAW ENFORCEMENT - READ FIRST

**Before writing ANY code, you MUST:**

1. ✅ Read and follow `/DEVELOPMENT_LAW.md` completely
2. ✅ Verify stack compatibility: NestJS + Prisma + PostgreSQL + React + MUI
3. ✅ Ensure FHIR R4, HIPAA, SNOMED CT, LOINC, and HL7 compliance
4. ✅ Never break login flow or dashboard loading
5. ✅ Test authentication flow before committing
6. ✅ Use only Material-UI (MUI) for UI components
7. ✅ Use only Prisma for database ORM (NO TypeORM)
8. ✅ Log all PHI access for HIPAA audit trails

**FORBIDDEN ACTIONS (Will be rejected):**

- ❌ Using TypeORM (use Prisma ONLY)
- ❌ Using UI libraries other than Material-UI (MUI)
- ❌ Modifying authentication endpoints (/api/auth/\*)
- ❌ Storing PHI without audit logging
- ❌ Skipping FHIR compliance for patient data
- ❌ Breaking existing login or dashboard functionality
- ❌ Hardcoding credentials or secrets
- ❌ Bypassing security guards or authentication

---

## Technology Stack (IMMUTABLE)

### Backend (NestJS Microservices)

```yaml
Framework: NestJS 10+
ORM: Prisma (ONLY - NO TypeORM)
Database: PostgreSQL 15+
Authentication: Passport.js + JWT
Password: bcrypt (10 rounds minimum)
Validation: class-validator + class-transformer
API Gateway: Kong Gateway 3.x (ports 8000, 8001)
```

### Frontend (React + MUI)

```yaml
Framework: React 18.2.0
Build Tool: Vite 5.0.8
UI Library: Material-UI (MUI) v5.14.20+ ONLY
State: Zustand 4.5.7
Data Fetching: React Query 5.90.7
HTTP Client: Axios 1.6.2
Router: React Router DOM 6.20.1
```

### Service Ports (FIXED)

```yaml
Kong Gateway: 8000 (proxy), 8001 (admin)
PostgreSQL: 5433
NATS JetStream: 4222 (client), 8222 (monitoring), 6222 (cluster)
MinIO: 9000 (S3 API), 9001 (console)
Authentication: 3001
Patient Service: 3011
Encounter Service: 3005
Clinical Workflow: 3004
Pharmacy: 3012
Lab: 3013
Radiology: 3014
Aggregation Service: 3020
Notification Service: 3021
Provider Portal: 5174
```

### Infrastructure Components

```yaml
Message Bus: NATS JetStream (ONLY - NO Kafka, NO RabbitMQ)
Object Storage: MinIO S3-compatible (HIPAA-compliant)
Event Library: @emr-hms/events (shared TypeScript package)
Buckets: radiology-images, lab-reports, patient-documents, prescriptions
```

---

## Healthcare Standards Compliance (MANDATORY)

### FHIR R4 Requirements

- ✅ All patient data MUST support FHIR R4 resources
- ✅ Use proper FHIR resourceType and structure
- ✅ Implement FHIR REST API endpoints (/fhir/r4/\*)
- ✅ Validate against FHIR specification
- ✅ Support FHIR search parameters

### HIPAA Compliance (CRITICAL)

- ✅ Log ALL PHI access to audit_logs table
- ✅ Include userId, action, timestamp, ipAddress
- ✅ Encrypt sensitive data at rest (SSN, insurance numbers)
- ✅ Implement minimum necessary access principle
- ✅ Use role-based access control (RBAC)
- ✅ Never log PHI in application logs

### SNOMED CT & LOINC

- ✅ All diagnoses MUST use SNOMED CT codes
- ✅ All lab tests MUST use LOINC codes
- ✅ Validate codes before storage
- ✅ Include system URLs in code references

### HL7 Integration

- ✅ Support HL7 v2.x message parsing
- ✅ Generate ADT messages for patient events
- ✅ Convert between HL7 v2 and FHIR
- ✅ Maintain message audit trail

---

## Prisma Requirements (STRICT)

### Schema Structure

```prisma
// MANDATORY: Every service schema
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["service_name"]  // Dedicated schema per service
}

// MANDATORY: All models include these fields
model Entity {
  id          String    @id @default(uuid())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdBy   String?
  updatedBy   String?
  isActive    Boolean   @default(true)
  isDeleted   Boolean   @default(false)

  @@map("table_name")
  @@schema("service_schema")
}
```

### Migration Rules

```bash
# MANDATORY: Named migrations
npx prisma migrate dev --name descriptive_name

# FORBIDDEN: Never use migrate reset in production
# FORBIDDEN: Never edit existing migrations
```

### PrismaService Implementation

```typescript
// MANDATORY in every service
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

  async executeTransaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return this.$transaction(fn);
  }
}
```

---

## Authentication & Security (NON-NEGOTIABLE)

### JWT Structure (FIXED)

```typescript
interface JWTPayload {
  sub: string; // User ID (REQUIRED)
  role: string; // User role (REQUIRED)
  portal: string; // Portal type (REQUIRED)
  iat?: number;
  exp?: number;
}

// Token expiry (FIXED)
ACCESS_TOKEN: "15m";
REFRESH_TOKEN: "7d";
```

### Protected Endpoints

```typescript
// MANDATORY: Use JWT guard
@UseGuards(JwtAuthGuard)
@Controller('api/protected')
export class ProtectedController {
  // All routes require authentication
}

// MANDATORY: Role-based access
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR', 'NURSE')
@Get('sensitive')
getSensitive() {
  // Only specific roles can access
}
```

### CSRF Protection

```typescript
// MANDATORY: All mutations must validate CSRF token
// 1. GET /api/auth/csrf-token
// 2. Include token in X-XSRF-TOKEN header
// 3. Validate in controller
```

---

## Event-Driven Architecture (MANDATORY)

### Event Publishing

```typescript
// MANDATORY: Publish events after state changes
import { LabResultAvailableEvent } from "@emr-hms/events";

@Injectable()
export class LabService {
  constructor(@Inject("NATS_CLIENT") private natsClient: ClientProxy) {}

  async finalizeLabResult(reportId: string) {
    const result = await this.prisma.labResult.update({
      where: { id: reportId },
      data: { status: "final" },
    });

    // MANDATORY: Publish event to NATS
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
        patientId: result.patientId,
        providerId: result.providerId,
        status: "final",
        criticalValues: result.hasCriticalValues,
        fhirResource: result.toFHIR(),
      },
    };

    this.natsClient.emit("lab.result.available", event);
  }
}
```

### Event Consumption

```typescript
// MANDATORY: Consume events with idempotent handlers
@Controller()
export class LabEventHandler {
  @EventPattern("lab.result.available")
  async handleLabResult(@Payload() event: LabResultAvailableEvent) {
    // MANDATORY: Check for duplicate processing
    const processed = await this.checkIfProcessed(event.eventId);
    if (processed) return;

    // Process event
    await this.updateAggregateView(event);
    await this.markAsProcessed(event.eventId);
  }
}
```

### CQRS Pattern

```typescript
// MANDATORY: Use aggregation service for reads
// Frontend calls: GET /api/aggregate/patients/:id
// Returns: Complete patient chart (single API call)

// DO NOT make multiple parallel API calls from frontend
// ❌ Bad: await Promise.all([fetchLabs(), fetchRadiology(), fetchMeds()])
// ✅ Good: await fetchPatientAggregate(patientId)
```

### Event Standards

```typescript
// MANDATORY: All events must include HIPAA fields
interface DomainEvent {
  eventId: string; // UUID v4
  eventType: string; // dot notation (lab.result.available)
  aggregateId: string; // Resource ID
  aggregateType: string; // FHIR resource type
  timestamp: Date; // ISO 8601
  userId: string; // HIPAA audit
  portalType:
    | "PROVIDER"
    | "PATIENT"
    | "LAB"
    | "PHARMACY"
    | "RADIOLOGY"
    | "ADMIN";
  data: Record<string, any>;
}

// Event naming: <domain>.<entity>.<action>
// Examples:
//   - patient.created
//   - lab.result.available
//   - pharmacy.medication.prescribed
//   - radiology.study.complete
```

### MinIO File Storage

```typescript
// MANDATORY: Store medical files in MinIO
@Injectable()
export class RadiologyService {
  async uploadDicomImage(file: Buffer, studyId: string) {
    // Store in radiology-images bucket
    const objectName = `${studyId}/${uuid()}.dcm`;
    await this.minioClient.putObject("radiology-images", objectName, file);

    // Generate presigned URL (24 hours)
    const url = await this.minioClient.presignedGetObject(
      "radiology-images",
      objectName,
      24 * 60 * 60
    );

    return { objectName, url };
  }
}

// MinIO buckets:
// - radiology-images: DICOM images
// - lab-reports: PDF reports
// - patient-documents: Consent forms, medical records
// - prescriptions: Prescription PDFs
```

### Real-Time Notifications

```typescript
// Frontend: Connect to notification service via WebSocket
import io from "socket.io-client";

const socket = io("http://localhost:3021", {
  auth: { token: localStorage.getItem("accessToken") },
});

// Listen for critical alerts
socket.on("critical_alert", (alert) => {
  // Show urgent notification
  showCriticalAlertModal(alert);
});

socket.on("notification", (notification) => {
  // Show toast notification
  showToast(notification.title, notification.message);
});
```

---

## Material-UI (MUI) Requirements (STRICT)

### Component Usage

```typescript
// MANDATORY: Use only MUI components
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  AppBar,
  Drawer,
  Grid,
  Stack,
  Box,
  // ... other MUI components
} from "@mui/material";

// FORBIDDEN: Custom UI components duplicating MUI
// FORBIDDEN: Other UI libraries (Bootstrap, Ant Design, etc.)
```

### Theming

```typescript
// MANDATORY: Use MUI theme system
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    success: { main: '#4caf50' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

// Wrap app in ThemeProvider
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

---

## State Management (MANDATORY)

### Zustand for Global State

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
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
    { name: "auth-storage" }
  )
);
```

### React Query for Server State

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";

// MANDATORY: Query pattern
const usePatient = (id: string) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });
};

// MANDATORY: Mutation pattern
const useCreatePatient = () => {
  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
```

---

## Error Handling (MANDATORY)

### Backend Error Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // MANDATORY: Log all errors
    // FORBIDDEN: Expose stack traces to client
    // MANDATORY: Return standardized error format

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      message: "Error message",
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Frontend Error Boundary

```typescript
// MANDATORY: Wrap app in ErrorBoundary
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay />;
    }
    return this.props.children;
  }
}
```

---

## Code Quality Requirements (STRICT)

### TypeScript

```typescript
// MANDATORY: Strict mode enabled
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
  }
}

// MANDATORY: Type all functions
function createPatient(dto: CreatePatientDto): Promise<Patient> {
  // Implementation
}

// FORBIDDEN: Using 'any' type (use 'unknown' if necessary)
```

### Testing

```typescript
// MANDATORY: Unit tests for all services
describe("PatientService", () => {
  it("should create FHIR-compliant patient", async () => {
    // Test implementation
  });

  it("should log PHI access", async () => {
    // Verify audit log created
  });
});

// MANDATORY: E2E tests for critical flows
test("user can login and view dashboard", async () => {
  // Test implementation
});
```

### Documentation

```typescript
// MANDATORY: JSDoc for all public methods
/**
 * Creates a new patient with FHIR R4 compliance
 * @param dto - Patient data following FHIR Patient resource
 * @returns Promise<FHIRPatient> - Created patient in FHIR format
 * @throws {BadRequestException} If validation fails
 * @audit Logs patient creation for HIPAA compliance
 */
async createPatient(dto: CreatePatientDto): Promise<FHIRPatient> {
  // Implementation
}
```

---

## Breaking Change Prevention (CRITICAL)

### Protected Endpoints (DO NOT MODIFY)

```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/csrf-token
```

### Login Flow (DO NOT BREAK)

```typescript
// Request structure (FIXED)
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

// Response structure (FIXED)
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

### Dashboard Loading (DO NOT BREAK)

```typescript
// MANDATORY: Handle loading states
function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return <DashboardContent user={data} />;
}
```

---

## Deployment Checklist (BEFORE MERGE)

- [ ] All tests passing (unit + E2E)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Prisma migrations applied successfully
- [ ] Environment variables configured
- [ ] Kong Gateway configured
- [ ] Login flow tested manually
- [ ] Dashboard loads without errors
- [ ] FHIR endpoints return valid resources
- [ ] Audit logs being created for PHI access
- [ ] No sensitive data in logs
- [ ] API documentation updated (Swagger)
- [ ] HIPAA compliance verified

---

## Code Review Requirements

Every pull request MUST:

1. ✅ Pass all automated tests
2. ✅ Include tests for new functionality
3. ✅ Follow DEVELOPMENT_LAW.md
4. ✅ Update documentation if API changes
5. ✅ Include migration if schema changes
6. ✅ Verify FHIR compliance for patient data
7. ✅ Verify HIPAA compliance for PHI access
8. ✅ Not break login flow
9. ✅ Not break dashboard loading
10. ✅ Be approved by at least one reviewer

---

## Quick Reference Commands

### Prisma

```bash
npx prisma generate
npx prisma migrate dev --name migration_name
npx prisma studio
npx prisma db push  # For prototyping only
```

### Docker

```bash
docker-compose up -d
docker-compose logs -f service_name
docker-compose restart service_name
docker-compose down
```

### Frontend Development

```bash
npm run dev          # Start Vite dev server
npm test            # Run Jest tests
npx playwright test # Run E2E tests
npm run build       # Production build
```

### Backend Development

```bash
npm run start:dev   # Start NestJS in watch mode
npm test           # Run unit tests
npm run test:e2e   # Run E2E tests
npm run build      # Production build
```

---

## Emergency Procedures

### If Login Breaks:

1. Check authentication service logs
2. Verify JWT secret is configured
3. Test /api/auth/csrf-token endpoint
4. Verify Kong Gateway routing
5. Check CORS configuration

### If Dashboard Won't Load:

1. Check browser console for errors
2. Verify authentication token is valid
3. Test API endpoints directly
4. Check React Query dev tools
5. Verify all dependencies installed

### If Database Migration Fails:

1. Check migration SQL for syntax errors
2. Verify DATABASE_URL is correct
3. Ensure PostgreSQL is running
4. Check schema permissions
5. Review Prisma documentation

---

## Clarity Healthcare Design System - UI Guidelines

### Persona & Goal

You are implementing the 'Clarity' healthcare design system using Material-UI components. This system prioritizes medical data clarity, accessibility, and professional healthcare aesthetics.

## Core Rules (Adhere to these without exception)

### RULE 1: USE TOKENS, NOT VALUES (ABSOLUTE MANDATORY)

You MUST NOT use hardcoded values (hex codes, rgb, rem, px, etc.) for colors, spacing, font sizes, shadows, or border radii. You MUST ALWAYS use the corresponding CSS custom property (variable) from our clarity-tokens.css file.

**Examples:**

- ❌ `color: '#0F172A';` → ✅ `color: var(--color-text-primary);`
- ❌ `padding: '24px';` → ✅ `padding: var(--spacing-5);`
- ❌ `fontSize: '1rem';` → ✅ `fontSize: var(--font-size-md);`
- ❌ `boxShadow: '0 4px 6px rgba(0,0,0,0.1)';` → ✅ `boxShadow: var(--shadow-md);`

### RULE 2: REPLACE OLD COMPONENT CLASSES (MANDATORY)

You MUST identify and replace all CSS classes related to the old glassmorphism system:

- Any element with classes like `.glass-card`, `.glass-container`, `.glass-panel`, or `.glass` MUST be refactored
- The standard replacement for a container is the new `.clarity-card` class
- Remove ALL portal-specific styling classes like `.glass-patient`, `.glass-provider`, etc.
- The new system is unified—no portal-specific styling

### RULE 3: ELIMINATE OBSOLETE CSS (MANDATORY)

You MUST remove all CSS properties associated with the old glassmorphism effect:

- `backdrop-filter` (performance-intensive, prohibited)
- `background` properties with `rgba()` transparency for glass effects
- Complex border or box-shadow styles designed to simulate glass
- Any CSS that creates visual complexity at the expense of clarity

### RULE 4: MAINTAIN STRUCTURE AND FUNCTIONALITY (MANDATORY)

When refactoring React components:

- Maintain the existing props and component structure unless refactoring explicitly requires a change
- Remove `portalType` props that were only used for styling
- Ensure all functionality remains intact
- Preserve all event handlers and state management

### RULE 5: HEALTHCARE UX REQUIREMENTS (MANDATORY)

You MUST implement healthcare-specific design requirements:

- Use semantic medical status colors (green for normal, yellow for caution, red for critical)
- Ensure high contrast ratios for medical data readability
- Implement clear information hierarchy for clinical workflows
- Include trust indicators (HIPAA compliance, security badges)
- Design for accessibility (elderly users, medical professionals, patients with disabilities)

## Contextual Information

### Design System Details

- **Name**: 'Clarity' Healthcare Design System
- **Tokens File**: `/src/styles/clarity-tokens.css`
- **Philosophy**: Apple-inspired minimalist design for medical applications
- **Primary Goal**: Enhance clinical outcomes through interface clarity

### Key Design Tokens

- **Primary Interactive Accent**: `var(--color-primary-500)` (#007AFF)
- **Default Background**: `var(--color-background)` (#FFFFFF)
- **Card/Surface Background**: `var(--color-surface)` (#F8F9FA)
- **Primary Text**: `var(--color-text-primary)` (#1D1D1F)
- **Medical Status Colors**:
  - Normal: `var(--color-success-500)` (#34C759)
  - Caution: `var(--color-warning-500)` (#FF9500)
  - Critical: `var(--color-error-500)` (#FF3B30)
  - Pending: `var(--color-info-500)` (#007AFF)

### Key Spacing Tokens

- **Standard Padding**: `var(--spacing-4)` (16px) or `var(--spacing-5)` (24px)
- **Page-level Padding**: `var(--spacing-6)` (32px)
- **Small Gaps**: `var(--spacing-2)` (8px)

### Key Typography Tokens

- **Base Font Stack**: `var(--font-family-sans)`
- **Body Text Size**: `var(--font-size-md)` (16px)
- **Label Size**: `var(--font-size-sm)` (14px)
- **Heading Weight**: `var(--font-weight-semibold)` (600)

### Performance Requirements

- **NO `backdrop-filter`** (computationally expensive)
- **Use solid colors** instead of complex gradients
- **Optimized shadows** instead of glass effects
- **CSS transitions** instead of heavy animations

## Component Mapping Reference

| Old Glassmorphism Class | New Clarity Class        | Purpose                     |
| ----------------------- | ------------------------ | --------------------------- |
| `.glass-card`           | `.clarity-card`          | Primary container component |
| `.glass-container`      | `.clarity-container`     | Layout container            |
| `.glass-panel`          | `.clarity-panel`         | Section container           |
| `.glass-strong`         | `.clarity-card-elevated` | Elevated content            |
| `.glass-patient`        | `.clarity-card`          | Unified card system         |
| `.glass-provider`       | `.clarity-card`          | Unified card system         |

## Healthcare-Specific Implementation Rules

### Medical Data Display

- Use clear, readable fonts with proper hierarchy
- Implement semantic color coding for medical status
- Ensure critical information is prominently displayed
- Use consistent data visualization patterns

### Accessibility Requirements

- Minimum 16px font size for body text
- High contrast ratios (WCAG AA compliance)
- Touch targets minimum 44px × 44px
- Screen reader optimized with proper ARIA labels
- Keyboard navigation support

### Trust & Security Indicators

- Display "HIPAA Compliant" badges prominently
- Include "256-bit Encryption" indicators
- Show "SOC 2 Certified" status on login pages
- Use security icons consistently

## Example Refactoring Task

**Input Component (Before):**

```tsx
// src/components/DashboardCard.tsx
import './DashboardCard.css';

const DashboardCard = ({ children, portalType }) => {
  const cardClass = `glass-card glass-${portalType}`;
  return <div className={cardClass}>{children}</div>;
};

/* DashboardCard.css */
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 24px;
}
```

**Expected Output (After):**

```tsx
// src/components/Card.tsx
import './Card.css';

const Card = ({ children, className = '' }) => {
  const combinedClassName = `clarity-card ${className}`;
  return <div className={combinedClassName}>{children}</div>;
};

/* Card.css */
.clarity-card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-subtle);
  padding: var(--spacing-5);
  transition: var(--transition-base);
}
```

## Quality Checklist for Each Refactoring

Before completing any refactoring task, verify:

### Design System Compliance

- [ ] All hardcoded values replaced with tokens
- [ ] All glassmorphism classes removed
- [ ] All `backdrop-filter` properties eliminated
- [ ] Proper token usage for colors, spacing, typography

### Healthcare UX Requirements

- [ ] Medical status colors used correctly
- [ ] High contrast ratios maintained
- [ ] Clear information hierarchy implemented
- [ ] Trust indicators included where appropriate

### Accessibility Standards

- [ ] Semantic HTML elements used
- [ ] Proper ARIA labels added
- [ ] Keyboard navigation supported
- [ ] Screen reader optimized

### Performance Standards

- [ ] No performance-intensive CSS effects
- [ ] Optimized transitions used
- [ ] Efficient CSS selectors
- [ ] Minimal bundle impact

### Functional Integrity

- [ ] All original functionality preserved
- [ ] Event handlers maintained
- [ ] State management intact
- [ ] Props interface preserved (except for removed styling props)

## Error Handling Rules

If you encounter a situation where the design system rules conflict with functionality:

1. **Prioritize functionality** - Ensure the component works
2. **Document the conflict** - Explain why the rule couldn't be followed
3. **Propose a solution** - Suggest how to extend the design system
4. **Never revert to glassmorphism** - Find alternative solutions within the clarity system

## Emergency Procedures

### Critical System Failure

If refactoring breaks critical functionality:

1. **Immediately revert** to the last working state
2. **Document the failure** with specific error details
3. **Create a minimal fix** that maintains design system principles
4. **Test thoroughly** before re-deployment

### Performance Issues

If performance degrades after refactoring:

1. **Identify the bottleneck** using browser dev tools
2. **Optimize using approved methods** (better selectors, reduced complexity)
3. **Never use glassmorphism** as a performance solution
4. **Measure improvements** before and after optimization

## Final Verification

Before submitting any refactored code:

1. **Run automated tests** to ensure functionality
2. **Check visual consistency** across components
3. **Verify accessibility** with screen reader testing
4. **Test responsive behavior** on all breakpoints
5. **Validate performance** improvements
6. **Ensure healthcare compliance** (HIPAA, accessibility, trust indicators)

Remember: The 'Clarity' design system exists to improve healthcare outcomes through better interface design. Every refactoring should contribute to this primary goal.
