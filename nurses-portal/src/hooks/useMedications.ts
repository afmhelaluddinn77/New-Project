import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import medicationService, {
  MedicationAdministrationRecord,
} from "../services/medicationService";

export function useMedicationsDue(timeWindow = 60) {
  return useQuery({
    queryKey: ["medicationsDue", timeWindow],
    queryFn: () => medicationService.getMedicationsDue(timeWindow),
    refetchInterval: 30000, // Refresh every 30 seconds for time-sensitive meds
  });
}

export function useAdministerMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: MedicationAdministrationRecord) =>
      medicationService.administerMedication(record),
    onSuccess: (_, variables) => {
      // Invalidate medications due
      queryClient.invalidateQueries({
        queryKey: ["medicationsDue"],
      });
      // Invalidate medication history for this patient
      queryClient.invalidateQueries({
        queryKey: ["medicationHistory", variables.patientId],
      });
    },
  });
}

export function useHoldMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      medicationId,
      reason,
    }: {
      medicationId: string;
      reason: string;
    }) => medicationService.holdMedication(medicationId, reason),
    onSuccess: () => {
      // Invalidate medications due
      queryClient.invalidateQueries({
        queryKey: ["medicationsDue"],
      });
    },
  });
}

export function useMedicationHistory(patientId: string, days = 7) {
  return useQuery({
    queryKey: ["medicationHistory", patientId, days],
    queryFn: () => medicationService.getMedicationHistory(patientId, days),
    enabled: !!patientId,
  });
}

export function useCheckInteractions(medications: string[]) {
  return useQuery({
    queryKey: ["medicationInteractions", medications],
    queryFn: () => medicationService.checkInteractions(medications),
    enabled: medications.length > 1,
  });
}
