import { apiCall, setTokens, clearTokens, getAccessToken, getRefreshToken } from './client';

export interface AuthUser {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  phone_no?: string;
  is_active?: boolean;
  is_staff?: boolean;
  role?: string;
  last_login?: string;
  date_joined?: string;
  status?: boolean;
  bio?: string;
  member_id?: number | null;
  [key: string]: unknown;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

const USER_STORAGE_KEY = 'jen_user';

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch (_e) {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(getAccessToken());
}

export async function login(emailOrUsername: string, password: string): Promise<AuthUser> {
  const response = await apiCall<LoginResponse>('/auth/token/', {
    method: 'POST',
    body: {
      'email-username': emailOrUsername.trim(),
      password,
    },
    auth: false,
  });

  if (!response || !response.access || !response.user) {
    throw new Error('Invalid response structure from login server.');
  }

  setTokens(response.access, response.refresh);
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
  }

  return response.user;
}

export async function fetchMe(): Promise<AuthUser> {
  const user = await apiCall<AuthUser>('/auth/me/', {
    method: 'GET',
  });

  if (typeof window !== 'undefined' && user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  return user;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await apiCall('/auth/logout/', {
        method: 'POST',
        body: { refresh: refreshToken },
        skipRefresh: true,
      });
    }
  } catch (_err) {
    // Best-effort logout: swallow errors so client clears state regardless
  } finally {
    clearTokens();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }
}
