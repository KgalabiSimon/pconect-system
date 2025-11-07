'use client';

import { useState, useEffect } from 'react';
import { useProgrammes } from './useProgrammes';

/**
 * Hook for programme selection in forms
 * Provides a simplified interface for programme dropdowns
 */
export const useProgrammeSelection = () => {
  const { programmes, loadProgrammes, isLoading, error } = useProgrammes();
  const [programmeOptions, setProgrammeOptions] = useState<Array<{value: string, label: string}>>([]);

  useEffect(() => {
    if (programmes.length > 0) {
      const options = programmes.map(programme => ({
        value: programme.id,
        label: programme.name
      }));
      setProgrammeOptions(options);
    }
  }, [programmes]);

  useEffect(() => {
    loadProgrammes();
  }, [loadProgrammes]);

  return {
    programmeOptions,
    isLoading,
    error,
    programmes
  };
};
