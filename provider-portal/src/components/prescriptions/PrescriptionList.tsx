import React, { useMemo, useState } from 'react';
import { usePrescriptionsByEncounter } from '@/hooks/useEncounterQueries';
import { LoadingState, SkeletonCard } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorBoundary';
import { SkeletonTable } from '@/components/shared/LoadingState';

interface PrescriptionListProps {
  encounterId: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * PrescriptionList Component
 * Displays list of prescriptions for an encounter
 */
const RxRow: React.FC<{
  rx: any;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}> = React.memo(({ rx, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="border border-gray-200 px-4 py-2 text-sm">
        <div className="font-medium text-gray-900">{rx.genericName}</div>
        {rx.brandName && <div className="text-xs text-gray-500">{rx.brandName}</div>}
      </td>
      <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">
        {rx.dosage} {rx.dosageForm}
      </td>
      <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">{rx.frequency}</td>
      <td className="border border-gray-200 px-4 py-2 text-sm">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rx.status || '')}`}>
          {rx.status || 'PENDING'}
        </span>
      </td>
      <td className="border border-gray-200 px-4 py-2 text-sm space-x-2">
        {onEdit && (
          <button onClick={() => onEdit(rx.id)} className="text-blue-600 hover:text-blue-800 font-medium">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(rx.id)} className="text-red-600 hover:text-red-800 font-medium">
            Delete
          </button>
        )}
      </td>
    </tr>
  );
});

export const PrescriptionList: React.FC<PrescriptionListProps> = ({
  encounterId,
  onEdit,
  onDelete,
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'name'>('date');
  const { data: prescriptions, isLoading, error, refetch } = usePrescriptionsByEncounter(encounterId);

  if (isLoading) {
    return <SkeletonTable rows={5} columns={5} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No prescriptions found for this encounter</p>
      </div>
    );
  }

  const sortedPrescriptions = useMemo(() => {
    return [...prescriptions].sort((a, b) => {
      switch (sortBy) {
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'name':
          return (a.genericName || '').localeCompare(b.genericName || '');
        case 'date':
        default:
          return 0;
      }
    });
  }, [prescriptions, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Prescriptions</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="status">Sort by Status</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold">
                Medication
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold">
                Dosage
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold">
                Frequency
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold">
                Status
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPrescriptions.map((rx) => (
              <RxRow key={rx.id} rx={rx} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-500">
        Showing {sortedPrescriptions.length} prescription{sortedPrescriptions.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
