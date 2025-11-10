import React from 'react';
import { useGetMedicationContraindications } from '@/hooks/useEncounterQueries';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorBoundary';

interface Contraindication {
  id: string;
  condition: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CONTRAINDICATED';
  description: string;
  recommendation: string;
}

interface ContraindicationsListProps {
  rxNormCode: string | null;
}

export const ContraindicationsList: React.FC<ContraindicationsListProps> = ({ rxNormCode }) => {
  const { data: contraindications, isLoading, error } = useGetMedicationContraindications(rxNormCode);

  if (!rxNormCode) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
        <p>Select a medication to view contraindications</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState count={3} height={60} message="Loading contraindications..." />;
  }

  if (error) {
    return <ErrorState error={error as Error} />;
  }

  if (!contraindications || contraindications.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-green-800 font-semibold">✓ No contraindications found</p>
        <p className="text-sm text-green-700 mt-1">This medication is safe for general use.</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CONTRAINDICATED':
        return 'border-red-300 bg-red-50 text-red-800';
      case 'SEVERE':
        return 'border-orange-300 bg-orange-50 text-orange-800';
      case 'MODERATE':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      case 'MILD':
        return 'border-blue-300 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Contraindications</h3>
        <span className="text-sm text-gray-600">{contraindications.length} condition(s)</span>
      </div>

      <div className="space-y-3">
        {contraindications.map((contra: Contraindication) => (
          <div
            key={contra.id}
            className={`rounded-lg border-l-4 p-4 ${getSeverityColor(contra.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{contra.condition}</h4>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium">
                    {contra.severity}
                  </span>
                </div>
                <p className="mt-2 text-sm">{contra.description}</p>
                <div className="mt-3 rounded-md bg-white/50 p-2">
                  <p className="text-sm font-medium">
                    <span className="font-semibold">Recommendation:</span> {contra.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContraindicationsList;
