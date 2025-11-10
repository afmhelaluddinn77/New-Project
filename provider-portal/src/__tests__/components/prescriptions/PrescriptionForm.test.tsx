import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrescriptionForm } from '@/components/prescriptions/PrescriptionForm';

describe('PrescriptionForm', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('should render form with all fields', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PrescriptionForm encounterId="test-encounter" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/new prescription/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/aspirin/i)).toBeInTheDocument();
  });

  it('should display validation errors on invalid input', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <PrescriptionForm encounterId="test-encounter" />
      </QueryClientProvider>
    );

    const form = container.querySelector('form');
    if (!form) throw new Error('Form element not found');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryAllByText(/required/i).length).toBeGreaterThan(0);
    });
  });

  it('renders inputs for user entry', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PrescriptionForm encounterId="test-encounter" />
      </QueryClientProvider>
    );
    expect(screen.getByPlaceholderText(/aspirin/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/500mg/i)).toBeInTheDocument();
  });

  it('should handle form reset', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PrescriptionForm encounterId="test-encounter" />
      </QueryClientProvider>
    );

    const genericNameInput = screen.getByPlaceholderText(/aspirin/i) as HTMLInputElement;
    fireEvent.change(genericNameInput, { target: { value: 'Aspirin' } });
    expect(genericNameInput.value).toBe('Aspirin');

    const resetButton = screen.getByText(/reset/i);
    fireEvent.click(resetButton);

    expect(genericNameInput.value).toBe('');
  });
});
