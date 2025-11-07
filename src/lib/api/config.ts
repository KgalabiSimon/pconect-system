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
    USE_PROXY: false, // Disabled - requires CORS configuration on backend
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
  
  // Employees (alias for users, but may have different response format)
  EMPLOYEES: {
    LIST: '/employees/', // List all employees (users)
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
    LIST: '/api/v1/spaces/', // List all spaces (admin)
    CREATE: '/api/v1/spaces/', // Create space (admin)
    GET_BY_ID: (id: string) => `/api/v1/spaces/${id}`, // Get space by ID
    UPDATE_GLOBAL: (id: string) => `/api/v1/spaces/${id}`, // Update space (global endpoint)
    DELETE_GLOBAL: (id: string) => `/api/v1/spaces/${id}`, // Delete space (global endpoint)
    // Building-specific endpoints (for backward compatibility)
    UPDATE: (id: string) => `/api/v1/buildings/spaces/${id}`, // Update space (building-specific)
    DELETE: (id: string) => `/api/v1/buildings/spaces/${id}`, // Delete space (building-specific)
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
  
  // Bookings - Updated to match new API spec (singular /booking/)
  BOOKINGS: {
    LIST: '/api/v1/booking/',
    CREATE: '/api/v1/booking/',
    UPDATE: (id: string) => `/api/v1/booking/${id}`,
    DELETE: (id: string) => `/api/v1/booking/${id}`,
    ADMIN_LIST: '/api/v1/booking/admin',
    AVAILABILITY: '/api/v1/booking/availability',
    // Note: GET by ID endpoint doesn't exist in API spec
  },
  
  // Check-ins
  CHECKINS: {
    LIST: '/api/v1/checkins/',
    CREATE: '/api/v1/checkins/',
    GET_BY_ID: (id: string) => `/api/v1/checkins/${id}`,
    UPDATE: (id: string) => `/api/v1/checkins/${id}`,
    DELETE: (id: string) => `/api/v1/checkins/${id}`,
    CHECK_IN: '/api/v1/checkin/', // Updated to match actual API endpoint (with trailing slash - backend expects it)
    CHECK_OUT: '/api/v1/checkin/checkout', // Updated to match actual API endpoint
    USER_HISTORY: (userId: string) => `/api/v1/checkins/user/${userId}`,
    QR_GENERATE: '/api/v1/checkins/qr/generate',
    QR_SCAN: '/api/v1/checkins/qr/scan',
    VERIFY_QR: '/api/v1/verify-qr/', // New endpoint for QR verification (with trailing slash as per API docs)
    GET_STATUS: (checkinId: string) => `/api/v1/verify-qr/status/${checkinId}`, // Get check-in status by checkin_id
    MY_CHECKINS: '/api/v1/checkin/my-checkins', // Get all check-ins (general and booking-linked) for current user
  },
  
  // Visitors
  VISITORS: {
    ALL: '/api/v1/visitors/all', // Get all visitors (admin/security)
    FILTER: '/api/v1/visitors/filter', // Filter visitors by name/mobile/purpose (GET with query params)
    REGISTER: '/api/v1/visitors/register', // Register new visitor
    CHECK_IN: '/api/v1/visitors/checkin', // Check-in visitor
    CHECK_OUT: (visitorId: string) => `/api/v1/visitors/checkout/${visitorId}`, // Check-out visitor (POST with visitor_id in path)
    LOGS: '/api/v1/visitors/logs', // Get all visitor logs (admin/security)
    GET_BY_ID: (id: string) => `/api/v1/visitors/${id}`, // Get visitor by ID
    // Legacy endpoints (kept for backward compatibility if needed)
    LIST: '/api/v1/visitors/all', // Alias for ALL
    CREATE: '/api/v1/visitors/register', // Alias for REGISTER
    SEARCH: '/api/v1/visitors/filter', // Alias for FILTER
    BY_PHONE: '/api/v1/visitors/by-phone', // May not exist in API spec - verify
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
