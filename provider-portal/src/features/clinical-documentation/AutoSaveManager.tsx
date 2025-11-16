import React from "react";
import { useAutoSave, useUnsavedChangesWarning } from "../../hooks/useAutoSave";

interface AutoSaveManagerProps {
  debounceMs?: number;
}

/**
 * Thin wrapper component that wires the auto-save hooks into the
 * encounter editor. It does not render any UI; it just keeps the
 * encounter data automatically saved and warns on unsaved changes.
 */
export const AutoSaveManager: React.FC<AutoSaveManagerProps> = ({
  debounceMs = 3000,
}) => {
  useAutoSave({ debounceMs });
  useUnsavedChangesWarning(true);

  // No visual output; this component only manages side effects.
  return null;
};
