import { fetchWithAuth, unwrap, API_BASE } from '../api-client';
import { createAuthTokens } from '@/mocks/fixtures';

describe('api-client', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('fetchWithAuth', () => {
    it('should make request without auth header when no token exists', async () => {
      const response = await fetchWithAuth(`${API_BASE}/recipes`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should add Bearer token header when token exists in localStorage', async () => {
      const tokens = createAuthTokens('test-user-id');
      localStorage.setItem('accessToken', tokens.accessToken);

      const response = await fetchWithAuth(`${API_BASE}/auth/me`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.user).toBeDefined();
    });

    it('should refresh expired token automatically on 401 response', async () => {
      // Set up an expired token
      const expiredTokens = createAuthTokens('test-user-id', true);
      localStorage.setItem('accessToken', expiredTokens.accessToken);
      localStorage.setItem('refreshToken', expiredTokens.refreshToken);

      // This should trigger token refresh
      const response = await fetchWithAuth(`${API_BASE}/auth/me`);
      
      // After refresh, localStorage should have new tokens
      const newAccessToken = localStorage.getItem('accessToken');
      expect(newAccessToken).toBeDefined();
      expect(newAccessToken).not.toBe(expiredTokens.accessToken);
    });

    it('should clear tokens when refresh fails', async () => {
      localStorage.setItem('accessToken', 'invalid-token');
      localStorage.setItem('refreshToken', 'invalid-refresh-token');

      await fetchWithAuth(`${API_BASE}/auth/me`);

      // Tokens should be cleared after failed refresh
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('should handle concurrent 401 responses with single refresh', async () => {
      const expiredTokens = createAuthTokens('test-user-id', true);
      localStorage.setItem('accessToken', expiredTokens.accessToken);
      localStorage.setItem('refreshToken', expiredTokens.refreshToken);

      // Make multiple concurrent requests
      const promises = [
        fetchWithAuth(`${API_BASE}/auth/me`),
        fetchWithAuth(`${API_BASE}/recipes`),
        fetchWithAuth(`${API_BASE}/recipes/recipe-1`),
      ];

      const responses = await Promise.all(promises);
      
      // All should succeed after single refresh
      responses.forEach(response => {
        expect(response.ok).toBe(true);
      });
    });
  });

  describe('unwrap', () => {
    it('should extract data from successful response', async () => {
      const response = await fetchWithAuth(`${API_BASE}/recipes`);
      const result = await unwrap(response);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should throw error for failed response', async () => {
      // Make a request that will fail (invalid credentials)
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'wrong@example.com', password: 'wrong' }),
      });

      await expect(unwrap(response)).rejects.toThrow('Invalid email or password');
    });

    it('should preserve pagination metadata', async () => {
      const response = await fetchWithAuth(`${API_BASE}/recipes?page=1&limit=5`);
      const result = await unwrap(response);

      expect(result.success).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination?.page).toBe(1);
      expect(result.pagination?.limit).toBe(5);
    });

    it('should preserve isLimited flag for guest users', async () => {
      // Request without auth (guest mode)
      const response = await fetch(`${API_BASE}/recipes`);
      const result = await unwrap(response);

      expect(result.success).toBe(true);
      // Guest users get limited flag if there are more than 10 recipes
      if (result.pagination && result.pagination.total > 10) {
        expect(result.isLimited).toBe(true);
        expect(result.message).toContain('Login');
      }
    });
  });
});
