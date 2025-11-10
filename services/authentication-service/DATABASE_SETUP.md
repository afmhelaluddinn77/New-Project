# Phase 2 Database Setup

## Prerequisites

- PostgreSQL 14+
- Database user with schema creation permissions

## Steps

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE healthcare_auth;

# Create schema
\c healthcare_auth
CREATE SCHEMA IF NOT EXISTS auth;

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE healthcare_auth TO your_user;
GRANT ALL PRIVILEGES ON SCHEMA auth TO your_user;
```

### 2. Configure Environment

Create `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/healthcare_auth
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=refresh-secret-change-in-production-min-32-chars
NODE_ENV=development
PORT=3001
```

### 3. Run Migration

```bash
# Build the project first
npm run build

# Run migration
npm run migration:run
```

### 4. Verify Schema

```bash
psql -U postgres -d healthcare_auth

# Check schema
\dt auth.*

# Should show:
#  Schema |  Name  | Type  |  Owner
# --------+--------+-------+---------
#  auth   | users  | table | username
```

### 5. Verify Table Structure

```sql
\d auth.users

# Should show columns:
# - id (varchar, primary key)
# - email (varchar, unique, nullable)
# - role (varchar, nullable)
# - hashedRefreshToken (varchar, nullable)
```

## Rollback

If you need to rollback the migration:

```bash
npm run migration:revert
```

## Production Deployment

1. **Disable synchronize:** Already set to `false` in `app.module.ts`
2. **Use connection pooling:** Configure in TypeORM options
3. **Enable SSL:** Add to DATABASE_URL: `?sslmode=require`
4. **Set strong secrets:** Generate with `openssl rand -base64 32`

```typescript
// production typeorm config
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  schema: 'auth',
  autoLoadEntities: true,
  synchronize: false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  ssl: process.env.NODE_ENV === 'production',
  extra: {
    max: 10, // connection pool size
    connectionTimeoutMillis: 5000,
  },
  logging: false,
}),
```

## Testing Database

For running tests, use a separate test database:

```bash
# Create test database
createdb healthcare_auth_test

# Set in test environment
DATABASE_URL=postgresql://localhost:5432/healthcare_auth_test npm test
```
