import api from './api';

/**
 * User Profile & User Management API Service
 */

// --- USER PROFILE (Authenticated User) ---

export const getUserProfile = async () => {
    try {
        const res = await api.get('auth/me/');
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
    }
};

export const updateUserProfile = async (profileData) => {
    try {
        const res = await api.patch('auth/me/', profileData);
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
    }
};

export const uploadAvatar = async (file) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await api.post('auth/me/avatar/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to upload avatar:', error);
        throw error;
    }
};

export const changePassword = async ({ old_password, new_password }) => {
    try {
        const res = await api.post('auth/me/change-password/', { old_password, new_password });
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to change password:', error);
        throw error;
    }
};

// --- USER MANAGEMENT (Super Admins & Staff Only) ---

export const getUsersList = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.role && params.role !== 'All') queryParams.append('role', params.role);
        if (params.status && params.status !== 'All') queryParams.append('status', params.status);
        if (params.limit) queryParams.append('limit', params.limit);

        const qs = queryParams.toString();
        const url = `auth/users/${qs ? '?' + qs : ''}`;
        const res = await api.get(url);
        return res?.data !== undefined && res?.results === undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to fetch users list:', error);
        throw error;
    }
};

export const getUserStats = async () => {
    try {
        const res = await api.get('auth/users/stats/');
        return res?.data !== undefined && res?.stats === undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to fetch user stats:', error);
        throw error;
    }
};

export const getUserRoles = async () => {
    try {
        const res = await api.get('auth/roles/');
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const res = await api.post('auth/users/', userData);
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to create user:', error);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const res = await api.patch(`auth/users/${id}/`, userData);
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error(`Failed to update user #${id}:`, error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const res = await api.delete(`auth/users/${id}/`);
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error(`Failed to deactivate user #${id}:`, error);
        throw error;
    }
};

