/**
 * Authentication Service
 * Unified: Connects to Django REST Framework (SimpleJWT) with fallback compatibility.
 */

import api, { setTokens, clearTokens, getRefreshToken } from './api';

/**
 * Login user
 * @param {string} email - User email or username
 * @param {string} password - User password
 * @returns {Promise<Object>} - User data and tokens
 */
export const login = async (email, password) => {
  // Django JWT Endpoint: POST /api/auth/token/
  const payload = {
    email: email.trim(),
    password,
  };

  const response = await api.post('auth/token/', payload);

  // DRF SimpleJWT legacy view returns { access, refresh, user }
  if (response?.access && response?.user) {
    const { access, refresh, user } = response;
    setTokens(access, refresh);
    return { user, success: true };
  }

  // Fallback if wrapped in legacy envelope { success: true, data: { access_token, user } }
  if (response?.success && response?.data) {
    const { access_token, refresh_token, user } = response.data;
    setTokens(access_token, refresh_token);
    return { user, success: true };
  }

  throw new Error(response?.detail || response?.error || 'Login failed');
};

/**
 * Register new user
 * @param {Object} userData - Registration data
 * @returns {Promise<Object>} - User data and tokens
 */
export const register = async (userData) => {
  const response = await api.post('members/', userData);

  if (response?.id || response?.success) {
    // Attempt automatic login after registration if credentials are present
    if (userData.email && userData.password) {
      return await login(userData.email, userData.password);
    }
    return { user: response, success: true };
  }

  throw new Error(response?.error || 'Registration failed');
};

/**
 * Logout user
 */
export const logout = async (allDevices = false) => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await api.post('auth/logout/', {
        refresh: refreshToken,
        all_devices: allDevices,
      });
    }
  } catch (error) {
    console.warn('Logout notification error:', error);
  } finally {
    clearTokens();
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} - { user, permissions }
 */
export const getCurrentUser = async () => {
  // Django Profile Endpoint: GET /api/auth/me/
  const response = await api.get('auth/me/');

  if (response?.id || response?.email) {
    return {
      user: response,
      permissions: response.is_staff ? ['admin', 'staff'] : ['member'],
    };
  }

  if (response?.success && response?.data) {
    return response.data;
  }

  throw new Error('Failed to load user profile');
};

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('jen_access_token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

/**
 * Update user profile
 * @param {Object} profileData
 */
export const updateProfile = async (profileData) => {
  const response = await api.patch('auth/me/', profileData);
  return response;
};

/**
 * Upload profile picture
 * @param {File} file - Image file to upload
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post('auth/me/avatar/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response;
};

/**
 * Change password
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('auth/me/change-password/', {
    old_password: currentPassword,
    new_password: newPassword,
  });
  return response;
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email) => {
  const response = await api.post('auth/forgot-password/', { email });
  return response;
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  updateProfile,
  uploadAvatar,
  changePassword,
  requestPasswordReset,
};
