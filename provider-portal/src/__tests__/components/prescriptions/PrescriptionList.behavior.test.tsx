import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrescriptionList } from '@/components/prescriptions/PrescriptionList';

jest.mock('@/hooks/useEncounterQueries', () => ({
  usePrescriptionsByEncounter: () => ({
    data: [
      { id: '1', genericName: 'Zidovudine', dosage: '300mg', dosageForm: 'tablet', frequency: 'BID', status: 'ACTIVE' },
      { id: '2', genericName: 'Amoxicillin', dosage: '500mg', dosageForm: 'capsule', frequency: 'TID', status: 'COMPLETED' },
    ],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('PrescriptionList behavior', () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('sorts by name', () => {
    render(
      <QueryClientProvider client={qc}>
        <PrescriptionList encounterId="enc" />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByDisplayValue(/sort by date/i), { target: { value: 'name' } });
    const rows = screen.getAllByRole('row');
    // Row 1 is header; first data row should contain Amoxicillin when sorted by name
    expect(rows[1].textContent).toMatch(/Amoxicillin/i);
  });

  it('invokes callbacks', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(
      <QueryClientProvider client={qc}>
        <PrescriptionList encounterId="enc" onEdit={onEdit} onDelete={onDelete} />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(editButtons[0]);
    fireEvent.click(deleteButtons[0]);
    expect(onEdit).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });
});
