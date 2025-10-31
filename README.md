# Secure Multi-Portal EMR/HMS System

A comprehensive Electronic Medical Records / Hospital Management System built with a **hub-and-spoke** frontend architecture and **gateway-first** backend security model.

## Architecture Overview

### Frontend (Hub-and-Spoke Pattern)
- **Common Portal Hub** (Port 5172): Modern medical-themed central navigation hub
- **7 Spoke Portals**: Each with unique login pages, themes, and comprehensive dashboards
  - Patient Portal (5173) - Medical Blue (#0066CC)
  - Provider Portal (5174) - Medical Green (#00856A)
  - Admin Portal (5175) - Authority Purple (#6B46C1)
  - Lab Portal (5176) - Lab Teal (#0891B2)
  - Pharmacy Portal (5177) - Pharmacy Navy (#1E40AF)
  - Billing Portal (5178) - Finance Dark Blue (#1E3A8A)
  - Radiology Portal (5179) - Imaging Violet (#7C3AED)

### Backend (Gateway-First / Zero Trust)
- **API Gateway (Kong)**: Single authentication enforcer
  - Validates JWTs
  - Strips Authorization headers
  - Injects trusted headers: `X-User-ID`, `X-User-Role`, `X-Portal`
- **Authentication Service** (Port 3000): Login with portal type validation
- **Lab Service** (Port 3001): REST controller reading Kong headers
- **Patient Service** (Port 3002): Microservice with HIPAA audit logging

## Security Features

1. **Portal Type Validation**: Users can only log in through portals they're authorized for
2. **JWT Validation**: Kong gateway validates all tokens before forwarding requests
3. **Header Injection**: Backend services receive trusted headers from Kong (not from clients)
4. **HIPAA Audit Logging**: All patient data access is logged with provider details
5. **Service-to-Service Authorization**: Patient service validates care team membership

## Project Structure

```
.
├── common-portal/          # Hub portal (port 5172)
├── patient-portal/         # Spoke portal (port 5173)
├── provider-portal/         # Spoke portal (port 5174)
├── admin-portal/            # Spoke portal (port 5175)
├── lab-portal/              # Spoke portal (port 5176)
├── pharmacy-portal/         # Spoke portal (port 5177)
├── billing-portal/          # Spoke portal (port 5178)
├── radiology-portal/        # Spoke portal (port 5179)
├── services/
│   ├── authentication-service/  # Login service (port 3000)
│   ├── lab-service/             # Lab REST API (port 3001)
│   └── patient-service/         # Patient microservice (port 3002)
├── kong.yml                # Kong gateway configuration
└── docker-compose.yml      # Kong setup with Docker
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for Kong)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install dependencies for each portal
npm install --workspace=common-portal
npm install --workspace=patient-portal
npm install --workspace=provider-portal
npm install --workspace=admin-portal
npm install --workspace=lab-portal
npm install --workspace=pharmacy-portal
npm install --workspace=billing-portal
npm install --workspace=radiology-portal

# Install backend service dependencies
cd services/authentication-service && npm install
cd ../lab-service && npm install
cd ../patient-service && npm install
```

### 2. Start Kong Gateway

```bash
docker-compose up -d
```

Kong will start on:
- Proxy: `http://localhost:8000`
- Admin API: `http://localhost:8001`

### 3. Start Backend Services

```bash
# Terminal 1: Authentication Service
cd services/authentication-service
npm run start:dev

# Terminal 2: Patient Service (Microservice)
cd services/patient-service
npm run start:dev

# Terminal 3: Lab Service
cd services/lab-service
npm run start:dev
```

### 4. Start Frontend Portals

```bash
# Terminal 4: Common Portal Hub
npm run dev:common

# Terminal 5-11: Start each spoke portal
npm run dev:patient
npm run dev:provider
npm run dev:admin
npm run dev:lab
npm run dev:pharmacy
npm run dev:billing
npm run dev:radiology
```

## Usage

### 1. Access Hub Portal
Navigate to `http://localhost:5172` to see the portal hub with 7 portal cards.

### 2. Login to a Portal
Click any portal card to navigate to its login page. Each portal has:
- Unique visual theme
- Hard-coded `portalType` in login payload
- Redirect to `/login` from root route

### 3. Test Login
Use these mock credentials:
- **Patient**: `patient@example.com` / `password` (PATIENT portal only)
- **Provider**: `provider@example.com` / `password` (PROVIDER portal only)
- **Admin**: `admin@example.com` / `password` (ADMIN portal only)

### 4. Access Lab Results (Service-to-Service Flow)
After logging in as a provider:
1. Get JWT token from login response
2. Call: `GET http://localhost:8000/api/lab/patient/xyz-789`
3. Include header: `Authorization: Bearer <token>`
4. Kong validates token and injects headers
5. Lab service reads headers and calls patient service
6. Patient service validates authorization and logs HIPAA audit
7. Response includes patient data + lab results

## API Endpoints

### Authentication Service (Direct Access)
- `POST http://localhost:3000/api/auth/login`
  ```json
  {
    "email": "provider@example.com",
    "password": "password",
    "portalType": "PROVIDER"
  }
  ```

### Lab Service (Via Kong Gateway)
- `GET http://localhost:8000/api/lab/patient/:patientId`
  - Requires: `Authorization: Bearer <token>`
  - Kong injects: `X-User-ID`, `X-User-Role`, `X-Portal`

## Security Flow

```
Client → Kong Gateway → Backend Service
   ↓           ↓              ↓
  JWT      Validate      Read Headers
           & Inject           ↓
         X-Headers    S2S Communication
                              ↓
                        Patient Service
                              ↓
                    Authorization Check
                              ↓
                      HIPAA Audit Log
```

## Key Implementation Details

### Frontend Login Pages
Each login page sends `portalType` in the payload:
- `PatientLoginPage.tsx`: `portalType: 'PATIENT'`
- `ProviderLoginPage.tsx`: `portalType: 'PROVIDER'`
- etc.

### Backend Portal Validation
`auth.service.ts` validates:
1. User credentials
2. User's authorized portals vs. requested portal
3. Throws `UnauthorizedException` if mismatch

### Kong Configuration
`kong.yml` configures:
- JWT validation plugin
- Request transformer to strip `Authorization` header
- Header injection: `X-User-ID`, `X-User-Role`, `X-Portal`

### Service-to-Service Communication
- Lab service reads headers from Kong
- Uses NestJS `ClientProxy` to call patient service
- Passes auth context in payload
- Patient service validates authorization and logs HIPAA audit

## HIPAA Compliance

All patient data access triggers mandatory audit logs:
```
HIPAA_AUDIT: Provider {id} ({role}) accessed Patient {patientId} via {portal} portal at {timestamp}
```

## Development Notes

- Mock data is used for demonstration purposes
- In production, replace with real database connections
- Use secure password hashing (bcrypt) in authentication service
- Configure Kong JWT secret securely
- Implement proper error handling and logging
- Add rate limiting and additional security measures

## Design System

The EMR/HMS system features a modern, medical-grade user interface with:

### Design Features
- **Apple San Francisco Typography** - Professional, readable typeface system
- **Glass Morphism (Liquid Glass)** - Frosted glass effects throughout
- **Medical-Grade Color Palette** - 7 unique portal-specific colors
- **3D Depth & Shadows** - Subtle elevation for visual hierarchy
- **Smooth Animations** - Apple-grade transitions and micro-interactions
- **Mobile Responsive** - Optimized for all devices (320px to 4K)
- **Accessibility** - WCAG 2.1 AA compliant

### Design Documentation
- **[DESIGN_IMPLEMENTATION.md](./DESIGN_IMPLEMENTATION.md)** - Complete design system documentation
- **[VISUAL_TESTING_GUIDE.md](./VISUAL_TESTING_GUIDE.md)** - Step-by-step testing instructions
- **[REDESIGN_COMPLETE.md](./REDESIGN_COMPLETE.md)** - Project summary and achievement report
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference card for URLs and credentials

### Key Components
- **Collapsible Sidebar** - Portal-branded navigation (240px → 60px)
- **Search-Enabled Top Bar** - User menu, notifications, search
- **Glass Morphism Cards** - Metric display with trends
- **Breadcrumb Navigation** - Clear page hierarchy
- **Responsive Layouts** - 1-4 column adaptive grids
- **Mobile Bottom Navigation** - Touch-optimized on mobile

---

## Security

This project handles Protected Health Information (PHI) and must comply with HIPAA regulations.

### Security Documentation

- **[SECURITY.md](./SECURITY.md)** - Comprehensive security guidelines and best practices
- **[SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)** - Quick reference checklist for developers
- **[Pull Request Template](./.github/PULL_REQUEST_TEMPLATE.md)** - Security review requirements

### Security Checks

Run security checks before committing:

```bash
./scripts/security-check.sh
```

This script automatically checks for:
- Unprotected routes
- Hardcoded secrets
- Missing token validation
- CORS misconfigurations
- Missing HIPAA audit logs
- Portal authorization issues

### Pre-commit Hook

A Git pre-commit hook automatically runs security checks. Install with:

```bash
npm install husky --save-dev
npx husky install
```

### Security Rules (Quick Reference)

1. **ALL protected routes MUST use `<ProtectedRoute>`**
2. **Token validation MUST check: existence, expiration, and portal claim**
3. **Each portal MUST validate its own portal type**
4. **Invalid tokens MUST be cleared from localStorage**
5. **CORS MUST be explicitly configured (no wildcards)**
6. **Backend MUST validate user's portal authorization**
7. **JWT MUST include portal claim**
8. **Kong MUST inject trusted headers (X-User-ID, X-User-Role, X-Portal)**
9. **ALL patient data access MUST be logged (HIPAA)**

### Reporting Security Issues

If you discover a security vulnerability, please email security@your-organization.com immediately. Do not open a public issue.

---

## License

MIT

