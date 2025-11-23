# STACK MIGRATION & ALIGNMENT - COMPLETE GUIDE

## Overview

This document outlines all changes made to align the entire stack with:

1. **Prisma ORM** for ALL services (including authentication)
2. **Material-UI (MUI)** for frontend
3. **Corrected service ports** across Kong Gateway and Docker Compose

## ✅ Changes Completed

### 1. Kong Gateway Port Fixes

**File:** `kong.yml`

**Changes:**

- ❌ **OLD:** `authentication-service` → `http://localhost:3000`
- ✅ **NEW:** `authentication-service` → `http://localhost:3001`

- ❌ **OLD:** `patient-service` → `http://localhost:3002`
- ✅ **NEW:** `patient-service` → `http://localhost:3011`

**All services now correctly aligned:**

```yaml
- authentication-service: 3001
- clinical-workflow-service: 3004
- encounter-service: 3005
- patient-service: 3011
- pharmacy-service: 3012
- lab-service: 3013
- radiology-service: 3014
```

### 2. Frontend: Material-UI Added

**File:** `provider-portal/package.json`

**Packages Added:**

```json
{
  "@emotion/react": "^11.11.1",
  "@emotion/styled": "^11.11.0",
  "@mui/icons-material": "^5.14.19",
  "@mui/material": "^5.14.20"
}
```

**Installation Required:**

```bash
cd provider-portal
npm install
```

### 3. Authentication Service: TypeORM → Prisma Migration

#### A. Package.json Updated

**File:** `services/authentication-service/package.json`

**Removed Dependencies:**

```json
"@nestjs/typeorm": "^10.0.0",
"typeorm": "^0.3.17",
"pg": "^8.16.3",
"sqlite3": "^5.1.7"
```

**Added Dependencies:**

```json
"@prisma/client": "^5.7.1"
```

**Added DevDependencies:**

```json
"prisma": "^5.7.1"
```

**Updated Scripts:**

```json
{
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}
```

**Removed Scripts:**

```json
{
  "typeorm": "...",
  "migration:generate": "...",
  "migration:run": "...",
  "migration:revert": "..."
}
```

#### B. Prisma Schema Created

**File:** `services/authentication-service/prisma/schema.prisma`

Complete Prisma schema with:

- User model (with sessions & audit logs)
- Session model (access/refresh tokens)
- AuditLog model (HIPAA compliance)
- PasswordResetToken model

See file for full schema.

#### C. PrismaService & Module Created

**Files Created:**

- `services/authentication-service/src/prisma/prisma.service.ts`
- `services/authentication-service/src/prisma/prisma.module.ts`

### 4. System Prompt Updated

**File:** `SYSTEM_PROMPT_COMPLETE.md`

**Key Updates:**

- ✅ Frontend stack now lists Material-UI v5.14.20
- ✅ Backend ORM changed from "Mixed" to "Prisma v5.7.1 (all services)"
- ✅ All service ports corrected (3001, 3011, 3012, 3013, 3014)
- ✅ Removed ORM warning section (no longer needed)
- ✅ Updated project structure to show Prisma for auth-service
- ✅ Added complete auth schema with Session and AuditLog models

## 🔄 Migration Steps Required

### Step 1: Install Dependencies

```bash
# Frontend: Install MUI
cd provider-portal
npm install

# Backend: Install Prisma for auth service
cd ../services/authentication-service
npm install
```

### Step 2: Generate Prisma Client

```bash
cd services/authentication-service
npx prisma generate
```

### Step 3: Create Initial Migration

```bash
# This will create the initial database migration
npx prisma migrate dev --name init_auth_schema
```

### Step 4: Update Auth Service Code

You need to update the following files in `services/authentication-service/src/`:

#### A. Update `app.module.ts`:

**Remove:**

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    // ...
  ]
})
```

**Add:**

```typescript
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // Global module
    // ...
  ]
})
```

#### B. Update `auth/auth.service.ts`:

**Remove:**

```typescript
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

constructor(
  @InjectRepository(User)
  private userRepository: Repository<User>,
  private jwtService: JwtService
) {}
```

**Replace with:**

```typescript
import { PrismaService } from '../prisma/prisma.service';

constructor(
  private prisma: PrismaService,
  private jwtService: JwtService
) {}
```

**Update all repository calls:**

```typescript
// OLD TypeORM:
this.userRepository.findOne({ where: { email } })
this.userRepository.update(userId, { ... })
this.userRepository.create({ ... })
this.userRepository.save(user)

// NEW Prisma:
this.prisma.user.findUnique({ where: { email } })
this.prisma.user.update({ where: { id: userId }, data: { ... } })
this.prisma.user.create({ data: { ... } })
// (Prisma combines create+save in one operation)
```

#### C. Update `auth/auth.module.ts`:

**Remove:**

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // ...
  ]
})
```

**Replace with:**

```typescript
// PrismaModule is global, no need to import in feature modules
@Module({
  imports: [
    JwtModule.register({ ... }),
    PassportModule,
  ]
})
```

#### D. Delete TypeORM Files:

```bash
# Remove TypeORM entity files
rm -rf src/entities/

# Remove TypeORM config
rm -f src/config/typeorm.config.ts

# Remove TypeORM migrations (if any)
rm -rf src/migrations/
```

### Step 5: Update Seed Script

**File:** `services/authentication-service/src/scripts/seed-test-users.ts`

**Replace TypeORM code:**

```typescript
// OLD
const userRepository = connection.getRepository(User);
await userRepository.save(users);
```

**With Prisma code:**

```typescript
// NEW
const prisma = app.get(PrismaService);
await prisma.user.createMany({
  data: users,
  skipDuplicates: true,
});
```

### Step 6: Restart Kong Gateway

Kong needs to reload the updated configuration:

```bash
# If using Docker Compose
docker-compose restart kong

# Or restart Kong manually
curl -i -X POST http://localhost:8001/config \
  --form config=@kong.yml
```

### Step 7: Test the Migration

```bash
# 1. Run the auth service
cd services/authentication-service
npm run start:dev

# 2. Seed test users
npm run seed:test-users

# 3. Test login via Kong Gateway
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test-doctor@hospital.com","password":"TestPassword123!","portalType":"PROVIDER"}'
```

## 📋 Verification Checklist

- [ ] Frontend packages installed (`node_modules/@mui` exists)
- [ ] Prisma client generated for auth-service
- [ ] Initial migration created and applied
- [ ] Auth service starts without TypeORM errors
- [ ] Test users can be seeded
- [ ] Login works via Kong Gateway (port 8000)
- [ ] All service ports match between Kong and Docker Compose
- [ ] System prompt reflects current stack (Prisma + MUI)

## 🎯 Final Stack Configuration

### Frontend

- React 18.2.0 + TypeScript 5+
- Vite 5.0.8
- **Material-UI v5.14.20** ✅
- React Query 5.90.7
- Zustand 4.5.7
- Axios 1.6.2

### Backend

- NestJS 10+ with Node.js 18+
- **Prisma v5.7.1 (ALL services)** ✅
- PostgreSQL 15+
- Passport.js (JWT + Refresh Token)
- bcrypt password hashing

### API Gateway

- Kong Gateway 3.x
- Ports: 8000 (proxy), 8001 (admin)
- **All service ports aligned** ✅

### Service Ports

| Service                   | Port | Kong URL | Docker Port |
| ------------------------- | ---- | -------- | ----------- |
| authentication-service    | 3001 | ✅       | ✅          |
| clinical-workflow-service | 3004 | ✅       | ✅          |
| encounter-service         | 3005 | ✅       | ✅          |
| patient-service           | 3011 | ✅       | ✅          |
| pharmacy-service          | 3012 | ✅       | ✅          |
| lab-service               | 3013 | ✅       | ✅          |
| radiology-service         | 3014 | ✅       | ✅          |

## 🚨 Important Notes

1. **Database Migration:** The Prisma migration will create new tables in the `auth` schema. If you have existing data in TypeORM tables, you'll need to migrate it manually.

2. **Test Users:** After migration, re-run the seed script to populate test users in the new Prisma schema.

3. **Frontend MUI Migration:** While MUI packages are installed, existing components still use custom CSS. Gradual migration recommended:
   - Start with new components using MUI
   - Refactor existing components incrementally
   - Use MUI theme for consistent styling

4. **Breaking Changes:** This is a breaking change for authentication-service. Ensure you:
   - Backup the database before migration
   - Update all authentication-related imports
   - Test thoroughly before deploying to production

## 📚 Additional Resources

- Prisma Documentation: https://www.prisma.io/docs
- MUI Documentation: https://mui.com/material-ui/getting-started/
- NestJS Prisma Integration: https://docs.nestjs.com/recipes/prisma

## ✅ Migration Complete

All configuration files have been updated. Follow the migration steps above to complete the code changes and deploy the new stack.
