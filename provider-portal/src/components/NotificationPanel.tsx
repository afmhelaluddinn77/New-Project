import React from "react";
import { Bell, X, AlertTriangle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  Notification,
  CriticalAlert,
} from "../hooks/useNotifications";

/**
 * Notification Panel Component
 *
 * Real-time notifications from notification service via WebSocket
 * MANDATORY: Critical alerts require acknowledgment
 */
export function NotificationPanel() {
  const {
    notifications,
    criticalAlerts,
    isConnected,
    clearNotification,
    clearCriticalAlert,
    clearAllNotifications,
  } = useNotifications();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const totalCount = notifications.length + criticalAlerts.length;

  const handleNotificationClick = (
    notification: Notification,
    index: number
  ) => {
    if (notification.action?.url) {
      navigate(notification.action.url);
    }
    clearNotification(index);
  };

  const handleCriticalAlertClick = (alert: CriticalAlert, index: number) => {
    if (alert.action?.url) {
      navigate(alert.action.url);
    }
    // Critical alerts stay until explicitly dismissed
  };

  const acknowledgeCriticalAlert = (index: number) => {
    clearCriticalAlert(index);
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell className="h-6 w-6" />

        {/* Badge */}
        {totalCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}

        {/* Connection indicator */}
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            isConnected ? "bg-green-500" : "bg-gray-400"
          }`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {totalCount > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {totalCount === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* Critical Alerts - Always show first */}
                {criticalAlerts.map((alert, index) => (
                  <CriticalAlertItem
                    key={`critical-${index}`}
                    alert={alert}
                    onClick={() => handleCriticalAlertClick(alert, index)}
                    onAcknowledge={() => acknowledgeCriticalAlert(index)}
                  />
                ))}

                {/* Regular Notifications */}
                {notifications.map((notification, index) => (
                  <NotificationItem
                    key={`notification-${index}`}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification, index)}
                    onDismiss={() => clearNotification(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CriticalAlertItem({
  alert,
  onClick,
  onAcknowledge,
}: {
  alert: CriticalAlert;
  onClick: () => void;
  onAcknowledge: () => void;
}) {
  return (
    <div className="p-4 bg-red-50 border-l-4 border-red-600 hover:bg-red-100 transition cursor-pointer">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-1" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-red-900">{alert.title}</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAcknowledge();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-red-800 mb-2">{alert.message}</p>

          {alert.patientName && (
            <p className="text-xs text-red-700 mb-2">
              Patient: {alert.patientName}
            </p>
          )}

          {alert.details && (
            <div className="bg-white rounded p-2 text-xs space-y-1 mb-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Test:</span>
                <span className="font-medium">{alert.details.testName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Value:</span>
                <span className="font-bold text-red-600">
                  {alert.details.value} {alert.details.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Normal Range:</span>
                <span className="text-gray-700">
                  {alert.details.referenceRange}
                </span>
              </div>
              {alert.details.criticalReason && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-600">
                    {alert.details.criticalReason}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-red-600">
              {new Date(alert.timestamp).toLocaleString()}
            </span>
            <button
              onClick={onClick}
              className="text-xs font-medium text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
            >
              View Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationItem({
  notification,
  onClick,
  onDismiss,
}: {
  notification: Notification;
  onClick: () => void;
  onDismiss: () => void;
}) {
  const priorityStyles = {
        <Info
          className={`h-5 w-5 shrink-0 mt-1 ${
            notification.priority === 'high'
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-l-4 hover:bg-gray-50 transition cursor-pointer ${
        priorityStyles[notification.priority]
      }`}
    >
      <div className="flex items-start gap-3">
        <Info
          className={`h-5 w-5 shrink-0 mt-1 ${
            notification.priority === "high"
              ? "text-yellow-600"
              : notification.priority === "urgent"
                ? "text-red-600"
                : "text-blue-600"
          }`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-900">
              {notification.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>

          <span className="text-xs text-gray-500">
            {new Date(notification.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
