'use client';

import { useState, useEffect, useCallback } from 'react';
import { programmesService } from '../../lib/api/programmes';
import type {
  ProgrammeResponse,
  ProgrammeCreate,
  ProgrammeUpdate,
} from '../../types/api';
import { useAuth } from './useAuth';

interface UseProgrammesOptions {
  initialLoad?: boolean;
}

interface GetProgrammesParams {
  skip?: number;
  limit?: number;
  search?: string;
}

export const useProgrammes = (options?: UseProgrammesOptions) => {
  const { isAuthenticated } = useAuth();
  const [programmes, setProgrammes] = useState<ProgrammeResponse[]>([]);
  const [currentProgramme, setCurrentProgramme] = useState<ProgrammeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadProgrammes = useCallback(
    async (params?: GetProgrammesParams) => {
      if (!isAuthenticated) {
        setError('Authentication required to load programmes.');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await programmesService.getProgrammes(params);
        setProgrammes(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load programmes.');
        console.error('Failed to load programmes:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const getProgrammeById = useCallback(
    async (programmeId: string): Promise<ProgrammeResponse | null> => {
      if (!isAuthenticated) {
        setError('Authentication required to get programme details.');
        return null;
      }
      setIsLoading(true);
      setError(null);
      try {
        const programme = await programmesService.getProgrammeById(programmeId);
        setCurrentProgramme(programme);
        return programme;
      } catch (err: any) {
        setError(err.message || 'Failed to get programme details.');
        console.error('Failed to get programme details:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const createProgramme = useCallback(
    async (programmeData: ProgrammeCreate): Promise<ProgrammeResponse | null> => {
      if (!isAuthenticated) {
        setError('Authentication required to create programme.');
        return null;
      }
      setIsUpdating(true);
      setError(null);
      try {
        const newProgramme = await programmesService.createProgramme(programmeData);
        setProgrammes((prev) => [...prev, newProgramme]);
        return newProgramme;
      } catch (err: any) {
        setError(err.message || 'Failed to create programme.');
        console.error('Failed to create programme:', err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated]
  );

  const updateProgramme = useCallback(
    async (
      programmeId: string,
      programmeData: ProgrammeUpdate
    ): Promise<ProgrammeResponse | null> => {
      if (!isAuthenticated) {
        setError('Authentication required to update programme.');
        return null;
      }
      setIsUpdating(true);
      setError(null);
      try {
        const updatedProgramme = await programmesService.updateProgramme(programmeId, programmeData);
        setProgrammes((prev) =>
          prev.map((programme) => (programme.id === programmeId ? updatedProgramme : programme))
        );
        if (currentProgramme?.id === programmeId) {
          setCurrentProgramme(updatedProgramme);
        }
        return updatedProgramme;
      } catch (err: any) {
        setError(err.message || 'Failed to update programme.');
        console.error('Failed to update programme:', err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated, currentProgramme]
  );

  const deleteProgramme = useCallback(
    async (programmeId: string): Promise<boolean> => {
      if (!isAuthenticated) {
        setError('Authentication required to delete programme.');
        return false;
      }
      setIsUpdating(true);
      setError(null);
      try {
        await programmesService.deleteProgramme(programmeId);
        setProgrammes((prev) => prev.filter((programme) => programme.id !== programmeId));
        if (currentProgramme?.id === programmeId) {
          setCurrentProgramme(null);
        }
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to delete programme.');
        console.error('Failed to delete programme:', err);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated, currentProgramme]
  );

  useEffect(() => {
    if (options?.initialLoad && isAuthenticated) {
      loadProgrammes();
    }
  }, [options?.initialLoad, isAuthenticated, loadProgrammes]);

  return {
    programmes,
    currentProgramme,
    isLoading,
    isUpdating,
    error,
    clearError,
    loadProgrammes,
    getProgrammeById,
    createProgramme,
    updateProgramme,
    deleteProgramme,
  };
};
