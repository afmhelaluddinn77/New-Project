import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import patientService, {
  Patient,
  PatientVitals,
} from "../services/patientService";

export function useAssignedPatients() {
  return useQuery({
    queryKey: ["assignedPatients"],
    queryFn: () => patientService.getAssignedPatients(),
    refetchInterval: 60000, // Refresh every minute
  });
}

export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getPatientById(patientId),
    enabled: !!patientId,
  });
}

export function usePatientVitals(patientId: string, limit = 10) {
  return useQuery({
    queryKey: ["patientVitals", patientId, limit],
    queryFn: () => patientService.getPatientVitals(patientId, limit),
    enabled: !!patientId,
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

export function useRecordVitals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vitals: PatientVitals) => patientService.recordVitals(vitals),
    onSuccess: (_, variables) => {
      // Invalidate vitals for this patient
      queryClient.invalidateQueries({
        queryKey: ["patientVitals", variables.patientId],
      });
      // Also invalidate assigned patients to update any summary data
      queryClient.invalidateQueries({
        queryKey: ["assignedPatients"],
      });
    },
  });
}

export function useUpdatePatientStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      status,
    }: {
      patientId: string;
      status: Partial<Patient>;
    }) => patientService.updatePatientStatus(patientId, status),
    onSuccess: (_, variables) => {
      // Invalidate this specific patient
      queryClient.invalidateQueries({
        queryKey: ["patient", variables.patientId],
      });
      // Also invalidate assigned patients list
      queryClient.invalidateQueries({
        queryKey: ["assignedPatients"],
      });
    },
  });
}
