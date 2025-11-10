import create from 'zustand'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface User {
  id: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  status: AuthStatus
  setUserAndToken: (user: User, accessToken: string) => void
  clearAuth: () => void
  setStatus: (status: AuthStatus) => void
  setAccessToken: (token: string) => void
}

/**
 * Global auth store (in-memory) – replaces localStorage token approach.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'loading',
  setUserAndToken: (user, accessToken) =>
    set({ user, accessToken, status: 'authenticated' }),
  clearAuth: () => set({ user: null, accessToken: null, status: 'unauthenticated' }),
  setStatus: (status) => set({ status }),
  setAccessToken: (token) => set({ accessToken: token, status: 'authenticated' }),
}))
