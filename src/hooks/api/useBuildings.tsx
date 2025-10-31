'use client';

import { useState, useEffect, useCallback } from 'react';
import { buildingsService } from '../../lib/api/buildings';
import type {
  BuildingResponse,
  BuildingCreate,
  BuildingUpdate,
  FloorResponse,
  BlockResponse,
  SpaceResponse,
} from '../../types/api';
import { useAuth } from './useAuth';

interface UseBuildingsOptions {
  initialLoad?: boolean;
}

interface GetBuildingsParams {
  skip?: number;
  limit?: number;
  search?: string;
}

export const useBuildings = (options?: UseBuildingsOptions) => {
  const { isAuthenticated } = useAuth();
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [currentBuilding, setCurrentBuilding] = useState<BuildingResponse | null>(null);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [blocks, setBlocks] = useState<BlockResponse[]>([]);
  const [spaces, setSpaces] = useState<SpaceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadBuildings = useCallback(
    async (params?: GetBuildingsParams) => {
      if (!isAuthenticated) {
        setError('Authentication required to load buildings.');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await buildingsService.getBuildings(params);
        setBuildings(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load buildings.');
        console.error('Failed to load buildings:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const getBuildingById = useCallback(
    async (buildingId: string): Promise<BuildingResponse | null> => {
      if (!isAuthenticated) {
        setError('Authentication required to get building details.');
        return null;
      }
      setIsLoading(true);
      setError(null);
      try {
        const building = await buildingsService.getBuildingById(buildingId);
        setCurrentBuilding(building);
        return building;
      } catch (err: any) {
        setError(err.message || 'Failed to get building details.');
        console.error('Failed to get building details:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const createBuilding = useCallback(
    async (buildingData: BuildingCreate): Promise<BuildingResponse | null> => {
      if (!isAuthenticated) {
        setError('Authentication required to create building.');
        return null;
      }
      setIsUpdating(true);
      setError(null);
      try {
        const newBuilding = await buildingsService.createBuilding(buildingData);
        setBuildings((prev) => [...prev, newBuilding]);
        return newBuilding;
      } catch (err: any) {
        setError(err.message || 'Failed to create building.');
        console.error('Failed to create building:', err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated]
  );

  const updateBuilding = useCallback(
    async (
      buildingId: string,
      buildingData: BuildingUpdate
    ): Promise<BuildingResponse | null> => {
      if (!isAuthenticated) {
        setError('Authentication required to update building.');
        return null;
      }
      setIsUpdating(true);
      setError(null);
      try {
        const updatedBuilding = await buildingsService.updateBuilding(buildingId, buildingData);
        setBuildings((prev) =>
          prev.map((building) => (building.id === buildingId ? updatedBuilding : building))
        );
        if (currentBuilding?.id === buildingId) {
          setCurrentBuilding(updatedBuilding);
        }
        return updatedBuilding;
      } catch (err: any) {
        setError(err.message || 'Failed to update building.');
        console.error('Failed to update building:', err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated, currentBuilding]
  );

  const deleteBuilding = useCallback(
    async (buildingId: string): Promise<boolean> => {
      if (!isAuthenticated) {
        setError('Authentication required to delete building.');
        return false;
      }
      setIsUpdating(true);
      setError(null);
      try {
        await buildingsService.deleteBuilding(buildingId);
        setBuildings((prev) => prev.filter((building) => building.id !== buildingId));
        if (currentBuilding?.id === buildingId) {
          setCurrentBuilding(null);
        }
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to delete building.');
        console.error('Failed to delete building:', err);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated, currentBuilding]
  );

  const loadBuildingFloors = useCallback(
    async (buildingId: string): Promise<FloorResponse[]> => {
      if (!isAuthenticated) {
        setError('Authentication required to load floors.');
        return [];
      }
      setIsLoading(true);
      setError(null);
      try {
        const floorsData = await buildingsService.getBuildingFloors(buildingId);
        setFloors(floorsData);
        return floorsData;
      } catch (err: any) {
        setError(err.message || 'Failed to load floors.');
        console.error('Failed to load floors:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const loadBuildingBlocks = useCallback(
    async (buildingId: string): Promise<BlockResponse[]> => {
      if (!isAuthenticated) {
        setError('Authentication required to load blocks.');
        return [];
      }
      setIsLoading(true);
      setError(null);
      try {
        const blocksData = await buildingsService.getBuildingBlocks(buildingId);
        setBlocks(blocksData);
        return blocksData;
      } catch (err: any) {
        setError(err.message || 'Failed to load blocks.');
        console.error('Failed to load blocks:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const loadBuildingSpaces = useCallback(
    async (buildingId: string): Promise<SpaceResponse[]> => {
      if (!isAuthenticated) {
        setError('Authentication required to load spaces.');
        return [];
      }
      setIsLoading(true);
      setError(null);
      try {
        const spacesData = await buildingsService.getBuildingSpaces(buildingId);
        setSpaces(spacesData);
        return spacesData;
      } catch (err: any) {
        setError(err.message || 'Failed to load spaces.');
        console.error('Failed to load spaces:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (options?.initialLoad && isAuthenticated) {
      loadBuildings();
    }
  }, [options?.initialLoad, isAuthenticated, loadBuildings]);

  return {
    buildings,
    currentBuilding,
    floors,
    blocks,
    spaces,
    isLoading,
    isUpdating,
    error,
    clearError,
    loadBuildings,
    getBuildingById,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    loadBuildingFloors,
    loadBuildingBlocks,
    loadBuildingSpaces,
  };
};
