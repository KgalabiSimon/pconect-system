/**
 * Spaces API Service
 * Handles all space-related API calls to Azure P-Connect API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  SpaceResponse,
  SpaceCreate,
  SpaceUpdate,
  FloorResponse,
  BlockResponse,
} from '../../types/api';

interface GetSpacesParams {
  skip?: number;
  limit?: number;
  building_id?: string;
  type?: string;
}

export class SpacesService {
  /**
   * Get spaces for a specific building
   */
  async getBuildingSpaces(buildingId: string): Promise<SpaceResponse[]> {
    const response = await apiClient.get<SpaceResponse[]>(
      API_ENDPOINTS.BUILDINGS.SPACES(buildingId)
    );
    return response.data;
  }

  /**
   * Get all spaces with optional filters (admin)
   * Uses the global /api/v1/spaces/ endpoint
   */
  async getSpaces(params?: GetSpacesParams): Promise<SpaceResponse[]> {
    let endpoint = API_ENDPOINTS.SPACES.LIST;
    
    // Add query parameters to endpoint
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.building_id) queryParams.append('building_id', params.building_id);
      if (params.type) queryParams.append('type', params.type);
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }
    }
    
    const response = await apiClient.get<SpaceResponse[]>(endpoint);
    return response.data;
  }

  /**
   * Get space by ID (admin)
   * Uses the global /api/v1/spaces/{id} endpoint
   */
  async getSpaceById(spaceId: string): Promise<SpaceResponse> {
    const response = await apiClient.get<SpaceResponse>(
      API_ENDPOINTS.SPACES.GET_BY_ID(spaceId)
    );
    return response.data;
  }

  /**
   * Create a space globally (admin)
   * Uses the global /api/v1/spaces/ endpoint
   * Note: This is different from createSpace which is building-specific
   */
  async createSpaceGlobal(spaceData: SpaceCreate): Promise<SpaceResponse> {
    const response = await apiClient.post<SpaceResponse>(
      API_ENDPOINTS.SPACES.CREATE,
      spaceData
    );
    return response.data;
  }

  /**
   * Create a single space for a building
   */
  async createSpace(buildingId: string, spaceData: SpaceCreate): Promise<SpaceResponse> {
    const response = await apiClient.post<SpaceResponse>(
      API_ENDPOINTS.BUILDINGS.SPACES(buildingId),
      spaceData
    );
    return response.data;
  }

  /**
   * Create multiple spaces for a building
   */
  async createSpaces(buildingId: string, spacesData: SpaceCreate[]): Promise<SpaceResponse[]> {
    // Create spaces one by one since the API expects single objects
    const results: SpaceResponse[] = [];
    for (const spaceData of spacesData) {
      const result = await this.createSpace(buildingId, spaceData);
      results.push(result);
    }
    return results;
  }

  /**
   * Update space (building-specific endpoint)
   * Uses /api/v1/buildings/spaces/{id}
   */
  async updateSpace(
    spaceId: string,
    spaceData: SpaceUpdate
  ): Promise<SpaceResponse> {
    const response = await apiClient.put<SpaceResponse>(
      API_ENDPOINTS.SPACES.UPDATE(spaceId),
      spaceData
    );
    return response.data;
  }

  /**
   * Update space globally (admin)
   * Uses /api/v1/spaces/{id}
   */
  async updateSpaceGlobal(
    spaceId: string,
    spaceData: SpaceUpdate
  ): Promise<SpaceResponse> {
    const response = await apiClient.put<SpaceResponse>(
      API_ENDPOINTS.SPACES.UPDATE_GLOBAL(spaceId),
      spaceData
    );
    return response.data;
  }

  /**
   * Delete space (building-specific endpoint)
   * Uses /api/v1/buildings/spaces/{id}
   */
  async deleteSpace(spaceId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.SPACES.DELETE(spaceId)
    );
    return response.data;
  }

  /**
   * Delete space globally (admin)
   * Uses /api/v1/spaces/{id}
   */
  async deleteSpaceGlobal(spaceId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SPACES.DELETE_GLOBAL(spaceId));
  }

  /**
   * Get building floors
   */
  async getBuildingFloors(buildingId: string): Promise<FloorResponse[]> {
    const response = await apiClient.get<FloorResponse[]>(
      API_ENDPOINTS.BUILDINGS.FLOORS(buildingId)
    );
    return response.data;
  }

  /**
   * Get building blocks
   */
  async getBuildingBlocks(buildingId: string): Promise<BlockResponse[]> {
    const response = await apiClient.get<BlockResponse[]>(
      API_ENDPOINTS.BUILDINGS.BLOCKS(buildingId)
    );
    return response.data;
  }
}

export const spacesService = new SpacesService();
