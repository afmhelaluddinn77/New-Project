/**
 * Lab Result Detail Page
 * 
 * Displays comprehensive lab test results with:
 * - Test-specific formatting (CBC, CMP, Lipid Panel, etc.)
 * - Reference ranges and abnormal flags
 * - Historical comparison
 * - Trend visualization
 * - Print-ready layout
 */

import React from 'react';
import { useParams } from 'react-router-dom';

// Mock data for demonstration (will be replaced with API call)
const mockCBCResult = {
  id: 'bbdd4460-999e-49d4-924a-11ae90505242',
  orderId: 'LAB-20251111112114-FMQE6',
  workflowOrderId: 'WF-20251111112114-WEHZZ',
  patientId: 'P003',
  encounterId: 'ENC003',
  testCode: '24323-8', // LOINC code for CBC
  testName: 'Complete Blood Count (CBC)',
  status: 'FINAL',
  performedAt: '2025-11-11T17:23:00Z',
  resultedAt: '2025-11-11T17:23:59Z',
  performingLab: 'Central Clinical Laboratory',
  verifiedBy: 'Dr. Jane Smith, Lab Tech #3',
  interpretation: 'All values within normal limits. No abnormal findings. Patient\'s CBC is unremarkable. Continue routine follow-up as needed.',
  components: [
    {
      code: '6690-2',
      name: 'White Blood Cells',
      displayName: 'WBC',
      value: '7.2',
      numericValue: 7.2,
      unit: 'x10^9/L',
      referenceRangeLow: 4.0,
      referenceRangeHigh: 10.0,
      referenceRangeText: '4.0 - 10.0',
      interpretation: 'N', // Normal
      trend: 'UP', // Slightly increased from last test
    },
    {
      code: '789-8',
      name: 'Red Blood Cells',
      displayName: 'RBC',
      value: '4.5',
      numericValue: 4.5,
      unit: 'x10^12/L',
      referenceRangeLow: 4.5,
      referenceRangeHigh: 5.5,
      referenceRangeText: '4.5 - 5.5',
      interpretation: 'N',
      trend: 'STABLE',
    },
    {
      code: '718-7',
      name: 'Hemoglobin',
      displayName: 'Hgb',
      value: '13.5',
      numericValue: 13.5,
      unit: 'g/dL',
      referenceRangeLow: 12.0,
      referenceRangeHigh: 16.0,
      referenceRangeText: '12.0 - 16.0',
      interpretation: 'N',
      trend: 'STABLE',
    },
    {
      code: '4544-3',
      name: 'Hematocrit',
      displayName: 'Hct',
      value: '40.0',
      numericValue: 40.0,
      unit: '%',
      referenceRangeLow: 37.0,
      referenceRangeHigh: 47.0,
      referenceRangeText: '37.0 - 47.0',
      interpretation: 'N',
      trend: 'DOWN', // Slightly decreased
    },
    {
      code: '777-3',
      name: 'Platelets',
      displayName: 'PLT',
      value: '250',
      numericValue: 250,
      unit: 'x10^9/L',
      referenceRangeLow: 150,
      referenceRangeHigh: 400,
      referenceRangeText: '150 - 400',
      interpretation: 'N',
      trend: 'UP',
    },
  ],
  historicalResults: [
    {
      date: '2025-10-15T10:00:00Z',
      components: {
        'WBC': 6.8,
        'RBC': 4.6,
        'Hgb': 13.3,
        'Hct': 39.5,
        'PLT': 245,
      }
    },
    {
      date: '2025-09-20T09:30:00Z',
      components: {
        'WBC': 7.0,
        'RBC': 4.5,
        'Hgb': 13.4,
        'Hct': 40.2,
        'PLT': 240,
      }
    },
    {
      date: '2025-08-15T14:15:00Z',
      components: {
        'WBC': 6.5,
        'RBC': 4.4,
        'Hgb': 13.1,
        'Hct': 39.0,
        'PLT': 235,
      }
    },
  ],
};

// Status badge component
const StatusBadge: React.FC<{ interpretation: string }> = ({ interpretation }) => {
  const config = {
    'N': { label: '✓ Normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    'L': { label: '↓ Low', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    'H': { label: '↑ High', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    'LL': { label: '↓↓ Critical Low', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    'HH': { label: '↑↑ Critical High', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    'A': { label: '⚠ Abnormal', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  }[interpretation] || { label: interpretation, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bg} border ${config.border}`}>
      {config.label}
    </span>
  );
};

// Trend indicator component
const TrendIndicator: React.FC<{ trend: string }> = ({ trend }) => {
  const config = {
    'UP': { symbol: '↑──', color: 'text-blue-500', label: 'Increasing' },
    'DOWN': { symbol: '↓──', color: 'text-orange-500', label: 'Decreasing' },
    'STABLE': { symbol: '───', color: 'text-gray-400', label: 'Stable' },
    'RECENT_UP': { symbol: '──↑', color: 'text-blue-500', label: 'Recently increased' },
    'RECENT_DOWN': { symbol: '──↓', color: 'text-orange-500', label: 'Recently decreased' },
  }[trend] || { symbol: '───', color: 'text-gray-400', label: 'Unknown' };

  return (
    <span className={`text-sm font-mono ${config.color}`} title={config.label}>
      {config.symbol}
    </span>
  );
};

// Main component
export const LabResultDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const result = mockCBCResult; // In real app, fetch from API based on orderId

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{result.testName}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Patient: <span className="font-medium">#{result.patientId}</span> | 
                  Encounter: <span className="font-medium">{result.encounterId}</span> | 
                  DOB: <span className="font-medium">01/15/1980</span>
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                  📄 Print Report
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                  📥 Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Test Information */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">📋 Test Information</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Order ID</dt>
                <dd className="text-gray-900 font-medium">{result.orderId}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Workflow Order</dt>
                <dd className="text-gray-900 font-medium">{result.workflowOrderId}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Performed</dt>
                <dd className="text-gray-900 font-medium">{formatDate(result.performedAt)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Resulted</dt>
                <dd className="text-gray-900 font-medium">{formatDate(result.resultedAt)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Lab</dt>
                <dd className="text-gray-900 font-medium">{result.performingLab}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Verified By</dt>
                <dd className="text-gray-900 font-medium">{result.verifiedBy}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    ✓ {result.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Results Table */}
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">📊 Test Results</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference Range
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.components.map((component, index) => (
                    <tr key={component.code} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{component.displayName}</div>
                        <div className="text-xs text-gray-500">{component.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{component.value}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {component.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {component.referenceRangeText}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge interpretation={component.interpretation} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TrendIndicator trend={component.trend} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interpretation */}
          <div className="px-6 py-5 bg-blue-50 border-t border-blue-100">
            <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2">📝 Clinical Interpretation</h2>
            <p className="text-sm text-blue-800 leading-relaxed">
              {result.interpretation}
            </p>
          </div>

          {/* Historical Comparison */}
          <div className="px-6 py-5 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              📈 Historical Comparison (Last {result.historicalResults.length + 1} Results)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {formatDateShort(result.resultedAt)}
                      <div className="text-xs font-normal text-emerald-600 mt-1">Current</div>
                    </th>
                    {result.historicalResults.map((historical) => (
                      <th key={historical.date} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {formatDateShort(historical.date)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.components.map((component, index) => (
                    <tr key={component.code} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {component.displayName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-emerald-700">
                        {component.value}
                      </td>
                      {result.historicalResults.map((historical) => (
                        <td key={historical.date} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                          {historical.components[component.displayName] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>💡 <strong>Tip:</strong> Values in green represent the most recent result. Compare trends over time to monitor patient progress.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              ← Back to Results
            </button>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700">
                📝 Add Clinical Note
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                🔔 Set Alert
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> This is a demonstration of the lab results display system based on international EMR standards (Epic, Cerner, HL7 FHIR). 
                The actual implementation will integrate with the lab service API and support multiple test types (CMP, Lipid Panel, Thyroid Panel, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabResultDetailPage;

