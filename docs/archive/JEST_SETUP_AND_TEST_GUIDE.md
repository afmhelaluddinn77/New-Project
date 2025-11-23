# Jest Setup & Smoke Test Execution Guide

**Status:** ✅ READY FOR FRONTEND TEAM  
**Date:** November 7, 2025  
**Time:** 5:15 AM UTC+06:00  
**Owner:** Frontend Team Lead

---

## 🎯 Objective

Execute Jest smoke tests for the EncounterService API layer to verify all 24 endpoints are properly mocked and tested before integration.

---

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ `/provider-portal` directory accessible
- ✅ `encounterService.test.ts` file created
- ✅ Jest dependencies installed

---

## 🔧 Step 1: Verify Jest Configuration

### 1.1 Check package.json

```bash
cd /Users/helal/New\ Project/provider-portal
cat package.json
```

**Expected output should include:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

**If missing, install:**
```bash
npm install --save-dev jest ts-jest @testing-library/react @testing-library/jest-dom @types/jest
```

---

### 1.2 Create/Verify jest.config.js

**File:** `/Users/helal/New Project/provider-portal/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/main.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
```

---

### 1.3 Create setupTests.ts

**File:** `/Users/helal/New Project/provider-portal/src/setupTests.ts`

```typescript
import '@testing-library/jest-dom';

// Mock axios globally
jest.mock('axios');

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Not implemented: HTMLFormElement.prototype.submit')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

---

## 🧪 Step 2: Verify Test File

### 2.1 Check Test File Location

```bash
ls -la /Users/helal/New\ Project/provider-portal/src/__tests__/services/
```

**Expected output:**
```
encounterService.test.ts
```

---

### 2.2 Verify Test File Content

```bash
head -50 /Users/helal/New\ Project/provider-portal/src/__tests__/services/encounterService.test.ts
```

**Expected to see:**
- ✅ `jest.mock('axios')`
- ✅ `import { encounterService }`
- ✅ `describe('EncounterService - Smoke Tests')`
- ✅ `beforeEach(() => { jest.clearAllMocks(); })`

---

### 2.3 Fix Remaining TypeScript Errors

**Known Issues:**
- Lines 14, 33: `Cannot find name 'vi'` - Already fixed (vi.fn() → jest.fn())

**Verify fixes:**
```bash
grep -n "vi\.fn()" /Users/helal/New\ Project/provider-portal/src/__tests__/services/encounterService.test.ts
```

**Expected output:** (empty - no matches)

If matches found, they need to be replaced with `jest.fn()`.

---

## 🚀 Step 3: Run Tests

### 3.1 Install Dependencies (if not already done)

```bash
cd /Users/helal/New\ Project/provider-portal
npm install
```

---

### 3.2 Run All Tests

```bash
npm test -- encounterService.test.ts
```

**Expected output:**
```
PASS  src/__tests__/services/encounterService.test.ts
  EncounterService - Smoke Tests
    Prescription APIs
      ✓ should create a prescription (XX ms)
      ✓ should fetch prescriptions by encounter (XX ms)
      ✓ should dispense a prescription (XX ms)
      ✓ should check prescription interactions (XX ms)
    Investigation APIs
      ✓ should create an investigation (XX ms)
      ✓ should fetch investigations by encounter (XX ms)
      ✓ should add investigation results (XX ms)
      ✓ should search investigations by LOINC code (XX ms)
    Medication APIs
      ✓ should search medications (XX ms)
      ✓ should check medication interactions (XX ms)
      ✓ should get medication contraindications (XX ms)
      ✓ should get medication side effects (XX ms)
      ✓ should get medication dosage info (XX ms)
      ✓ should check medication allergies (XX ms)
      ✓ should get medication alternatives (XX ms)
    Error Handling
      ✓ should handle prescription creation errors (XX ms)
      ✓ should handle investigation fetch errors (XX ms)
      ✓ should handle medication search errors (XX ms)

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        X.XXXs
```

---

### 3.3 Run Tests in Watch Mode

```bash
npm test -- encounterService.test.ts --watch
```

**Use this for development:**
- Tests re-run on file changes
- Press `a` to run all tests
- Press `q` to quit
- Press `f` to run only failed tests

---

### 3.4 Generate Coverage Report

```bash
npm test -- encounterService.test.ts --coverage
```

**Expected output:**
```
File                 | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   XX.XX |   XX.XX  |  XX.XX  |  XX.XX  |
 encounterService.ts|   XX.XX |   XX.XX  |  XX.XX  |  XX.XX  |
```

**Target:** > 80% coverage

---

## ✅ Verification Checklist

### Jest Configuration
- [ ] `jest.config.js` exists and is valid
- [ ] `setupTests.ts` exists and is valid
- [ ] Jest dependencies installed (`npm list jest`)
- [ ] TypeScript Jest preset configured

### Test File
- [ ] `encounterService.test.ts` exists
- [ ] No `vi.fn()` references (all replaced with `jest.fn()`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] All imports resolve correctly

### Test Execution
- [ ] All 20+ tests pass
- [ ] No console errors
- [ ] Coverage > 80%
- [ ] Tests run in < 10 seconds

### Test Categories
- [ ] Prescription tests pass (4 tests)
- [ ] Investigation tests pass (4 tests)
- [ ] Medication tests pass (7 tests)
- [ ] Error handling tests pass (3 tests)

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'axios'"

**Solution:**
```bash
npm install axios
```

---

### Issue: "Cannot find name 'jest'"

**Solution:**
```bash
npm install --save-dev @types/jest
```

---

### Issue: "ReferenceError: describe is not defined"

**Solution:**
- Verify `jest.config.js` exists
- Verify `testEnvironment: 'jsdom'` is set
- Run `npm test` instead of `node`

---

### Issue: "TypeError: encounterService.createPrescription is not a function"

**Solution:**
- Verify `encounterService` is imported correctly
- Verify all methods exist in `encounterService.ts`
- Check that mocks are set up before tests run

---

### Issue: Tests timeout

**Solution:**
```bash
npm test -- encounterService.test.ts --testTimeout=10000
```

---

## 📊 Expected Test Results

### Prescription APIs (4 tests)
- ✅ Create prescription with valid data
- ✅ Fetch prescriptions by encounter ID
- ✅ Dispense prescription with pharmacy info
- ✅ Check interactions between medications

### Investigation APIs (4 tests)
- ✅ Create investigation with LOINC code
- ✅ Fetch investigations by encounter ID
- ✅ Add results to investigation
- ✅ Search investigations by LOINC code

### Medication APIs (7 tests)
- ✅ Search medications by query
- ✅ Check medication interactions
- ✅ Get medication contraindications
- ✅ Get medication side effects
- ✅ Get medication dosage info
- ✅ Check medication allergies
- ✅ Get medication alternatives

### Error Handling (3 tests)
- ✅ Handle prescription creation errors
- ✅ Handle investigation fetch errors
- ✅ Handle medication search errors

---

## 🔄 Next Steps After Tests Pass

### 1. Component Integration
- [ ] Integrate `usePrescriptionsByEncounter` hook into components
- [ ] Integrate `useCreatePrescription` hook into forms
- [ ] Integrate `useSearchMedications` hook into search
- [ ] Add error boundaries and loading states

### 2. Integration Testing
- [ ] Test API + Database interactions
- [ ] Test React Query cache invalidation
- [ ] Test optimistic updates
- [ ] Test error recovery

### 3. E2E Testing
- [ ] Create Cypress test suite
- [ ] Test complete workflows
- [ ] Test user interactions
- [ ] Test error scenarios

---

## 📞 Support & Documentation

**Files to Reference:**
- `QA_HANDOFF_PHASE_4.md` - QA testing strategy
- `PHASE_4_EXECUTION_PLAN.md` - Execution timeline
- `encounterService.ts` - API methods
- `useEncounterQueries.ts` - React Query hooks

**Commands Reference:**
```bash
# Run tests
npm test

# Run specific test file
npm test -- encounterService.test.ts

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Update snapshots
npm test -- -u

# Run failed tests only
npm test -- --onlyChanged
```

---

## ✅ Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Frontend Lead | TBD | - | ⏳ Pending |
| QA Lead | TBD | - | ⏳ Pending |

---

**Status:** ✅ READY FOR EXECUTION

**Timeline:** 1-2 hours for complete setup and test execution

**Success Criteria:**
- ✅ All 20+ tests pass
- ✅ Coverage > 80%
- ✅ No TypeScript errors
- ✅ No console errors

---

*Last Updated: November 7, 2025 - 5:15 AM UTC+06:00*  
*Jest Setup & Smoke Test Execution Guide*
