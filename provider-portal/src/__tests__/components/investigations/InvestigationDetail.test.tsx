import { render, screen } from '@testing-library/react';
import { InvestigationDetail } from '@/components/investigations/InvestigationDetail';

describe('InvestigationDetail', () => {
  it('renders investigation details', () => {
    const inv = {
      id: 'inv1',
      encounterId: 'enc1',
      investigationType: 'LABORATORY',
      name: 'CBC',
      loincCode: '85025-9',
      snomedCode: '12345',
      priority: 'ROUTINE',
      status: 'ORDERED',
      description: 'Full blood count',
      resultValue: '12',
      resultUnit: 'g/dL',
      referenceRange: '11-15',
      interpretation: 'NORMAL',
      createdAt: new Date().toISOString(),
    };
    render(<InvestigationDetail investigation={inv} />);
    expect(screen.getByText(/CBC/i)).toBeInTheDocument();
    expect(screen.getByText(/LOINC Code/i)).toBeInTheDocument();
  });
});
