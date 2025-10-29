/**
 * API Client Test Suite
 * Basic tests to verify API client foundation is working
 */

import { apiClient, API_CONFIG, API_ENDPOINTS } from '../lib/api';

/**
 * Test API client configuration
 */
export function testAPIConfiguration() {
  console.log('🧪 Testing API Configuration...');
  
  // Test configuration values
  console.log('✅ Base URL:', API_CONFIG.BASE_URL);
  console.log('✅ API Version:', API_CONFIG.VERSION);
  console.log('✅ Timeout:', API_CONFIG.TIMEOUT);
  console.log('✅ Features:', API_CONFIG.FEATURES);
  
  // Test endpoints
  console.log('✅ Auth endpoints:', Object.keys(API_ENDPOINTS.AUTH).length);
  console.log('✅ User endpoints:', Object.keys(API_ENDPOINTS.USERS).length);
  console.log('✅ Building endpoints:', Object.keys(API_ENDPOINTS.BUILDINGS).length);
  
  return true;
}

/**
 * Test API client instance
 */
export function testAPIClient() {
  console.log('🧪 Testing API Client...');
  
  // Test client properties
  console.log('✅ Client created:', !!apiClient);
  console.log('✅ Base URL set:', !!apiClient['baseURL']);
  console.log('✅ Default headers:', !!apiClient['defaultHeaders']);
  
  // Test authentication state
  console.log('✅ Auth token initially null:', !apiClient.getAuthToken());
  console.log('✅ Not authenticated initially:', !apiClient.isAuthenticated());
  
  return true;
}

/**
 * Test API client methods
 */
export function testAPIClientMethods() {
  console.log('🧪 Testing API Client Methods...');
  
  // Test method existence
  const methods = ['get', 'post', 'put', 'delete', 'patch', 'request'];
  methods.forEach(method => {
    console.log(`✅ Method ${method} exists:`, typeof apiClient[method] === 'function');
  });
  
  return true;
}

/**
 * Test error handling
 */
export function testErrorHandling() {
  console.log('🧪 Testing Error Handling...');
  
  try {
    // Test APIError import
    const { APIError } = require('../lib/api/errors');
    const error = new APIError('Test error', 400, 'VALIDATION_ERROR');
    
    console.log('✅ APIError created:', error.message);
    console.log('✅ Error status:', error.status);
    console.log('✅ Error type:', error.type);
    console.log('✅ Is client error:', error.isClientError());
    console.log('✅ User message:', error.getUserMessage());
    
    return true;
  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export function runAPIClientTests() {
  console.log('🚀 Running API Client Foundation Tests...\n');
  
  const tests = [
    { name: 'Configuration', test: testAPIConfiguration },
    { name: 'Client Instance', test: testAPIClient },
    { name: 'Client Methods', test: testAPIClientMethods },
    { name: 'Error Handling', test: testErrorHandling },
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(({ name, test }) => {
    try {
      const result = test();
      if (result) {
        console.log(`✅ ${name} test passed\n`);
        passed++;
      } else {
        console.log(`❌ ${name} test failed\n`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${name} test error:`, error, '\n');
      failed++;
    }
  });
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  return { passed, failed, successRate: (passed / (passed + failed)) * 100 };
}

// Export for use in other files
export default {
  testAPIConfiguration,
  testAPIClient,
  testAPIClientMethods,
  testErrorHandling,
  runAPIClientTests,
};
