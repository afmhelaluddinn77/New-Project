# Phase 7: Testing & Quality Assurance Implementation Guide

**Priority:** HIGH  
**Duration:** 7 days  
**Status:** ⏳ Ready for Implementation  
**Owner:** QA Lead + Full-stack Team

---

## 🎯 Objectives

1. Achieve 80%+ automated test coverage across frontend, backend, and shared utilities.  
2. Establish integration and end-to-end (E2E) testing workflows covering critical clinical scenarios.  
3. Execute comprehensive security testing (static, dynamic, and penetration tests).  
4. Formalize test file structure, CI pipelines, and reporting standards.

---

## 🗓️ Timeline & Milestones

| Day | Milestone | Deliverables |
|-----|-----------|--------------|
| 1 | Test Framework Setup | Jest config, Testing Library setup, Cypress scaffolding |
| 2 | Frontend Unit Tests | Component tests, hooks tests, snapshot baselines |
| 3 | Backend Unit Tests | Controller/service tests, database mocks |
| 4 | Integration Tests | API + DB tests, Terminology service tests |
| 5 | E2E Workflows | Cypress test suite, CI integration |
| 6 | Security Testing | SAST report, DAST/Pen-test scripts |
| 7 | Coverage Review & Sign-off | Coverage reports, QA dashboard, retrospective |

---

## 🧱 Prerequisites

- ✅ All Phase 4 API endpoints available.  
- ✅ Phase 5 security guardrails (JWT, RBAC) implemented.  
- 🔄 Seed data fixtures for tests.  
- 🔄 CI pipeline (GitHub Actions or GitLab CI) configured for multi-stage testing.

---

## 🧪 Testing Stack

| Layer | Tooling | Notes |
|-------|---------|-------|
| Unit (Frontend) | Jest + @testing-library/react | Snapshot and DOM assertions |
| Unit (Backend) | Jest + supertest + ts-jest | Mock Prisma with in-memory provider |
| Integration | supertest, pactum, Prisma test db | Run against dockerized PostgreSQL |
| E2E | Cypress (web), Playwright (optional) | Use seeded test accounts |
| Security | Snyk, OWASP ZAP, npm audit | Automate in CI |
| Performance | k6 or Artillery | Validate API latency under load |

---

## 🧱 Test File Structure

```
provider-portal/
├─ src/
│  ├─ __tests__/
│  │  ├─ components/
│  │  │  ├─ ChiefComplaint.test.tsx
│  │  │  ├─ VitalSigns.test.tsx
│  │  │  ├─ MedicationSearch.test.tsx
│  │  │  └─ ... (22 component tests)
│  │  ├─ hooks/
│  │  │  ├─ useAutoSave.test.ts
│  │  │  ├─ useEncounterQueries.test.ts
│  │  │  └─ usePrint.test.ts
│  │  └─ utils/
│  │     └─ validation.test.ts
│  └─ setupTests.ts
└─ cypress/
   ├─ e2e/
   │  ├─ encounter-workflow.cy.ts
   │  ├─ prescription-workflow.cy.ts
   │  └─ investigation-workflow.cy.ts
   ├─ fixtures/
   └─ support/

services/encounter-service/
├─ test/
│  ├─ controllers/
│  │  ├─ encounter.controller.spec.ts
│  │  ├─ prescription.controller.spec.ts
│  │  └─ investigation.controller.spec.ts
│  ├─ services/
│  │  ├─ encounter.service.spec.ts
│  │  ├─ terminology.service.spec.ts
│  │  └─ fhir.service.spec.ts
│  ├─ integrations/
│  │  ├─ encounter.integration.spec.ts
│  │  └─ terminology.integration.spec.ts
│  └─ mocks/
│     └─ prisma.mock.ts
└─ jest.config.ts
```

---

## 🧪 Unit Testing Strategy (80%+ Coverage)

### Frontend Components

- Use React Testing Library for DOM assertions.
- Mock Zustand store with custom provider.
- Verify validation errors (Zod schemas).
- Snapshot check for major components (tabs, panels).

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ChiefComplaint } from '../components/history/ChiefComplaint';
import { useEncounterStore } from '../../store/encounterStore';

jest.mock('../../store/encounterStore');

const mockStore = {
  history: { chiefComplaint: '' },
  updateChiefComplaint: jest.fn(),
};

(useEncounterStore as jest.Mock).mockReturnValue(mockStore);

describe('ChiefComplaint', () => {
  it('updates store on input change', () => {
    render(<ChiefComplaint />);
    fireEvent.change(screen.getByLabelText(/chief complaint/i), {
      target: { value: 'Headache' },
    });
    expect(mockStore.updateChiefComplaint).toHaveBeenCalledWith('Headache');
  });
});
```

### Hooks

- Test auto-save debouncing (useFakeTimers).
- Ensure React Query hooks call correct endpoints (msw).

### Backend Services

- Mock Prisma using `jest.mock('@prisma/client')` pattern.
- Use dependency injection to isolate services.
- Cover positive/negative scenarios.

```typescript
describe('PrescriptionService', () => {
  it('creates prescription with audit log', async () => {
    prisma.prescription.create.mockResolvedValue(mockPrescription);
    await service.create(createDto, userId);
    expect(prisma.prescription.create).toHaveBeenCalled();
    expect(auditLogService.log).toHaveBeenCalledWith(
      'CREATE',
      'PRESCRIPTION',
      mockPrescription.id,
      userId,
      'provider',
      createDto,
      mockPrescription,
      undefined,
      undefined,
    );
  });
});
```

---

## 🔗 Integration Testing Workflows

### Backend (NestJS + Supertest)

```typescript
describe('EncounterController (e2e)', () => {
  it('/encounters (POST)', () => {
    return request(app.getHttpServer())
      .post('/encounters')
      .set('Authorization', `Bearer ${jwt}`)
      .send(mockEncounterDto)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body).toHaveProperty('id');
        expect(body.status).toBe('IN_PROGRESS');
      });
  });
});
```

### Frontend (Cypress)

1. User logs in as provider.  
2. Creates new encounter (History → Examination → Medications).  
3. Saves draft, triggers auto-save, verifies API calls.  
4. Finalizes encounter, checks success toast.  
5. Prints prescription, validates preview.

```javascript
cy.login('provider@example.com', 'password123');
cy.visit('/encounters/new');
cy.findByLabelText(/chief complaint/i).type('Acute headache');
cy.findByRole('button', { name: /save draft/i }).click();
cy.wait('@saveEncounter');
cy.findByRole('button', { name: /finalize/i }).click();
cy.findByText(/encounter finalized/i).should('be.visible');
```

### Contract Testing (Optional)

- Use Pact or Schemathesis to verify API contracts.  
- Generate OpenAPI specs and validate responses.

---

## 🛡️ Security Testing Procedures

### Static Analysis (SAST)

- `npm run lint` (ESLint rules).  
- `npm run lint:security` (eslint-plugin-security).  
- `snyk test` for dependency vulnerabilities.

### Dynamic Analysis (DAST)

- OWASP ZAP baseline scan against staging URL.
- Check for injection, broken auth, missing headers.

### Penetration Testing Checklist

- JWT tampering attempts.  
- Role escalation and horizontal privilege attacks.  
- SQL injection on search endpoints.  
- XSS via rich text fields.  
- CSRF test (ensure SameSite cookies + CSRF tokens if needed).

### Compliance Tests

- HIPAA audit trail verification.  
- Encryption key rotation test.  
- Access log review workflows.

---

## 📈 Reporting & Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Unit Test Coverage | ≥80% statements/branches | Jest + nyc |
| Integration Coverage | 90% endpoints | Supertest + coverage |
| E2E Reliability | 95% pass rate | Cypress Dashboard |
| Lint Errors | 0 blocking | ESLint |
| Vulnerabilities | 0 high severity | Snyk + npm audit |
| Performance | P95 < 500ms API response | k6/Artillery |

**Dashboard:**  
- Use Allure or ReportPortal for aggregated reporting.  
- Upload coverage reports to CI artifacts.  
- Post daily summaries to Slack/Teams channel.

---

## 🔄 CI/CD Workflow (GitHub Actions Example)

```yaml
name: CI

on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        ports: ['5432:5432']
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd "pg_isready -U test" 
          --health-interval 10s 
          --health-timeout 5s 
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:security
      - uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage/
```

---

## ✅ Completion Checklist

- [ ] Jest + Cypress configured with scripts in package.json.  
- [ ] 80%+ coverage across frontend/backend modules.  
- [ ] Integration tests covering critical workflows.  
- [ ] Cypress E2E suite passing in CI.  
- [ ] Security scans automated (Snyk, OWASP ZAP).  
- [ ] Performance test baseline captured.  
- [ ] QA dashboard with daily reporting.  
- [ ] Test data fixtures and seed scripts documented.

---

## 📚 Resources & References

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)  
- [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)  
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)  
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)  
- [Snyk CLI Documentation](https://docs.snyk.io/snyk-cli)

---

**Next Phase:** Phase 8 – ML & Analytics
