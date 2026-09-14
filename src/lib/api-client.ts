export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  isLimited?: boolean;
  message?: string;
  pagination?: PaginationMeta;
}

interface ErrorResponse {
  success: false;
  error: string | { code: string; message: string };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

type OnTokenRefreshCallback = (token: string) => void;
const onTokenRefreshCallbacks: OnTokenRefreshCallback[] = [];

export function subscribeToTokenRefresh(callback: OnTokenRefreshCallback) {
  onTokenRefreshCallbacks.push(callback);
  return () => {
    const index = onTokenRefreshCallbacks.indexOf(callback);
    if (index > -1) {
      onTokenRefreshCallbacks.splice(index, 1);
    }
  };
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
  onTokenRefreshCallbacks.forEach((cb) => cb(token));
}


/**
 * Fetch with automatic token management.
 * On any 401 response, attempts a token refresh using the stored refresh token
 * before retrying the original request. Redirects to /login only if no refresh
 * token is available or if the refresh itself fails.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  const headers = new Headers(options.headers || {});
  
  // Only add Authorization header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });

  // Handle 401 Unauthorized responses
  if (res.status === 401) {
    // Attempt token refresh for any 401 when a refresh token is available.
    // The server may not always return TOKEN_EXPIRED (e.g. plain "Unauthorized"),
    // so we should not gate the refresh solely on that error code.
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refreshToken')
      : null;

    if (refreshToken) {
      let refreshedToken: string = '';

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });

          if (!refreshRes.ok) {
            throw new Error('Refresh failed');
          }

          const data = await refreshRes.json();

          if (data.success && data.data?.accessToken) {
            refreshedToken = data.data.accessToken;
            localStorage.setItem('accessToken', refreshedToken);
            if (data.data.refreshToken) {
              localStorage.setItem('refreshToken', data.data.refreshToken);
            }
            onRefreshed(refreshedToken);
          } else {
            throw new Error('Invalid refresh response');
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          refreshedToken = '';
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tokenExpiresAt');
          onRefreshed('');
          // Redirect to login only after refresh has actually failed
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } finally {
          isRefreshing = false;
        }
      } else {
        // Another request is already refreshing — wait for it
        refreshedToken = await new Promise<string>((resolve) => {
          refreshSubscribers.push(resolve);
        });
      }

      // Retry the original request with the new token if refresh succeeded
      if (refreshedToken) {
        const newHeaders = new Headers(options.headers || {});
        newHeaders.set('Authorization', `Bearer ${refreshedToken}`);
        res = await fetch(url, { ...options, headers: newHeaders });
      }
    } else {
      // No refresh token available — cannot recover, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenExpiresAt');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return res;
}

export async function unwrap<T>(res: Response): Promise<SuccessResponse<T>> {
  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    const errorMessage = typeof json.error === 'string' 
      ? json.error 
      : json.error?.message || 'Request failed';
    throw new Error(errorMessage || `Request failed with status ${res.status}`);
  }

  return json;
}
