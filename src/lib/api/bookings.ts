/**
 * Bookings API Service
 * Handles all booking-related API calls to Azure P-Connect API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  BookingResponse,
  BookingCreate,
  BookingUpdate,
} from '../../types/api';

interface GetBookingsParams {
  skip?: number;
  limit?: number;
  user_id?: string;
  space_id?: string;
  status?: string;
  booking_date?: string;
}

export class BookingsService {
  /**
   * Get all bookings with optional filters
   */
  async getBookings(params?: GetBookingsParams): Promise<BookingResponse[]> {
    const response = await apiClient.get<BookingResponse[]>(
      API_ENDPOINTS.BOOKINGS.LIST,
      { params }
    );
    return response.data;
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: BookingCreate): Promise<BookingResponse> {
    const response = await apiClient.post<BookingResponse>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      bookingData
    );
    return response.data;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<BookingResponse> {
    const response = await apiClient.get<BookingResponse>(
      API_ENDPOINTS.BOOKINGS.GET_BY_ID(bookingId)
    );
    return response.data;
  }

  /**
   * Update booking
   */
  async updateBooking(bookingId: string, updateData: BookingUpdate): Promise<BookingResponse> {
    const response = await apiClient.put<BookingResponse>(
      API_ENDPOINTS.BOOKINGS.UPDATE(bookingId),
      updateData
    );
    return response.data;
  }

  /**
   * Delete booking
   */
  async deleteBooking(bookingId: string): Promise<boolean> {
    await apiClient.delete(API_ENDPOINTS.BOOKINGS.DELETE(bookingId));
    return true;
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId?: string): Promise<BookingResponse[]> {
    const params = userId ? { user_id: userId } : {};
    return this.getBookings(params);
  }

  /**
   * Get bookings for a specific space
   */
  async getSpaceBookings(spaceId: string): Promise<BookingResponse[]> {
    return this.getBookings({ space_id: spaceId });
  }

  /**
   * Get bookings for a specific date
   */
  async getBookingsByDate(date: string): Promise<BookingResponse[]> {
    return this.getBookings({ booking_date: date });
  }

  /**
   * Check space availability for a specific date and time
   */
  async checkAvailability(spaceId: string, date: string, startTime: string, endTime: string): Promise<boolean> {
    try {
      const bookings = await this.getSpaceBookings(spaceId);
      const requestedStart = new Date(`${date}T${startTime}`);
      const requestedEnd = new Date(`${date}T${endTime}`);

      // Check for conflicts
      const hasConflict = bookings.some(booking => {
        if (booking.booking_date !== date || booking.status === 'CANCELLED') {
          return false;
        }

        const bookingStart = new Date(`${booking.booking_date}T${booking.start_time}`);
        const bookingEnd = new Date(`${booking.booking_date}T${booking.end_time}`);

        // Check for time overlap
        return (
          (requestedStart < bookingEnd && requestedEnd > bookingStart)
        );
      });

      return !hasConflict;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }
}

export const bookingsService = new BookingsService();
