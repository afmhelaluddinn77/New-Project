import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const resultsSchema = z.object({
  resultValue: z.string().min(1, 'Result value is required'),
  resultUnit: z.string().optional(),
  referenceRange: z.string().optional(),
  interpretation: z.string().optional(),
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
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., mg/dL"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference Range</label>
          <input
            type="text"
            {...register('referenceRange')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 70-100"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Interpretation</label>
        <select
          {...register('interpretation')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional notes"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:bg-gray-400 transition"
      >
        {isLoading ? 'Saving...' : 'Save Results'}
      </button>
    </form>
  );
};

export default ResultsEntry;
