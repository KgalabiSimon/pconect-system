/**
 * Check-ins Hook
 * React hook for managing check-in operations with Azure P-Connect API
 */

import { useState, useCallback } from 'react';
import { checkInsService } from '../../lib/api/checkins';
import type {
  CheckInResponse,
  CheckInCreate,
  CheckInUpdate,
  QRCodeGenerate,
  QRCodeScan,
} from '../../types/api';

interface UseCheckInsOptions {
  initialLoad?: boolean;
  userId?: string; // Optional: to fetch check-ins for a specific user
}

export function useCheckIns(options?: UseCheckInsOptions) {
  const { initialLoad = false, userId } = options || {};
  const [checkIns, setCheckIns] = useState<CheckInResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadCheckIns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await checkInsService.getCheckIns();
      // Further filter by userId if provided in options
      let filteredData = data;
      if (userId) {
        filteredData = filteredData.filter(c => c.user_id === userId);
      }
      setCheckIns(filteredData);
    } catch (err: any) {
      setError(err.message || 'Failed to load check-ins');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const createCheckIn = useCallback(async (checkInData: CheckInCreate) => {
    setIsUpdating(true);
    setError(null);
    try {
      const newCheckIn = await checkInsService.createCheckIn(checkInData);
      setCheckIns((prev) => [...prev, newCheckIn]);
      return newCheckIn;
    } catch (err: any) {
      setError(err.message || 'Failed to create check-in');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateCheckIn = useCallback(async (id: string, checkInData: CheckInUpdate) => {
    setIsUpdating(true);
    setError(null);
    try {
      const updatedCheckIn = await checkInsService.updateCheckIn(id, checkInData);
      setCheckIns((prev) =>
        prev.map((c) => (c.id === id ? updatedCheckIn : c))
      );
      return updatedCheckIn;
    } catch (err: any) {
      setError(err.message || 'Failed to update check-in');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteCheckIn = useCallback(async (id: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      await checkInsService.deleteCheckIn(id);
      setCheckIns((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete check-in');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const checkIn = useCallback(async (checkInData: CheckInCreate) => {
    setIsUpdating(true);
    setError(null);
    try {
      const newCheckIn = await checkInsService.checkIn(checkInData);
      setCheckIns((prev) => [...prev, newCheckIn]);
      return newCheckIn;
    } catch (err: any) {
      setError(err.message || 'Failed to check-in');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const checkOut = useCallback(async (checkInId: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const updatedCheckIn = await checkInsService.checkOut(checkInId);
      setCheckIns((prev) =>
        prev.map((c) => (c.id === checkInId ? updatedCheckIn : c))
      );
      return updatedCheckIn;
    } catch (err: any) {
      setError(err.message || 'Failed to check-out');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const getUserCheckInHistory = useCallback(async (userId: string) => {
    setError(null);
    try {
      return await checkInsService.getUserCheckInHistory(userId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch check-in history');
      return [];
    }
  }, []);

  const generateQRCode = useCallback(async (qrData: QRCodeGenerate) => {
    setError(null);
    try {
      return await checkInsService.generateQRCode(qrData);
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
      return null;
    }
  }, []);

  const scanQRCode = useCallback(async (scanData: QRCodeScan) => {
    setIsUpdating(true);
    setError(null);
    try {
      const result = await checkInsService.scanQRCode(scanData);
      // Update the check-ins list with the result
      setCheckIns((prev) => {
        const existingIndex = prev.findIndex(c => c.id === result.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = result;
          return updated;
        } else {
          return [...prev, result];
        }
      });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to scan QR code');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const getActiveCheckIns = useCallback(async (userId?: string) => {
    setError(null);
    try {
      return await checkInsService.getActiveCheckIns(userId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active check-ins');
      return [];
    }
  }, []);

  const getCheckInsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    setError(null);
    try {
      return await checkInsService.getCheckInsByDateRange(startDate, endDate);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch check-ins by date range');
      return [];
    }
  }, []);

  return {
    checkIns,
    isLoading,
    isUpdating,
    error,
    loadCheckIns,
    createCheckIn,
    updateCheckIn,
    deleteCheckIn,
    checkIn,
    checkOut,
    getUserCheckInHistory,
    generateQRCode,
    scanQRCode,
    getActiveCheckIns,
    getCheckInsByDateRange,
    clearError,
  };
}
