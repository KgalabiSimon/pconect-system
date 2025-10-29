/**
 * Authentication Context and Hook
 * Provides authentication state and methods throughout the app
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../../lib/api/auth';
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
        
        // Try to get user data
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.warn('Failed to get user data, clearing auth:', error);
          logout();
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
        
        // Get user data
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
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

      // First try admin login
      try {
        const tokenData = await authService.loginAdmin({ email, password });
        
        if (tokenData.access_token) {
          setToken(tokenData.access_token);
          setIsAuthenticated(true);
          
          // Get user data
          const userData = await authService.getCurrentUser();
          setUser(userData);
          
          return true;
        }
      } catch (adminError) {
        console.log('Admin login failed, trying regular login as fallback...');
        
        // Fallback to regular user login
        try {
          const tokenData = await authService.loginUser({ email, password });
          
          if (tokenData.access_token) {
            setToken(tokenData.access_token);
            setIsAuthenticated(true);
            
            // Get user data
            const userData = await authService.getCurrentUser();
            setUser(userData);
            
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
        
        // Get user data
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
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
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      logout();
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
