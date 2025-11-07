/**
 * Programmes API Service
 * Handles all programme-related API calls to Azure P-Connect API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  ProgrammeResponse,
  ProgrammeCreate,
  ProgrammeUpdate,
} from '../../types/api';

interface GetProgrammesParams {
  skip?: number;
  limit?: number;
  search?: string;
}

export class ProgrammesService {
  /**
   * Get all programmes with optional filters
   */
  async getProgrammes(params?: GetProgrammesParams): Promise<ProgrammeResponse[]> {
    let endpoint = API_ENDPOINTS.PROGRAMMES.LIST;
    
    // Add query parameters to endpoint
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }
    }
    
    const response = await apiClient.get<ProgrammeResponse[]>(endpoint);
    return response.data;
  }

  /**
   * Get programme by ID
   */
  async getProgrammeById(programmeId: string): Promise<ProgrammeResponse> {
    const response = await apiClient.get<ProgrammeResponse>(
      API_ENDPOINTS.PROGRAMMES.GET(programmeId)
    );
    return response.data;
  }

  /**
   * Create a new programme
   */
  async createProgramme(programmeData: ProgrammeCreate): Promise<ProgrammeResponse> {
    const response = await apiClient.post<ProgrammeResponse>(
      API_ENDPOINTS.PROGRAMMES.CREATE,
      programmeData
    );
    return response.data;
  }

  /**
   * Update programme
   */
  async updateProgramme(
    programmeId: string,
    programmeData: ProgrammeUpdate
  ): Promise<ProgrammeResponse> {
    const response = await apiClient.put<ProgrammeResponse>(
      API_ENDPOINTS.PROGRAMMES.UPDATE(programmeId),
      programmeData
    );
    return response.data;
  }

  /**
   * Delete programme
   */
  async deleteProgramme(programmeId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.PROGRAMMES.DELETE(programmeId)
    );
    return response.data;
  }
}

export const programmesService = new ProgrammesService();
