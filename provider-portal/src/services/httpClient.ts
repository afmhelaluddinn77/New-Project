import axios, { AxiosInstance } from "axios";

const DEFAULT_WORKFLOW_API_URL = "http://localhost:3004/api/workflow";

const ALLOWED_ORIGINS = [
  "http://localhost:5172",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://localhost:5178",
  "http://localhost:5179",
];

const tokenStorageKey = "token";

const getWorkflowApiUrl = () =>
  (import.meta.env.VITE_WORKFLOW_API_URL as string | undefined) ??
  DEFAULT_WORKFLOW_API_URL;

function createAuthenticatedClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    withCredentials: false,
  });

  client.interceptors.request.use((config) => {
    if (typeof window === "undefined") {
      return config;
    }

    const token = window.localStorage.getItem(tokenStorageKey);
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && typeof window !== "undefined") {
        window.localStorage.removeItem(tokenStorageKey);
        if (!ALLOWED_ORIGINS.includes(window.location.origin)) {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const workflowClient = createAuthenticatedClient(getWorkflowApiUrl());

/**
 * @deprecated Use authStore.getState().accessToken instead
 * Token management moved to lib/api.ts with cookie-based auth
 */
export function getAuthToken(): string | null {
  console.warn(
    "[httpClient] getAuthToken is deprecated. Use authStore.getState().accessToken instead."
  );
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(tokenStorageKey);
}

/**
 * @deprecated Token management moved to lib/api.ts with HttpOnly cookies
 * Tokens should not be stored in localStorage
 */
export function setAuthToken(token: string) {
  console.warn(
    "[httpClient] setAuthToken is deprecated. Tokens are managed via HttpOnly cookies in lib/api.ts."
  );
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(tokenStorageKey, token);
}

/**
 * @deprecated Use authStore.clearAuth() instead
 * Token management moved to lib/api.ts with cookie-based auth
 */
export function clearAuthToken() {
  console.warn(
    "[httpClient] clearAuthToken is deprecated. Use authStore.clearAuth() instead."
  );
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(tokenStorageKey);
}
