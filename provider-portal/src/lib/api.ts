import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Helper – read cookie by name
const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

// Use gateway if available, otherwise go directly to services
// For now, bypassing Kong and going directly to services for reliability
export const api = axios.create({
  baseURL:
    (import.meta.env.VITE_API_GATEWAY_URL as string | undefined) ??
    "http://localhost:3001/api", // Auth service base - other services accessed via full URLs
  withCredentials: true, // send refresh cookie + XSRF-TOKEN automatically
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

// Request interceptor → attach Authorization + CSRF header
api.interceptors.request.use((config) => {
  const { accessToken, user } = useAuthStore.getState();

  // Ensure headers object exists
  config.headers = config.headers ?? {};

  // Add Authorization header
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Required by backend role guards - ALWAYS set these headers
  config.headers["x-user-role"] = user?.role || "PROVIDER";
  config.headers["x-portal"] = "PROVIDER";

  // Extract user ID from user object or JWT token
  let userId = user?.id;
  if (!userId && accessToken) {
    userId = extractUserIdFromToken(accessToken);
  }
  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  // Add CSRF token for mutating requests
  if (
    config.method &&
    ["post", "put", "patch", "delete"].includes(config.method)
  ) {
    const csrf = getCookie("XSRF-TOKEN");
    if (csrf) {
      config.headers["X-XSRF-TOKEN"] = csrf;
    }
  }

  return config;
});

// Response interceptor → handle 401 by refreshing
let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: any) => void }> =
  [];

const processQueue = (err: any, token: string | null = null) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  queue = [];
};

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const status = error?.response?.status;
    const original = error.config;
    if (status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers["Authorization"] = `Bearer ${token}`;
          return api(original);
        });
      }
      isRefreshing = true;
      original._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        const { accessToken } = data;
        useAuthStore.getState().setAccessToken(accessToken);
        processQueue(null, accessToken);
        original.headers["Authorization"] = `Bearer ${accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
