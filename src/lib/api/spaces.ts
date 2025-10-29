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
   * Get all spaces with optional filters (Note: This endpoint may not exist)
   */
  async getSpaces(params?: GetSpacesParams): Promise<SpaceResponse[]> {
    // Note: The /api/v1/spaces/ endpoint doesn't exist in the current API
    // This method is kept for future compatibility
    throw new Error('GET /api/v1/spaces/ endpoint not available. Use getBuildingSpaces instead.');
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
   * Update space
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
   * Delete space
   */
  async deleteSpace(spaceId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.SPACES.DELETE(spaceId)
    );
    return response.data;
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
