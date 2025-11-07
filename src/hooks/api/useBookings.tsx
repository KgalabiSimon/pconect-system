/**
 * Bookings Hook
 * React hook for managing booking operations with Azure P-Connect API
 */

import { useState, useCallback } from 'react';
import { bookingsService } from '../../lib/api/bookings';
import { useAuth } from './useAuth';
import type {
  BookingResponse,
  BookingCreate,
  BookingUpdate,
} from '../../types/api';

interface UseBookingsOptions {
  initialLoad?: boolean;
  userId?: string;
}

export function useBookings(options: UseBookingsOptions = {}) {
  const { initialLoad = false, userId } = options;
  const { user } = useAuth(); // Get user to check if admin

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadBookings = useCallback(async (params?: {
    user_id?: string;
    building_id?: string;
    space_type?: 'DESK' | 'OFFICE' | 'ROOM';
    booking_date?: string; // ISO date-time string
    status?: 'pending' | 'checked_in' | 'checked_out'; // CheckInStatus
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const bookingData = await bookingsService.getBookings(params);
      setBookings(bookingData);
      
      return bookingData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookings';
      setError(errorMessage);
      console.error('Error loading bookings:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserBookings = useCallback(async (targetUserId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userBookings = await bookingsService.getUserBookings(targetUserId || userId);
      setBookings(userBookings);
      
      return userBookings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user bookings';
      setError(errorMessage);
      console.error('Error loading user bookings:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const createBooking = useCallback(async (bookingData: BookingCreate): Promise<BookingResponse | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const newBooking = await bookingsService.createBooking(bookingData);
      
      // Add to local state
      setBookings(prev => [newBooking, ...prev]);
      
      return newBooking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      console.error('Error creating booking:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateBooking = useCallback(async (bookingId: string, updateData: BookingUpdate): Promise<BookingResponse | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedBooking = await bookingsService.updateBooking(bookingId, updateData);
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? updatedBooking : booking
        )
      );
      
      return updatedBooking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      console.error('Error updating booking:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      await bookingsService.deleteBooking(bookingId);
      
      // Remove from local state
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      setError(errorMessage);
      console.error('Error deleting booking:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  /**
   * Note: GET booking by ID endpoint doesn't exist in the API spec
   * Use loadBookings with filters or getBookingsByDate to find specific bookings
   */

  const checkAvailability = useCallback(async (
    buildingId: string,
    floor: number,
    spaceType: 'DESK' | 'OFFICE' | 'ROOM',
    date: string, 
    startTime: string, 
    endTime: string
  ): Promise<boolean> => {
    try {
      setError(null);
      
      // Use the dedicated availability endpoint
      const isAvailable = await bookingsService.checkAvailability(
        buildingId, 
        floor, 
        spaceType, 
        date, 
        startTime, 
        endTime
      );
      return isAvailable;
    } catch (err: any) {
      // Don't set error for 401/403 - these are handled gracefully (assume available)
      // The backend will validate availability when creating the booking
      // Regular users may not have permission to check availability, which is expected
      if (err?.status === 401 || err?.status === 403) {
        // Silently handle - don't log as error, don't set error state
        // The browser will show the network request in network tab (normal behavior)
        // But we won't add additional error logging
        return true; // Optimistic: assume available, backend will validate
      }
      // For other errors, also return true (better UX than blocking)
      // Don't set error state for availability checks to avoid breaking UI
      return true;
    }
  }, []);

  const getBuildingBookings = useCallback(async (buildingId: string): Promise<BookingResponse[]> => {
    try {
      setError(null);
      
      const buildingBookings = await bookingsService.getBuildingBookings(buildingId);
      return buildingBookings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get building bookings';
      setError(errorMessage);
      console.error('Error getting building bookings:', err);
      return [];
    }
  }, []);

  const getAdminBookings = useCallback(async (params?: {
    user_id?: string;
    building_id?: string;
    space_type?: 'DESK' | 'OFFICE' | 'ROOM';
    booking_date?: string;
    status?: 'pending' | 'checked_in' | 'checked_out';
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingsService.getAdminBookings(params);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get admin bookings';
      setError(errorMessage);
      console.error('Error getting admin bookings:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBookingsByDate = useCallback(async (date: string): Promise<BookingResponse[]> => {
    try {
      setError(null);
      
      const dateBookings = await bookingsService.getBookingsByDate(date);
      return dateBookings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get bookings by date';
      setError(errorMessage);
      console.error('Error getting bookings by date:', err);
      return [];
    }
  }, []);

  return {
    bookings,
    isLoading,
    isUpdating,
    error,
    clearError,
    loadBookings,
    loadUserBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    checkAvailability,
    getBuildingBookings,
    getBookingsByDate,
    getAdminBookings, // NEW - Admin-only endpoint to view all bookings
  };
}
