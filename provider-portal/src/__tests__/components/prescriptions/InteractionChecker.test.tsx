import { render, screen } from '@testing-library/react';
import { InteractionChecker } from '@/components/prescriptions/InteractionChecker';

describe('InteractionChecker', () => {
  it('shows no interactions message when list is empty', () => {
    render(
      <InteractionChecker medications={[]} interactions={[]} />
    );
    expect(screen.getByText(/no drug interactions detected/i)).toBeInTheDocument();
  });

  it('renders interaction items', () => {
    render(
      <InteractionChecker
        medications={[]}
        interactions={[{
          medication1: 'Aspirin',
          medication2: 'Warfarin',
          severity: 'SEVERE',
          description: 'Increased bleeding risk',
          recommendation: 'Avoid combination',
        }]}
      />
    );
    expect(screen.getByText(/aspirin \+ warfarin/i)).toBeInTheDocument();
    expect(screen.getByText(/increased bleeding risk/i)).toBeInTheDocument();
  });
});
