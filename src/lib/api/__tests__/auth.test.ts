import { authApi } from '../auth';

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const result = await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe('test@example.com');
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.refreshToken).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      await expect(
        authApi.login({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error when email is missing', async () => {
      await expect(
        authApi.login({
          password: 'password123',
        })
      ).rejects.toThrow('Email and password are required');
    });

    it('should throw error when password is missing', async () => {
      await expect(
        authApi.login({
          email: 'test@example.com',
        })
      ).rejects.toThrow('Email and password are required');
    });
  });

  describe('signup', () => {
    it('should successfully create new user', async () => {
      const result = await authApi.signup({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe('newuser@example.com');
      expect(result.data.user.name).toBe('New User');
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.refreshToken).toBeDefined();
    });

    it('should throw error when user already exists', async () => {
      // First signup succeeds
      await authApi.signup({
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'First User',
      });

      // Second signup with same email should fail
      await expect(
        authApi.signup({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'Second User',
        })
      ).rejects.toThrow('User with this email already exists');
    });

    it('should throw error when required fields are missing', async () => {
      await expect(
        authApi.signup({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email, password, and name are required');
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      // Login first
      const loginResult = await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      });
      
      localStorage.setItem('accessToken', loginResult.data.accessToken);

      // Logout should not throw
      await expect(authApi.logout()).resolves.not.toThrow();
    });

    it('should handle logout without authentication', async () => {
      // Logout without token should not throw
      await expect(authApi.logout()).resolves.not.toThrow();
    });
  });
});
