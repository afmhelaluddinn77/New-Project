import React, { useState } from 'react';
import { useCheckMedicationAllergies } from '@/hooks/useEncounterQueries';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorBoundary';

interface Allergy {
  id: string;
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reaction: string;
  dateReported?: string;
}

interface AllergyCheckerProps {
  patientId: string;
  medications: string[];
  allergies?: Allergy[];
}

export const AllergyChecker: React.FC<AllergyCheckerProps> = ({
  patientId,
  medications,
  allergies = [],
}) => {
  const [showResults, setShowResults] = useState(false);
  const checkAllergies = useCheckMedicationAllergies();

  const handleCheck = async () => {
    await checkAllergies.mutateAsync({
      patientId,
      medications,
    });
    setShowResults(true);
  };

  if (checkAllergies.isPending) {
    return <LoadingState count={2} height={40} message="Checking allergies..." />;
  }

  if (checkAllergies.isError) {
    return (
      <ErrorState
        error={checkAllergies.error as Error}
        onRetry={() => checkAllergies.reset()}
      />
    );
  }

  const allergyMatches = checkAllergies.data?.matches || [];
  const hasAllergyMatches = allergyMatches.length > 0;

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Allergy Check</h3>
        <button
          onClick={handleCheck}
          disabled={medications.length === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          Check Allergies
        </button>
      </div>

      {showResults && !hasAllergyMatches && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-green-800 font-semibold">✓ No allergy conflicts detected</p>
          <p className="text-sm text-green-700 mt-1">
            Checked {medications.length} medication(s) against {allergies.length} allergy record(s).
          </p>
        </div>
      )}

      {showResults && hasAllergyMatches && (
        <div className="space-y-3">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800 font-semibold">⚠ Allergy Conflict Detected</p>
            <p className="text-sm text-red-700 mt-1">
              {allergyMatches.length} potential allergy conflict(s) found.
            </p>
          </div>

          {allergyMatches.map((match: any, idx: number) => (
            <div key={idx} className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-red-900">
                    {match.medication} + {match.allergen}
                  </p>
                  <p className="text-sm text-red-800 mt-1">{match.reaction}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      match.severity === 'SEVERE'
                        ? 'bg-red-200 text-red-800'
                        : match.severity === 'MODERATE'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-blue-200 text-blue-800'
                    }`}>
                      {match.severity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {medications.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>No medications selected for allergy check</p>
        </div>
      )}
    </div>
  );
};

export default AllergyChecker;
