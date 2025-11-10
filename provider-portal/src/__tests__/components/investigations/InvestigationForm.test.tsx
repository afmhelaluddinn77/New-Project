import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InvestigationForm } from '@/components/investigations/InvestigationForm';

jest.mock('@/hooks/useEncounterQueries', () => ({
  useCreateInvestigation: () => ({ mutateAsync: jest.fn(), isPending: false, isError: false, error: undefined, reset: jest.fn() }),
  useUpdateInvestigation: () => ({ mutateAsync: jest.fn(), isPending: false, isError: false, error: undefined, reset: jest.fn() }),
  useMutationStatus: () => ({ isLoading: false, isSuccess: false, isError: false }),
}));

describe('InvestigationForm', () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

  it('renders investigation form fields', () => {
    render(
      <QueryClientProvider client={qc}>
        <InvestigationForm encounterId="enc-1" />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /add investigation/i })).toBeInTheDocument();
    expect(screen.getByText(/investigation type/i)).toBeInTheDocument();
  });
});
