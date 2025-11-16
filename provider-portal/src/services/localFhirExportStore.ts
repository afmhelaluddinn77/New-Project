import type { FhirBundle, NdjsonExportForSteps1to3 } from "./fhirService";

const STORAGE_KEY = "clinical_fhir_exports_steps1to3";

export interface StoredFhirExport {
  id: string;
  timestamp: string;
  encounterId?: string;
  patientId?: string;
  providerId?: string;
  bundle: FhirBundle;
  ndjson?: NdjsonExportForSteps1to3;
  source?: string; // e.g. "provider-portal"
}

function readAll(): StoredFhirExport[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredFhirExport[];
  } catch {
    return [];
  }
}

export function saveFhirExportToLocal(
  entry: Omit<StoredFhirExport, "id" | "timestamp">
): StoredFhirExport {
  const now = new Date().toISOString();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const all = readAll();
  const stored: StoredFhirExport = { id, timestamp: now, ...entry };
  const next = [...all, stored];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to save FHIR export to local storage", error);
  }

  return stored;
}

export function listLocalFhirExports(): StoredFhirExport[] {
  return readAll();
}

export function clearLocalFhirExports(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to clear local FHIR exports", error);
  }
}
