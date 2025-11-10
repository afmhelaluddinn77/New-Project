import { render, screen } from '@testing-library/react';
import { PrescriptionDetail } from '@/components/prescriptions/PrescriptionDetail';

describe('PrescriptionDetail', () => {
  it('renders prescription fields', () => {
    const rx = {
      id: 'rx1',
      encounterId: 'enc1',
      genericName: 'Aspirin',
      brandName: 'Bayer',
      dosage: '500mg',
      dosageForm: 'tablet',
      route: 'oral',
      frequency: 'BID',
      duration: '7 days',
      quantity: 14,
      refills: 0,
      instructions: 'Take with food',
      indication: 'Pain',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    render(<PrescriptionDetail prescription={rx} />);

    expect(screen.getByText('Aspirin')).toBeInTheDocument();
    expect(screen.getByText('Bayer')).toBeInTheDocument();
    expect(screen.getByText('500mg')).toBeInTheDocument();
    expect(screen.getByText('tablet')).toBeInTheDocument();
    expect(screen.getByText('BID')).toBeInTheDocument();
    expect(screen.getByText('7 days')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText(/Pain/i)).toBeInTheDocument();
    expect(screen.getByText(/Take with food/i)).toBeInTheDocument();
  });
});
