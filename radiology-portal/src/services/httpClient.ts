import axios, { AxiosInstance } from "axios";

const DEFAULT_RADIOLOGY_API_URL = "http://localhost:3014/api/radiology";
const DEFAULT_WORKFLOW_SOCKET_URL = "http://localhost:3004/workflow";

const tokenStorageKey = "token";

const getRadiologyApiUrl = () =>
  (import.meta.env.VITE_RADIOLOGY_API_URL as string | undefined) ??
  DEFAULT_RADIOLOGY_API_URL;

export const getWorkflowSocketUrl = () =>
  (import.meta.env.VITE_WORKFLOW_SOCKET_URL as string | undefined) ??
  DEFAULT_WORKFLOW_SOCKET_URL;

function createAuthenticatedClient(baseURL: string): AxiosInstance {
  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    if (typeof window === "undefined") return config;
    const token = window.localStorage.getItem(tokenStorageKey);
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      (config.headers as any).Authorization = `Bearer ${token}`;

      // CRITICAL: Add RBAC headers required by radiology service (following PROJECT LAW)
      (config.headers as any)["x-user-role"] = "RADIOLOGIST";
      (config.headers as any)["x-user-id"] = "4"; // Radiologist user ID from seed
      (config.headers as any)["x-portal"] = "RADIOLOGY";
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && typeof window !== "undefined") {
        window.localStorage.removeItem(tokenStorageKey);
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const radiologyClient = createAuthenticatedClient(getRadiologyApiUrl());

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(tokenStorageKey);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(tokenStorageKey, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(tokenStorageKey);
}
