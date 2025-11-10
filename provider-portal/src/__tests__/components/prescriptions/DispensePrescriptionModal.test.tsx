import { render, screen, fireEvent } from '@testing-library/react';
import { DispensePrescriptionModal } from '@/components/prescriptions/DispensePrescriptionModal';

describe('DispensePrescriptionModal', () => {
  it('renders when open and calls onClose on cancel', () => {
    const onClose = jest.fn();
    const onDispense = jest.fn(() => Promise.resolve());
    render(
      <DispensePrescriptionModal
        prescriptionId="rx1"
        isOpen
        onClose={onClose}
        onDispense={onDispense}
      />
    );

    expect(screen.getByText(/dispense prescription/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/cancel/i));
    expect(onClose).toHaveBeenCalled();
  });
});
