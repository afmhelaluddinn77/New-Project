import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const Thrower: React.FC = () => {
  throw new Error('Boom');
};

describe('ErrorBoundary', () => {
  it('renders fallback on error', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
