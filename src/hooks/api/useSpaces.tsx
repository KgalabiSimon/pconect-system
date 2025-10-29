'use client';

import { useState, useEffect, useCallback } from 'react';
import { spacesService } from '../../lib/api/spaces';
import type {
  SpaceResponse,
  SpaceCreate,
  SpaceUpdate,
  FloorResponse,
  BlockResponse,
} from '../../types/api';
import { useAuth } from './useAuth';

interface UseSpacesOptions {
  buildingId?: string;
  initialLoad?: boolean;
}

interface GetSpacesParams {
  skip?: number;
  limit?: number;
  building_id?: string;
  type?: string;
}

export const useSpaces = (options?: UseSpacesOptions) => {
  const { isAuthenticated } = useAuth();
  const [spaces, setSpaces] = useState<SpaceResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [blocks, setBlocks] = useState<BlockResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadSpaces = useCallback(
    async (params?: GetSpacesParams) => {
      if (!isAuthenticated) {
        setError('Authentication required to load spaces.');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Note: The getSpaces method throws an error since the endpoint doesn't exist
        // This is kept for future compatibility
        throw new Error('GET /api/v1/spaces/ endpoint not available. Use loadBuildingSpaces instead.');
      } catch (err: any) {
        setError(err.message || 'Failed to load spaces.');
        console.error('Failed to load spaces:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const loadBuildingSpaces = useCallback(
    async (buildingId: string): Promise<SpaceResponse[]> => {
      if (!isAuthenticated) {
        setError('Authentication required to load building spaces.');
        return [];
      }
      setIsLoading(true);
      setError(null);
      try {
        const spacesData = await spacesService.getBuildingSpaces(buildingId);
        setSpaces(spacesData);
        return spacesData;
      } catch (err: any) {
        setError(err.message || 'Failed to load building spaces.');
        console.error('Failed to load building spaces:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const createSpaces = useCallback(
    async (buildingId: string, spacesData: SpaceCreate[]): Promise<SpaceResponse[] | null> => {
      if (!isAuthenticated) {
        setError('Authentication required to create spaces.');
        return null;
      }
      setIsUpdating(true);
      setError(null);
      try {
        const newSpaces = await spacesService.createSpaces(buildingId, spacesData);
        setSpaces((prev) => [...prev, ...newSpaces]);
        return newSpaces;
      } catch (err: any) {
        setError(err.message || 'Failed to create spaces.');
        console.error('Failed to create spaces:', err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated]
  );

  const updateSpace = useCallback(
    async (
      spaceId: string,
      spaceData: SpaceUpdate
    ): Promise<SpaceResponse | null> => {
      if (!isAuthenticated) {
        setError('Authentication required to update space.');
        return null;
      }
      setIsUpdating(true);
      setError(null);
      try {
        const updatedSpace = await spacesService.updateSpace(spaceId, spaceData);
        setSpaces((prev) =>
          prev.map((space) => (space.id === spaceId ? updatedSpace : space))
        );
        return updatedSpace;
      } catch (err: any) {
        setError(err.message || 'Failed to update space.');
        console.error('Failed to update space:', err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated]
  );

  const deleteSpace = useCallback(
    async (spaceId: string): Promise<boolean> => {
      if (!isAuthenticated) {
        setError('Authentication required to delete space.');
        return false;
      }
      setIsUpdating(true);
      setError(null);
      try {
        await spacesService.deleteSpace(spaceId);
        setSpaces((prev) => prev.filter((space) => space.id !== spaceId));
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to delete space.');
        console.error('Failed to delete space:', err);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated]
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
        const floorsData = await spacesService.getBuildingFloors(buildingId);
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
        const blocksData = await spacesService.getBuildingBlocks(buildingId);
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

  useEffect(() => {
    if (options?.initialLoad && isAuthenticated) {
      if (options.buildingId) {
        loadBuildingSpaces(options.buildingId);
      } else {
        loadSpaces();
      }
    }
  }, [options?.initialLoad, options?.buildingId, isAuthenticated, loadBuildingSpaces, loadSpaces]);

  return {
    spaces,
    floors,
    blocks,
    isLoading,
    isUpdating,
    error,
    clearError,
    loadSpaces,
    loadBuildingSpaces,
    createSpaces,
    updateSpace,
    deleteSpace,
    loadBuildingFloors,
    loadBuildingBlocks,
  };
};
