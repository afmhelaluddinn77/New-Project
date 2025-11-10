import React, { useMemo, useState } from 'react';
import { useInvestigationsByEncounter } from '@/hooks/useEncounterQueries';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorBoundary';

interface InvestigationListProps {
  encounterId: string;
  onSelect?: (investigationId: string) => void;
  onEdit?: (investigationId: string) => void;
  onDelete?: (investigationId: string) => void;
}

const statusColors: Record<string, string> = {
  ORDERED: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const typeLabels: Record<string, string> = {
  LABORATORY: 'Laboratory',
  IMAGING: 'Imaging',
  PATHOLOGY: 'Pathology',
  PROCEDURE: 'Procedure',
};

export const InvestigationList: React.FC<InvestigationListProps> = ({
  encounterId,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error, refetch } = useInvestigationsByEncounter(encounterId);

  const filteredInvestigations = useMemo(() => {
    if (!data) return [];

    return data
      .filter((investigation: any) => {
        if (filterType !== 'ALL' && investigation.investigationType !== filterType) {
          return false;
        }
        if (
          searchTerm &&
          !investigation.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) &&
          !(investigation.loincCode || '').toLowerCase().includes(searchTerm.trim().toLowerCase()) &&
          !(investigation.snomedCode || '').toLowerCase().includes(searchTerm.trim().toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? 0).getTime();
        return dateB - dateA;
      });
  }, [data, filterType, searchTerm]);

  if (isLoading) {
    return <LoadingState count={4} height={64} message="Loading investigations..." />;
  }

  if (error) {
    return <ErrorState error={error as Error} onRetry={() => refetch()} />;
  }

  if (!filteredInvestigations.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
        No investigations found. Use the form above to create one.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All types</option>
            <option value="LABORATORY">Laboratory</option>
            <option value="IMAGING">Imaging</option>
            <option value="PATHOLOGY">Pathology</option>
            <option value="PROCEDURE">Procedure</option>
          </select>
        </div>

        <div className="md:w-64">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or code"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredInvestigations.map((investigation: any) => (
          <button
            key={investigation.id}
            type="button"
            onClick={() => onSelect?.(investigation.id)}
            className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{investigation.name}</h3>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {typeLabels[investigation.investigationType] ?? investigation.investigationType}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                  {investigation.loincCode && <span>LOINC: {investigation.loincCode}</span>}
                  {investigation.snomedCode && <span>SNOMED: {investigation.snomedCode}</span>}
                  {investigation.priority && <span>Priority: {investigation.priority}</span>}
                </div>
                {investigation.description && (
                  <p className="mt-3 text-sm text-gray-700">{investigation.description}</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    statusColors[investigation.status || 'ORDERED'] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {investigation.status ?? 'ORDERED'}
                </span>

                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(investigation.id);
                      }}
                      className="rounded-md border border-gray-200 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(investigation.id);
                      }}
                      className="rounded-md border border-gray-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InvestigationList;
