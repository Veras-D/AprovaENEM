import { apiClient } from '../client';
import type { InstitutionalCohortDiagnosticResponse } from '../types';

export const institutionalService = {
  /**
   * Retrieve aggregated diagnostic metrics for a specific institutional classroom/cohort
   * Target endpoint: GET /api/v1/institutional/cohorts/{cohortId}/diagnostics
   */
  async getCohortDiagnostics(cohortId: string): Promise<InstitutionalCohortDiagnosticResponse> {
    const response = await apiClient.get<InstitutionalCohortDiagnosticResponse>(
      `/institutional/cohorts/${cohortId}/diagnostics`
    );
    return response.data;
  },
};
