import { render, screen } from '@testing-library/react';
import { MedicationDetail } from '@/components/medications/MedicationDetail';

describe('MedicationDetail', () => {
  it('renders medication details', () => {
    const med = {
      id: 'm1',
      genericName: 'Amoxicillin',
      brandName: 'Amoxil',
      rxNormCode: '999',
      strength: '500mg',
      form: 'capsule',
      route: 'oral',
      indication: 'Infection',
      sideEffects: ['Nausea'],
      contraindications: ['Allergy'],
      dosageInfo: '500mg TID for 7 days',
    };
    render(<MedicationDetail medication={med} />);
    expect(screen.getByText(/amoxicillin/i)).toBeInTheDocument();
    expect(screen.getByText(/500mg tid for 7 days/i)).toBeInTheDocument();
  });
});
