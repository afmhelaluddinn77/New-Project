import React from 'react';

interface Prescription {
  id: string;
  encounterId: string;
  genericName: string;
  brandName?: string;
  dosage: string;
  dosageForm: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills?: number;
  instructions?: string;
  indication?: string;
  status: string;
  createdAt?: string;
}

interface PrescriptionDetailProps {
  prescription: Prescription;
  onEdit?: () => void;
  onDispense?: () => void;
  onPrint?: () => void;
}

/**
 * PrescriptionDetail Component
 * Displays detailed view of a prescription
 */
export const PrescriptionDetail: React.FC<PrescriptionDetailProps> = ({
  prescription,
  onEdit,
  onDispense,
  onPrint,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{prescription.genericName}</h2>
          {prescription.brandName && (
            <p className="text-sm text-gray-600">{prescription.brandName}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          prescription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          prescription.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {prescription.status}
        </span>
      </div>

      {/* Dosage Information */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">Dosage</p>
          <p className="text-lg font-medium text-gray-900">{prescription.dosage}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">Form</p>
          <p className="text-lg font-medium text-gray-900">{prescription.dosageForm}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">Route</p>
          <p className="text-lg font-medium text-gray-900">{prescription.route}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">Frequency</p>
          <p className="text-lg font-medium text-gray-900">{prescription.frequency}</p>
        </div>
      </div>

      {/* Duration and Quantity */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">Duration</p>
          <p className="text-lg font-medium text-gray-900">{prescription.duration}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">Quantity</p>
          <p className="text-lg font-medium text-gray-900">{prescription.quantity}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">Refills</p>
          <p className="text-lg font-medium text-gray-900">{prescription.refills ?? 0}</p>
        </div>
        {prescription.createdAt && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Created</p>
            <p className="text-lg font-medium text-gray-900">
              {new Date(prescription.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Indication */}
      {prescription.indication && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Indication</p>
          <p className="text-gray-600">{prescription.indication}</p>
        </div>
      )}

      {/* Instructions */}
      {prescription.instructions && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Special Instructions</p>
          <p className="text-gray-600">{prescription.instructions}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Edit
          </button>
        )}
        {onDispense && (
          <button
            onClick={onDispense}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Dispense
          </button>
        )}
        {onPrint && (
          <button
            onClick={onPrint}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            Print
          </button>
        )}
      </div>
    </div>
  );
};
