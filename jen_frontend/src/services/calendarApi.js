/**
 * Calendar API Service
 * Connects jen_frontend to jenc_backend Django REST endpoints under /api/calendar/events/
 */

import api from './api';

/**
 * Fetch unified master calendar events and meetings
 */
export const getCalendarEvents = async ({ year, month, exclude = '', category = '' } = {}) => {
  const params = new URLSearchParams();
  if (year) params.append('year', year);
  if (month) params.append('month', month);
  if (exclude) params.append('exclude', exclude);
  if (category && category !== 'all') params.append('category', category);

  const res = await api.get(`calendar/events/?${params.toString()}`);
  return {
    success: true,
    data: res.data || res || {},
    events: res.events || res.data?.events || [],
    filters: res.filters || res.data?.filters || [],
    summary: res.summary || res.data?.summary || { total_items: 0, events_count: 0, meetings_count: 0 },
  };
};

export default {
  getCalendarEvents,
};

