'use client';

import { useState, useEffect } from 'react';
import { buildingsService } from '../../lib/api/buildings';
import type { BuildingResponse } from '../../types/api';

/**
 * Hook for building selection in public forms (like registration)
 * Does not require authentication
 */
export const useBuildingSelectionPublic = () => {
  const [buildingOptions, setBuildingOptions] = useState<Array<{value: string, label: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBuildings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the API client directly with skipAuth option
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pconnect-api-gcdce6eagcfyavgr.southafricanorth-01.azurewebsites.net'}/api/v1/buildings/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buildings: BuildingResponse[] = await response.json();
      
      const options = buildings.map(building => ({
        value: building.id,
        label: building.name
      }));
      setBuildingOptions(options);
    } catch (err: any) {
      setError(err.message || 'Failed to load buildings.');
      console.error('Failed to load buildings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  return {
    buildingOptions,
    isLoading,
    error,
    loadBuildings
  };
};
