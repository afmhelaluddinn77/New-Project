import axios, { AxiosInstance } from 'axios';

const DEFAULT_LAB_API_URL = 'http://localhost:3013/api/lab';
const DEFAULT_WORKFLOW_SOCKET_URL = 'http://localhost:3004/workflow';

const tokenStorageKey = 'token';

const getLabApiUrl = () =>
  (import.meta.env.VITE_LAB_API_URL as string | undefined) ?? DEFAULT_LAB_API_URL;

export const getWorkflowSocketUrl = () =>
  (import.meta.env.VITE_WORKFLOW_SOCKET_URL as string | undefined) ?? DEFAULT_WORKFLOW_SOCKET_URL;

function createAuthenticatedClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
  });

  client.interceptors.request.use((config) => {
    if (typeof window === 'undefined') {
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
      if (error?.response?.status === 401 && typeof window !== 'undefined') {
        window.localStorage.removeItem(tokenStorageKey);
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export const labClient = createAuthenticatedClient(getLabApiUrl());

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(tokenStorageKey);
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(tokenStorageKey, token);
}

export function clearAuthToken() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(tokenStorageKey);
}

