'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, subscribeToTokenRefresh } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper function to decode JWT payload and check expiration
 * Returns true if token is valid and not expired, false otherwise
 */
function isTokenValid(token: string): boolean {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode payload (base64url)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    );

    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    if (payload.exp) {
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      // Add 10 second buffer to avoid race conditions
      return expirationTime > currentTime + 10000;
    }

    return true; // No exp claim, assume valid
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage on mount and validate token expiration
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedAccessToken && isTokenValid(storedAccessToken)) {
      // Token is valid, use it
      setToken(storedAccessToken);
      setIsAuthenticated(true);
    } else if (storedRefreshToken && storedAccessToken) {
      // Access token is expired, try to refresh it
      console.log('Access token expired, attempting refresh...');
      refreshTokenSilently(storedRefreshToken);
    } else {
      // No valid tokens, clear auth state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setIsAuthenticated(false);
    }

    setIsLoading(false);

    // Subscribe to token refresh events emitted by api-client interceptor
    const unsubscribe = subscribeToTokenRefresh((newToken: string | null) => {
      setToken(newToken || null);
      setIsAuthenticated(!!newToken);
    });
    
    return () => unsubscribe();
  }, []);

  /**
   * Silently attempt to refresh the access token using refresh token
   */
  async function refreshTokenSilently(refreshToken: string) {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        setToken(data.data.accessToken);
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
    setToken(accessToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
