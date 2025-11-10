import { render, screen } from '@testing-library/react';
import { LoadingState } from '@/components/shared/LoadingState';

describe('LoadingState', () => {
  it('renders loading message', () => {
    render(<LoadingState message="Loading data..." />);
    expect(screen.getByText(/loading data/i)).toBeInTheDocument();
  });
});
