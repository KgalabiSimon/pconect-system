'use client';

import { useState, useCallback } from 'react';
import { userService } from '../../lib/api/users';
import type { UserResponse, UserCreate, UserUpdate, UserProfileUpdate } from '../../types/api';

export interface UseUsersOptions {
  initialLoad?: boolean;
  defaultParams?: {
    skip?: number;
    limit?: number;
    building_id?: string;
    programme_id?: string;
    search?: string;
  };
}

export interface UseUsersReturn {
  // Data
  users: UserResponse[];
  user: UserResponse | null;
  userCount: number;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  loadUsers: (params?: any) => Promise<void>;
  loadUser: (userId: string) => Promise<void>;
  createUser: (userData: UserCreate) => Promise<UserResponse | null>;
  updateUser: (userId: string, userData: UserUpdate) => Promise<UserResponse | null>;
  deleteUser: (userId: string) => Promise<boolean>;
  searchUsers: (query: string, limit?: number) => Promise<UserResponse[]>;
  getUserCount: (params?: any) => Promise<void>;
  updateProfile: (profileData: UserProfileUpdate) => Promise<UserResponse | null>;
  
  // Utilities
  clearError: () => void;
  clearUsers: () => void;
}

export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  const { initialLoad = false, defaultParams = {} } = options;
  
  // State
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [userCount, setUserCount] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear users
  const clearUsers = useCallback(() => {
    setUsers([]);
    setUser(null);
  }, []);

  // Load users
  const loadUsers = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchParams = { ...defaultParams, ...params };
      const userList = await userService.getUsers(searchParams);
      setUsers(userList);
      
      return userList;
    } catch (err: any) {
      // Handle 403 Forbidden errors gracefully
      if (err?.status === 403) {
        const errorMessage = 'You do not have permission to access user management. Please contact your administrator.';
        setError(errorMessage);
        setUsers([]); // Clear users list
        console.warn('Access forbidden to user management:', err);
        // Don't throw - allow UI to show error message
        return [];
      }
      
      const errorMessage = err.message || 'Failed to load users';
      setError(errorMessage);
      console.error('Error loading users:', err);
      setUsers([]); // Clear users list on error
      // Don't throw - allow UI to handle gracefully
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [defaultParams]);

  // Load single user
  const loadUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await userService.getUserById(userId);
      setUser(userData);
      
      return userData;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load user';
      setError(errorMessage);
      console.error('Error loading user:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create user
  const createUser = useCallback(async (userData: UserCreate): Promise<UserResponse | null> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const newUser = await userService.createUser(userData);
      
      // Add to users list
      setUsers(prev => [newUser, ...prev]);
      
      return newUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create user';
      setError(errorMessage);
      console.error('Error creating user:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (userId: string, userData: UserUpdate): Promise<UserResponse | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedUser = await userService.updateUser(userId, userData);
      
      // Update in users list
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      
      // Update current user if it's the same
      if (user && user.id === userId) {
        setUser(updatedUser);
      }
      
      return updatedUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update user';
      setError(errorMessage);
      console.error('Error updating user:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [user]);

  // Delete user
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      
      await userService.deleteUser(userId);
      
      // Remove from users list
      setUsers(prev => prev.filter(u => u.id !== userId));
      
      // Clear current user if it's the same
      if (user && user.id === userId) {
        setUser(null);
      }
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete user';
      setError(errorMessage);
      console.error('Error deleting user:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [user]);

  // Search users
  const searchUsers = useCallback(async (query: string, limit = 10): Promise<UserResponse[]> => {
    try {
      setError(null);
      
      const results = await userService.searchUsers({ q: query, limit });
      return results;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search users';
      setError(errorMessage);
      console.error('Error searching users:', err);
      return [];
    }
  }, []);

  // Get user count
  const getUserCount = useCallback(async (params = {}) => {
    try {
      setError(null);
      
      const countData = await userService.getUserCount(params);
      setUserCount(countData.count);
      
      return countData.count;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get user count';
      setError(errorMessage);
      console.error('Error getting user count:', err);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profileData: UserProfileUpdate): Promise<UserResponse | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedUser = await userService.updateProfile(profileData);
      
      // Update current user
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    // Data
    users,
    user,
    userCount,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error states
    error,
    
    // Actions
    loadUsers,
    loadUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getUserCount,
    updateProfile,
    
    // Utilities
    clearError,
    clearUsers,
  };
};
