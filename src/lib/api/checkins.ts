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
   */
  async checkIn(data: CheckInCreate): Promise<CheckInResponse> {
    const response = await apiClient.post<CheckInResponse>(
      API_ENDPOINTS.CHECKINS.CHECK_IN,
      data
    );
    return response.data;
  }

  /**
   * Check-out user
   */
  async checkOut(checkInId: string): Promise<CheckInResponse> {
    const response = await apiClient.post<CheckInResponse>(
      API_ENDPOINTS.CHECKINS.CHECK_OUT,
      { check_in_id: checkInId }
    );
    return response.data;
  }

  /**
   * Get user's check-in history
   */
  async getUserCheckInHistory(userId: string): Promise<CheckInResponse[]> {
    const response = await apiClient.get<CheckInResponse[]>(
      API_ENDPOINTS.CHECKINS.USER_HISTORY(userId)
    );
    return response.data;
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
   * Get active check-ins for a user
   */
  async getActiveCheckIns(userId?: string): Promise<CheckInResponse[]> {
    const response = await apiClient.get<CheckInResponse[]>(API_ENDPOINTS.CHECKINS.LIST);
    const allCheckIns = response.data;
    
    // Filter for active check-ins
    const activeCheckIns = allCheckIns.filter(checkIn => 
      checkIn.status === 'ACTIVE' && 
      (!userId || checkIn.user_id === userId)
    );
    
    return activeCheckIns;
  }

  /**
   * Get check-ins by date range
   */
  async getCheckInsByDateRange(startDate: string, endDate: string): Promise<CheckInResponse[]> {
    const response = await apiClient.get<CheckInResponse[]>(API_ENDPOINTS.CHECKINS.LIST);
    const allCheckIns = response.data;
    
    // Filter by date range
    const filteredCheckIns = allCheckIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.check_in_time).toISOString().split('T')[0];
      return checkInDate >= startDate && checkInDate <= endDate;
    });
    
    return filteredCheckIns;
  }
}

export const checkInsService = new CheckInsService();
