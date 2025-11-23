import axios, { AxiosError } from "axios";

const AUTH_SERVICE_URL =
  process.env.REACT_APP_AUTH_SERVICE_URL || "http://localhost:3001";

export interface LoginCredentials {
  email: string;
  password: string;
  portalType: "ADMIN" | "PROVIDER" | "PATIENT";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    portal?: string;
  };
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  role: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${AUTH_SERVICE_URL}/api/auth/login`,
        credentials,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Store token and user data
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        "Login error:",
        axiosError.response?.data || axiosError.message
      );

      // Provide more specific error messages
      if (axiosError.response?.status === 401) {
        throw new Error("Invalid email or password");
      } else if (axiosError.response?.status === 403) {
        throw new Error("Access denied for this portal");
      } else if (axiosError.response?.status === 404) {
        throw new Error("User not found");
      } else if (axiosError.code === "ECONNREFUSED") {
        throw new Error(
          "Authentication service is not available. Please try again later."
        );
      } else {
        throw new Error(
          (axiosError.response?.data as any)?.message ||
            "Login failed. Please try again."
        );
      }
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${AUTH_SERVICE_URL}/api/auth/register`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        "Registration error:",
        axiosError.response?.data || axiosError.message
      );

      if (axiosError.response?.status === 409) {
        throw new Error("User already exists");
      } else {
        throw new Error(
          (axiosError.response?.data as any)?.message ||
            "Registration failed. Please try again."
        );
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(
        `${AUTH_SERVICE_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await axios.post<{ accessToken: string }>(
        `${AUTH_SERVICE_URL}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        return response.data.accessToken;
      }
      return null;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  getUser(): any {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Setup axios interceptor for automatic token attachment
  setupAxiosInterceptors(): void {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await this.refreshToken();

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } else {
            // Redirect to login if refresh fails
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export default AuthService.getInstance();
