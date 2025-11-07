/**
 * API Client Index
 * Main export file for API client functionality
 */

// Core API client
export { APIClient, apiClient } from './client';
export type { RequestOptions, APIResponse } from './client';

// Configuration
export { API_CONFIG, API_ENDPOINTS, HTTP_STATUS, API_ERROR_TYPES } from './config';

// Error handling
export { 
  APIError, 
  createAPIErrorFromResponse, 
  createAPIErrorFromNetwork, 
  createAPIErrorFromTimeout 
} from './errors';

// Environment configuration
export { ENV_CONFIG, validateEnvConfig, getEnvConfig } from './env';

// API Services
export { authService } from './auth';
export { userService } from './users';
export { buildingsService } from './buildings';
export { programmesService } from './programmes';
export { spacesService } from './spaces';
export { bookingsService } from './bookings';
export { checkInsService } from './checkins';
export { visitorsService } from './visitors';

// Re-export types for convenience
export type {
  // Authentication
  SecurityRegister,
  AdminCreate,
  UserCreate,
  UserLogin,
  AdminLogin,
  SecurityLogin,
  PasswordResetRequest,
  Token,
  
  // User
  UserResponse,
  UserUpdate,
  UserProfileUpdate,
  
  // Building
  BuildingCreate,
  BuildingResponse,
  BuildingUpdate,
  
  // Programme
  ProgrammeCreate,
  ProgrammeResponse,
  ProgrammeUpdate,
  
  // Space
  SpaceType,
  SpaceCreate,
  SpaceResponse,
  SpaceUpdate,
  
  // Floor
  FloorCreate,
  FloorResponse,
  FloorUpdate,
  
  // Block
  BlockCreate,
  BlockResponse,
  BlockUpdate,
  
  // Booking
  BookingStatus,
  BookingCreate,
  BookingResponse,
  BookingUpdate,
  // Check-in
  CheckInStatus,
  CheckInCreate,
  CheckInResponse,
  CheckInUpdate,
  QRCodeGenerate,
  QRCodeScan,
  // Visitor
  VisitorStatus,
  VisitorCreate,
  VisitorResponse,
  VisitorUpdate,
  VisitorSearch,
  VisitorByPhone,
  
  // Error
  ValidationError,
  HTTPValidationError,
  
  // Query Parameters
  UserListParams,
  UserSearchParams,
  UserCountParams,
  
  // Response Types
  PaginatedResponse,
  CountResponse,
  
  // Utility
  BaseEntity,
  APIEndpoint,
  HTTPMethod,
  FeatureFlags,
} from '../../types/api';
