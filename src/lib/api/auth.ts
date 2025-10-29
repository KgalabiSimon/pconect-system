/**
 * Authentication API Service
 * Handles all authentication-related API calls to Azure P-Connect API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  UserLogin,
  AdminLogin,
  SecurityLogin,
  UserCreate,
  AdminCreate,
  SecurityRegister,
  PasswordResetRequest,
  Token,
  UserResponse,
} from '../../types/api';

export class AuthService {
  /**
   * Login regular user
   */
  async loginUser(credentials: UserLogin): Promise<Token> {
    const response = await apiClient.post<Token>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (response.success && response.data.access_token) {
      // Store token in API client
      apiClient.setAuthToken(response.data.access_token);
    }
    
    return response.data;
  }

  /**
   * Login admin user
   */
  async loginAdmin(credentials: AdminLogin): Promise<Token> {
    const response = await apiClient.post<Token>(
      API_ENDPOINTS.AUTH.ADMIN_LOGIN,
      credentials
    );
    
    if (response.success && response.data.access_token) {
      // Store token in API client
      apiClient.setAuthToken(response.data.access_token);
    }
    
    return response.data;
  }

  /**
   * Login security officer
   */
  async loginSecurity(credentials: SecurityLogin): Promise<Token> {
    const response = await apiClient.post<Token>(
      API_ENDPOINTS.AUTH.SECURITY_LOGIN,
      credentials
    );
    
    if (response.success && response.data.access_token) {
      // Store token in API client
      apiClient.setAuthToken(response.data.access_token);
    }
    
    return response.data;
  }

  /**
   * Register regular user
   */
  async registerUser(userData: UserCreate): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    return response.data;
  }

  /**
   * Register admin user (admin creation)
   */
  async registerAdmin(adminData: AdminCreate): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(
      API_ENDPOINTS.AUTH.ADMIN_REGISTER,
      adminData
    );
    
    return response.data;
  }

  /**
   * Register security officer
   */
  async registerSecurity(securityData: SecurityRegister): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.SECURITY_REGISTER,
      securityData
    );
    
    return response.data;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(resetData: PasswordResetRequest): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.PASSWORD_RESET,
      resetData
    );
    
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(
      API_ENDPOINTS.AUTH.ME
    );
    
    return response.data;
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear token from API client
    apiClient.clearAuthToken();
    
    // Clear any additional auth data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pconnect_auth_token');
      localStorage.removeItem('pconnect_refresh_token');
      localStorage.removeItem('pconnect_user_data');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return apiClient.getAuthToken();
  }

  /**
   * Refresh token (if needed)
   * Note: This would need to be implemented based on Azure API token refresh logic
   */
  async refreshToken(): Promise<Token | null> {
    // For now, return null as Azure API doesn't seem to have refresh endpoint
    // This would need to be implemented if Azure API supports token refresh
    return null;
  }
}

// Create singleton instance
export const authService = new AuthService();
