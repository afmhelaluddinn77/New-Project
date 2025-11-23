# Phase 3: Integration & State Management - Implementation Guide

**Status:** 📋 READY FOR IMPLEMENTATION  
**Priority:** HIGH  
**Duration:** 6-7 days  
**Date:** November 7, 2025

---

## 📋 Overview

Phase 3 focuses on integrating all frontend components with backend services, implementing advanced state management, and adding real-time features like auto-save and live preview.

---

## 🎯 Phase 3 Objectives

1. ✅ Setup advanced state management (Zustand + React Query)
2. ✅ Implement form validation (Zod)
3. ✅ Build main encounter editor page (DONE - EncounterEditorPage.tsx)
4. ✅ Add auto-save functionality
5. ✅ Create prescription preview component
6. ✅ Implement print functionality
7. ✅ Add error handling and loading states
8. ✅ Integrate with backend API

---

## 📊 Phase 3 Breakdown

### Step 3.1: Setup State Management (2 days)

#### Task 1: Enhance Zustand Store ✅ (PARTIALLY DONE)

**Current Status:** Store created with basic structure  
**Remaining:** Add persistence and middleware

**File:** `/provider-portal/src/store/encounterStore.ts`

**What to Add:**
```typescript
// 1. Add localStorage persistence
import { persist } from 'zustand/middleware';

// 2. Add immer middleware for immutable updates
import { immer } from 'zustand/middleware/immer';

// 3. Add devtools for debugging
import { devtools } from 'zustand/middleware';

// Usage:
create<EncounterState>()(
  devtools(
    persist(
      immer((set) => ({
        // ... store implementation
      })),
      { name: 'encounter-store' }
    )
  )
);
```

**Benefits:**
- Automatic localStorage sync
- Time-travel debugging
- Immutable state updates
- Better performance

---

#### Task 2: Implement React Query ⏳ (TODO)

**File:** `/provider-portal/src/hooks/useEncounterQueries.ts` (NEW)

**What to Create:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encounterService } from '../services/encounterService';

// Query hooks
export const useEncounter = (encounterId: string) => {
  return useQuery({
    queryKey: ['encounter', encounterId],
    queryFn: () => encounterService.getEncounter(encounterId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePatientEncounters = (patientId: string) => {
  return useQuery({
    queryKey: ['encounters', patientId],
    queryFn: () => encounterService.getPatientEncounters(patientId),
  });
};

// Mutation hooks
export const useSaveEncounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => encounterService.createEncounter(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
    },
  });
};
```

**Benefits:**
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

---

#### Task 3: Add Form Validation with Zod ⏳ (TODO)

**File:** `/provider-portal/src/schemas/encounterSchema.ts` (NEW)

**What to Create:**
```typescript
import { z } from 'zod';

export const chiefComplaintSchema = z.object({
  chiefComplaint: z.string().min(1, 'Chief complaint is required').max(500),
});

export const vitalSignsSchema = z.object({
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Invalid BP format'),
  heartRate: z.number().min(30).max(300),
  temperature: z.number().min(35).max(42),
  spO2: z.number().min(0).max(100),
});

export const encounterSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  chiefComplaint: z.string().min(1),
  vitalSigns: vitalSignsSchema.optional(),
});

export type EncounterFormData = z.infer<typeof encounterSchema>;
```

**Benefits:**
- Runtime validation
- Type inference
- Better error messages
- Schema reusability

---

#### Task 4: Setup Auto-save Functionality ⏳ (TODO)

**File:** `/provider-portal/src/hooks/useAutoSave.ts` (NEW)

**What to Create:**
```typescript
import { useEffect, useRef } from 'react';
import { useEncounterStore } from '../store/encounterStore';

export const useAutoSave = (debounceMs = 3000) => {
  const { saveEncounter, isSaving } = useEncounterStore();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveEncounter().catch(console.error);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [saveEncounter, debounceMs]);

  return { isSaving };
};
```

**Usage:**
```typescript
function EncounterEditor() {
  const { isSaving } = useAutoSave(3000); // Auto-save every 3 seconds
  
  return (
    <div>
      {isSaving && <p>Saving...</p>}
    </div>
  );
}
```

---

### Step 3.2: Build Main Encounter Editor ✅ (DONE)

**Status:** COMPLETE - `EncounterEditorPage.tsx` created

**Features Implemented:**
- ✅ Tabbed interface (History, Examination, Investigations, Medications)
- ✅ All components integrated
- ✅ Save, Print, Finalize buttons
- ✅ Status messages
- ✅ Responsive design
- ✅ Auto-save hooks prepared

**Remaining:**
- Add live preview panel
- Integrate auto-save hook
- Add error boundaries

---

### Step 3.3: Prescription Preview & Print (2 days)

#### Task 1: Build Prescription Preview Component ⏳ (TODO)

**File:** `/provider-portal/src/features/encounter/components/PrescriptionPreview.tsx` (NEW)

**What to Create:**
```typescript
import React from 'react';
import { useEncounterStore } from '../../../store/encounterStore';
import styles from './PrescriptionPreview.module.css';

export const PrescriptionPreview: React.FC = () => {
  const { medications, history, examination } = useEncounterStore();

  return (
    <div className={styles.prescription}>
      <div className={styles.header}>
        <h2>Prescription</h2>
        <p>Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className={styles.patientInfo}>
        <p><strong>Chief Complaint:</strong> {history.chiefComplaint}</p>
      </div>

      <div className={styles.medications}>
        <h3>Medications</h3>
        {medications.prescriptions.map((rx, idx) => (
          <div key={idx} className={styles.medication}>
            <p><strong>{rx.medicationName}</strong></p>
            <p>{rx.dosage} - {rx.frequency}</p>
            <p>Duration: {rx.duration}</p>
            {rx.indication && <p>For: {rx.indication}</p>}
          </div>
        ))}
      </div>

      <div className={styles.notes}>
        <p>Patient Instructions:</p>
        <ul>
          <li>Take medications as prescribed</li>
          <li>Report any adverse effects</li>
          <li>Follow-up as recommended</li>
        </ul>
      </div>
    </div>
  );
};
```

---

#### Task 2: Implement Print Functionality ⏳ (TODO)

**File:** `/provider-portal/src/hooks/usePrint.ts` (NEW)

**What to Create:**
```typescript
import { useRef } from 'react';

export const usePrint = () => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write(printRef.current.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return { printRef, handlePrint };
};
```

---

#### Task 3: Add Print Settings ⏳ (TODO)

**File:** `/provider-portal/src/components/PrintSettings.tsx` (NEW)

**Features:**
- Page size selection (A4, Letter)
- Margin settings
- Header/Footer options
- Color/B&W toggle
- Preview before print

---

### Step 3.4: Error Handling & Loading States ⏳ (TODO)

#### Task 1: Create Error Boundary ⏳ (TODO)

**File:** `/provider-portal/src/components/ErrorBoundary.tsx` (NEW)

```typescript
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

#### Task 2: Add Loading Skeletons ⏳ (TODO)

**File:** `/provider-portal/src/components/LoadingSkeleton.tsx` (NEW)

```typescript
export const EncounterSkeleton: React.FC = () => (
  <div className={styles.skeleton}>
    <div className={styles.skeletonHeader} />
    <div className={styles.skeletonContent} />
    <div className={styles.skeletonContent} />
  </div>
);
```

---

## 📦 Dependencies to Install

```bash
npm install @tanstack/react-query zod zustand immer
npm install --save-dev @tanstack/react-query-devtools
```

---

## 🔄 Integration Flow

```
User Input
    ↓
Component Handler
    ↓
Zod Validation
    ↓
Zustand Store Update
    ↓
Auto-save Hook Triggered
    ↓
React Query Mutation
    ↓
API Call
    ↓
Success/Error Response
    ↓
Cache Invalidation
    ↓
UI Update
```

---

## 📋 Implementation Checklist

### State Management
- [ ] Enhance Zustand store with persistence
- [ ] Add immer middleware
- [ ] Add devtools middleware
- [ ] Create React Query hooks
- [ ] Setup query client configuration

### Form Validation
- [ ] Create Zod schemas
- [ ] Integrate with components
- [ ] Add error messages
- [ ] Test validation

### Auto-save
- [ ] Create useAutoSave hook
- [ ] Integrate with EncounterEditorPage
- [ ] Add debouncing
- [ ] Test auto-save functionality

### Prescription Preview
- [ ] Create preview component
- [ ] Add styling
- [ ] Test layout
- [ ] Verify data display

### Print Functionality
- [ ] Create print hook
- [ ] Add print settings component
- [ ] Test print layout
- [ ] Verify PDF output

### Error Handling
- [ ] Create ErrorBoundary
- [ ] Add error messages
- [ ] Create loading skeletons
- [ ] Test error scenarios

### Testing
- [ ] Unit tests for hooks
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing

---

## 🚀 Deployment Checklist

- [ ] All Phase 3 tasks completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] No console errors
- [ ] Performance optimized
- [ ] Accessibility verified
- [ ] Security review passed
- [ ] Ready for Phase 4

---

## 📊 Phase 3 Timeline

| Task | Duration | Status |
|------|----------|--------|
| State Management Setup | 2 days | ⏳ TODO |
| Main Editor Page | 2-3 days | ✅ DONE |
| Prescription Preview | 2 days | ⏳ TODO |
| Error Handling | 1 day | ⏳ TODO |
| Testing & Optimization | 1-2 days | ⏳ TODO |
| **Total** | **6-7 days** | **~30% DONE** |

---

## 🎯 Success Criteria

- ✅ All components integrated
- ✅ Auto-save working
- ✅ Form validation active
- ✅ Prescription preview functional
- ✅ Print working correctly
- ✅ Error handling in place
- ✅ No console errors
- ✅ Performance optimized

---

## 📞 Next Steps

1. **Install Dependencies** - Add React Query and Zod
2. **Enhance Store** - Add persistence and middleware
3. **Create Query Hooks** - Setup React Query integration
4. **Add Validation** - Implement Zod schemas
5. **Build Auto-save** - Create useAutoSave hook
6. **Create Preview** - Build prescription preview
7. **Add Print** - Implement print functionality
8. **Error Handling** - Add ErrorBoundary and skeletons
9. **Testing** - Write and run tests
10. **Optimization** - Performance tuning

---

## 📚 Resources

### Documentation
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zod Docs](https://zod.dev)

### Related Files
- `/provider-portal/src/store/encounterStore.ts` - Zustand store
- `/provider-portal/src/services/encounterService.ts` - API service
- `/provider-portal/src/pages/EncounterEditorPage.tsx` - Main editor

---

**Status:** 📋 READY FOR PHASE 3 IMPLEMENTATION

**Estimated Start:** November 8, 2025  
**Estimated Completion:** November 14, 2025

---

*Last Updated: November 7, 2025*
*Phase 3 Guide Created*
