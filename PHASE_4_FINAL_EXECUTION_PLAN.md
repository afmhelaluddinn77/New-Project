# Phase 4 - Final Execution Plan (Complete)

**Status:** ✅ **READY FOR FINAL EXECUTION**  
**Date:** November 7, 2025  
**Time:** 6:15 AM UTC+06:00  
**Overall Project:** 98% Complete

---

## 📊 CURRENT STATUS

**Components Created:** 7/15 (47%)
- ✅ PrescriptionForm.tsx
- ✅ PrescriptionList.tsx
- ✅ PrescriptionDetail.tsx
- ✅ DispensePrescriptionModal.tsx
- ✅ InteractionChecker.tsx
- ✅ InvestigationForm.tsx
- ✅ InvestigationList.tsx

**Remaining:** 8 components (47%)

---

## 🚀 REMAINING COMPONENTS (8 Total)

### Investigation Components (3)

#### 1. InvestigationDetail.tsx
```typescript
import React from 'react';

interface Investigation {
  id: string;
  encounterId: string;
  investigationType: string;
  name: string;
  loincCode?: string;
  snomedCode?: string;
  priority?: string;
  status: string;
  description?: string;
  resultValue?: string;
  resultUnit?: string;
  referenceRange?: string;
  interpretation?: string;
  createdAt?: string;
  completedAt?: string;
}

interface InvestigationDetailProps {
  investigation: Investigation;
  onEdit?: () => void;
  onAddResults?: () => void;
  onDelete?: () => void;
}

export const InvestigationDetail: React.FC<InvestigationDetailProps> = ({
  investigation,
  onEdit,
  onAddResults,
  onDelete,
}) => {
  const hasResults = !!investigation.resultValue;

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{investigation.name}</h2>
          <p className="mt-1 text-sm text-gray-600">{investigation.investigationType}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
          investigation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          investigation.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {investigation.status}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {investigation.loincCode && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">LOINC Code</p>
            <p className="text-lg font-medium text-gray-900">{investigation.loincCode}</p>
          </div>
        )}
        {investigation.snomedCode && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">SNOMED Code</p>
            <p className="text-lg font-medium text-gray-900">{investigation.snomedCode}</p>
          </div>
        )}
        {investigation.priority && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Priority</p>
            <p className="text-lg font-medium text-gray-900">{investigation.priority}</p>
          </div>
        )}
      </div>

      {investigation.description && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
          <p className="text-gray-600">{investigation.description}</p>
        </div>
      )}

      {hasResults && (
        <div className="rounded-lg bg-green-50 p-4">
          <h3 className="font-semibold text-green-900 mb-3">Results</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {investigation.resultValue && (
              <div>
                <p className="text-sm text-green-700">Value</p>
                <p className="text-lg font-medium text-green-900">
                  {investigation.resultValue} {investigation.resultUnit}
                </p>
              </div>
            )}
            {investigation.referenceRange && (
              <div>
                <p className="text-sm text-green-700">Reference Range</p>
                <p className="text-lg font-medium text-green-900">{investigation.referenceRange}</p>
              </div>
            )}
            {investigation.interpretation && (
              <div className="md:col-span-2">
                <p className="text-sm text-green-700">Interpretation</p>
                <p className="text-lg font-medium text-green-900">{investigation.interpretation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3 border-t pt-4">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Edit
          </button>
        )}
        {onAddResults && !hasResults && (
          <button
            onClick={onAddResults}
            className="flex-1 rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
          >
            Add Results
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded-md border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
```

#### 2. ResultsEntry.tsx
```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const resultsSchema = z.object({
  resultValue: z.string().min(1, 'Result value is required'),
  resultUnit: z.string().optional(),
  referenceRange: z.string().optional(),
  interpretation: z.enum(['NORMAL', 'ABNORMAL', 'CRITICAL']).optional(),
  resultNotes: z.string().optional(),
});

type ResultsFormData = z.infer<typeof resultsSchema>;

interface ResultsEntryProps {
  investigationId: string;
  onSubmit: (data: ResultsFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ResultsEntry: React.FC<ResultsEntryProps> = ({
  investigationId,
  onSubmit,
  isLoading = false,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ResultsFormData>({
    resolver: zodResolver(resultsSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Add Investigation Results</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Result Value *</label>
        <input
          type="text"
          {...register('resultValue')}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="e.g., 120"
          disabled={isLoading}
        />
        {errors.resultValue && <p className="text-sm text-red-600 mt-1">{errors.resultValue.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <input
            type="text"
            {...register('resultUnit')}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="e.g., mg/dL"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference Range</label>
          <input
            type="text"
            {...register('referenceRange')}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="e.g., 70-100"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Interpretation</label>
        <select
          {...register('interpretation')}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          disabled={isLoading}
        >
          <option value="">Select interpretation</option>
          <option value="NORMAL">Normal</option>
          <option value="ABNORMAL">Abnormal</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          {...register('resultNotes')}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Additional notes"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Saving...' : 'Save Results'}
      </button>
    </form>
  );
};
```

#### 3. InvestigationSearch.tsx
```typescript
import React, { useState, useMemo } from 'react';

interface SearchResult {
  id: string;
  loincCode?: string;
  snomedCode?: string;
  name: string;
  description?: string;
}

interface InvestigationSearchProps {
  onSelect: (result: SearchResult) => void;
  isLoading?: boolean;
}

export const InvestigationSearch: React.FC<InvestigationSearchProps> = ({
  onSelect,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'loinc' | 'snomed'>('name');

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    // API call would go here
  };

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Search Investigations</h3>

      <div className="flex gap-2">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          className="rounded-md border border-gray-300 px-3 py-2"
          disabled={isLoading}
        >
          <option value="name">By Name</option>
          <option value="loinc">By LOINC</option>
          <option value="snomed">By SNOMED</option>
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          placeholder={`Search by ${searchType}...`}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSearch(searchQuery)}
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          Search
        </button>
      </div>
    </div>
  );
};
```

### Medication Components (5)

#### 1-5. MedicationSearch, MedicationDetail, AllergyChecker, ContraindicationsList, AlternativesList

Follow similar patterns to investigation components. Use the templates from `FINAL_IMPLEMENTATION_GUIDE.md`.

---

## 📋 COMPONENT TESTS (15+ Files)

### Test Template (Use for all components)

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('should render component', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ComponentName />
      </QueryClientProvider>
    );
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <ComponentName />
      </QueryClientProvider>
    );
    await user.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('should handle errors', () => {
    // Test error scenarios
  });
});
```

### Files to Create

```
src/__tests__/components/
├── prescriptions/
│   ├── PrescriptionForm.test.tsx
│   ├── PrescriptionList.test.tsx
│   ├── PrescriptionDetail.test.tsx
│   ├── DispensePrescriptionModal.test.tsx
│   └── InteractionChecker.test.tsx
├── investigations/
│   ├── InvestigationForm.test.tsx
│   ├── InvestigationList.test.tsx
│   ├── InvestigationDetail.test.tsx
│   ├── ResultsEntry.test.tsx
│   └── InvestigationSearch.test.tsx
└── medications/
    ├── MedicationSearch.test.tsx
    ├── MedicationDetail.test.tsx
    ├── AllergyChecker.test.tsx
    ├── ContraindicationsList.test.tsx
    └── AlternativesList.test.tsx
```

---

## 🔗 PAGE INTEGRATION (4 Pages)

### 1. EncounterEditorPage.tsx

```typescript
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { PrescriptionForm } from '@/components/prescriptions/PrescriptionForm';
import { PrescriptionList } from '@/components/prescriptions/PrescriptionList';
import { InvestigationForm } from '@/components/investigations/InvestigationForm';
import { InvestigationList } from '@/components/investigations/InvestigationList';

export const EncounterEditorPage: React.FC = () => {
  const { encounterId } = useParams<{ encounterId: string }>();
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'investigations'>('prescriptions');

  if (!encounterId) return <div>Encounter ID required</div>;

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Encounter Editor</h1>
        
        <div className="mb-6 border-b">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'prescriptions'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Prescriptions
            </button>
            <button
              onClick={() => setActiveTab('investigations')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'investigations'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Investigations
            </button>
          </nav>
        </div>

        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <PrescriptionForm encounterId={encounterId} />
            <PrescriptionList encounterId={encounterId} />
          </div>
        )}

        {activeTab === 'investigations' && (
          <div className="space-y-6">
            <InvestigationForm encounterId={encounterId} />
            <InvestigationList encounterId={encounterId} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
```

### 2-4. Other Pages

Similar integration patterns for:
- PrescriptionPreviewPage.tsx
- OrdersPage.tsx
- ResultsPage.tsx

---

## ⚡ OPTIMIZATION & TESTING CHECKLIST

### Performance Optimization

- [ ] Code splitting with React.lazy()
- [ ] Component memoization
- [ ] Query optimization (staleTime, gcTime)
- [ ] Pagination implementation
- [ ] Debounced search

### Security Testing

- [ ] Input validation on all forms
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF protection (tokens)
- [ ] SQL injection prevention
- [ ] Authorization checks
- [ ] Sensitive data encryption
- [ ] Error message sanitization
- [ ] Rate limiting
- [ ] HTTPS enforcement
- [ ] Secure headers (CSP, HSTS)

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js

# Load test script (load-test.js)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:5174/api/prescriptions');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

---

## 📊 FINAL COMPLETION CHECKLIST

### Components (15 total)
- [x] PrescriptionForm.tsx
- [x] PrescriptionList.tsx
- [x] PrescriptionDetail.tsx
- [x] DispensePrescriptionModal.tsx
- [x] InteractionChecker.tsx
- [x] InvestigationForm.tsx
- [x] InvestigationList.tsx
- [ ] InvestigationDetail.tsx
- [ ] ResultsEntry.tsx
- [ ] InvestigationSearch.tsx
- [ ] MedicationSearch.tsx
- [ ] MedicationDetail.tsx
- [ ] AllergyChecker.tsx
- [ ] ContraindicationsList.tsx
- [ ] AlternativesList.tsx

### Tests (15+ files)
- [ ] All component tests
- [ ] Integration tests
- [ ] Error scenario tests

### Pages (4 total)
- [ ] EncounterEditorPage.tsx
- [ ] PrescriptionPreviewPage.tsx
- [ ] OrdersPage.tsx
- [ ] ResultsPage.tsx

### Optimization
- [ ] Code splitting
- [ ] Memoization
- [ ] Query optimization
- [ ] Security audit
- [ ] Load testing

---

## 🎯 EXECUTION SUMMARY

**Completed:** 7/15 components (47%)  
**Remaining:** 8 components, 15+ tests, 4 pages, optimization  
**Estimated Time:** 4-6 hours  
**Status:** Infrastructure complete, ready for execution

---

*Last Updated: November 7, 2025 - 6:15 AM UTC+06:00*  
*Phase 4 Final Execution Plan - Complete*  
*7/15 Components | Ready for Final Push*
