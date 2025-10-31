/**
 * Visitors Hook
 * React hook for managing visitor operations with Azure P-Connect API
 */

import { useState, useCallback } from 'react';
import { visitorsService } from '../../lib/api/visitors';
import type {
  VisitorResponse,
  VisitorCreate,
  VisitorUpdate,
  VisitorSearch,
  VisitorByPhone,
} from '../../types/api';

interface UseVisitorsOptions {
  initialLoad?: boolean;
  hostEmployeeId?: string; // Optional: to fetch visitors for a specific host
}

export function useVisitors(options?: UseVisitorsOptions) {
  const { initialLoad = false, hostEmployeeId } = options || {};
  const [visitors, setVisitors] = useState<VisitorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadVisitors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await visitorsService.getVisitors();
      // Further filter by hostEmployeeId if provided in options
      let filteredData = data;
      if (hostEmployeeId) {
        filteredData = filteredData.filter(v => v.host_employee_id === hostEmployeeId);
      }
      setVisitors(filteredData);
    } catch (err: any) {
      setError(err.message || 'Failed to load visitors');
    } finally {
      setIsLoading(false);
    }
  }, [hostEmployeeId]);

  const createVisitor = useCallback(async (visitorData: VisitorCreate) => {
    setIsUpdating(true);
    setError(null);
    try {
      const newVisitor = await visitorsService.createVisitor(visitorData);
      setVisitors((prev) => [...prev, newVisitor]);
      return newVisitor;
    } catch (err: any) {
      setError(err.message || 'Failed to create visitor');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateVisitor = useCallback(async (id: string, visitorData: VisitorUpdate) => {
    setIsUpdating(true);
    setError(null);
    try {
      const updatedVisitor = await visitorsService.updateVisitor(id, visitorData);
      setVisitors((prev) =>
        prev.map((v) => (v.id === id ? updatedVisitor : v))
      );
      return updatedVisitor;
    } catch (err: any) {
      setError(err.message || 'Failed to update visitor');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteVisitor = useCallback(async (id: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      await visitorsService.deleteVisitor(id);
      setVisitors((prev) => prev.filter((v) => v.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete visitor');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const registerVisitor = useCallback(async (visitorData: VisitorCreate) => {
    setIsUpdating(true);
    setError(null);
    try {
      const newVisitor = await visitorsService.registerVisitor(visitorData);
      setVisitors((prev) => [...prev, newVisitor]);
      return newVisitor;
    } catch (err: any) {
      setError(err.message || 'Failed to register visitor');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const searchVisitors = useCallback(async (searchParams: VisitorSearch) => {
    setError(null);
    try {
      return await visitorsService.searchVisitors(searchParams);
    } catch (err: any) {
      setError(err.message || 'Failed to search visitors');
      return [];
    }
  }, []);

  const checkInVisitor = useCallback(async (visitorId: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const updatedVisitor = await visitorsService.checkInVisitor(visitorId);
      setVisitors((prev) =>
        prev.map((v) => (v.id === visitorId ? updatedVisitor : v))
      );
      return updatedVisitor;
    } catch (err: any) {
      setError(err.message || 'Failed to check-in visitor');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const checkOutVisitor = useCallback(async (visitorId: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const updatedVisitor = await visitorsService.checkOutVisitor(visitorId);
      setVisitors((prev) =>
        prev.map((v) => (v.id === visitorId ? updatedVisitor : v))
      );
      return updatedVisitor;
    } catch (err: any) {
      setError(err.message || 'Failed to check-out visitor');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const getVisitorByPhone = useCallback(async (phoneData: VisitorByPhone) => {
    setError(null);
    try {
      return await visitorsService.getVisitorByPhone(phoneData);
    } catch (err: any) {
      setError(err.message || 'Failed to find visitor by phone');
      return null;
    }
  }, []);

  const getActiveVisitors = useCallback(async () => {
    setError(null);
    try {
      return await visitorsService.getActiveVisitors();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active visitors');
      return [];
    }
  }, []);

  const getVisitorsByHost = useCallback(async (hostEmployeeId: string) => {
    setError(null);
    try {
      return await visitorsService.getVisitorsByHost(hostEmployeeId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visitors by host');
      return [];
    }
  }, []);

  const getVisitorsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    setError(null);
    try {
      return await visitorsService.getVisitorsByDateRange(startDate, endDate);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visitors by date range');
      return [];
    }
  }, []);

  const getVisitorStats = useCallback(async () => {
    setError(null);
    try {
      return await visitorsService.getVisitorStats();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visitor statistics');
      return {
        total: 0,
        checkedIn: 0,
        checkedOut: 0,
        registered: 0,
      };
    }
  }, []);

  return {
    visitors,
    isLoading,
    isUpdating,
    error,
    loadVisitors,
    createVisitor,
    updateVisitor,
    deleteVisitor,
    registerVisitor,
    searchVisitors,
    checkInVisitor,
    checkOutVisitor,
    getVisitorByPhone,
    getActiveVisitors,
    getVisitorsByHost,
    getVisitorsByDateRange,
    getVisitorStats,
    clearError,
  };
}
