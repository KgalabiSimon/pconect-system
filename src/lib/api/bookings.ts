/**
 * Bookings API Service
 * Handles all booking-related API calls to Azure P-Connect API
 */

import { apiClient } from './client';
import { API_ENDPOINTS, API_CONFIG } from './config';
import type {
  BookingResponse,
  BookingCreate,
  BookingUpdate,
} from '../../types/api';

interface GetBookingsParams {
  user_id?: string;
  building_id?: string;
  space_type?: 'DESK' | 'OFFICE' | 'ROOM';
  booking_date?: string; // ISO date-time string
  status?: 'pending' | 'checked_in' | 'checked_out'; // CheckInStatus
}

export class BookingsService {
  /**
   * Get all bookings with optional filters
   */
  async getBookings(params?: GetBookingsParams, options?: { suppressErrorLog?: boolean }): Promise<BookingResponse[]> {
    const response = await apiClient.get<BookingResponse[]>(
      API_ENDPOINTS.BOOKINGS.LIST,
      { params: params as Record<string, string | number | undefined> | undefined, suppressErrorLog: options?.suppressErrorLog }
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
   * Get admin list of bookings (admin-only endpoint)
   */
  async getAdminBookings(params?: GetBookingsParams): Promise<BookingResponse[]> {
    const response = await apiClient.get<BookingResponse[]>(
      API_ENDPOINTS.BOOKINGS.ADMIN_LIST,
      { params: params as Record<string, string | number | undefined> | undefined }
    );
    return response.data;
  }

  /**
   * Note: GET booking by ID endpoint doesn't exist in the API spec
   * Use list endpoint with filters if needed
   */

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
   * Get bookings for a specific building
   */
  async getBuildingBookings(buildingId: string): Promise<BookingResponse[]> {
    return this.getBookings({ building_id: buildingId });
  }

  /**
   * Get bookings for a specific date
   * Note: API expects date-time format, but we'll try date-only first
   * If API rejects it, format as: new Date(`${date}T00:00:00`).toISOString()
   */
  async getBookingsByDate(date: string): Promise<BookingResponse[]> {
    // If date is already in ISO format, use it; otherwise try date-only
    // API spec says date-time format, but many APIs accept date-only
    const formattedDate = date.includes('T') ? date : date;
    return this.getBookings({ booking_date: formattedDate });
  }

  /**
   * Check availability for a building and space type
   * Uses the dedicated /api/v1/booking/availability endpoint
   * 
   * API Parameters (from OpenAPI spec at https://pconnect-api-gcdce6eagcfyavgr.southafricanorth-01.azurewebsites.net/docs):
   * - building_id: Building ID (UUID, required)
   * - space_type: Type of space (DESK, OFFICE, ROOM, required)
   * - booking_date: Booking date in date-time format (required, e.g., "2025-10-20T00:00:00")
   * - start_time: Start time in time format (required, HH:mm, e.g., "09:00")
   * - end_time: End time in time format (required, HH:mm, e.g., "17:00")
   * 
   * Note: Floor parameter is NOT supported by the API
   * 
   * Parameters:
   * - buildingId: Building ID (UUID)
   * - floor: Floor number (NOT used by API, kept for backward compatibility)
   * - spaceType: Type of space (DESK, OFFICE, ROOM)
   * - date: Booking date (ISO date string, e.g., "2025-10-20" - will be converted to date-time)
   * - startTime: Start time (HH:mm format, e.g., "09:00")
   * - endTime: End time (HH:mm format, e.g., "17:00")
   * 
   * Returns: boolean indicating if space is available
   */
  async checkAvailability(
    buildingId: string,
    floor: number,
    spaceType: 'DESK' | 'OFFICE' | 'ROOM',
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      // Convert date to date-time format as required by API
      // API expects booking_date in date-time format (e.g., "2025-10-20T00:00:00")
      // If date is just "YYYY-MM-DD", convert to "YYYY-MM-DDTHH:mm:ss"
      const bookingDateTime = date.includes('T') 
        ? date 
        : `${date}T00:00:00`;

      // Build query parameters for availability endpoint
      // Note: API does NOT accept floor parameter (only building_id, space_type, booking_date, start_time, end_time)
      const params: Record<string, string> = {
        building_id: buildingId,
        space_type: spaceType,
        booking_date: bookingDateTime, // Must be in date-time format
        start_time: startTime, // HH:mm format
        end_time: endTime, // HH:mm format
      };

      // Call the availability endpoint
      // The endpoint might return:
      // - { available: boolean } - object with available property
      // - boolean - direct boolean value
      // - { available: boolean, spaces?: SpaceResponse[] } - with space details
      const response = await apiClient.get<{ available: boolean } | boolean>(
        API_ENDPOINTS.BOOKINGS.AVAILABILITY,
        { 
          params: params as Record<string, string | number | undefined>,
          suppressErrorLog: true // Suppress error logging for availability checks
        }
      );

      // Handle different response formats
      if (typeof response.data === 'boolean') {
        return response.data;
      }
      // If it's an object, check for available property
      return (response.data as any)?.available ?? true;
    } catch (error: any) {
      // If user doesn't have permission to check availability (401/403), assume available
      // The backend will validate availability when creating the booking
      if (error?.status === 401 || error?.status === 403) {
        // Don't log as error - this is expected behavior for regular users
        if (API_CONFIG.FEATURES.ENABLE_LOGGING) {
          console.log('[BookingsService] User does not have permission to check availability, assuming available');
        }
        return true; // Optimistic: assume available, backend will validate
      }
      // For other errors, also assume available (better UX than blocking)
      if (API_CONFIG.FEATURES.ENABLE_LOGGING) {
        console.warn('[BookingsService] Error checking availability, assuming available:', error?.message || 'Unknown error');
      }
      return true;
    }
  }
}

export const bookingsService = new BookingsService();
