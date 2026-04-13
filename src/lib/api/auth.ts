import { API_BASE, fetchWithAuth, unwrap } from '../api-client';

export const authApi = {
  async login(payload: any) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return unwrap<{ accessToken: string; refreshToken: string; user: any }>(res);
  },

  async signup(payload: any) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return unwrap<{ accessToken: string; refreshToken: string; user: any }>(res);
  },

  async logout() {
    const res = await fetchWithAuth(`${API_BASE}/auth/logout`, { method: 'POST' });
    if (!res.ok) {
      return;
    }
  },
};
