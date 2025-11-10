import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContraindicationsList } from '@/components/medications/ContraindicationsList';

jest.mock('@/hooks/useEncounterQueries', () => ({
  useGetMedicationContraindications: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

describe('ContraindicationsList', () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  it('renders no contraindications message', () => {
    render(
      <QueryClientProvider client={qc}>
        <ContraindicationsList rxNormCode="123" />
      </QueryClientProvider>
    );
    expect(screen.getByText(/no contraindications/i)).toBeInTheDocument();
  });
});
