import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface Notification {
  type: string;
  priority: "normal" | "high" | "urgent";
  title: string;
  message: string;
  patientId?: string;
  patientName?: string;
  reportId?: string;
  orderId?: string;
  timestamp: Date;
  action?: {
    type: string;
    url: string;
  };
  details?: any;
  requiresAcknowledgment?: boolean;
}

export interface CriticalAlert extends Notification {
  type: "critical_lab_value";
  priority: "urgent";
  details: {
    testName: string;
    loincCode: string;
    value: string | number;
    unit: string;
    referenceRange: string;
    criticalReason: string;
  };
}

/**
 * WebSocket Notifications Hook
 *
 * Connects to notification service and receives real-time notifications
 * MANDATORY: JWT authentication for WebSocket connection
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Get JWT token from localStorage (set during login)
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.warn("⚠️ No access token found - WebSocket connection skipped");
      return;
    }

    // Connect to notification service
    const socket = io("http://localhost:3021", {
      auth: {
        token,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("✅ Connected to notification service");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("👋 Disconnected from notification service");
      setIsConnected(false);
    });

    socket.on("connected", (data) => {
      console.log("📡 WebSocket authenticated:", data);
    });

    // Notification events
    socket.on("notification", (notification: Notification) => {
      console.log("📥 Received notification:", notification);

      setNotifications((prev) =>
        [
          {
            ...notification,
            timestamp: new Date(notification.timestamp),
          },
          ...prev,
        ].slice(0, 50)
      ); // Keep last 50 notifications

      // Browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/notification-icon.png",
          badge: "/badge-icon.png",
        });
      }

      // Audio alert for high priority
      if (notification.priority === "high") {
        playNotificationSound();
      }
    });

    socket.on("critical_alert", (alert: CriticalAlert) => {
      console.warn("🚨 CRITICAL ALERT:", alert);

      setCriticalAlerts((prev) => [
        {
          ...alert,
          timestamp: new Date(alert.timestamp),
        },
        ...prev,
      ]);

      setNotifications((prev) =>
        [
          {
            ...alert,
            timestamp: new Date(alert.timestamp),
          },
          ...prev,
        ].slice(0, 50)
      );

      // Browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(alert.title, {
          body: alert.message,
          icon: "/critical-icon.png",
          badge: "/badge-icon.png",
          requireInteraction: true, // Stays until user interacts
        });
      }

      // Audio alert for critical
      playCriticalSound();
    });

    // Cleanup on unmount
    return () => {
      console.log("🔌 Disconnecting from notification service");
      socket.disconnect();
    };
  }, []);

  const clearNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCriticalAlert = (index: number) => {
    setCriticalAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const clearAllCriticalAlerts = () => {
    setCriticalAlerts([]);
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  };

  return {
    notifications,
    criticalAlerts,
    isConnected,
    clearNotification,
    clearCriticalAlert,
    clearAllNotifications,
    clearAllCriticalAlerts,
    requestNotificationPermission,
  };
}

/**
 * Play notification sound
 */
function playNotificationSound() {
  const audio = new Audio("/sounds/notification.mp3");
  audio.volume = 0.5;
  audio.play().catch((error) => {
    console.warn("Failed to play notification sound:", error);
  });
}

/**
 * Play critical alert sound
 */
function playCriticalSound() {
  const audio = new Audio("/sounds/critical-alert.mp3");
  audio.volume = 0.8;
  audio.play().catch((error) => {
    console.warn("Failed to play critical alert sound:", error);
  });
}
