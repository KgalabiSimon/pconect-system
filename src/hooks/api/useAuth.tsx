/**
 * Authentication Context and Hook
 * Provides authentication state and methods throughout the app
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../../lib/api/auth';
import { apiClient } from '../../lib/api/client';
import type { UserResponse, Token } from '../../types/api';

interface AuthContextType {
  // State
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Methods
  loginUser: (email: string, password: string) => Promise<boolean>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  loginSecurity: (badgeNumber: string, pin: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a stored token
      const storedToken = authService.getAuthToken();
      
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        
        // Try to get user data - suppress errors as admin tokens don't work with /auth/me
        try {
          const userData = await authService.getCurrentUser({ suppressErrorLog: true });
          setUser(userData);
        } catch (error: any) {
          // If it's a 401, this might be an admin token - that's okay, don't clear auth
          // Admin tokens don't work with /auth/me but still work for admin endpoints
          if (error?.status === 401) {
            console.log('Token may be admin token (doesn\'t work with /auth/me), keeping auth state');
            // Keep authentication state - user can still access admin endpoints
          } else {
            console.warn('Failed to get user data, clearing auth:', error);
            logout();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const tokenData = await authService.loginUser({ email, password });
      
      if (tokenData.access_token) {
        setToken(tokenData.access_token);
        setIsAuthenticated(true);
        
        // Get user data - handle errors gracefully
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (userError) {
          // If getting user data fails, log but don't fail login
          // User data will be fetched on next page load
          console.warn('Failed to fetch user data after login:', userError);
          // Set a minimal user object to prevent issues
          // The user data will be refreshed automatically on next request
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('User login error:', error);
      setError(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // First try admin login (for accounts created through admin registration)
      try {
        const tokenData = await authService.loginAdmin({ email, password });
        
        if (tokenData.access_token) {
          setToken(tokenData.access_token);
          setIsAuthenticated(true);
          
          // Get user data - admin login tokens may not work with /auth/me
          // Try /auth/me first, if it fails, try regular login to get user data but restore admin token
          try {
            const userData = await authService.getCurrentUser({ suppressErrorLog: true });
            setUser(userData);
          } catch (userError: any) {
            // Admin login tokens don't work with /auth/me endpoint (returns 401)
            // This is expected behavior - admin tokens are for API operations, not user profile
            if (userError?.status === 401) {
              console.log('Admin login token doesn\'t work with /auth/me (expected), trying regular login to get user data...');
              const adminToken = tokenData.access_token; // Save admin token
              
              try {
                // Suppress error log for regular login fallback - it's expected to fail for admin accounts
                const regularTokenData = await authService.loginUser({ email, password }, { suppressErrorLog: true });
                if (regularTokenData.access_token) {
                  // Temporarily use regular token to get user data
                  const userData = await authService.getCurrentUser({ suppressErrorLog: true });
                  setUser(userData);
                  
                  // Restore admin token (needed for admin endpoints)
                  setToken(adminToken);
                  apiClient.setAuthToken(adminToken);
                  
                  console.log('✅ User data retrieved, admin token restored');
                }
              } catch (regularError) {
                // If regular login also fails, that's okay - user can still access admin endpoints
                // Just set basic user info from email
                console.log('Regular login not available for admin account (expected), using basic user info');
                setUser({
                  id: '',
                  email: email,
                  first_name: '',
                  last_name: '',
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                } as any);
              }
            } else {
              // Other errors - just log as warning
              console.warn('Failed to fetch user data after admin login:', userError);
            }
          }
          
          return true;
        }
      } catch (adminError: any) {
        // Admin login failed (expected for users registered through regular registration)
        // Silently fallback to regular login - don't log as error
        // If it's an expected 401, we don't need to log anything
        if (adminError?.status !== 401 && !adminError?.isExpected) {
          // Only log if it's not a 401 or expected error
          console.warn('Admin login failed with non-401 error, trying regular login...', adminError);
        }
        
        // Fallback to regular user login (works for admin accounts created via regular registration)
        try {
          const tokenData = await authService.loginUser({ email, password });
          
          if (tokenData.access_token) {
            setToken(tokenData.access_token);
            setIsAuthenticated(true);
            
            // Get user data - handle errors gracefully
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
            } catch (userError) {
              // If getting user data fails, log but don't fail login
              console.warn('Failed to fetch user data after login:', userError);
            }
            
            return true;
          }
        } catch (userError) {
          console.error('Both admin and user login failed:', userError);
          throw userError;
        }
      }
      
      return false;
    } catch (error: any) {
      console.error('Admin login error:', error);
      setError(error.message || 'Admin login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginSecurity = async (badgeNumber: string, pin: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const tokenData = await authService.loginSecurity({ badge_number: badgeNumber, pin });
      
      if (tokenData.access_token) {
        setToken(tokenData.access_token);
        setIsAuthenticated(true);
        
        // Get user data - handle errors gracefully
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (userError) {
          // If getting user data fails, log but don't fail login
          console.warn('Failed to fetch user data after security login:', userError);
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Security login error:', error);
      setError(error.message || 'Security login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    try {
      if (isAuthenticated) {
        const userData = await authService.getCurrentUser({ suppressErrorLog: true });
        setUser(userData);
      }
    } catch (error: any) {
      // If it's a 401, this might be an admin token - don't logout
      // Admin tokens don't work with /auth/me but still work for admin endpoints
      if (error?.status === 401) {
        console.log('Cannot refresh user data - token may be admin token (expected)');
        // Don't logout - admin tokens still work for admin endpoints
      } else {
        console.error('Failed to refresh user data:', error);
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    loginUser,
    loginAdmin,
    loginSecurity,
    logout,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for checking if user has specific role
export function useUserRole() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    isSecurity: user?.role === 'security',
    isUser: !user?.role || user?.role === 'user',
    role: user?.role || 'user',
  };
}
