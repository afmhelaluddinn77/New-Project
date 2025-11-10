import { render, screen } from '@testing-library/react';
import { ResultsEntry } from '@/components/investigations/ResultsEntry';

describe('ResultsEntry', () => {
  it('renders results form', () => {
    render(<ResultsEntry investigationId="inv1" onSubmit={async () => {}} />);
    expect(screen.getByText(/add investigation results/i)).toBeInTheDocument();
    expect(screen.getByText(/result value/i)).toBeInTheDocument();
  });
});
