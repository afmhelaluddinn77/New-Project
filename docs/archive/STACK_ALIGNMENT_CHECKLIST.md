# STACK ALIGNMENT - EXECUTION CHECKLIST

## ✅ Configuration Files Updated (COMPLETED)

All configuration files have been updated. The following changes are ready:

### Files Modified:

- [x] `kong.yml` - Authentication service port 3000 → 3001, Patient service port 3002 → 3011
- [x] `provider-portal/package.json` - Added MUI v5.14.20 and dependencies
- [x] `services/authentication-service/package.json` - Replaced TypeORM with Prisma v5.7.1
- [x] `services/authentication-service/prisma/schema.prisma` - Created complete schema
- [x] `services/authentication-service/src/prisma/prisma.service.ts` - Created
- [x] `services/authentication-service/src/prisma/prisma.module.ts` - Created
- [x] `SYSTEM_PROMPT_COMPLETE.md` - Updated with correct stack
- [x] `STACK_MIGRATION_COMPLETE.md` - Created migration guide
- [x] `STACK_ALIGNMENT_SUMMARY.md` - Created summary

## 📋 Code Migration Tasks (TO DO)

Follow these steps to complete the migration:

### Phase 1: Install Dependencies

```bash
# 1. Frontend - Install MUI
cd provider-portal
npm install
# Verify: Check that node_modules/@mui exists

# 2. Backend - Install Prisma
cd ../services/authentication-service
npm install
# Verify: Check that node_modules/@prisma exists
```

### Phase 2: Prisma Setup

```bash
cd services/authentication-service

# 1. Generate Prisma Client
npx prisma generate
# Expected: Generates .prisma/client in node_modules

# 2. Create Initial Migration
npx prisma migrate dev --name init_auth_schema
# Expected: Creates migration files in prisma/migrations/

# 3. Verify Database
npx prisma studio
# Expected: Opens browser with database GUI showing auth schema
```

### Phase 3: Update Auth Service Code

Update these files in `services/authentication-service/src/`:

#### 3.1 Update `app.module.ts`

**Remove:**

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    // ...
  ]
})
```

**Add:**

```typescript
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // Global Prisma module
    AuthModule,
    // ...
  ]
})
```

#### 3.2 Update `auth/auth.module.ts`

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
// PrismaModule is global, no need to import here
@Module({
  imports: [
    JwtModule.register({ /* ... */ }),
    PassportModule,
  ],
  // ...
})
```

#### 3.3 Update `auth/auth.service.ts`

**Find and Replace:**

| Old (TypeORM)                                                    | New (Prisma)       |
| ---------------------------------------------------------------- | ------------------ |
| `import { InjectRepository } from '@nestjs/typeorm';`            | Remove this import |
| `import { Repository } from 'typeorm';`                          | Remove this import |
| `import { User } from '../entities/user.entity';`                | Remove this import |
| Add: `import { PrismaService } from '../prisma/prisma.service';` |                    |

**Constructor:**

```typescript
// OLD
constructor(
  @InjectRepository(User)
  private userRepository: Repository<User>,
  private jwtService: JwtService
) {}

// NEW
constructor(
  private prisma: PrismaService,
  private jwtService: JwtService
) {}
```

**Methods to Update:**

| TypeORM Method                                      | Prisma Method                                       |
| --------------------------------------------------- | --------------------------------------------------- |
| `this.userRepository.findOne({ where: { email } })` | `this.prisma.user.findUnique({ where: { email } })` |
| `this.userRepository.findOne({ where: { id } })`    | `this.prisma.user.findUnique({ where: { id } })`    |
| `this.userRepository.create(data)` + `save()`       | `this.prisma.user.create({ data })`                 |
| `this.userRepository.update(id, data)`              | `this.prisma.user.update({ where: { id }, data })`  |
| `this.userRepository.delete(id)`                    | `this.prisma.user.delete({ where: { id } })`        |
| `this.userRepository.find()`                        | `this.prisma.user.findMany()`                       |

#### 3.4 Update `scripts/seed-test-users.ts`

**OLD:**

```typescript
const userRepository = connection.getRepository(User);
await userRepository.save(users);
```

**NEW:**

```typescript
import { PrismaService } from "../prisma/prisma.service";

const prisma = app.get(PrismaService);
await prisma.user.createMany({
  data: users,
  skipDuplicates: true,
});
```

#### 3.5 Delete TypeORM Files

```bash
cd services/authentication-service/src

# Remove TypeORM entities
rm -rf entities/

# Remove TypeORM config
rm -f config/typeorm.config.ts

# Remove any TypeORM migrations
rm -rf migrations/
```

### Phase 4: Restart Services

```bash
# 1. Restart Kong to load new config
docker-compose restart kong

# 2. Start auth service in dev mode
cd services/authentication-service
npm run start:dev

# 3. Seed test users
npm run seed:test-users
```

### Phase 5: Verify Everything Works

#### Test 1: Auth Service Health

```bash
curl http://localhost:3001/api/health
# Expected: 200 OK
```

#### Test 2: CSRF Token via Kong

```bash
curl http://localhost:8000/api/auth/csrf-token
# Expected: { csrfToken: "..." }
```

#### Test 3: Login via Kong

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-doctor@hospital.com",
    "password": "TestPassword123!",
    "portalType": "PROVIDER"
  }'
# Expected: { accessToken: "...", user: { ... } }
```

#### Test 4: Frontend Dev Server

```bash
cd provider-portal
npm run dev
# Visit: http://localhost:5174
# Verify: No console errors about missing MUI
```

### Phase 6: E2E Tests

```bash
cd provider-portal

# Run E2E tests
npm run test:e2e

# Expected: All auth and navigation tests should pass
```

## 🎯 Success Criteria

- [ ] `npm install` completes without errors in provider-portal
- [ ] `npm install` completes without errors in authentication-service
- [ ] `npx prisma generate` creates Prisma client successfully
- [ ] `npx prisma migrate dev` applies migrations without errors
- [ ] Auth service starts without TypeORM errors
- [ ] Test users seed successfully with Prisma
- [ ] Login works via Kong Gateway (port 8000)
- [ ] Frontend loads without MUI errors
- [ ] All E2E tests pass

## 🚨 Troubleshooting

### Error: "Cannot find module '@nestjs/typeorm'"

**Solution:** TypeORM still referenced somewhere. Search for:

```bash
grep -r "@nestjs/typeorm" services/authentication-service/src
grep -r "Repository" services/authentication-service/src
```

### Error: "Prisma client not generated"

**Solution:**

```bash
cd services/authentication-service
npx prisma generate
```

### Error: Kong returns 502 Bad Gateway

**Solution:** Check service is running on correct port:

```bash
# Check auth service
curl http://localhost:3001/api/health

# Restart Kong
docker-compose restart kong
```

### Error: MUI components not rendering

**Solution:** Ensure MUI is installed:

```bash
cd provider-portal
npm list @mui/material
# Should show v5.14.20
```

## 📊 Progress Tracking

Update this checklist as you complete each phase:

- [ ] Phase 1: Dependencies installed
- [ ] Phase 2: Prisma setup complete
- [ ] Phase 3: Code migrated to Prisma
- [ ] Phase 4: Services restarted
- [ ] Phase 5: All tests passing
- [ ] Phase 6: E2E tests passing

## ✅ Migration Complete

When all checkboxes above are complete, your stack will be fully aligned with:

- ✅ Prisma ORM across all services
- ✅ Material-UI in frontend
- ✅ Correct ports in Kong & Docker
- ✅ No configuration mismatches

**Total Estimated Time:** 2-3 hours

**Next:** Deploy to staging environment for full integration testing.
