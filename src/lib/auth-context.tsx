'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, subscribeToTokenRefresh } from './api';
import { useRouter } from 'next/navigation';

// Global refresh timer reference
let refreshTimeout: NodeJS.Timeout | null = null;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decode JWT payload (manual implementation to avoid external dependency)
 * Returns the decoded payload or null if invalid
 */
function decodeToken(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    );
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract expiration time from JWT token
 * Returns expiration time in milliseconds, or null if invalid
 */
function getTokenExpiry(token: string): number | null {
  const payload = decodeToken(token);
  if (payload?.exp) {
    return payload.exp * 1000; // Convert from seconds to milliseconds
  }
  return null;
}

/**
 * Helper function to check if token is valid and not expired
 * Returns true if token is valid and not expired, false otherwise
 */
function isTokenValid(token: string): boolean {
  try {
    const payload = decodeToken(token);
    if (!payload?.exp) return true; // No exp claim, assume valid

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    // Add 10 second buffer to avoid race conditions
    return expirationTime > currentTime + 10000;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

/**
 * Schedule token refresh 1 minute before expiry
 */
function scheduleTokenRefresh(expiresAt: number) {
  // Clear existing timer
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  const now = Date.now();
  const timeUntilRefresh = expiresAt - now - 60000; // Refresh 1 min early

  if (timeUntilRefresh > 0) {
    refreshTimeout = setTimeout(() => {
      console.log('Proactively refreshing token before expiry...');
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        refreshAccessToken(refreshToken);
      }
    }, timeUntilRefresh);
  }
}

/**
 * Attempt to refresh the access token using refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<void> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Refresh failed — redirect to login
      console.error('Token refresh failed:', response.statusText);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
      window.location.href = '/login';
      return;
    }

    const data = await response.json();
    
    if (data.success && data.data?.accessToken) {
      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;
      
      localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      // Store expiry time and schedule next refresh
      const expiresAt = getTokenExpiry(newAccessToken);
      if (expiresAt) {
        localStorage.setItem('tokenExpiresAt', expiresAt.toString());
        scheduleTokenRefresh(expiresAt);
      }
      
      // Notify auth context of refresh
      subscribeToTokenRefresh(newAccessToken);
    } else {
      throw new Error('Invalid refresh response');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
    window.location.href = '/login';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage on mount and validate token expiration
    const initializeAuth = async () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedAccessToken && isTokenValid(storedAccessToken)) {
        // Token is valid, use it
        setToken(storedAccessToken);
        setIsAuthenticated(true);
        
        // Schedule proactive refresh
        const expiresAt = getTokenExpiry(storedAccessToken);
        if (expiresAt) {
          scheduleTokenRefresh(expiresAt);
        }
      } else if (storedRefreshToken && storedAccessToken) {
        // Access token is expired, try to refresh it
        console.log('Access token expired, attempting refresh...');
        await refreshAccessToken(storedRefreshToken);
      } else {
        // No valid tokens, user is in guest mode
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresAt');
        setToken(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    // Subscribe to token refresh events emitted by api-client interceptor
    const unsubscribe = subscribeToTokenRefresh((newToken: string | null) => {
      if (newToken) {
        setToken(newToken);
        setIsAuthenticated(true);
        const expiresAt = getTokenExpiry(newToken);
        if (expiresAt) {
          scheduleTokenRefresh(expiresAt);
        }
      } else {
        setToken(null);
        setIsAuthenticated(false);
      }
    });

    initializeAuth();
    
    return () => {
      unsubscribe();
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, []);

  /**
   * Silently attempt to refresh the access token using refresh token
   * Returns a promise that resolves when refresh completes (or fails)
   */
  async function refreshTokenSilently(refreshToken: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        const newAccessToken = data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        setToken(newAccessToken);
        setIsAuthenticated(true);
      } else {
        // Refresh failed, clear auth state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Silent token refresh failed:', error);
      // Clear auth state on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setIsAuthenticated(false);
    }
  }

  /**
   * Silently attempt to refresh the access token using refresh token
   * Returns a promise that resolves when refresh completes (or fails)
   */
  async function refreshTokenSilently(refreshToken: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        const newAccessToken = data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        setToken(newAccessToken);
        setIsAuthenticated(true);
      } else {
        // Refresh failed, clear auth state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Silent token refresh failed:', error);
      // Clear auth state on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setIsAuthenticated(false);
    }
  }

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Store and schedule token refresh
    const expiresAt = getTokenExpiry(accessToken);
    if (expiresAt) {
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
      scheduleTokenRefresh(expiresAt);
    }
    
    setToken(accessToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    // Clear refresh timer
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
    }

    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
      setToken(null);
      setIsAuthenticated(false);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
