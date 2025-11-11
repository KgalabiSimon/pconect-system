'use client';

import { useState, useEffect } from 'react';
import { useBuildings } from './useBuildings';

/**
 * Hook for building selection in forms
 * Provides a simplified interface for building dropdowns
 */
export const useBuildingSelection = () => {
  const { buildings, loadBuildings, isLoading, error } = useBuildings();
  const [buildingOptions, setBuildingOptions] = useState<Array<{value: string, label: string}>>([]);

  useEffect(() => {
    if (buildings.length > 0) {
      const options = buildings.map(building => ({
        value: building.id,
        label: building.name
      }));
      setBuildingOptions(options);
    }
  }, [buildings]);

  useEffect(() => {
    loadBuildings();
  }, [loadBuildings]);

  return {
    buildingOptions,
    isLoading,
    error,
    buildings
  };
};
