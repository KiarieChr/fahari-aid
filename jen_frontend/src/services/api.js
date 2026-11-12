/**
 * API Configuration and Axios Instance
 * Dual-Mode: Supports both Django REST Framework and Legacy PHP endpoints
 */

import axios from 'axios';

// API Base URL - reads .env.local / .env or defaults to Django backend
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
export const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

/**
 * Resolve media URL (e.g. profile photo, audio stream, branding logo)
 * Ensures relative backend paths (/media/...) are resolved against backend origin (port 8000), not frontend (port 5173)
 */
export const getMediaUrl = (path) => {
    if (!path) return null;
    const str = String(path).trim();
    if (!str) return null;
    if (str.startsWith('http://') || str.startsWith('https://')) return str;
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
    const cleanPath = str.startsWith('/') ? str : `/${str}`;
    return `${backendOrigin}${cleanPath}`;
};

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
    timeout: 30000,
});

// Token storage keys
const ACCESS_TOKEN_KEY = 'jen_access_token';
const REFRESH_TOKEN_KEY = 'jen_refresh_token';

/**
 * Get stored access token
 */
export const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Store tokens
 */
export const setTokens = (accessToken, refreshToken) => {
    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
};

/**
 * Clear tokens (logout)
 */
export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor - add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle token refresh and errors
api.interceptors.response.use(
    (response) => {
        // Return successful response data directly
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Don't try to refresh for auth endpoints - return error directly
        const isAuthEndpoint = originalRequest.url?.includes('auth/token') ||
                               originalRequest.url?.includes('/auth/login');

        // If 401 and not already retrying and not an auth endpoint, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            const refreshToken = getRefreshToken();

            if (refreshToken) {
                try {
                    // Try to refresh token via Django SimpleJWT endpoint or legacy refresh
                    const refreshUrl = `${API_BASE_URL}auth/token/refresh/`;
                    const response = await axios.post(refreshUrl, {
                        refresh: refreshToken,
                    });

                    const newAccessToken = response.data?.access || response.data?.data?.access_token;
                    const newRefreshToken = response.data?.refresh || response.data?.data?.refresh_token || refreshToken;

                    if (newAccessToken) {
                        setTokens(newAccessToken, newRefreshToken);
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    clearTokens();
                    return Promise.reject(new Error('Session expired. Please login again.'));
                }
            }
        }

        // Extract friendly error message from DRF or Legacy PHP
        let errorMessage = 'An error occurred';
        if (error.response?.data) {
            const data = error.response.data;
            if (typeof data === 'string') {
                errorMessage = data;
            } else if (data.detail) {
                errorMessage = data.detail;
            } else if (data.error) {
                errorMessage = data.error;
            } else if (data.message) {
                errorMessage = data.message;
            } else {
                // Collect first field error if dictionary
                const firstVal = Object.values(data)[0];
                if (Array.isArray(firstVal) && firstVal.length > 0) {
                    errorMessage = firstVal[0];
                } else if (typeof firstVal === 'string') {
                    errorMessage = firstVal;
                }
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        return Promise.reject(new Error(errorMessage));
    }
);

export default api;
