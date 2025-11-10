import React from 'react';

interface Investigation {
  id: string;
  encounterId: string;
  investigationType: string;
  name: string;
  loincCode?: string;
  snomedCode?: string;
  priority?: string;
  status: string;
  description?: string;
  resultValue?: string;
  resultUnit?: string;
  referenceRange?: string;
  interpretation?: string;
  createdAt?: string;
  completedAt?: string;
}

interface InvestigationDetailProps {
  investigation: Investigation;
  onEdit?: () => void;
  onAddResults?: () => void;
  onDelete?: () => void;
}

export const InvestigationDetail: React.FC<InvestigationDetailProps> = ({
  investigation,
  onEdit,
  onAddResults,
  onDelete,
}) => {
  const hasResults = !!investigation.resultValue;

  const statusColor = {
    COMPLETED: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    ORDERED: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }[investigation.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{investigation.name}</h2>
          <p className="mt-1 text-sm text-gray-600">{investigation.investigationType}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusColor}`}>
          {investigation.status}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {investigation.loincCode && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">LOINC Code</p>
            <p className="text-lg font-medium text-gray-900">{investigation.loincCode}</p>
          </div>
        )}
        {investigation.snomedCode && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">SNOMED Code</p>
            <p className="text-lg font-medium text-gray-900">{investigation.snomedCode}</p>
          </div>
        )}
        {investigation.priority && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Priority</p>
            <p className="text-lg font-medium text-gray-900">{investigation.priority}</p>
          </div>
        )}
      </div>

      {investigation.description && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
          <p className="text-gray-600">{investigation.description}</p>
        </div>
      )}

      {hasResults && (
        <div className="rounded-lg bg-green-50 p-4">
          <h3 className="font-semibold text-green-900 mb-3">Results</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {investigation.resultValue && (
              <div>
                <p className="text-sm text-green-700">Value</p>
                <p className="text-lg font-medium text-green-900">
                  {investigation.resultValue} {investigation.resultUnit || ''}
                </p>
              </div>
            )}
            {investigation.referenceRange && (
              <div>
                <p className="text-sm text-green-700">Reference Range</p>
                <p className="text-lg font-medium text-green-900">{investigation.referenceRange}</p>
              </div>
            )}
            {investigation.interpretation && (
              <div className="md:col-span-2">
                <p className="text-sm text-green-700">Interpretation</p>
                <p className="text-lg font-medium text-green-900">{investigation.interpretation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3 border-t pt-4">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Edit
          </button>
        )}
        {onAddResults && !hasResults && (
          <button
            onClick={onAddResults}
            className="flex-1 rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
          >
            Add Results
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded-md border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default InvestigationDetail;
