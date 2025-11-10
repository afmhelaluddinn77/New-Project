import React, { useState, useCallback } from 'react';

interface SearchResult {
  id: string;
  loincCode?: string;
  snomedCode?: string;
  name: string;
  description?: string;
  type: string;
}

interface InvestigationSearchProps {
  onSelect: (result: SearchResult) => void;
  isLoading?: boolean;
}

export const InvestigationSearch: React.FC<InvestigationSearchProps> = ({
  onSelect,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'loinc' | 'snomed'>('name');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Mock search results - replace with actual API call
      const mockResults: SearchResult[] = [
        {
          id: '1',
          name: 'Complete Blood Count',
          loincCode: '85025-9',
          type: 'LABORATORY',
          description: 'CBC with differential',
        },
        {
          id: '2',
          name: 'Chest X-Ray',
          snomedCode: '71045-1',
          type: 'IMAGING',
          description: 'Frontal and lateral chest radiograph',
        },
      ];
      setResults(mockResults.filter((r) =>
        searchType === 'name'
          ? r.name.toLowerCase().includes(query.toLowerCase())
          : searchType === 'loinc'
            ? r.loincCode?.includes(query)
            : r.snomedCode?.includes(query)
      ));
    } finally {
      setIsSearching(false);
    }
  }, [searchType]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Search Investigations</h3>

      <div className="flex gap-2">
        <select
          value={searchType}
          onChange={(e) => {
            setSearchType(e.target.value as any);
            setResults([]);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isSearching}
        >
          <option value="name">By Name</option>
          <option value="loinc">By LOINC</option>
          <option value="snomed">By SNOMED</option>
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Search by ${searchType}...`}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isSearching}
        />

        <button
          onClick={() => handleSearch(searchQuery)}
          disabled={isLoading || isSearching}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => onSelect(result)}
              className="w-full rounded-md border border-gray-200 bg-white p-3 text-left hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{result.name}</p>
                  {result.description && (
                    <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                  )}
                  <div className="flex gap-2 mt-2 text-xs text-gray-500">
                    {result.loincCode && <span>LOINC: {result.loincCode}</span>}
                    {result.snomedCode && <span>SNOMED: {result.snomedCode}</span>}
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{result.type}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchQuery && results.length === 0 && !isSearching && (
        <div className="text-center py-4 text-gray-500">
          <p>No investigations found matching your search</p>
        </div>
      )}
    </div>
  );
};

export default InvestigationSearch;
