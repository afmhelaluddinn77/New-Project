# Component Integration Guide - Phase 4

**Status:** ✅ READY FOR INTEGRATION  
**Date:** November 7, 2025  
**Time:** 5:35 AM UTC+06:00  
**Owner:** Frontend Team

---

## 🎯 Objective

Integrate React Query hooks and API service layer into React components for prescriptions, investigations, and medications.

---

## 📋 Integration Checklist

### Core Components to Create/Update

#### 1. Prescription Components
- [ ] **PrescriptionForm.tsx** - Create/edit prescriptions
- [ ] **PrescriptionList.tsx** - Display prescriptions
- [ ] **PrescriptionDetail.tsx** - View prescription details
- [ ] **DispensePrescriptionModal.tsx** - Dispense functionality
- [ ] **InteractionChecker.tsx** - Check drug interactions

#### 2. Investigation Components
- [ ] **InvestigationForm.tsx** - Create/order investigations
- [ ] **InvestigationList.tsx** - Display investigations
- [ ] **InvestigationDetail.tsx** - View investigation details
- [ ] **ResultsEntry.tsx** - Add investigation results
- [ ] **InvestigationSearch.tsx** - Search by LOINC/SNOMED

#### 3. Medication Components
- [ ] **MedicationSearch.tsx** - Search medications
- [ ] **MedicationDetail.tsx** - View medication details
- [ ] **AllergyChecker.tsx** - Check medication allergies
- [ ] **ContraindicationsList.tsx** - Display contraindications
- [ ] **AlternativesList.tsx** - Show medication alternatives

#### 4. Shared Components
- [ ] **LoadingState.tsx** - Loading skeleton
- [ ] **ErrorBoundary.tsx** - Error handling
- [ ] **SuccessNotification.tsx** - Success messages
- [ ] **ConfirmDialog.tsx** - Confirmation dialogs

---

## 🔧 Integration Pattern

### Basic Component Structure

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePrescriptionsByEncounter, useCreatePrescription } from '@/hooks/useEncounterQueries';
import { useState } from 'react';

interface PrescriptionFormProps {
  encounterId: string;
  onSuccess?: () => void;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  encounterId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({...});
  const createMutation = useCreatePrescription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        encounterId,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating...' : 'Create Prescription'}
      </button>
    </form>
  );
};
```

---

## 📊 Hook Integration Examples

### Query Hook Usage
```typescript
const { data: prescriptions, isLoading, error } = usePrescriptionsByEncounter(encounterId);

if (isLoading) return <LoadingState />;
if (error) return <ErrorState error={error} />;

return (
  <div>
    {prescriptions?.map(rx => (
      <PrescriptionCard key={rx.id} prescription={rx} />
    ))}
  </div>
);
```

### Mutation Hook Usage
```typescript
const createMutation = useCreatePrescription();

const handleCreate = async (data: PrescriptionPayload) => {
  try {
    const result = await createMutation.mutateAsync(data);
    toast.success('Prescription created successfully');
  } catch (error) {
    toast.error('Failed to create prescription');
  }
};
```

### Optimistic Updates
```typescript
const updateMutation = useUpdatePrescription(prescriptionId);

const handleUpdate = async (data: UpdatePrescriptionPayload) => {
  updateMutation.mutate(data, {
    onMutate: async (newData) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ 
        queryKey: prescriptionKeys.detail(prescriptionId) 
      });
      
      // Snapshot old data
      const previousData = queryClient.getQueryData(
        prescriptionKeys.detail(prescriptionId)
      );
      
      // Update cache optimistically
      queryClient.setQueryData(
        prescriptionKeys.detail(prescriptionId),
        (old) => ({ ...old, ...newData })
      );
      
      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          prescriptionKeys.detail(prescriptionId),
          context.previousData
        );
      }
    },
  });
};
```

---

## 🎨 Component File Structure

```
src/
├── components/
│   ├── prescriptions/
│   │   ├── PrescriptionForm.tsx
│   │   ├── PrescriptionList.tsx
│   │   ├── PrescriptionDetail.tsx
│   │   ├── DispensePrescriptionModal.tsx
│   │   └── InteractionChecker.tsx
│   ├── investigations/
│   │   ├── InvestigationForm.tsx
│   │   ├── InvestigationList.tsx
│   │   ├── InvestigationDetail.tsx
│   │   ├── ResultsEntry.tsx
│   │   └── InvestigationSearch.tsx
│   ├── medications/
│   │   ├── MedicationSearch.tsx
│   │   ├── MedicationDetail.tsx
│   │   ├── AllergyChecker.tsx
│   │   ├── ContraindicationsList.tsx
│   │   └── AlternativesList.tsx
│   └── shared/
│       ├── LoadingState.tsx
│       ├── ErrorBoundary.tsx
│       ├── SuccessNotification.tsx
│       └── ConfirmDialog.tsx
```

---

## 🧪 Component Testing Pattern

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrescriptionForm } from './PrescriptionForm';

describe('PrescriptionForm', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  it('should render form fields', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PrescriptionForm encounterId="enc-123" />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText(/medication name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dosage/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <PrescriptionForm encounterId="enc-123" />
      </QueryClientProvider>
    );

    await user.type(screen.getByLabelText(/medication name/i), 'Aspirin');
    await user.type(screen.getByLabelText(/dosage/i), '500mg');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});
```

---

## 📝 Implementation Steps

### Phase 1: Shared Components (1 day)
1. Create LoadingState component
2. Create ErrorBoundary component
3. Create notification components
4. Create confirmation dialogs

### Phase 2: Prescription Components (2 days)
1. Create PrescriptionForm with validation
2. Create PrescriptionList with filtering
3. Create PrescriptionDetail view
4. Create DispensePrescriptionModal
5. Create InteractionChecker

### Phase 3: Investigation Components (2 days)
1. Create InvestigationForm
2. Create InvestigationList
3. Create InvestigationDetail
4. Create ResultsEntry form
5. Create InvestigationSearch

### Phase 4: Medication Components (2 days)
1. Create MedicationSearch
2. Create MedicationDetail
3. Create AllergyChecker
4. Create ContraindicationsList
5. Create AlternativesList

### Phase 5: Integration & Testing (2 days)
1. Wire components into pages
2. Add component tests
3. Test with real API
4. Performance optimization

---

## 🔗 Hook Integration Points

### Prescription Hooks
```typescript
import {
  usePrescriptionsByEncounter,
  useCreatePrescription,
  useUpdatePrescription,
  useDispensePrescription,
  useCheckPrescriptionInteractions,
} from '@/hooks/useEncounterQueries';
```

### Investigation Hooks
```typescript
import {
  useInvestigationsByEncounter,
  useCreateInvestigation,
  useUpdateInvestigation,
  useAddInvestigationResults,
} from '@/hooks/useEncounterQueries';
```

### Medication Hooks
```typescript
import {
  useSearchMedications,
  useCheckMedicationInteractions,
  useGetMedicationContraindications,
  useGetMedicationSideEffects,
  useGetMedicationDosageInfo,
  useGetMedicationAlternatives,
  useCheckMedicationAllergies,
} from '@/hooks/useEncounterQueries';
```

---

## ⚠️ Error Handling

### API Error Handling
```typescript
const { data, error, isError } = useQuery({
  queryKey: ['prescriptions', encounterId],
  queryFn: () => encounterService.getPrescriptionsByEncounter(encounterId),
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (isError) {
  return (
    <ErrorState 
      error={error}
      onRetry={() => queryClient.invalidateQueries({ queryKey: ['prescriptions'] })}
    />
  );
}
```

### Form Validation
```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const prescriptionSchema = z.object({
  genericName: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

export const PrescriptionForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('genericName')} />
      {errors.genericName && <span>{errors.genericName.message}</span>}
    </form>
  );
};
```

---

## 🚀 Performance Optimization

### Query Caching
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
    },
  },
});
```

### Pagination
```typescript
const [page, setPage] = useState(1);
const { data: prescriptions } = usePrescriptionsByEncounter(encounterId);

const paginatedData = prescriptions?.slice(
  (page - 1) * 10,
  page * 10
);
```

### Debouncing Search
```typescript
import { useDeferredValue } from 'react';

const [searchQuery, setSearchQuery] = useState('');
const deferredQuery = useDeferredValue(searchQuery);

const { data: results } = useSearchMedications(deferredQuery, deferredQuery.length > 0);
```

---

## 📞 Support & Documentation

**Files to Reference:**
- `useEncounterQueries.ts` - React Query hooks
- `encounterService.ts` - API methods
- `JEST_TEST_EXECUTION_REPORT.md` - Test results
- `PHASE_4_JEST_COMPLETION_SUMMARY.md` - Setup summary

**Commands:**
```bash
# Run component tests
npm test -- components

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## ✅ Success Criteria

- [ ] All shared components created
- [ ] All prescription components created
- [ ] All investigation components created
- [ ] All medication components created
- [ ] Components properly integrated with hooks
- [ ] Error handling implemented
- [ ] Form validation working
- [ ] Component tests passing
- [ ] No console errors
- [ ] Performance acceptable

---

**Status:** ✅ **READY FOR COMPONENT INTEGRATION**

**Timeline:** 8-10 days for full integration

**Next Milestone:** Shared components creation

---

*Last Updated: November 7, 2025 - 5:35 AM UTC+06:00*  
*Component Integration Guide for Phase 4*
