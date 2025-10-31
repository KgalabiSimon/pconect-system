/**
 * API Error Class
 * Custom error class for API-related errors
 */

export class APIError extends Error {
  public readonly status: number;
  public readonly type: string;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    status: number = 500,
    type: string = 'UNKNOWN_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.type = type;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return this.type === 'NETWORK_ERROR';
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401 || this.type === 'AUTHENTICATION_ERROR';
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.status === 422 || this.type === 'VALIDATION_ERROR';
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case 'NETWORK_ERROR':
        return 'Network connection failed. Please check your internet connection.';
      case 'TIMEOUT_ERROR':
        return 'Request timed out. Please try again.';
      case 'AUTHENTICATION_ERROR':
        return 'Authentication failed. Please log in again.';
      case 'AUTHORIZATION_ERROR':
        return 'You do not have permission to perform this action.';
      case 'NOT_FOUND_ERROR':
        return 'The requested resource was not found.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'SERVER_ERROR':
        return 'Server error occurred. Please try again later.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      type: this.type,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Create API error from fetch response
 */
export function createAPIErrorFromResponse(response: Response, details?: any): APIError {
  const status = response.status;
  let type = 'UNKNOWN_ERROR';
  let message = `HTTP ${status}`;

  // Determine error type based on status code
  if (status === 401) {
    type = 'AUTHENTICATION_ERROR';
    message = 'Authentication failed';
  } else if (status === 403) {
    type = 'AUTHORIZATION_ERROR';
    message = 'Access forbidden';
  } else if (status === 404) {
    type = 'NOT_FOUND_ERROR';
    message = 'Resource not found';
  } else if (status === 422) {
    type = 'VALIDATION_ERROR';
    message = 'Validation failed';
  } else if (status >= 500) {
    type = 'SERVER_ERROR';
    message = 'Server error';
  }

  return new APIError(message, status, type, details);
}

/**
 * Create API error from network error
 */
export function createAPIErrorFromNetwork(error: Error): APIError {
  return new APIError(
    error.message,
    0,
    'NETWORK_ERROR',
    { originalError: error.message }
  );
}

/**
 * Create API error from timeout
 */
export function createAPIErrorFromTimeout(): APIError {
  return new APIError(
    'Request timed out',
    408,
    'TIMEOUT_ERROR'
  );
}
