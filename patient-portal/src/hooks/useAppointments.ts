import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appointmentService,
  type CheckInRequest,
  type CreateAppointmentRequest,
  type RescheduleAppointmentRequest,
} from "../services/appointmentService";

// Query Keys
export const appointmentKeys = {
  all: ["appointments"] as const,
  patient: (patientId: string) =>
    ["appointments", "patient", patientId] as const,
  detail: (appointmentId: string) =>
    ["appointments", "detail", appointmentId] as const,
};

/**
 * Hook to fetch all appointments for a patient (Feature #2)
 * @param patientId - Patient ID
 */
export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: appointmentKeys.patient(patientId),
    queryFn: () => appointmentService.getPatientAppointments(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single appointment
 * @param appointmentId - Appointment ID
 */
export function useAppointment(appointmentId: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(appointmentId),
    queryFn: () => appointmentService.getAppointment(appointmentId),
    enabled: !!appointmentId,
  });
}

/**
 * Hook to create a new appointment (Feature #3)
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) =>
      appointmentService.createAppointment(data),
    onSuccess: (newAppointment) => {
      // Invalidate patient appointments list to refetch
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.patient(newAppointment.patientId),
      });
    },
  });
}

/**
 * Hook to reschedule an appointment (Feature #4)
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: RescheduleAppointmentRequest;
    }) => appointmentService.rescheduleAppointment(appointmentId, data),
    onSuccess: (updatedAppointment) => {
      // Update the specific appointment in cache
      queryClient.setQueryData(
        appointmentKeys.detail(updatedAppointment.id),
        updatedAppointment
      );

      // Invalidate patient appointments list
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.patient(updatedAppointment.patientId),
      });
    },
  });
}

/**
 * Hook to cancel an appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentService.cancelAppointment(appointmentId),
    onSuccess: (cancelledAppointment) => {
      // Update the specific appointment in cache
      queryClient.setQueryData(
        appointmentKeys.detail(cancelledAppointment.id),
        cancelledAppointment
      );

      // Invalidate patient appointments list
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.patient(cancelledAppointment.patientId),
      });
    },
  });
}

/**
 * Hook to check-in for an appointment (Feature #20)
 */
export function useCheckInAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: CheckInRequest;
    }) => appointmentService.checkInAppointment(appointmentId, data),
    onSuccess: (checkedInAppointment) => {
      // Update the specific appointment in cache
      queryClient.setQueryData(
        appointmentKeys.detail(checkedInAppointment.id),
        checkedInAppointment
      );

      // Invalidate patient appointments list
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.patient(checkedInAppointment.patientId),
      });
    },
  });
}
