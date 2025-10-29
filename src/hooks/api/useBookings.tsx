/**
 * Bookings Hook
 * React hook for managing booking operations with Azure P-Connect API
 */

import { useState, useCallback } from 'react';
import { bookingsService } from '../../lib/api/bookings';
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

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadBookings = useCallback(async (params?: {
    skip?: number;
    limit?: number;
    user_id?: string;
    space_id?: string;
    status?: string;
    booking_date?: string;
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

  const getBookingById = useCallback(async (bookingId: string): Promise<BookingResponse | null> => {
    try {
      setError(null);
      
      const booking = await bookingsService.getBookingById(bookingId);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get booking';
      setError(errorMessage);
      console.error('Error getting booking:', err);
      return null;
    }
  }, []);

  const checkAvailability = useCallback(async (
    spaceId: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ): Promise<boolean> => {
    try {
      setError(null);
      
      const isAvailable = await bookingsService.checkAvailability(spaceId, date, startTime, endTime);
      return isAvailable;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check availability';
      setError(errorMessage);
      console.error('Error checking availability:', err);
      return false;
    }
  }, []);

  const getSpaceBookings = useCallback(async (spaceId: string): Promise<BookingResponse[]> => {
    try {
      setError(null);
      
      const spaceBookings = await bookingsService.getSpaceBookings(spaceId);
      return spaceBookings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get space bookings';
      setError(errorMessage);
      console.error('Error getting space bookings:', err);
      return [];
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
    getBookingById,
    checkAvailability,
    getSpaceBookings,
    getBookingsByDate,
  };
}
