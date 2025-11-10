import React from 'react';

interface Medication {
  id: string;
  genericName: string;
  brandName?: string;
  rxNormCode?: string;
  strength?: string;
  form?: string;
  route?: string;
  manufacturer?: string;
  indication?: string;
  contraindications?: string[];
  sideEffects?: string[];
  interactions?: string[];
  dosageInfo?: string;
}

interface MedicationDetailProps {
  medication: Medication;
  onEdit?: () => void;
  onDelete?: () => void;
  onCheckInteractions?: () => void;
}

export const MedicationDetail: React.FC<MedicationDetailProps> = ({
  medication,
  onEdit,
  onDelete,
  onCheckInteractions,
}) => {
  return (
    <div className="space-y-6 rounded-lg border bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{medication.genericName}</h2>
          {medication.brandName && (
            <p className="mt-1 text-sm text-gray-600">{medication.brandName}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {medication.strength && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Strength</p>
            <p className="text-lg font-medium text-gray-900">{medication.strength}</p>
          </div>
        )}
        {medication.form && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Form</p>
            <p className="text-lg font-medium text-gray-900">{medication.form}</p>
          </div>
        )}
        {medication.route && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Route</p>
            <p className="text-lg font-medium text-gray-900">{medication.route}</p>
          </div>
        )}
        {medication.rxNormCode && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">RxNorm Code</p>
            <p className="text-lg font-medium text-gray-900">{medication.rxNormCode}</p>
          </div>
        )}
      </div>

      {medication.indication && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Indication</p>
          <p className="text-gray-600">{medication.indication}</p>
        </div>
      )}

      {medication.dosageInfo && (
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Dosage Information</p>
          <p className="text-blue-800">{medication.dosageInfo}</p>
        </div>
      )}

      {medication.sideEffects && medication.sideEffects.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Common Side Effects</p>
          <ul className="space-y-1">
            {medication.sideEffects.map((effect, idx) => (
              <li key={idx} className="text-sm text-gray-600 flex items-start">
                <span className="mr-2">•</span>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {medication.contraindications && medication.contraindications.length > 0 && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900 mb-2">Contraindications</p>
          <ul className="space-y-1">
            {medication.contraindications.map((contra, idx) => (
              <li key={idx} className="text-sm text-red-800 flex items-start">
                <span className="mr-2">⚠</span>
                <span>{contra}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 border-t pt-4">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition"
          >
            Edit
          </button>
        )}
        {onCheckInteractions && (
          <button
            onClick={onCheckInteractions}
            className="flex-1 rounded-md bg-yellow-600 px-4 py-2 font-medium text-white hover:bg-yellow-700 transition"
          >
            Check Interactions
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded-md border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-50 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default MedicationDetail;
