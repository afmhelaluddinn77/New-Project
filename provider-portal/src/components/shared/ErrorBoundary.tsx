import * as React from 'react';
import { ReactNode } from 'react';

/**
 * ErrorBoundary Component
 * Catches React errors and displays a fallback UI
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      return (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 m-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-700 mb-4 text-sm">
            {this.state.error.message}
          </p>
          <button
            onClick={this.retry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorState Component
 * Displays an error message with retry option
 */

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title = 'Error',
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-4 m-4">
      <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
      <p className="text-red-700 mb-4 text-sm">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
};

/**
 * ValidationError Component
 * Displays form validation errors
 */

interface ValidationErrorProps {
  errors: Record<string, string>;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ errors }) => {
  const errorList = Object.entries(errors);

  if (errorList.length === 0) {
    return null;
  }

  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
      <ul className="space-y-1">
        {errorList.map(([field, message]) => (
          <li key={field} className="text-sm text-red-700">
            <span className="font-medium">{field}:</span> {message}
          </li>
        ))}
      </ul>
    </div>
  );
};
