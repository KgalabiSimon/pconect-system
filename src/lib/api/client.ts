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

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_CONFIG.BASE_URL;
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
   * Load authentication token from storage
   */
  private loadAuthToken(): void {
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
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
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.RETRY_ATTEMPTS,
      skipAuth = false,
      suppressErrorLog = false,
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // Add authentication header if token exists and not skipped
    if (this.authToken && !skipAuth) {
      requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: this.createAbortSignal(timeout),
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

      return {
        data: responseData,
        status: response.status,
        headers: response.headers,
        success: response.ok,
      };
    } catch (error) {
      // Log error in development (unless suppressed for expected errors like 401 fallbacks)
      if (API_CONFIG.FEATURES.ENABLE_LOGGING && !suppressErrorLog) {
        console.error(`[API Error] ${method} ${url}`, error);
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
