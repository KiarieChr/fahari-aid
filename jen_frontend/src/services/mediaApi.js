import api from './api';

/**
 * Fetch media list with optional filters
 * @param {Object} params - { type, search, series, featured, limit }
 */
export const getMediaList = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.type && params.type !== 'all') queryParams.append('type', params.type);
        if (params.search) queryParams.append('search', params.search);
        if (params.series && params.series !== 'all') queryParams.append('series', params.series);
        if (params.featured !== undefined) queryParams.append('featured', params.featured);
        if (params.limit) queryParams.append('limit', params.limit);

        const queryString = queryParams.toString();
        const url = `media/${queryString ? '?' + queryString : ''}`;
        const res = await api.get(url);
        return res?.data !== undefined && res?.results === undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to fetch media list:', error);
        throw error;
    }
};

/**
 * Fetch media center KPI statistics
 */
export const getMediaStats = async () => {
    try {
        const res = await api.get('media/stats/');
        return res?.data !== undefined && res?.stats === undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to fetch media stats:', error);
        throw error;
    }
};

/**
 * Fetch featured/latest media sermon
 */
export const getLatestMedia = async () => {
    try {
        const res = await api.get('media/latest/');
        return res?.data !== undefined && res?.item === undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to fetch latest media:', error);
        throw error;
    }
};

/**
 * Fetch media detail by ID
 */
export const getMediaDetail = async (id) => {
    try {
        const res = await api.get(`media/${id}/`);
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error(`Failed to fetch media #${id}:`, error);
        throw error;
    }
};

/**
 * Create/Upload new media item (audio, video, gallery)
 */
export const createMedia = async (data) => {
    try {
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const res = await api.post('media/', data, config);
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error('Failed to create media item:', error);
        throw error;
    }
};

/**
 * Update media item
 */
export const updateMedia = async (id, data) => {
    try {
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const res = await api.put(`media/${id}/`, data, config);
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error(`Failed to update media #${id}:`, error);
        throw error;
    }
};

/**
 * Delete media item
 */
export const deleteMedia = async (id) => {
    try {
        const res = await api.delete(`media/${id}/`);
        return res?.data !== undefined ? res.data : res;
    } catch (error) {
        console.error(`Failed to delete media #${id}:`, error);
        throw error;
    }
};
