import React, { useEffect, useState } from 'react';

/**
 * Notification Types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast Notification Component
 * Displays temporary notifications that auto-dismiss
 */

interface ToastProps {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[type];

  return (
    <div
      className={`border rounded-lg p-4 mb-2 flex items-start gap-3 ${bgColor}`}
      role="alert"
    >
      <span className={`text-lg font-bold ${textColor}`}>{icon}</span>
      <div className="flex-1">
        <p className={`text-sm ${textColor}`}>{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className={`text-lg font-bold ${textColor} hover:opacity-70`}
      >
        ×
      </button>
    </div>
  );
};

/**
 * Toast Container Component
 * Manages multiple toasts
 */

interface ToastContainerProps {
  toasts: Array<{ id: string; type: NotificationType; message: string }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

/**
 * Success Notification Component
 */

interface SuccessNotificationProps {
  message: string;
  title?: string;
  onClose?: () => void;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  message,
  title = 'Success',
  onClose,
}) => {
  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-green-800 mb-1">{title}</h3>
      <p className="text-green-700 text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="mt-2 text-sm text-green-600 hover:text-green-800"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

/**
 * Warning Notification Component
 */

interface WarningNotificationProps {
  message: string;
  title?: string;
  onClose?: () => void;
}

export const WarningNotification: React.FC<WarningNotificationProps> = ({
  message,
  title = 'Warning',
  onClose,
}) => {
  return (
    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-yellow-800 mb-1">{title}</h3>
      <p className="text-yellow-700 text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="mt-2 text-sm text-yellow-600 hover:text-yellow-800"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

/**
 * Info Notification Component
 */

interface InfoNotificationProps {
  message: string;
  title?: string;
  onClose?: () => void;
}

export const InfoNotification: React.FC<InfoNotificationProps> = ({
  message,
  title = 'Information',
  onClose,
}) => {
  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-blue-800 mb-1">{title}</h3>
      <p className="text-blue-700 text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

/**
 * useToast Hook
 * Manages toast notifications
 */

export const useToast = () => {
  const [toasts, setToasts] = useState<
    Array<{ id: string; type: NotificationType; message: string }>
  >([]);

  const addToast = (type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message: string) => addToast('success', message);
  const error = (message: string) => addToast('error', message);
  const warning = (message: string) => addToast('warning', message);
  const info = (message: string) => addToast('info', message);

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};
