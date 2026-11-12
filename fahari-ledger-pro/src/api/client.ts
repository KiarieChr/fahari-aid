export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const ACCESS_TOKEN_KEY = 'jen_access_token';
const REFRESH_TOKEN_KEY = 'jen_refresh_token';

export function setTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export interface ApiCallOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  skipRefresh?: boolean;
}

function extractErrorMessage(data: unknown, status: number, statusText: string): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (typeof record.detail === 'string') {
      return record.detail;
    }
    const fieldErrors: string[] = [];
    for (const [key, val] of Object.entries(record)) {
      if (Array.isArray(val)) {
        fieldErrors.push(`${key}: ${val.join(', ')}`);
      } else if (typeof val === 'string') {
        fieldErrors.push(`${key}: ${val}`);
      }
    }
    if (fieldErrors.length > 0) {
      return fieldErrors.join('; ');
    }
  }
  return statusText || `Request failed with status ${status}`;
}

export async function apiCall<T = unknown>(
  path: string,
  options: ApiCallOptions = {}
): Promise<T> {
  const envBase = import.meta.env.VITE_API_BASE as string | undefined;
  const baseUrl = (envBase && envBase.trim().length > 0 ? envBase : 'http://localhost:8001/api').replace(/\/$/, '');
  const rawPath = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = baseUrl.endsWith('/api') && rawPath.startsWith('/api/')
    ? rawPath.substring(4)
    : rawPath;
  const url = `${baseUrl}${cleanPath}`;

  const headers = new Headers(options.headers || {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  let bodyPayload: BodyInit | undefined;
  if (options.body !== undefined && options.body !== null) {
    if (
      typeof options.body === 'string' ||
      options.body instanceof FormData ||
      options.body instanceof Blob ||
      options.body instanceof URLSearchParams
    ) {
      bodyPayload = options.body as BodyInit;
    } else {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      bodyPayload = JSON.stringify(options.body);
    }
  }

  if (options.auth !== false) {
    const token = getAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const { auth: _auth, skipRefresh, ...fetchInit } = options;

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchInit,
      headers,
      body: bodyPayload,
    });
  } catch (networkError) {
    throw new Error(
      networkError instanceof Error ? networkError.message : 'Unable to connect to the server.'
    );
  }

  // Handle 401 with automatic token refresh (only if auth was requested)
  if (response.status === 401 && !skipRefresh && options.auth !== false) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResp = await apiCall<{ access: string; refresh?: string }>(
          '/auth/token/refresh/',
          {
            method: 'POST',
            body: { refresh: refreshToken },
            auth: false,
            skipRefresh: true,
          }
        );

        if (refreshResp && refreshResp.access) {
          setTokens(refreshResp.access, refreshResp.refresh || refreshToken);
          // Retry the original request with new token
          return apiCall<T>(path, {
            ...options,
            skipRefresh: true,
          });
        }
      } catch (_refreshErr) {
        clearTokens();
      }
    }
  }

  // Handle 204 No Content / 205 Reset Content
  if (response.status === 204 || response.status === 205) {
    return undefined as unknown as T;
  }

  const contentType = response.headers.get('content-type') || '';
  let responseData: unknown;

  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch (_jsonErr) {
      responseData = null;
    }
  } else {
    responseData = await response.blob();
  }

  if (!response.ok) {
    const message = extractErrorMessage(responseData, response.status, response.statusText);
    throw new ApiError(message, response.status, responseData);
  }

  return responseData as T;
}
