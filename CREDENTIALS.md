# 🔐 EMR System - Portal Credentials

## Default Login Credentials

All default users use the password: **`password123`**

---

## 👨‍⚕️ Provider Portal

**URL**: http://localhost:5174

| Email                  | Password      | Role     | Name           |
| ---------------------- | ------------- | -------- | -------------- |
| `provider@example.com` | `password123` | PROVIDER | Dr. John Smith |

**Access**: Patient encounters, prescriptions, orders, clinical documentation

---

## � Patient Portal

**URL**: http://localhost:5173

| Email                 | Password      | Role    | Name     |
| --------------------- | ------------- | ------- | -------- |
| `patient@example.com` | `password123` | PATIENT | Jane Doe |

**Access**: View medical records, appointments, test results, prescriptions

---

## 🔐 Admin Portal

**URL**: http://localhost:5175

| Email               | Password      | Role  | Name       |
| ------------------- | ------------- | ----- | ---------- |
| `admin@example.com` | `password123` | ADMIN | Admin User |

**Access**: System administration, user management, configuration

---

## 🔬 Lab Portal

**URL**: http://localhost:5176

| Email                 | Password      | Role     | Name        |
| --------------------- | ------------- | -------- | ----------- |
| `labtech@example.com` | `password123` | LAB_TECH | Emily Davis |

**Access**: Lab orders, test results, specimen tracking

---

## � Pharmacy Portal

**URL**: http://localhost:5177

| Email                    | Password      | Role       | Name          |
| ------------------------ | ------------- | ---------- | ------------- |
| `pharmacist@example.com` | `password123` | PHARMACIST | Sarah Johnson |

**Access**: Prescription verification, drug interactions, dispensing

---

## � Billing Portal

**URL**: http://localhost:5178

| Email                 | Password      | Role    | Name            |
| --------------------- | ------------- | ------- | --------------- |
| `billing@example.com` | `password123` | BILLING | Robert Martinez |

**Access**: Claims management, payments, denials, revenue cycle

---

## 🏥 Radiology Portal

**URL**: http://localhost:5179

| Email                     | Password      | Role        | Name             |
| ------------------------- | ------------- | ----------- | ---------------- |
| `radiologist@example.com` | `password123` | RADIOLOGIST | Dr. Michael Chen |

**Access**: Imaging orders, radiology reports, DICOM viewing

---

## 👩‍⚕️ Nurses Portal

**URL**: http://localhost:5180

| Email               | Password      | Role  | Name          |
| ------------------- | ------------- | ----- | ------------- |
| `nurse@example.com` | `password123` | NURSE | Lisa Anderson |

**Access**: Patient care, vitals, medication administration, charting

---

## 💻 IT Portal

**URL**: http://localhost:5181

| Email            | Password      | Role     | Name         |
| ---------------- | ------------- | -------- | ------------ |
| `it@example.com` | `password123` | IT_ADMIN | David Wilson |

**Access**: System maintenance, user support, technical configuration

---

## 🧪 Test Users (Alternative Credentials)

These are test fixtures with stronger passwords:

| Email                      | Password           | Role   |
| -------------------------- | ------------------ | ------ |
| `test-doctor@hospital.com` | `TestPassword123!` | doctor |
| `test-nurse@hospital.com`  | `TestPassword123!` | nurse  |
| `test-admin@hospital.com`  | `TestPassword123!` | admin  |

---

## 🔧 How to Seed Users

If users are not in the database, run the seed script:

```bash
cd services/authentication-service
node seed-users.js
```

This will create/update all default users in the database.

---

## 📝 Portal Access Matrix

| Portal        | URL                   | Default User            | Role           |
| ------------- | --------------------- | ----------------------- | -------------- |
| **Common**    | http://localhost:5172 | N/A                     | Hub/Navigation |
| **Patient**   | http://localhost:5173 | patient@example.com     | PATIENT        |
| **Provider**  | http://localhost:5174 | provider@example.com    | PROVIDER       |
| **Admin**     | http://localhost:5175 | admin@example.com       | ADMIN          |
| **Lab**       | http://localhost:5176 | labtech@example.com     | LAB_TECH       |
| **Pharmacy**  | http://localhost:5177 | pharmacist@example.com  | PHARMACIST     |
| **Billing**   | http://localhost:5178 | billing@example.com     | BILLING        |
| **Radiology** | http://localhost:5179 | radiologist@example.com | RADIOLOGIST    |
| **Nurses**    | http://localhost:5180 | nurse@example.com       | NURSE          |
| **IT**        | http://localhost:5181 | it@example.com          | IT_ADMIN       |

---

## 🔐 Security Notes

1. **Development Only**: These credentials are for development/testing only
2. **Change in Production**: Never use these credentials in production
3. **Password Hashing**: All passwords are hashed with bcrypt (10 rounds)
4. **JWT Authentication**: All portals use JWT tokens after login
5. **Portal Validation**: Users can only access portals they're authorized for

---

## 🚀 Quick Login Test

### Test Provider Login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@example.com",
    "password": "password123",
    "portalType": "PROVIDER"
  }'
```

### Test Pharmacist Login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pharmacist@example.com",
    "password": "password123",
    "portalType": "PHARMACY"
  }'
```

---

## 🆘 Troubleshooting

### "Invalid credentials" error

1. Check if users are seeded: `cd services/authentication-service && node seed-users.js`
2. Verify database is running: `docker-compose ps clinical-db`
3. Check auth service logs: `tail -f logs/auth-service.log`

### "Unauthorized portal access" error

- User is trying to access a portal they're not authorized for
- Check the user's `portal` field in the database matches the portal type

### Reset Password

Users are created with `password123` by default. To reset:

```bash
cd services/authentication-service
node seed-users.js  # Re-runs upsert with default passwords
```

---

**Last Updated**: November 23, 2025
**Status**: Development credentials active ✅
