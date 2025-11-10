import React, { useState, useDeferredValue, useCallback } from 'react';
import { useSearchMedications } from '@/hooks/useEncounterQueries';
import { LoadingState } from '@/components/shared/LoadingState';

interface MedicationSearchProps {
  onSelect: (medication: any) => void;
}

export const MedicationSearch: React.FC<MedicationSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { data: results, isLoading } = useSearchMedications(deferredQuery, deferredQuery.length > 1);

  const handleSelect = useCallback((medication: any) => {
    onSelect(medication);
    setQuery('');
  }, [onSelect]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search medications by name or code..."
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {isLoading && deferredQuery && (
        <LoadingState count={3} height={40} message="Searching medications..." />
      )}

      {results && results.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {results.map((med: any) => (
            <button
              key={med.id}
              onClick={() => handleSelect(med)}
              className="w-full rounded-md border border-gray-200 bg-white p-3 text-left hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{med.genericName}</p>
                  {med.brandName && (
                    <p className="text-sm text-gray-600">{med.brandName}</p>
                  )}
                  {med.rxNormCode && (
                    <p className="text-xs text-gray-500 mt-1">RxNorm: {med.rxNormCode}</p>
                  )}
                </div>
                {med.strength && (
                  <span className="ml-2 text-sm font-medium text-blue-600">{med.strength}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {deferredQuery && results && results.length === 0 && !isLoading && (
        <div className="text-center py-4 text-gray-500">
          <p>No medications found matching "{deferredQuery}"</p>
        </div>
      )}

      {!deferredQuery && (
        <div className="text-center py-4 text-gray-500">
          <p>Start typing to search medications</p>
        </div>
      )}
    </div>
  );
};

export default MedicationSearch;
