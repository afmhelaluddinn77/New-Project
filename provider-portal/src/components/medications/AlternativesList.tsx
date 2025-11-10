import React from 'react';
import { useGetMedicationAlternatives } from '@/hooks/useEncounterQueries';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorBoundary';

interface Alternative {
  id: string;
  genericName: string;
  brandName?: string;
  rxNormCode?: string;
  strength?: string;
  reason: string;
  efficacy: 'SIMILAR' | 'BETTER' | 'LOWER';
  cost?: string;
}

interface AlternativesListProps {
  rxNormCode: string | null;
  onSelect?: (alternative: Alternative) => void;
}

export const AlternativesList: React.FC<AlternativesListProps> = ({ rxNormCode, onSelect }) => {
  const { data: alternatives, isLoading, error } = useGetMedicationAlternatives(rxNormCode);

  if (!rxNormCode) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
        <p>Select a medication to view alternatives</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState count={3} height={60} message="Loading alternatives..." />;
  }

  if (error) {
    return <ErrorState error={error as Error} />;
  }

  if (!alternatives || alternatives.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
        <p>No alternatives available for this medication</p>
      </div>
    );
  }

  const getEfficacyColor = (efficacy: string) => {
    switch (efficacy) {
      case 'BETTER':
        return 'bg-green-100 text-green-800';
      case 'SIMILAR':
        return 'bg-blue-100 text-blue-800';
      case 'LOWER':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Alternative Medications</h3>
        <span className="text-sm text-gray-600">{alternatives.length} option(s)</span>
      </div>

      <div className="space-y-3">
        {alternatives.map((alt: Alternative) => (
          <button
            key={alt.id}
            onClick={() => onSelect?.(alt)}
            className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-blue-300 hover:bg-blue-50 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{alt.genericName}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getEfficacyColor(alt.efficacy)}`}>
                    {alt.efficacy}
                  </span>
                </div>

                {alt.brandName && (
                  <p className="text-sm text-gray-600 mt-1">{alt.brandName}</p>
                )}

                <p className="text-sm text-gray-700 mt-2">{alt.reason}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {alt.strength && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {alt.strength}
                    </span>
                  )}
                  {alt.cost && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {alt.cost}
                    </span>
                  )}
                  {alt.rxNormCode && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      RxNorm: {alt.rxNormCode}
                    </span>
                  )}
                </div>
              </div>

              {onSelect && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(alt);
                  }}
                  className="ml-4 rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                  Select
                </button>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlternativesList;
