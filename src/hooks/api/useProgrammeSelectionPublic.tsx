'use client';

import { useState, useEffect } from 'react';
import type { ProgrammeResponse } from '../../types/api';

/**
 * Hook for programme selection in public forms (like registration)
 * Does not require authentication
 */
export const useProgrammeSelectionPublic = () => {
  const [programmeOptions, setProgrammeOptions] = useState<Array<{value: string, label: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProgrammes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the API client directly with skipAuth option
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pconnect-api-gcdce6eagcfyavgr.southafricanorth-01.azurewebsites.net'}/api/v1/programmes/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const programmes: ProgrammeResponse[] = await response.json();
      
      const options = programmes.map(programme => ({
        value: programme.id,
        label: programme.name
      }));
      setProgrammeOptions(options);
    } catch (err: any) {
      setError(err.message || 'Failed to load programmes.');
      console.error('Failed to load programmes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgrammes();
  }, []);

  return {
    programmeOptions,
    isLoading,
    error,
    loadProgrammes
  };
};
