import { apiClient } from '@/core/api/client';

describe('ApiClient', () => {
  it('has correct base configuration', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(apiClient.defaults.timeout).toBe(30000);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('has request interceptor', () => {
    expect(apiClient.interceptors.request).toBeDefined();
  });

  it('has response interceptor', () => {
    expect(apiClient.interceptors.response).toBeDefined();
  });
});
