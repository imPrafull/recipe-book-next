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
  error: string;
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

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    let refreshedToken: string | null = null;
    
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        const data = await refreshRes.json();
        
        if (data.success && data.data?.accessToken) {
          refreshedToken = data.data.accessToken;
          localStorage.setItem('accessToken', refreshedToken);
          if (data.data.refreshToken) {
            localStorage.setItem('refreshToken', data.data.refreshToken);
          }
          onRefreshed(refreshedToken);
        } else {
          refreshedToken = '';
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          onRefreshed('');
        }
      } catch {
        refreshedToken = '';
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        onRefreshed('');
      } finally {
        isRefreshing = false;
      }
    }

    const newToken = refreshedToken !== null ? refreshedToken : await new Promise<string>((resolve) => {
      refreshSubscribers.push(resolve);
    });

    if (newToken) {
      const newHeaders = new Headers(options.headers || {});
      newHeaders.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(url, { ...options, headers: newHeaders });
    }
  }

  return res;
}

export async function unwrap<T>(res: Response): Promise<SuccessResponse<T>> {
  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }

  return json;
}
