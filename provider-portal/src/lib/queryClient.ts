import { QueryClient } from "@tanstack/react-query";

/**
 * React Query Client Configuration
 *
 * Optimized for healthcare application with:
 * - Longer stale times for relatively static data (encounters, orders)
 * - Automatic refetching on window focus
 * - Error retry with exponential backoff
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 30 seconds
      staleTime: 30 * 1000,

      // Cache data for 5 minutes
      gcTime: 5 * 60 * 1000,

      // Refetch on window focus (user comes back to tab)
      refetchOnWindowFocus: true,

      // Retry failed requests 3 times
      retry: 3,

      // Exponential backoff: 1s, 2s, 4s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,

      // Show error for 5 seconds
      gcTime: 5000,
    },
  },
});

/**
 * Query Keys
 * Centralized query key factory for type safety and consistency
 */
export const queryKeys = {
  // Encounters
  encounters: {
    all: ["encounters"] as const,
    lists: () => [...queryKeys.encounters.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.encounters.lists(), filters] as const,
    details: () => [...queryKeys.encounters.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.encounters.details(), id] as const,
  },

  // Orders
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
} as const;
