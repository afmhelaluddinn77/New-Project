import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AllergyChecker } from '@/components/medications/AllergyChecker';

jest.mock('@/hooks/useEncounterQueries', () => ({
  useCheckMedicationAllergies: () => ({
    mutateAsync: jest.fn(async () => ({ matches: [] })),
    isPending: false,
    isError: false,
    error: undefined,
    reset: jest.fn(),
    data: { matches: [] },
  }),
}));

describe('AllergyChecker', () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  it('renders and checks allergies', async () => {
    render(
      <QueryClientProvider client={qc}>
        <AllergyChecker patientId="p1" medications={["m1"]} />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByText(/check allergies/i));
    await waitFor(() => expect(screen.getByText(/no allergy conflicts/i)).toBeInTheDocument());
  });
});
