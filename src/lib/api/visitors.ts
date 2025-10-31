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
   * Get all visitors
   */
  async getVisitors(): Promise<VisitorResponse[]> {
    const response = await apiClient.get<VisitorResponse[]>(API_ENDPOINTS.VISITORS.LIST);
    return response.data;
  }

  /**
   * Create a new visitor
   */
  async createVisitor(data: VisitorCreate): Promise<VisitorResponse> {
    const response = await apiClient.post<VisitorResponse>(
      API_ENDPOINTS.VISITORS.CREATE,
      data
    );
    return response.data;
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
   * Search visitors
   */
  async searchVisitors(searchParams: VisitorSearch): Promise<VisitorResponse[]> {
    const response = await apiClient.post<VisitorResponse[]>(
      API_ENDPOINTS.VISITORS.SEARCH,
      searchParams
    );
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
   */
  async checkOutVisitor(visitorId: string): Promise<VisitorResponse> {
    const response = await apiClient.post<VisitorResponse>(
      API_ENDPOINTS.VISITORS.CHECK_OUT,
      { visitor_id: visitorId }
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
    const response = await apiClient.get<VisitorResponse[]>(API_ENDPOINTS.VISITORS.LIST);
    const allVisitors = response.data;
    
    const stats = {
      total: allVisitors.length,
      checkedIn: allVisitors.filter(v => v.status === 'CHECKED_IN').length,
      checkedOut: allVisitors.filter(v => v.status === 'CHECKED_OUT').length,
      registered: allVisitors.filter(v => v.status === 'REGISTERED').length,
    };
    
    return stats;
  }
}

export const visitorsService = new VisitorsService();
