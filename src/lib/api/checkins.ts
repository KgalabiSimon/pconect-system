/**
 * Check-ins API Service
 * Handles all check-in related API calls to Azure P-Connect API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  CheckInResponse,
  CheckInCreate,
  CheckInUpdate,
  QRCodeGenerate,
  QRCodeScan,
  CheckInStatusResponse,
} from '../../types/api';

export class CheckInsService {
  /**
   * Get all check-ins
   */
  async getCheckIns(): Promise<CheckInResponse[]> {
    const response = await apiClient.get<CheckInResponse[]>(API_ENDPOINTS.CHECKINS.LIST);
    return response.data;
  }

  /**
   * Create a new check-in
   */
  async createCheckIn(data: CheckInCreate): Promise<CheckInResponse> {
    const response = await apiClient.post<CheckInResponse>(
      API_ENDPOINTS.CHECKINS.CREATE,
      data
    );
    return response.data;
  }

  /**
   * Get check-in by ID
   */
  async getCheckInById(id: string): Promise<CheckInResponse> {
    const response = await apiClient.get<CheckInResponse>(
      API_ENDPOINTS.CHECKINS.GET_BY_ID(id)
    );
    return response.data;
  }

  /**
   * Update check-in
   */
  async updateCheckIn(id: string, data: CheckInUpdate): Promise<CheckInResponse> {
    const response = await apiClient.put<CheckInResponse>(
      API_ENDPOINTS.CHECKINS.UPDATE(id),
      data
    );
    return response.data;
  }

  /**
   * Delete check-in
   */
  async deleteCheckIn(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CHECKINS.DELETE(id));
  }

  /**
   * Check-in user
   * Note: NEW API - all data in request body, no query parameters
   * API returns CheckInResponse object with qr_code_data field
   */
  async checkIn(checkInData: CheckInCreate): Promise<CheckInResponse> {
    console.log('[CheckInsService] checkIn called with data:', checkInData);
    console.log('[CheckInsService] API Client token exists:', !!apiClient.getAuthToken());
    console.log('[CheckInsService] API Client token preview:', apiClient.getAuthToken()?.substring(0, 20) + '...');
    
    const response = await apiClient.post<any>(
      API_ENDPOINTS.CHECKINS.CHECK_IN,
      checkInData  // All fields in body (user_id, floor, block, laptop_model, laptop_asset_number)
    );
    
    console.log('[CheckInsService] checkIn response:', response.data);
    console.log('[CheckInsService] Full API response keys:', Object.keys(response.data || {}));
    
    // API returns: { message, qr_code_base64, checkin_id } OR full CheckInResponse
    // Check if API returns full check-in details or just minimal response
    const apiResponse = response.data;
    const checkinId = apiResponse.checkin_id || apiResponse.id;
    
    // Try to construct the response using API data first, then fallback to request data
    const checkInResponse: CheckInResponse = {
      id: checkinId,
      qr_code_data: checkinId, // Use checkin_id as QR code data (UUID)
      status: apiResponse.status || 'checked_in' as const,
      check_in_time: apiResponse.check_in_time || apiResponse.created_at || new Date().toISOString(),
      user_id: apiResponse.user_id || checkInData.user_id,
      // Use API response data if available, otherwise use request data
      floor: apiResponse.floor || checkInData.floor,
      block: apiResponse.block || checkInData.block,
      laptop_model: apiResponse.laptop_model || checkInData.laptop_model,
      laptop_asset_number: apiResponse.laptop_asset_number || checkInData.laptop_asset_number,
      // Store the base64 QR code image if needed (for display purposes)
      ...(apiResponse.qr_code_base64 && { 
        // Could add a custom field for this, but for now we'll use checkin_id
      }),
    };
    
    console.log('[CheckInsService] Transformed CheckInResponse:', {
      id: checkInResponse.id,
      floor: checkInResponse.floor,
      block: checkInResponse.block,
      laptop_model: checkInResponse.laptop_model,
      laptop_asset_number: checkInResponse.laptop_asset_number,
      status: checkInResponse.status,
    });
    
    // If API didn't return full details, try to fetch them immediately after creation
    // This ensures we have the complete check-in data
    if (checkinId && (!apiResponse.floor || !apiResponse.block)) {
      console.log('[CheckInsService] API response missing details, attempting to fetch full check-in...');
      try {
        // Try to get check-ins for this user and find the one we just created
        const userCheckIns = await this.getCheckInsByUserId(checkInData.user_id);
        const fullCheckIn = userCheckIns.find(c => c.id === checkinId);
        
        if (fullCheckIn) {
          console.log('[CheckInsService] ✅ Found full check-in details:', fullCheckIn);
          // Merge the full details
          return {
            ...checkInResponse,
            ...fullCheckIn,
            qr_code_data: checkinId, // Ensure QR code data is set
          };
        }
      } catch (fetchError: any) {
        // If we can't fetch (403 permission denied, etc.), use what we have
        console.log('[CheckInsService] Could not fetch full check-in details:', fetchError?.status || 'unknown error');
        console.log('[CheckInsService] Using request data for check-in details');
      }
    }
    
    return checkInResponse;
  }

  /**
   * Check-out user
   */
  async checkOut(checkInId: string): Promise<CheckInResponse> {
    // API expects checkin_id (no underscore) in the request body
    const response = await apiClient.post<CheckInResponse>(
      API_ENDPOINTS.CHECKINS.CHECK_OUT,
      { checkin_id: checkInId }
    );
    return response.data;
  }

  /**
   * Get user's check-in history
   * Note: NEW API - uses GET /api/v1/checkin/ with user_id filter
   */
  async getUserCheckInHistory(userId: string): Promise<CheckInResponse[]> {
    try {
      // Use the new GET endpoint with user_id filter
    const response = await apiClient.get<CheckInResponse[]>(
        API_ENDPOINTS.CHECKINS.CHECK_IN,
        { params: { user_id: userId }, suppressErrorLog: true } // Suppress 403 if user doesn't have permission
    );
    return response.data;
    } catch (error: any) {
      // Handle 403 gracefully - regular users may not have permission
      if (error?.status === 403) {
        console.log('ℹ️ User does not have permission to list check-ins (expected for regular users)');
        return []; // Return empty array
      }
      throw error;
    }
  }

  /**
   * Generate QR code for check-in
   */
  async generateQRCode(data: QRCodeGenerate): Promise<{ qr_code: string; expires_at: string }> {
    const response = await apiClient.post<{ qr_code: string; expires_at: string }>(
      API_ENDPOINTS.CHECKINS.QR_GENERATE,
      data
    );
    return response.data;
  }

  /**
   * Scan QR code for check-in/out
   */
  async scanQRCode(data: QRCodeScan): Promise<CheckInResponse> {
    const response = await apiClient.post<CheckInResponse>(
      API_ENDPOINTS.CHECKINS.QR_SCAN,
      data
    );
    return response.data;
  }

  /**
   * Verify QR code (for security checkpoint)
   * Note: API expects checkin_id and officer_id in the body
   */
  async verifyQR(checkinId: string, officerId: string): Promise<CheckInResponse> {
    // Log the request for debugging
    const token = apiClient.getAuthToken();
    console.log('[CheckInsService] verifyQR called with:', { checkinId, officerId });
    console.log('[CheckInsService] API Client has token:', !!token);
    console.log('[CheckInsService] Token preview:', token ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}` : 'NONE');
    console.log('[CheckInsService] Token length:', token?.length || 0);
    
    // Also check localStorage directly
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('pconnect_auth_token') : null;
    console.log('[CheckInsService] localStorage token matches API client:', storedToken === token);
    
    try {
      const response = await apiClient.post<CheckInResponse>(
        API_ENDPOINTS.CHECKINS.VERIFY_QR,
        { checkin_id: checkinId, officer_id: officerId }
      );
      return response.data;
    } catch (error: any) {
      console.error('[CheckInsService] verifyQR error:', error);
      console.error('[CheckInsService] Error status:', error?.status);
      console.error('[CheckInsService] Error details:', error?.details);
      
      // If 401, check if token needs to be refreshed or re-synced
      if (error?.status === 401) {
        console.warn('[CheckInsService] 401 Unauthorized - token may be expired or invalid');
        console.warn('[CheckInsService] Attempting to re-sync token from localStorage...');
        
        // Try to re-sync token from localStorage
        if (storedToken && storedToken !== token) {
          console.log('[CheckInsService] Token mismatch detected, syncing...');
          apiClient.setAuthToken(storedToken);
        }
      }
      
      // Re-throw to let the hook handle it
      throw error;
    }
  }

  /**
   * Get my check-ins (all general and booking-linked check-ins for current user)
   * NEW endpoint: GET /api/v1/checkin/my-checkins
   */
  async myCheckIns(): Promise<CheckInResponse[]> {
    const response = await apiClient.get<CheckInResponse[]>(
      API_ENDPOINTS.CHECKINS.MY_CHECKINS
    );
    return response.data;
  }

  /**
   * Get active check-ins for a user
   * Note: NEW API - GET /api/v1/checkin/ with filters
   * Note: Regular users may not have permission to list check-ins (403 expected)
   */
  async getActiveCheckIns(userId?: string): Promise<CheckInResponse[]> {
    const params: any = { status: 'checked_in' };
    if (userId) params.user_id = userId;
    
    try {
      const response = await apiClient.get<CheckInResponse[]>(
        API_ENDPOINTS.CHECKINS.CHECK_IN,
        { params, suppressErrorLog: true } // Suppress 403 errors - expected for regular users
      );
      return response.data;
    } catch (error: any) {
      // Handle 403 gracefully - regular users don't have permission to list check-ins
      if (error?.status === 403) {
        console.log('ℹ️ User does not have permission to list check-ins (expected for regular users)');
        return []; // Return empty array - user can still create new check-ins
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Get check-ins by date range
   * Note: NEW API - GET /api/v1/checkin/ with date filters
   */
  async getCheckInsByDateRange(startDate: string, endDate: string, userId?: string): Promise<CheckInResponse[]> {
    const params: any = {
      start_date: startDate,
      end_date: endDate
    };
    if (userId) params.user_id = userId;
    
    const response = await apiClient.get<CheckInResponse[]>(
      API_ENDPOINTS.CHECKINS.CHECK_IN,
      { params }
    );
    return response.data;
  }
  
  /**
   * Filter check-ins with comprehensive query parameters
   * Uses GET /api/v1/checkin/ with all available filter options
   */
  async filterCheckIns(params?: {
    user_id?: string;
    visitor_id?: string;
    building_id?: string;
    floor?: string;
    block?: string;
    programme_id?: string;
    status?: 'pending' | 'checked_in' | 'checked_out';
    user_type?: 'employee' | 'visitor';
    start_date?: string; // ISO date-time string
    end_date?: string; // ISO date-time string
  }): Promise<CheckInResponse[]> {
    try {
      const response = await apiClient.get<CheckInResponse[]>(
        API_ENDPOINTS.CHECKINS.CHECK_IN,
        { params: params || {}, suppressErrorLog: false }
      );
      return response.data;
    } catch (error: any) {
      // Handle 403 gracefully - some users may not have permission
      if (error?.status === 403) {
        console.log('ℹ️ User does not have permission to filter check-ins');
        return [];
      }
      throw error;
    }
  }

  /**
   * Get check-ins by user ID
   * NEW API - filter check-ins for a specific user
   * Note: Security officers may not have permission (403 expected)
   */
  async getCheckInsByUserId(userId: string): Promise<CheckInResponse[]> {
    try {
      const response = await apiClient.get<CheckInResponse[]>(
        API_ENDPOINTS.CHECKINS.CHECK_IN,
        { params: { user_id: userId }, suppressErrorLog: true }
      );
      return response.data;
    } catch (error: any) {
      // Handle 403 gracefully - security officers don't have permission to list check-ins
      // This is expected behavior, so we return empty array silently
      if (error?.status === 403) {
        // Don't log anything - this is expected and we handle it gracefully
        return []; // Return empty array - we'll use verifyQR response data instead
      }
      // Re-throw other errors (but also suppress logging for them if needed)
      throw error;
    }
  }

  /**
   * Get check-in status by checkin_id
   * Returns rich check-in data including status, user_id, floor, block, laptop info
   * This endpoint should be called FIRST before verifyQR to determine if user is checked_in or pending
   */
  async getCheckInStatus(checkinId: string): Promise<CheckInStatusResponse> {
    console.log('[CheckInsService] getCheckInStatus called for:', checkinId);
    console.log('[CheckInsService] Endpoint:', API_ENDPOINTS.CHECKINS.GET_STATUS(checkinId));

    try {
      const response = await apiClient.get<CheckInStatusResponse>(
        API_ENDPOINTS.CHECKINS.GET_STATUS(checkinId),
        { suppressErrorLog: false } // Log errors to debug
      );

      console.log('[CheckInsService] Status response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[CheckInsService] getCheckInStatus error:', error);
      console.error('[CheckInsService] Error status:', error?.status);
      console.error('[CheckInsService] Error details:', error?.details);

      // Handle errors gracefully
      if (error?.status === 404) {
        throw new Error('Check-in not found');
      } else if (error?.status === 403) {
        throw new Error('Access forbidden - insufficient permissions');
      }
      throw error;
    }
  }
}

export const checkInsService = new CheckInsService();
