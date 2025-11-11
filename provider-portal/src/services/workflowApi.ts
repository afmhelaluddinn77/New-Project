import axios from "axios";
import { useAuthStore } from "../store/authStore";

/**
 * Workflow API Service
 *
 * CRITICAL FIX: Use separate axios instance with direct URL
 * Absolute URLs bypass interceptors, so we need a fresh client
 * that will apply headers before sending to workflow service.
 */

// Create a separate client for workflow service requests
const workflowClient = axios.create({
  baseURL: "http://localhost:3004",
  withCredentials: true,
});

// Helper to extract user ID from JWT token
const extractUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.userId || payload.id || null;
  } catch {
    return null;
  }
};

// Apply request interceptor to workflow client
workflowClient.interceptors.request.use((config) => {
  const { accessToken, user } = useAuthStore.getState();

  config.headers = config.headers ?? {};

  // Add Authorization
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Required by backend role guards
  config.headers["x-user-role"] = user?.role || "PROVIDER";
  config.headers["x-portal"] = "PROVIDER";

  // Extract user ID from token or user object
  let userId = user?.id;
  if (!userId && accessToken) {
    userId = extractUserIdFromToken(accessToken);
  }
  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  return config;
});

import type { CreateUnifiedOrderInput, UnifiedOrder } from "../types/workflow";

export async function fetchUnifiedOrders(): Promise<UnifiedOrder[]> {
  const response = await workflowClient.get<UnifiedOrder[]>("/api/workflow/orders");
  return response.data;
}

export async function fetchUnifiedOrder(
  orderId: string
): Promise<UnifiedOrder> {
  const response = await workflowClient.get<UnifiedOrder>(
    `/api/workflow/orders/${orderId}`
  );
  return response.data;
}

export async function createUnifiedOrder(
  payload: CreateUnifiedOrderInput
): Promise<UnifiedOrder> {
  const response = await workflowClient.post<UnifiedOrder>(
    "/api/workflow/orders/unified",
    payload
  );
  return response.data;
}
