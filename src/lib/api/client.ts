/**
 * API Client Base Class
 * Foundation for all API interactions with Azure P-Connect API
 */

import { API_CONFIG, HTTP_STATUS, API_ERROR_TYPES } from './config';
import { APIError, createAPIErrorFromResponse, createAPIErrorFromNetwork, createAPIErrorFromTimeout } from './errors';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | undefined>; // Query parameters
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
  suppressErrorLog?: boolean; // Suppress error logging for expected errors
}

export interface APIResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  success: boolean;
}

export class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;
  private useProxy: boolean;

  constructor(baseURL?: string) {
    const configuredBaseURL = baseURL || API_CONFIG.BASE_URL;
    
    // Proxy disabled - using direct API calls (requires CORS configuration on backend)
    this.useProxy = false;
    this.baseURL = configuredBaseURL;
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Load stored auth token
    this.loadAuthToken();
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
    if (token) {
      localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    }
  }

  /**
   * Get current authentication token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Check if a JWT token is expired (without verifying signature)
   * Returns true if expired, false if valid, null if can't determine
   */
  private isTokenExpired(token: string): boolean | null {
    try {
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Decode payload (base64url decode)
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      // Check expiration
      if (payload.exp) {
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        return currentTime >= expirationTime;
      }
      
      return null; // No expiration claim
    } catch {
      return null; // Invalid token format
    }
  }

  /**
   * Load authentication token from storage
   */
  private loadAuthToken(): void {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
      if (storedToken) {
        // Check if token is expired
        const expired = this.isTokenExpired(storedToken);
        if (expired === true) {
          // Token is expired, clear it
          if (API_CONFIG.FEATURES.ENABLE_LOGGING) {
            console.warn('[API Client] Token expired, clearing from storage');
          }
          localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
          this.authToken = null;
          return;
        }
        this.authToken = storedToken;
      }
    }
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.RETRY_ATTEMPTS,
      skipAuth = false,
      suppressErrorLog = false,
    } = options;

    // Build URL with query parameters
    // If using proxy, prepend /api/proxy to the endpoint path
    let url: string;
    if (this.useProxy) {
      // Proxy route expects: /api/proxy/{endpoint}
      // Remove leading slash from endpoint if present
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      url = `/api/proxy/${cleanEndpoint}`;
    } else {
      url = `${this.baseURL}${endpoint}`;
    }
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    // Reload token from localStorage before making request (in case it was updated)
    // This ensures we always have the latest token, especially after login
    if (typeof window !== 'undefined' && !skipAuth) {
      const storedToken = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
      // Check if stored token exists and is valid
      if (storedToken) {
        const expired = this.isTokenExpired(storedToken);
        if (expired === true) {
          // Token expired, clear it
          localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
          this.authToken = null;
        } else if (!this.authToken || storedToken !== this.authToken) {
          // Token is valid, update in-memory token
          this.authToken = storedToken;
          if (API_CONFIG.FEATURES.ENABLE_LOGGING) {
            console.log('[API Client] Token reloaded from localStorage');
          }
        }
      }
    }

    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // Add authentication header if token exists and not skipped
    if (this.authToken && !skipAuth) {
      requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
    } else if (!skipAuth && API_CONFIG.FEATURES.ENABLE_LOGGING) {
      console.warn('[API Client] No auth token available for request:', {
        endpoint,
        hasToken: !!this.authToken,
        skipAuth,
        storedToken: typeof window !== 'undefined' ? !!localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY) : false,
      });
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: this.createAbortSignal(timeout),
      redirect: 'follow', // Follow redirects but ensure baseURL uses HTTPS
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Log request in development
    if (API_CONFIG.FEATURES.ENABLE_LOGGING) {
      console.log(`[API Request] ${method} ${url}`, {
        headers: requestHeaders,
        body: body,
      });
    }

    try {
      const response = await this.executeRequest(url, requestOptions, retries);
      
      // Parse response
      const responseData = await this.parseResponse<T>(response);
      
      // Log response in development
      if (API_CONFIG.FEATURES.ENABLE_LOGGING) {
        console.log(`[API Response] ${method} ${url}`, {
          status: response.status,
          data: responseData,
        });
      }

      // Log validation errors in detail
      if (response.status === 422 && responseData && typeof responseData === 'object' && 'detail' in responseData) {
        console.error('[API Validation Error]', {
          endpoint: `${method} ${url}`,
          validationErrors: (responseData as { detail: any }).detail,
        });
      }

      return {
        data: responseData,
        status: response.status,
        headers: response.headers,
        success: response.ok,
      };
    } catch (error: any) {
      // Log error in development (unless suppressed for expected errors like 401 fallbacks)
      // Also suppress 401/403 errors for availability checks (expected for regular users)
      const shouldSuppress = suppressErrorLog || 
                            (error?.status === 401 && endpoint.includes('/booking'));
      
      if (API_CONFIG.FEATURES.ENABLE_LOGGING && !shouldSuppress) {
        console.error(`[API Error] ${method} ${url}`, error);
        // For validation errors (422/400), log the details
        if (error.status === 422 || error.status === 400) {
          console.error('[API Validation Error Details]:', error.details);
        }
      }
      throw error;
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequest(
    url: string,
    options: RequestInit,
    retries: number
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // If response is ok or client error (4xx), don't retry
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }

        // For server errors (5xx), retry if attempts remain
        if (response.status >= 500 && attempt < retries) {
          await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on network errors for the last attempt
        if (attempt === retries) {
          break;
        }

        // Wait before retry
        await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
      }
    }

    // Handle final error
    if (lastError) {
      if (lastError.name === 'AbortError') {
        throw createAPIErrorFromTimeout();
      }
      throw createAPIErrorFromNetwork(lastError);
    }

    throw new APIError('Request failed after all retries');
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorDetails: any;
      
      try {
        if (contentType?.includes('application/json')) {
          errorDetails = await response.json();
        } else {
          errorDetails = await response.text();
        }
      } catch {
        errorDetails = null;
      }
      
      throw createAPIErrorFromResponse(response, errorDetails);
    }

    // Handle empty responses
    if (response.status === HTTP_STATUS.NO_CONTENT || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    // Parse JSON response
    if (contentType?.includes('application/json')) {
      try {
        return await response.json();
      } catch (error) {
        throw new APIError('Failed to parse JSON response', response.status);
      }
    }

    // Parse text response
    return (await response.text()) as T;
  }

  /**
   * Create abort signal for timeout
   */
  private createAbortSignal(timeout: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }
}

// Create default API client instance
export const apiClient = new APIClient();
