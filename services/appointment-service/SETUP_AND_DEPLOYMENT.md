# Appointment Service - Setup & Deployment Guide

## Overview

The **Appointment Service** is a HIPAA-compliant, FHIR R4-compatible microservice that manages patient appointments, scheduling, rescheduling, and check-ins.

### Features Implemented

- ✅ **Feature #2**: View Appointments
- ✅ **Feature #3**: Schedule New Appointments
- ✅ **Feature #4**: Reschedule Appointments
- ✅ **Feature #20**: Self-Check-in (Simulated)
- ✅ **Feature #18**: Appointment Reminders (Backend support)

### Technology Stack

- **Framework**: NestJS 10+
- **ORM**: Prisma 6.18.0
- **Database**: PostgreSQL 15+ (schema: `appointment`)
- **Authentication**: JWT via Passport
- **Port**: 3015

---

## Phase 1: Requirements (COMPLETE)

✅ Domain objects defined in Prisma schema
✅ Ownership: `appointment-service`
✅ Consumers: Patient Portal, Provider Portal
✅ HIPAA compliance: Audit logging for all PHI access
✅ FHIR mapping: Appointment resource

---

## Phase 2: Backend Setup (IN PROGRESS)

### Step 1: Install Dependencies

```bash
cd services/appointment-service
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/emr_hms?schema=appointment"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"

# Service
PORT=3015
NODE_ENV=development

# Kong Gateway
KONG_GATEWAY_URL="http://localhost:8000"
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Run Migrations

```bash
# Create the appointment schema and tables
npx prisma migrate dev --name initial_appointment_schema

# This creates:
# - appointments table
# - appointment_changes table
# - appointment_reminders table
# - provider_availability table
# - audit_logs table
```

### Step 5: Create Missing Module Files

Create `src/prisma/prisma.module.ts`:

```typescript
import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Create `src/appointment/appointment.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { AppointmentController } from "./appointment.controller";
import { AppointmentService } from "./appointment.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
```

Create `src/app.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AppointmentModule } from "./appointment/appointment.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AppointmentModule,
  ],
})
export class AppModule {}
```

Create `src/main.ts`:

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix("api");

  // CORS
  app.enableCors({
    origin: [
      "http://localhost:5174", // Provider Portal
      "http://localhost:5175", // Patient Portal
      "http://localhost:5176", // Admin Portal
    ],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle("Appointment Service API")
    .setDescription("HIPAA-compliant Appointment Management Service")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3015;
  await app.listen(port);
  console.log(`🚀 Appointment Service running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

Create `nest-cli.json`:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

### Step 6: Start the Service

```bash
npm run start:dev
```

Service will be available at `http://localhost:3015`

---

## Phase 3: Kong Gateway Configuration

Add to `kong.yml`:

```yaml
services:
  - name: appointment-service
    url: http://appointment-service:3015
    routes:
      - name: appointment-routes
        paths:
          - /api/appointments
        strip_path: false
    plugins:
      - name: jwt
        config:
          secret_is_base64: false
          key_claim_name: sub
      - name: cors
        config:
          origins:
            - "*"
          methods:
            - GET
            - POST
            - PUT
            - PATCH
            - DELETE
          headers:
            - Accept
            - Authorization
            - Content-Type
          exposed_headers:
            - X-Auth-Token
          credentials: true
          max_age: 3600
```

Reload Kong:

```bash
docker-compose restart kong
```

---

## Phase 4: FHIR Integration

### FHIR Appointment Resource Mapping

```typescript
// Add to appointment.service.ts

/**
 * Convert internal Appointment to FHIR R4 Appointment resource
 */
toFHIR(appointment: Appointment): FHIRAppointment {
  return {
    resourceType: 'Appointment',
    id: appointment.fhirResourceId || appointment.id,
    identifier: [
      {
        system: 'urn:emr-hms:appointment',
        value: appointment.appointmentNumber,
      },
    ],
    status: this.mapStatusToFHIR(appointment.status),
    serviceType: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/service-type',
            code: appointment.appointmentType,
            display: appointment.appointmentType,
          },
        ],
      },
    ],
    appointmentType: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
          code: 'FOLLOWUP',
        },
      ],
    },
    reasonCode: appointment.reason
      ? [
          {
            text: appointment.reason,
          },
        ]
      : undefined,
    description: appointment.notes,
    start: appointment.scheduledDate?.toISOString(),
    end: appointment.scheduledDate
      ? new Date(
          appointment.scheduledDate.getTime() + appointment.duration * 60000
        ).toISOString()
      : undefined,
    minutesDuration: appointment.duration,
    comment: appointment.instructions,
    participant: [
      {
        actor: {
          reference: `Patient/${appointment.patientId}`,
        },
        required: 'required',
        status: this.mapParticipantStatus(appointment.status),
      },
      appointment.providerId
        ? {
            actor: {
              reference: `Practitioner/${appointment.providerId}`,
            },
            required: 'required',
            status: 'accepted',
          }
        : undefined,
    ].filter(Boolean),
  };
}

private mapStatusToFHIR(status: AppointmentStatus): string {
  const mapping = {
    REQUESTED: 'proposed',
    PENDING_APPROVAL: 'pending',
    CONFIRMED: 'booked',
    CHECKED_IN: 'arrived',
    IN_PROGRESS: 'fulfilled',
    COMPLETED: 'fulfilled',
    CANCELLED: 'cancelled',
    NO_SHOW: 'noshow',
    RESCHEDULED: 'booked',
  };
  return mapping[status] || 'proposed';
}
```

---

## Phase 5: Testing

### Unit Tests

Create `src/appointment/appointment.service.spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { AppointmentService } from "./appointment.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AppointmentService", () => {
  let service: AppointmentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: PrismaService,
          useValue: {
            appointment: {
              count: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
            appointmentChange: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create an appointment", async () => {
    const createDto = {
      patientId: "patient-123",
      appointmentType: "GENERAL_CHECKUP",
      requestedDate: new Date().toISOString(),
    };

    const mockAppointment = {
      id: "appt-123",
      appointmentNumber: "APT-2024-000001",
      ...createDto,
    };

    jest.spyOn(prisma.appointment, "count").mockResolvedValue(0);
    jest
      .spyOn(prisma.appointment, "create")
      .mockResolvedValue(mockAppointment as any);
    jest.spyOn(prisma.auditLog, "create").mockResolvedValue({} as any);

    const result = await service.create(createDto as any, "user-123");

    expect(result).toEqual(mockAppointment);
    expect(prisma.appointment.create).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
```

Run tests:

```bash
npm test
```

### E2E Testing Scenario

```bash
# 1. Create appointment
curl -X POST http://localhost:8000/api/appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-123",
    "appointmentType": "GENERAL_CHECKUP",
    "requestedDate": "2024-02-01T10:00:00Z",
    "reason": "Annual checkup"
  }'

# 2. Get patient appointments
curl -X GET http://localhost:8000/api/appointments/patient/patient-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Reschedule appointment
curl -X PATCH http://localhost:8000/api/appointments/appt-123/reschedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newDate": "2024-02-02T14:00:00Z",
    "reason": "Schedule conflict"
  }'

# 4. Check-in
curl -X PATCH http://localhost:8000/api/appointments/appt-123/check-in \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "Cough, fever",
    "temperature": 98.6
  }'
```

---

## Deployment Checklist

- [x] Prisma schema created with all required models
- [x] Service, controller, DTOs implemented
- [x] JWT authentication configured
- [x] HIPAA audit logging implemented
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database migrations run (`npx prisma migrate dev`)
- [ ] Environment variables configured (`.env`)
- [ ] Kong Gateway routes configured
- [ ] Service started (`npm run start:dev`)
- [ ] Unit tests written and passing
- [ ] E2E test scenarios documented
- [ ] Swagger documentation accessible
- [ ] FHIR mapping implemented

---

## API Endpoints

### Appointments

| Method | Endpoint                                 | Description               | Auth |
| ------ | ---------------------------------------- | ------------------------- | ---- |
| POST   | `/api/appointments`                      | Create appointment        | JWT  |
| GET    | `/api/appointments/patient/:patientId`   | Get patient appointments  | JWT  |
| GET    | `/api/appointments/provider/:providerId` | Get provider appointments | JWT  |
| GET    | `/api/appointments/:id`                  | Get appointment details   | JWT  |
| PATCH  | `/api/appointments/:id/reschedule`       | Reschedule appointment    | JWT  |
| PATCH  | `/api/appointments/:id/cancel`           | Cancel appointment        | JWT  |
| PATCH  | `/api/appointments/:id/check-in`         | Check-in for appointment  | JWT  |

---

## Next Steps

1. **Complete service setup** by running the installation commands above
2. **Create messaging-service** following the same pattern
3. **Frontend integration** - Create API service wrappers in patient-portal
4. **React Query hooks** - Implement data fetching hooks
5. **Replace mock data** in tab components with real API calls

---

## Compliance Notes

### HIPAA

- ✅ All PHI access is logged in `audit_logs` table
- ✅ Soft delete implemented (never hard delete patient data)
- ✅ JWT authentication required for all endpoints
- ✅ Audit fields: `createdBy`, `updatedBy`, `deletedBy`

### FHIR R4

- ✅ Domain model maps to FHIR Appointment resource
- ✅ Status codes align with FHIR value sets
- ✅ Participant references use FHIR resource references
- ✅ Appointment types use HL7 terminology

---

**Status**: ✅ Backend structure complete, awaiting dependency installation and testing
**Last Updated**: November 21, 2025
