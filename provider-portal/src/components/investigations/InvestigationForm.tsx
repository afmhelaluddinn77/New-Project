import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreateInvestigation,
  useUpdateInvestigation,
  useMutationStatus,
} from '@/hooks/useEncounterQueries';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState, ValidationError } from '@/components/shared/ErrorBoundary';

const investigationSchema = z.object({
  investigationType: z.enum(['LABORATORY', 'IMAGING', 'PATHOLOGY', 'PROCEDURE']),
  loincCode: z.string().optional(),
  snomedCode: z.string().optional(),
  name: z.string().min(1, 'Investigation name is required'),
  description: z.string().optional(),
  priority: z.enum(['ROUTINE', 'URGENT', 'ASAP', 'STAT']).optional(),
  imagingModality: z.string().optional(),
  imagingBodySite: z.string().optional(),
});

export type InvestigationFormData = z.infer<typeof investigationSchema>;

interface InvestigationFormProps {
  encounterId: string;
  investigationId?: string;
  initialData?: Partial<InvestigationFormData>;
  onSuccess?: () => void;
  isLoading?: boolean;
}

export const InvestigationForm: React.FC<InvestigationFormProps> = ({
  encounterId,
  investigationId,
  initialData,
  onSuccess,
  isLoading: externalLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvestigationFormData>({
    resolver: zodResolver(investigationSchema),
    defaultValues: {
      investigationType: 'LABORATORY',
      priority: 'ROUTINE',
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        investigationType: initialData.investigationType ?? 'LABORATORY',
        priority: initialData.priority ?? 'ROUTINE',
        ...initialData,
      });
    }
  }, [initialData, reset]);

  const createMutation = useCreateInvestigation();
  const updateMutation = investigationId ? useUpdateInvestigation(investigationId) : null;

  const createStatus = useMutationStatus(createMutation);
  const updateStatus = updateMutation ? useMutationStatus(updateMutation) : null;

  const onSubmit = async (data: InvestigationFormData) => {
    const payload = {
      ...data,
      encounterId,
    };

    if (investigationId && updateMutation) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
      reset({ investigationType: 'LABORATORY', priority: 'ROUTINE' } as InvestigationFormData);
    }

    onSuccess?.();
  };

  const isSubmitting = createStatus.isLoading || updateStatus?.isLoading || false;
  const type = watch('investigationType');

  if (externalLoading) {
    return <LoadingState count={4} height={48} message="Loading investigation form..." />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {investigationId ? 'Edit Investigation' : 'Add Investigation'}
        </h2>
        {isSubmitting && <span className="text-sm text-gray-500">Saving...</span>}
      </div>

      {Object.keys(errors).length > 0 && (
        <ValidationError
          errors={Object.fromEntries(
            Object.entries(errors).map(([key, value]) => [key, value?.message ?? 'Invalid field'])
          )}
        />
      )}

      {createStatus.isError && (
        <ErrorState
          title="Unable to create investigation"
          error={createStatus.error as Error}
          onRetry={() => createMutation.reset()}
        />
      )}

      {updateStatus?.isError && (
        <ErrorState
          title="Unable to update investigation"
          error={updateStatus.error as Error}
          onRetry={() => updateMutation?.reset()}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Investigation Type *</label>
          <select
            {...register('investigationType')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="LABORATORY">Laboratory</option>
            <option value="IMAGING">Imaging</option>
            <option value="PATHOLOGY">Pathology</option>
            <option value="PROCEDURE">Procedure</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
          <select
            {...register('priority')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="ROUTINE">Routine</option>
            <option value="URGENT">Urgent</option>
            <option value="ASAP">ASAP</option>
            <option value="STAT">STAT</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">LOINC Code</label>
          <input
            type="text"
            {...register('loincCode')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 4548-4"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">SNOMED Code</label>
          <input
            type="text"
            {...register('snomedCode')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 123456"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Investigation Name *</label>
        <input
          type="text"
          {...register('name')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Complete Blood Count"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter description or clinical notes"
          disabled={isSubmitting}
        />
      </div>

      {type === 'IMAGING' && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Imaging Modality</label>
            <input
              type="text"
              {...register('imagingModality')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., MRI, CT, Ultrasound"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Body Site</label>
            <input
              type="text"
              {...register('imagingBodySite')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Brain, Abdomen"
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Saving...' : investigationId ? 'Update Investigation' : 'Add Investigation'}
        </button>
        <button
          type="button"
          onClick={() => reset(initialData)}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default InvestigationForm;
