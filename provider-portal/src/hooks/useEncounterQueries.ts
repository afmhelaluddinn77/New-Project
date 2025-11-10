import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encounterService } from '../services/encounterService';

// Query Keys
const encounterKeys = {
  all: ['encounters'] as const,
  lists: () => [...encounterKeys.all, 'list'] as const,
  list: (filters: string) => [...encounterKeys.lists(), { filters }] as const,
  details: () => [...encounterKeys.all, 'detail'] as const,
  detail: (id: string) => [...encounterKeys.details(), id] as const,
  patient: (patientId: string) => [...encounterKeys.all, 'patient', patientId] as const,
};

const prescriptionKeys = {
  all: ['prescriptions'] as const,
  lists: () => [...prescriptionKeys.all, 'list'] as const,
  list: (filters: string) => [...prescriptionKeys.lists(), { filters }] as const,
  details: () => [...prescriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...prescriptionKeys.details(), id] as const,
  byEncounter: (encounterId: string) => [...prescriptionKeys.all, 'encounter', encounterId] as const,
};

const investigationKeys = {
  all: ['investigations'] as const,
  lists: () => [...investigationKeys.all, 'list'] as const,
  list: (filters: string) => [...investigationKeys.lists(), { filters }] as const,
  details: () => [...investigationKeys.all, 'detail'] as const,
  detail: (id: string) => [...investigationKeys.details(), id] as const,
  byEncounter: (encounterId: string) => [...investigationKeys.all, 'encounter', encounterId] as const,
};

const medicationKeys = {
  all: ['medications'] as const,
  search: (query: string) => [...medicationKeys.all, 'search', query] as const,
  interactions: () => [...medicationKeys.all, 'interactions'] as const,
  contraindications: (code: string) => [...medicationKeys.all, 'contraindications', code] as const,
  sideEffects: (code: string) => [...medicationKeys.all, 'sideEffects', code] as const,
  dosage: (code: string) => [...medicationKeys.all, 'dosage', code] as const,
  alternatives: (code: string) => [...medicationKeys.all, 'alternatives', code] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch a single encounter by ID
 */
export const useEncounter = (encounterId: string | null) => {
  return useQuery({
    queryKey: encounterId ? encounterKeys.detail(encounterId) : ['disabled'],
    queryFn: () => {
      if (!encounterId) throw new Error('Encounter ID is required');
      return encounterService.getEncounter(encounterId);
    },
    enabled: !!encounterId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Fetch all encounters for a patient
 */
export const usePatientEncounters = (patientId: string | null) => {
  return useQuery({
    queryKey: patientId ? encounterKeys.patient(patientId) : ['disabled'],
    queryFn: () => {
      if (!patientId) throw new Error('Patient ID is required');
      return encounterService.getPatientEncounters(patientId);
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch all encounters with pagination
 */
export const useAllEncounters = (skip: number = 0, take: number = 20) => {
  return useQuery({
    queryKey: encounterKeys.list(`skip=${skip}&take=${take}`),
    queryFn: () => encounterService.getAllEncounters(skip, take),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Check service health
 */
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => encounterService.healthCheck(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new encounter
 */
export const useCreateEncounter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof encounterService.createEncounter>[0]) =>
      encounterService.createEncounter(data),
    onSuccess: (data) => {
      // Invalidate all encounter queries
      queryClient.invalidateQueries({ queryKey: encounterKeys.all });
      // Optionally set the new encounter in cache
      queryClient.setQueryData(encounterKeys.detail(data.id), data);
    },
    onError: (error) => {
      console.error('Failed to create encounter:', error);
    },
  });
};

/**
 * Update an existing encounter
 */
export const useUpdateEncounter = (encounterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof encounterService.updateEncounter>[1]) =>
      encounterService.updateEncounter(encounterId, data),
    onSuccess: (data) => {
      // Update the specific encounter in cache
      queryClient.setQueryData(encounterKeys.detail(encounterId), data);
      // Invalidate patient encounters if available
      queryClient.invalidateQueries({ queryKey: encounterKeys.patient(data.patientId) });
    },
    onError: (error) => {
      console.error('Failed to update encounter:', error);
    },
  });
};

/**
 * Finalize an encounter
 */
export const useFinalizeEncounter = (encounterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => encounterService.finalizeEncounter(encounterId),
    onSuccess: (data) => {
      queryClient.setQueryData(encounterKeys.detail(encounterId), data);
      queryClient.invalidateQueries({ queryKey: encounterKeys.all });
    },
    onError: (error) => {
      console.error('Failed to finalize encounter:', error);
    },
  });
};

/**
 * Delete an encounter (soft delete)
 */
export const useDeleteEncounter = (encounterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => encounterService.deleteEncounter(encounterId),
    onSuccess: () => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: encounterKeys.detail(encounterId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: encounterKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete encounter:', error);
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Get mutation status for UI feedback
 */
export const useMutationStatus = (mutation: any) => {
  return {
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
};

// ============================================================================
// PRESCRIPTION HOOKS
// ============================================================================

export const usePrescription = (prescriptionId: string | null) => {
  return useQuery({
    queryKey: prescriptionId ? prescriptionKeys.detail(prescriptionId) : ['disabled'],
    queryFn: () => {
      if (!prescriptionId) throw new Error('Prescription ID is required');
      return encounterService.getPrescription(prescriptionId);
    },
    enabled: !!prescriptionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrescriptionsByEncounter = (encounterId: string | null) => {
  return useQuery({
    queryKey: encounterId ? prescriptionKeys.byEncounter(encounterId) : ['disabled'],
    queryFn: () => {
      if (!encounterId) throw new Error('Encounter ID is required');
      return encounterService.getPrescriptionsByEncounter(encounterId);
    },
    enabled: !!encounterId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof encounterService.createPrescription>[0]) =>
      encounterService.createPrescription(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.byEncounter(data.encounterId) });
      queryClient.setQueryData(prescriptionKeys.detail(data.id), data);
    },
    onError: (error) => {
      console.error('Failed to create prescription:', error);
    },
  });
};

export const useUpdatePrescription = (prescriptionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof encounterService.updatePrescription>[1]) =>
      encounterService.updatePrescription(prescriptionId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(prescriptionKeys.detail(prescriptionId), data);
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.byEncounter(data.encounterId) });
    },
    onError: (error) => {
      console.error('Failed to update prescription:', error);
    },
  });
};

export const useDispensePrescription = (prescriptionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof encounterService.dispensePrescription>[1]) =>
      encounterService.dispensePrescription(prescriptionId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(prescriptionKeys.detail(prescriptionId), data);
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.all });
    },
    onError: (error) => {
      console.error('Failed to dispense prescription:', error);
    },
  });
};

export const useCheckPrescriptionInteractions = () => {
  return useMutation({
    mutationFn: (params: {
      prescriptionId: string;
      medications: Parameters<typeof encounterService.checkPrescriptionInteractions>[1];
    }) => encounterService.checkPrescriptionInteractions(params.prescriptionId, params.medications),
    onError: (error) => {
      console.error('Failed to check interactions:', error);
    },
  });
};

// ============================================================================
// INVESTIGATION HOOKS
// ============================================================================

export const useInvestigationsByEncounter = (encounterId: string | null) => {
  return useQuery({
    queryKey: encounterId ? investigationKeys.byEncounter(encounterId) : ['disabled'],
    queryFn: () => {
      if (!encounterId) throw new Error('Encounter ID is required');
      return encounterService.getInvestigationsByEncounter(encounterId);
    },
    enabled: !!encounterId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateInvestigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof encounterService.createInvestigation>[0]) =>
      encounterService.createInvestigation(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: investigationKeys.byEncounter(data.encounterId) });
      queryClient.setQueryData(investigationKeys.detail(data.id), data);
    },
    onError: (error) => {
      console.error('Failed to create investigation:', error);
    },
  });
};

export const useUpdateInvestigation = (investigationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof encounterService.updateInvestigation>[1]) =>
      encounterService.updateInvestigation(investigationId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(investigationKeys.detail(investigationId), data);
      queryClient.invalidateQueries({ queryKey: investigationKeys.byEncounter(data.encounterId) });
    },
    onError: (error) => {
      console.error('Failed to update investigation:', error);
    },
  });
};

export const useAddInvestigationResults = (investigationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof encounterService.addInvestigationResults>[1]) =>
      encounterService.addInvestigationResults(investigationId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(investigationKeys.detail(investigationId), data);
      queryClient.invalidateQueries({ queryKey: investigationKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add investigation results:', error);
    },
  });
};

// ============================================================================
// MEDICATION HOOKS
// ============================================================================

export const useSearchMedications = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: medicationKeys.search(query),
    queryFn: () => encounterService.searchMedications(query),
    enabled: enabled && query.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useCheckMedicationInteractions = () => {
  return useMutation({
    mutationFn: (medications: Parameters<typeof encounterService.checkMedicationInteractions>[0]) =>
      encounterService.checkMedicationInteractions(medications),
    onError: (error) => {
      console.error('Failed to check medication interactions:', error);
    },
  });
};

export const useGetMedicationContraindications = (rxNormCode: string | null) => {
  return useQuery({
    queryKey: rxNormCode ? medicationKeys.contraindications(rxNormCode) : ['disabled'],
    queryFn: () => {
      if (!rxNormCode) throw new Error('RxNorm code is required');
      return encounterService.getMedicationContraindications(rxNormCode);
    },
    enabled: !!rxNormCode,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

export const useGetMedicationSideEffects = (rxNormCode: string | null) => {
  return useQuery({
    queryKey: rxNormCode ? medicationKeys.sideEffects(rxNormCode) : ['disabled'],
    queryFn: () => {
      if (!rxNormCode) throw new Error('RxNorm code is required');
      return encounterService.getMedicationSideEffects(rxNormCode);
    },
    enabled: !!rxNormCode,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

export const useGetMedicationDosageInfo = (rxNormCode: string | null) => {
  return useQuery({
    queryKey: rxNormCode ? medicationKeys.dosage(rxNormCode) : ['disabled'],
    queryFn: () => {
      if (!rxNormCode) throw new Error('RxNorm code is required');
      return encounterService.getMedicationDosageInfo(rxNormCode);
    },
    enabled: !!rxNormCode,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

export const useGetMedicationAlternatives = (rxNormCode: string | null) => {
  return useQuery({
    queryKey: rxNormCode ? medicationKeys.alternatives(rxNormCode) : ['disabled'],
    queryFn: () => {
      if (!rxNormCode) throw new Error('RxNorm code is required');
      return encounterService.getMedicationAlternatives(rxNormCode);
    },
    enabled: !!rxNormCode,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

export const useCheckMedicationAllergies = () => {
  return useMutation({
    mutationFn: (params: {
      patientId: string;
      medications: string[];
    }) => encounterService.checkMedicationAllergies(params.patientId, params.medications),
    onError: (error) => {
      console.error('Failed to check medication allergies:', error);
    },
  });
};
