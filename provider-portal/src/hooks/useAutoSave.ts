import { useEffect, useRef, useCallback } from 'react';
import { useEncounterStore } from '../store/encounterStore';

interface UseAutoSaveOptions {
  debounceMs?: number;
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for automatic encounter saving with debouncing
 * 
 * @param options Configuration options
 * @returns Object with isSaving status and manual save function
 * 
 * @example
 * const { isSaving, save } = useAutoSave({ debounceMs: 3000 });
 * 
 * // Auto-save will trigger 3 seconds after the last state change
 * // You can also manually trigger save with save()
 */
export const useAutoSave = (options: UseAutoSaveOptions = {}) => {
  const {
    debounceMs = 3000,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const { saveEncounter, isSaving, history, examination, investigations, medications } = useEncounterStore();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<string>('');
  const isSavingRef = useRef(false);

  /**
   * Create a hash of the current state to detect changes
   */
  const getStateHash = useCallback(() => {
    return JSON.stringify({
      history,
      examination,
      investigations,
      medications,
    });
  }, [history, examination, investigations, medications]);

  /**
   * Perform the actual save
   */
  const performSave = useCallback(async () => {
    if (!enabled || isSavingRef.current) {
      return;
    }

    try {
      isSavingRef.current = true;
      await saveEncounter();
      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error('Auto-save failed:', err);
      onError?.(err);
    } finally {
      isSavingRef.current = false;
    }
  }, [enabled, saveEncounter, onSuccess, onError]);

  /**
   * Setup auto-save with debouncing
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const currentStateHash = getStateHash();

    // Only set timeout if state has changed since last save
    if (currentStateHash !== lastSaveRef.current) {
      lastSaveRef.current = currentStateHash;

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for debounced save
      timeoutRef.current = setTimeout(() => {
        performSave();
      }, debounceMs);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, debounceMs, getStateHash, performSave]);

  /**
   * Manual save function
   */
  const manualSave = useCallback(async () => {
    await performSave();
  }, [performSave]);

  return {
    isSaving,
    save: manualSave,
    isEnabled: enabled,
  };
};

/**
 * Hook to track if there are unsaved changes
 */
export const useHasUnsavedChanges = () => {
  const { history, examination, investigations, medications } = useEncounterStore();
  const lastSavedStateRef = useRef<string>('');

  const currentState = JSON.stringify({
    history,
    examination,
    investigations,
    medications,
  });

  // Initialize on first render
  useEffect(() => {
    if (!lastSavedStateRef.current) {
      lastSavedStateRef.current = currentState;
    }
  }, [currentState]);

  const hasChanges = currentState !== lastSavedStateRef.current;

  const markAsSaved = useCallback(() => {
    lastSavedStateRef.current = currentState;
  }, [currentState]);

  return {
    hasChanges,
    markAsSaved,
  };
};

/**
 * Hook to warn user before leaving if there are unsaved changes
 */
export const useUnsavedChangesWarning = (enabled: boolean = true) => {
  const { hasChanges } = useHasUnsavedChanges();

  useEffect(() => {
    if (!enabled || !hasChanges) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, hasChanges]);

  return { hasChanges };
};

/**
 * Hook to periodically save (in addition to debounced auto-save)
 * Useful as a safety net to ensure data is saved
 */
export const usePeriodicSave = (intervalMs: number = 30000) => {
  const { saveEncounter } = useEncounterStore();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      saveEncounter().catch((error) => {
        console.error('Periodic save failed:', error);
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [saveEncounter, intervalMs]);
};
