/**
 * Environment Variables Configuration
 * Centralized environment variable management for API integration
 */

export const ENV_CONFIG = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://pconnect-api-gcdce6eagcfyavgr.southafricanorth-01.azurewebsites.net',
  
  // Feature Flags
  USE_AZURE_API: process.env.NEXT_PUBLIC_USE_AZURE_API === 'true',
  FALLBACK_TO_MOCK: process.env.NEXT_PUBLIC_FALLBACK_TO_MOCK === 'true',
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  
  // Development Settings
  MOCK_API_DELAY: parseInt(process.env.NEXT_PUBLIC_MOCK_API_DELAY || '500'),
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  
  // Authentication
  TOKEN_STORAGE_KEY: 'pconnect_auth_token',
  REFRESH_TOKEN_KEY: 'pconnect_refresh_token',
  
  // Debugging
  DEBUG_API: process.env.NEXT_PUBLIC_DEBUG_API === 'true',
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
} as const;

/**
 * Validate environment configuration
 */
export function validateEnvConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required environment variables
  if (!ENV_CONFIG.API_URL) {
    errors.push('NEXT_PUBLIC_API_URL is required');
  }
  
  // Validate URL format
  try {
    new URL(ENV_CONFIG.API_URL);
  } catch {
    errors.push('NEXT_PUBLIC_API_URL must be a valid URL');
  }
  
  // Validate numeric values
  if (isNaN(ENV_CONFIG.MOCK_API_DELAY) || ENV_CONFIG.MOCK_API_DELAY < 0) {
    errors.push('NEXT_PUBLIC_MOCK_API_DELAY must be a positive number');
  }
  
  if (isNaN(ENV_CONFIG.API_TIMEOUT) || ENV_CONFIG.API_TIMEOUT < 1000) {
    errors.push('NEXT_PUBLIC_API_TIMEOUT must be at least 1000ms');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get environment-specific configuration
 */
export function getEnvConfig() {
  const validation = validateEnvConfig();
  
  if (!validation.valid) {
    console.warn('Environment configuration validation failed:', validation.errors);
  }
  
  return {
    ...ENV_CONFIG,
    validation,
  };
}
