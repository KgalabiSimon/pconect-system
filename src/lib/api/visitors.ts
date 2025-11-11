/**
 * Visitors API Service
 * Handles all visitor-related API calls to Azure P-Connect API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  VisitorResponse,
  VisitorCreate,
  VisitorUpdate,
  VisitorSearch,
  VisitorByPhone,
} from '../../types/api';

export class VisitorsService {
  /**
   * Get all visitors (admin/security)
   */
  async getVisitors(): Promise<VisitorResponse[]> {
    const response = await apiClient.get<VisitorResponse[]>(API_ENDPOINTS.VISITORS.ALL);
    return response.data;
  }

  /**
   * Create a new visitor (alias for registerVisitor)
   */
  async createVisitor(data: VisitorCreate): Promise<VisitorResponse> {
    return this.registerVisitor(data);
  }

  /**
   * Get visitor by ID
   */
  async getVisitorById(id: string): Promise<VisitorResponse> {
    const response = await apiClient.get<VisitorResponse>(
      API_ENDPOINTS.VISITORS.GET_BY_ID(id)
    );
    return response.data;
  }

  /**
   * Update visitor
   */
  async updateVisitor(id: string, data: VisitorUpdate): Promise<VisitorResponse> {
    const response = await apiClient.put<VisitorResponse>(
      API_ENDPOINTS.VISITORS.UPDATE(id),
      data
    );
    return response.data;
  }

  /**
   * Delete visitor
   */
  async deleteVisitor(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.VISITORS.DELETE(id));
  }

  /**
   * Register a new visitor
   */
  async registerVisitor(data: VisitorCreate): Promise<VisitorResponse> {
    const response = await apiClient.post<VisitorResponse>(
      API_ENDPOINTS.VISITORS.REGISTER,
      data
    );
    return response.data;
  }

  /**
   * Filter visitors by name, mobile, or purpose
   * Uses GET with query parameters instead of POST
   */
  async searchVisitors(searchParams: VisitorSearch): Promise<VisitorResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (searchParams.name) queryParams.append('name', searchParams.name);
    if (searchParams.mobile) queryParams.append('mobile', searchParams.mobile);
    if (searchParams.purpose) queryParams.append('purpose', searchParams.purpose);
    
    const url = `${API_ENDPOINTS.VISITORS.FILTER}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<VisitorResponse[]>(url);
    return response.data;
  }

  /**
   * Check-in visitor
   */
  async checkInVisitor(visitorId: string): Promise<VisitorResponse> {
    const response = await apiClient.post<VisitorResponse>(
      API_ENDPOINTS.VISITORS.CHECK_IN,
      { visitor_id: visitorId }
    );
    return response.data;
  }

  /**
   * Check-out visitor
   * Uses POST with visitor_id in path, not in body
   */
  async checkOutVisitor(visitorId: string): Promise<VisitorResponse> {
    const response = await apiClient.post<VisitorResponse>(
      API_ENDPOINTS.VISITORS.CHECK_OUT(visitorId),
      {} // No body needed - visitor_id is in path
    );
    return response.data;
  }

  /**
   * Find visitor by phone number
   */
  async getVisitorByPhone(phoneData: VisitorByPhone): Promise<VisitorResponse | null> {
    try {
      const response = await apiClient.post<VisitorResponse>(
        API_ENDPOINTS.VISITORS.BY_PHONE,
        phoneData
      );
      return response.data;
    } catch (error) {
      // Return null if visitor not found
      return null;
    }
  }

  /**
   * Get active visitors (checked in)
   */
  async getActiveVisitors(): Promise<VisitorResponse[]> {
    const response = await apiClient.get<VisitorResponse[]>(API_ENDPOINTS.VISITORS.LIST);
    const allVisitors = response.data;
    
    // Filter for active visitors
    const activeVisitors = allVisitors.filter(visitor => 
      visitor.status === 'CHECKED_IN'
    );
    
    return activeVisitors;
  }

  /**
   * Get visitors by host employee
   */
  async getVisitorsByHost(hostEmployeeId: string): Promise<VisitorResponse[]> {
    const response = await apiClient.get<VisitorResponse[]>(API_ENDPOINTS.VISITORS.LIST);
    const allVisitors = response.data;
    
    // Filter by host employee
    const hostVisitors = allVisitors.filter(visitor => 
      visitor.host_employee_id === hostEmployeeId
    );
    
    return hostVisitors;
  }

  /**
   * Get visitors by date range
   */
  async getVisitorsByDateRange(startDate: string, endDate: string): Promise<VisitorResponse[]> {
    const response = await apiClient.get<VisitorResponse[]>(API_ENDPOINTS.VISITORS.LIST);
    const allVisitors = response.data;
    
    // Filter by date range
    const filteredVisitors = allVisitors.filter(visitor => {
      const visitDate = new Date(visitor.created_at).toISOString().split('T')[0];
      return visitDate >= startDate && visitDate <= endDate;
    });
    
    return filteredVisitors;
  }

  /**
   * Get visitor statistics
   */
  async getVisitorStats(): Promise<{
    total: number;
    checkedIn: number;
    checkedOut: number;
    registered: number;
  }> {
    const response = await apiClient.get<VisitorResponse[]>(API_ENDPOINTS.VISITORS.ALL);
    const allVisitors = response.data;
    
    const stats = {
      total: allVisitors.length,
      checkedIn: allVisitors.filter(v => v.status === 'CHECKED_IN').length,
      checkedOut: allVisitors.filter(v => v.status === 'CHECKED_OUT').length,
      registered: allVisitors.filter(v => v.status === 'REGISTERED').length,
    };
    
    return stats;
  }

  /**
   * Get all visitor logs (admin/security)
   * Returns visitor check-in/check-out history
   */
  async getVisitorLogs(): Promise<VisitorResponse[]> {
    const response = await apiClient.get<VisitorResponse[]>(API_ENDPOINTS.VISITORS.LOGS);
    return response.data;
  }
}

export const visitorsService = new VisitorsService();
