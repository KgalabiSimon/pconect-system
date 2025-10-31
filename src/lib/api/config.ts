/**
 * API Configuration
 * Central configuration for Azure P-Connect API integration
 */

export const API_CONFIG = {
  // Azure API Base URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://pconnect-api-gcdce6eagcfyavgr.southafricanorth-01.azurewebsites.net',
  
  // API Version
  VERSION: 'v1',
  
  // Timeouts
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Authentication
  TOKEN_STORAGE_KEY: 'pconnect_auth_token',
  REFRESH_TOKEN_KEY: 'pconnect_refresh_token',
  
  // Feature flags
  FEATURES: {
    USE_AZURE_API: process.env.NEXT_PUBLIC_USE_AZURE_API === 'true',
    FALLBACK_TO_MOCK: process.env.NEXT_PUBLIC_FALLBACK_TO_MOCK === 'true',
    ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  }
} as const;

/**
 * API Endpoints
 * All available API endpoints organized by category
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    ADMIN_REGISTER: '/api/v1/auth/admin/register',
    ADMIN_LOGIN: '/api/v1/auth/admin/login',
    SECURITY_REGISTER: '/api/v1/auth/security/register',
    SECURITY_LOGIN: '/api/v1/auth/security/login',
    PASSWORD_RESET: '/api/v1/auth/password-reset/request',
    ME: '/api/v1/auth/me',
  },
  
  // Users
  USERS: {
    LIST: '/api/v1/users/',
    CREATE: '/api/v1/users/',
    SEARCH: '/api/v1/users/search',
    GET_BY_ID: (id: string) => `/api/v1/users/${id}`,
    UPDATE: (id: string) => `/api/v1/users/${id}`,
    DELETE: (id: string) => `/api/v1/users/${id}`,
    STATS_COUNT: '/api/v1/users/stats/count',
  },
  
  // Profile
  PROFILE: {
    UPDATE: '/api/v1/profile/',
  },
  
  // Buildings
  BUILDINGS: {
    LIST: '/api/v1/buildings/',
    CREATE: '/api/v1/buildings/',
    GET: (id: string) => `/api/v1/buildings/${id}`,
    UPDATE: (id: string) => `/api/v1/buildings/${id}`,
    DELETE: (id: string) => `/api/v1/buildings/${id}`,
    SPACES: (id: string) => `/api/v1/buildings/${id}/spaces`,
    FLOORS: (id: string) => `/api/v1/buildings/${id}/floors`,
    BLOCKS: (id: string) => `/api/v1/buildings/${id}/blocks`,
  },
  
  // Spaces
  SPACES: {
    UPDATE: (id: string) => `/api/v1/buildings/spaces/${id}`,
    DELETE: (id: string) => `/api/v1/buildings/spaces/${id}`,
  },
  
  // Floors
  FLOORS: {
    UPDATE: (id: string) => `/api/v1/buildings/floors/${id}`,
    DELETE: (id: string) => `/api/v1/buildings/floors/${id}`,
  },
  
  // Blocks
  BLOCKS: {
    UPDATE: (id: string) => `/api/v1/buildings/blocks/${id}`,
    DELETE: (id: string) => `/api/v1/buildings/blocks/${id}`,
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/api/v1/bookings/',
    CREATE: '/api/v1/bookings/',
    GET_BY_ID: (id: string) => `/api/v1/bookings/${id}`,
    UPDATE: (id: string) => `/api/v1/bookings/${id}`,
    DELETE: (id: string) => `/api/v1/bookings/${id}`,
  },
  
  // Check-ins
  CHECKINS: {
    LIST: '/api/v1/checkins/',
    CREATE: '/api/v1/checkins/',
    GET_BY_ID: (id: string) => `/api/v1/checkins/${id}`,
    UPDATE: (id: string) => `/api/v1/checkins/${id}`,
    DELETE: (id: string) => `/api/v1/checkins/${id}`,
    CHECK_IN: '/api/v1/checkins/checkin',
    CHECK_OUT: '/api/v1/checkins/checkout',
    USER_HISTORY: (userId: string) => `/api/v1/checkins/user/${userId}`,
    QR_GENERATE: '/api/v1/checkins/qr/generate',
    QR_SCAN: '/api/v1/checkins/qr/scan',
  },
  
  // Visitors
  VISITORS: {
    LIST: '/api/v1/visitors/',
    CREATE: '/api/v1/visitors/',
    GET_BY_ID: (id: string) => `/api/v1/visitors/${id}`,
    UPDATE: (id: string) => `/api/v1/visitors/${id}`,
    DELETE: (id: string) => `/api/v1/visitors/${id}`,
    REGISTER: '/api/v1/visitors/register',
    SEARCH: '/api/v1/visitors/search',
    CHECK_IN: '/api/v1/visitors/checkin',
    CHECK_OUT: '/api/v1/visitors/checkout',
    BY_PHONE: '/api/v1/visitors/by-phone',
  },
  
  // Programmes
  PROGRAMMES: {
    LIST: '/api/v1/programmes/',
    CREATE: '/api/v1/programmes/',
    GET: (id: string) => `/api/v1/programmes/${id}`,
    UPDATE: (id: string) => `/api/v1/programmes/${id}`,
    DELETE: (id: string) => `/api/v1/programmes/${id}`,
  },
  
  // System
  SYSTEM: {
    ROOT: '/',
    HEALTH: '/health',
    DB_TEST: '/db-test',
  },
} as const;

/**
 * HTTP Status Codes
 * Common HTTP status codes used by the API
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * API Error Types
 * Common error types that can occur
 */
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;
