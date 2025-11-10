import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePrescription, useUpdatePrescription } from '@/hooks/useEncounterQueries';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState, ValidationError } from '@/components/shared/ErrorBoundary';
import { useToast } from '@/components/shared/Notifications';

/**
 * Prescription Form Validation Schema
 */
const prescriptionSchema = z.object({
  genericName: z.string().min(1, 'Medication name is required'),
  brandName: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required'),
  dosageForm: z.enum(['tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'other']),
  route: z.enum(['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'inhalation']),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  refills: z.number().min(0, 'Refills cannot be negative').optional(),
  instructions: z.string().optional(),
  indication: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  encounterId: string;
  prescriptionId?: string;
  initialData?: Partial<PrescriptionFormData>;
  onSuccess?: () => void;
  isLoading?: boolean;
}

/**
 * PrescriptionForm Component
 * Form for creating and editing prescriptions
 */
export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  encounterId,
  prescriptionId,
  initialData,
  onSuccess,
  isLoading: externalLoading = false,
}) => {
  const { success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreatePrescription();
  const updateMutation = prescriptionId ? useUpdatePrescription(prescriptionId) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: initialData || {
      quantity: 1,
      refills: 0,
    },
  });

  const onSubmit = async (data: PrescriptionFormData) => {
    setIsSubmitting(true);
    try {
      if (prescriptionId && updateMutation) {
        await updateMutation.mutateAsync(data);
        success('Prescription updated successfully');
      } else {
        await createMutation.mutateAsync({
          ...data,
          encounterId,
        });
        success('Prescription created successfully');
        reset();
      }
      onSuccess?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (externalLoading) {
    return <LoadingState count={5} height={50} message="Loading prescription form..." />;
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation?.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-lg border">
      <h2 className="text-2xl font-bold text-gray-900">
        {prescriptionId ? 'Edit Prescription' : 'New Prescription'}
      </h2>

      {Object.keys(errors).length > 0 && (
        <ValidationError errors={Object.fromEntries(
          Object.entries(errors).map(([key, value]) => [
            key,
            value?.message || 'Invalid field',
          ])
        )} />
      )}

      {createMutation.isError && (
        <ErrorState error={createMutation.error} onRetry={() => createMutation.reset()} />
      )}

      {updateMutation?.isError && (
        <ErrorState error={updateMutation.error} onRetry={() => updateMutation.reset()} />
      )}

      {/* Medication Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Generic Name *
          </label>
          <input
            {...register('genericName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Aspirin"
            disabled={isLoading}
          />
          {errors.genericName && (
            <p className="mt-1 text-sm text-red-600">{errors.genericName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Name
          </label>
          <input
            {...register('brandName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Bayer"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Dosage Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dosage *
          </label>
          <input
            {...register('dosage')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 500mg"
            disabled={isLoading}
          />
          {errors.dosage && (
            <p className="mt-1 text-sm text-red-600">{errors.dosage.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dosage Form *
          </label>
          <select
            {...register('dosageForm')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Select form</option>
            <option value="tablet">Tablet</option>
            <option value="capsule">Capsule</option>
            <option value="liquid">Liquid</option>
            <option value="injection">Injection</option>
            <option value="inhaler">Inhaler</option>
            <option value="other">Other</option>
          </select>
          {errors.dosageForm && (
            <p className="mt-1 text-sm text-red-600">{errors.dosageForm.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Route *
          </label>
          <select
            {...register('route')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Select route</option>
            <option value="oral">Oral</option>
            <option value="intravenous">Intravenous</option>
            <option value="intramuscular">Intramuscular</option>
            <option value="subcutaneous">Subcutaneous</option>
            <option value="topical">Topical</option>
            <option value="inhalation">Inhalation</option>
          </select>
          {errors.route && (
            <p className="mt-1 text-sm text-red-600">{errors.route.message}</p>
          )}
        </div>
      </div>

      {/* Frequency and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequency *
          </label>
          <input
            {...register('frequency')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., BID (twice daily)"
            disabled={isLoading}
          />
          {errors.frequency && (
            <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration *
          </label>
          <input
            {...register('duration')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 7 days"
            disabled={isLoading}
          />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity *
          </label>
          <input
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 14"
            disabled={isLoading}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Refills
          </label>
          <input
            {...register('refills', { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 0"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Indication
          </label>
          <input
            {...register('indication')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Pain relief"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Special Instructions
        </label>
        <textarea
          {...register('instructions')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Take with food, avoid alcohol"
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isLoading ? 'Saving...' : prescriptionId ? 'Update Prescription' : 'Create Prescription'}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 transition"
        >
          Reset
        </button>
      </div>
    </form>
  );
};
