import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MedicationSearch } from '@/components/medications/MedicationSearch';

jest.mock('@/hooks/useEncounterQueries', () => ({
  useSearchMedications: () => ({
    data: [
      { id: 'm1', genericName: 'Aspirin', brandName: 'Bayer', rxNormCode: '123' },
    ],
    isLoading: false,
  }),
}));

describe('MedicationSearch', () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  it('renders search and results', () => {
    render(
      <QueryClientProvider client={qc}>
        <MedicationSearch onSelect={() => {}} />
      </QueryClientProvider>
    );
    expect(screen.getByPlaceholderText(/search medications/i)).toBeInTheDocument();
  });
});
