import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlternativesList } from '@/components/medications/AlternativesList';

jest.mock('@/hooks/useEncounterQueries', () => ({
  useGetMedicationAlternatives: () => ({
    data: [
      { id: 'a1', genericName: 'Ibuprofen', efficacy: 'SIMILAR', reason: 'Comparable efficacy' },
    ],
    isLoading: false,
    error: null,
  }),
}));

describe('AlternativesList', () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  it('renders alternatives', () => {
    render(
      <QueryClientProvider client={qc}>
        <AlternativesList rxNormCode="123" />
      </QueryClientProvider>
    );
    expect(screen.getByText(/alternative medications/i)).toBeInTheDocument();
    expect(screen.getByText(/ibuprofen/i)).toBeInTheDocument();
  });
});
