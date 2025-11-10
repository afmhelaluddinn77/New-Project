import React, { useState } from 'react';

interface DispenseData {
  pharmacyId: string;
  quantity: number;
  dispensedDate: string;
  notes?: string;
}

interface DispensePrescriptionModalProps {
  prescriptionId: string;
  isOpen: boolean;
  onClose: () => void;
  onDispense: (data: DispenseData) => Promise<void>;
}

/**
 * DispensePrescriptionModal Component
 * Modal for dispensing prescriptions
 */
export const DispensePrescriptionModal: React.FC<DispensePrescriptionModalProps> = ({
  prescriptionId,
  isOpen,
  onClose,
  onDispense,
}) => {
  const [formData, setFormData] = useState<DispenseData>({
    pharmacyId: '',
    quantity: 1,
    dispensedDate: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onDispense(formData);
      onClose();
      // Reset form
      setFormData({
        pharmacyId: '',
        quantity: 1,
        dispensedDate: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispense prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Dispense Prescription</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pharmacy ID *
            </label>
            <input
              type="text"
              value={formData.pharmacyId}
              onChange={(e) => setFormData({ ...formData, pharmacyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter pharmacy ID"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispensed Date *
            </label>
            <input
              type="date"
              value={formData.dispensedDate}
              onChange={(e) => setFormData({ ...formData, dispensedDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Optional notes"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Dispensing...' : 'Dispense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
