import axios, { AxiosInstance } from 'axios';

const DEFAULT_WORKFLOW_API_URL = 'http://localhost:3004/api/workflow';

const ALLOWED_ORIGINS = [
  'http://localhost:5172',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
];

const tokenStorageKey = 'token';

const getWorkflowApiUrl = () =>
  (import.meta.env.VITE_WORKFLOW_API_URL as string | undefined) ?? DEFAULT_WORKFLOW_API_URL;

function createAuthenticatedClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    withCredentials: false,
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
        if (!ALLOWED_ORIGINS.includes(window.location.origin)) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export const workflowClient = createAuthenticatedClient(getWorkflowApiUrl());

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

