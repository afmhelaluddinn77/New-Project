import React from 'react';

interface MedicationSummary {
  id: string;
  genericName: string;
  rxNormCode?: string;
}

interface InteractionDetail {
  medication1: string;
  medication2: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  description: string;
  recommendation: string;
}

interface InteractionCheckerProps {
  medications: MedicationSummary[];
  interactions: InteractionDetail[];
  onAcknowledge?: (index: number) => void;
}

const severityClasses: Record<InteractionDetail['severity'], string> = {
  MINOR: 'border-blue-200 bg-blue-50 text-blue-800',
  MODERATE: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  SEVERE: 'border-red-200 bg-red-50 text-red-800',
};

export const InteractionChecker: React.FC<InteractionCheckerProps> = ({
  medications,
  interactions,
  onAcknowledge,
}) => {
  if (!interactions.length) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-green-800 font-semibold">No drug interactions detected</p>
        {medications.length > 0 && (
          <p className="mt-1 text-sm text-green-700">
            Checked {medications.length} medication{medications.length === 1 ? '' : 's'}.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Drug Interactions</h3>
        <span className="text-sm text-gray-500">{interactions.length} alert{interactions.length === 1 ? '' : 's'}</span>
      </div>

      {interactions.map((interaction, index) => (
        <div
          key={`${interaction.medication1}-${interaction.medication2}-${index}`}
          className={`rounded-lg border-l-4 p-4 ${severityClasses[interaction.severity]}`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  {interaction.medication1} + {interaction.medication2}
                </p>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium">
                  {interaction.severity}
                </span>
              </div>
              <p className="mt-2 text-sm">{interaction.description}</p>
              <p className="mt-3 text-sm font-medium">
                Recommendation: <span className="font-normal">{interaction.recommendation}</span>
              </p>
            </div>

            {onAcknowledge && (
              <button
                type="button"
                onClick={() => onAcknowledge(index)}
                className="self-start rounded-md border border-current px-3 py-1 text-sm font-medium hover:bg-white/40"
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InteractionChecker;
