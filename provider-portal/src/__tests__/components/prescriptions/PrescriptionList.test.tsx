import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrescriptionList } from '@/components/prescriptions/PrescriptionList';

jest.mock('@/hooks/useEncounterQueries', () => ({
  usePrescriptionsByEncounter: () => ({
    data: [
      {
        id: 'rx1',
        genericName: 'Aspirin',
        brandName: 'Bayer',
        dosage: '500mg',
        dosageForm: 'tablet',
        frequency: 'ONCE_DAILY',
        status: 'ACTIVE',
      },
    ],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('PrescriptionList', () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders a table of prescriptions', () => {
    render(
      <QueryClientProvider client={qc}>
        <PrescriptionList encounterId="enc-1" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/prescriptions/i)).toBeInTheDocument();
    expect(screen.getByText('Aspirin')).toBeInTheDocument();
    expect(screen.getByText(/dosage/i)).toBeInTheDocument();
  });
});
