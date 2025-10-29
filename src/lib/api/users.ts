/**
 * User Management API Service
 * Handles all user-related API calls to Azure P-Connect API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  UserResponse,
  UserCreate,
  UserUpdate,
  UserProfileUpdate,
} from '../../types/api';

export interface UserSearchParams {
  skip?: number;
  limit?: number;
  building_id?: string;
  programme_id?: string;
  search?: string;
}

export interface UserSearchQuery {
  q: string;
  limit?: number;
}

export interface UserStatsParams {
  building_id?: string;
  programme?: string;
}

export class UserService {
  /**
   * Get all users with optional filters (admin only)
   */
  async getUsers(params: UserSearchParams = {}): Promise<UserResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.building_id) queryParams.append('building_id', params.building_id);
    if (params.programme_id) queryParams.append('programme_id', params.programme_id);
    if (params.search) queryParams.append('search', params.search);

    const url = `${API_ENDPOINTS.USERS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<UserResponse[]>(url);
    return response.data;
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(userData: UserCreate): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(
      API_ENDPOINTS.USERS.CREATE,
      userData
    );
    return response.data;
  }

  /**
   * Search users by name for autocomplete
   */
  async searchUsers(query: UserSearchQuery): Promise<UserResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query.q);
    if (query.limit !== undefined) queryParams.append('limit', query.limit.toString());

    const url = `${API_ENDPOINTS.USERS.SEARCH}?${queryParams.toString()}`;
    const response = await apiClient.get<UserResponse[]>(url);
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(
      API_ENDPOINTS.USERS.GET_BY_ID(userId)
    );
    return response.data;
  }

  /**
   * Update user (self limited / admin full)
   */
  async updateUser(userId: string, userData: UserUpdate): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(
      API_ENDPOINTS.USERS.UPDATE(userId),
      userData
    );
    return response.data;
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.USERS.DELETE(userId)
    );
    return response.data;
  }

  /**
   * Get user count with optional filters
   */
  async getUserCount(params: UserStatsParams = {}): Promise<{ count: number }> {
    const queryParams = new URLSearchParams();
    if (params.building_id) queryParams.append('building_id', params.building_id);
    if (params.programme) queryParams.append('programme', params.programme);

    const url = `${API_ENDPOINTS.USERS.STATS_COUNT}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<{ count: number }>(url);
    return response.data;
  }

  /**
   * Update current user's own profile (self only)
   */
  async updateProfile(profileData: UserProfileUpdate): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(
      API_ENDPOINTS.PROFILE.UPDATE,
      profileData
    );
    return response.data;
  }
}

export const userService = new UserService();
