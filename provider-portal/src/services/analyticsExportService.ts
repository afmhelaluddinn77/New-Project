import { api } from "../lib/api";
import type { FhirBundle, NdjsonExportForSteps1to3 } from "./fhirService";

export interface AnalyticsFhirExportPayload {
  encounterId?: string;
  patientId?: string;
  providerId?: string;
  bundle: FhirBundle;
  ndjson?: NdjsonExportForSteps1to3;
  source?: string; // e.g. "provider-portal"
  notes?: string;
}

export async function exportFhirToAnalytics(
  payload: AnalyticsFhirExportPayload
): Promise<any> {
  const response = await api.post("/analytics/export-fhir", payload);
  return response.data;
}
