/**
 * Centralized Authentication Header Manager
 * 
 * Purpose: Provide consistent, validated auth headers across all API clients
 * Prevents: Missing headers, hardcoded fallbacks, inconsistent role mapping
 */

export interface AuthUser {
  id?: string;
  email?: string;
  role?: string;
}

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
}

export interface RequiredHeaders {
  'Authorization': string;
  'x-user-id': string;
  'x-user-role': string;
  'x-portal': string;
}

export class AuthenticationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthHeaderManager {
  constructor(private getAuthState: () => AuthState) {}

  /**
   * Get all required authentication headers for API requests
   * Throws clear errors if authentication is invalid
   */
  getRequiredHeaders(portal: 'PROVIDER' | 'LAB' | 'PHARMACY'): RequiredHeaders {
    const { accessToken, user } = this.getAuthState();

    // Validate access token
    if (!accessToken) {
      throw new AuthenticationError(
        'No access token available. Please log in.',
        'NO_TOKEN'
      );
    }

    // Get user ID (from user object or JWT token)
    const userId = this.getUserId(user, accessToken);
    if (!userId) {
      throw new AuthenticationError(
        'Unable to determine user identity. Please log in again.',
        'NO_USER_ID'
      );
    }

    // Get appropriate role for portal
    const role = this.getRoleForPortal(portal, user?.role);

    return {
      'Authorization': `Bearer ${accessToken}`,
      'x-user-id': userId,
      'x-user-role': role,
      'x-portal': portal,
    };
  }

  /**
   * Get optional CSRF token for mutating requests
   */
  getCSRFToken(): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; XSRF-TOKEN=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  /**
   * Extract user ID from user object or JWT token
   */
  private getUserId(user: AuthUser | null, token: string): string | null {
    // First try user object
    if (user?.id) {
      return user.id;
    }

    // Fallback: Extract from JWT token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.userId || payload.id || null;
    } catch (error) {
      console.error('Failed to parse JWT token:', error);
      return null;
    }
  }

  /**
   * Map portal to appropriate user role
   */
  private getRoleForPortal(portal: string, userRole?: string): string {
    const roleMap: Record<string, string> = {
      'PROVIDER': userRole || 'PROVIDER',
      'LAB': 'LAB_TECH',
      'PHARMACY': 'PHARMACIST',
    };
    return roleMap[portal] || userRole || 'USER';
  }

  /**
   * Check if current auth state is valid
   */
  isAuthenticated(): boolean {
    const { accessToken } = this.getAuthState();
    if (!accessToken) return false;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return true; // No expiration set

      const now = Math.floor(Date.now() / 1000);
      return exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Get user-friendly error message for auth errors
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof AuthenticationError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Authentication failed. Please try again.';
  }
}

/**
 * Create auth header manager instance
 * Usage: const headerManager = createAuthHeaderManager(useAuthStore);
 */
export function createAuthHeaderManager(
  getState: () => AuthState
): AuthHeaderManager {
  return new AuthHeaderManager(getState);
}

