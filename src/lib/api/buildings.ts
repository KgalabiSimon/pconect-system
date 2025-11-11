/**
 * Buildings API Service
 * Handles all building-related API calls to Azure P-Connect API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  BuildingResponse,
  BuildingCreate,
  BuildingUpdate,
  FloorResponse,
  BlockResponse,
  SpaceResponse,
} from '../../types/api';

interface GetBuildingsParams {
  skip?: number;
  limit?: number;
  search?: string;
}

export class BuildingsService {
  /**
   * Get all buildings with optional filters
   */
  async getBuildings(params?: GetBuildingsParams): Promise<BuildingResponse[]> {
    let endpoint = API_ENDPOINTS.BUILDINGS.LIST;
    
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
    
    const response = await apiClient.get<BuildingResponse[]>(endpoint);
    return response.data;
  }

  /**
   * Get building by ID
   */
  async getBuildingById(buildingId: string): Promise<BuildingResponse> {
    const response = await apiClient.get<BuildingResponse>(
      API_ENDPOINTS.BUILDINGS.GET(buildingId)
    );
    return response.data;
  }

  /**
   * Create a new building
   */
  async createBuilding(buildingData: BuildingCreate): Promise<BuildingResponse> {
    const response = await apiClient.post<BuildingResponse>(
      API_ENDPOINTS.BUILDINGS.CREATE,
      buildingData
    );
    return response.data;
  }

  /**
   * Update building
   */
  async updateBuilding(
    buildingId: string,
    buildingData: BuildingUpdate
  ): Promise<BuildingResponse> {
    const response = await apiClient.put<BuildingResponse>(
      API_ENDPOINTS.BUILDINGS.UPDATE(buildingId),
      buildingData
    );
    return response.data;
  }

  /**
   * Delete building
   */
  async deleteBuilding(buildingId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.BUILDINGS.DELETE(buildingId)
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

  /**
   * Get building spaces
   */
  async getBuildingSpaces(buildingId: string): Promise<SpaceResponse[]> {
    const response = await apiClient.get<SpaceResponse[]>(
      API_ENDPOINTS.BUILDINGS.SPACES(buildingId)
    );
    return response.data;
  }
}

export const buildingsService = new BuildingsService();
