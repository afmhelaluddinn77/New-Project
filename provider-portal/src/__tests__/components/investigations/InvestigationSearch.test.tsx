import { render, screen, fireEvent } from '@testing-library/react';
import { InvestigationSearch } from '@/components/investigations/InvestigationSearch';

describe('InvestigationSearch', () => {
  it('renders search UI and triggers search', () => {
    const onSelect = jest.fn();
    render(<InvestigationSearch onSelect={onSelect} />);

    expect(screen.getByText(/search investigations/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/search by name/i), { target: { value: 'cbc' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
  });
});
