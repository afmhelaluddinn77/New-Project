import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InvestigationList } from '@/components/investigations/InvestigationList';

jest.mock('@/hooks/useEncounterQueries', () => ({
  useInvestigationsByEncounter: () => ({
    data: [
      {
        id: 'inv1',
        name: 'CBC',
        investigationType: 'LABORATORY',
        loincCode: '85025-9',
        priority: 'ROUTINE',
        status: 'ORDERED',
        createdAt: new Date().toISOString(),
      },
    ],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('InvestigationList', () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders list with investigations', () => {
    render(
      <QueryClientProvider client={qc}>
        <InvestigationList encounterId="enc-1" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/cbc/i)).toBeInTheDocument();
    expect(screen.getByText(/loinc/i)).toBeInTheDocument();
  });
});
