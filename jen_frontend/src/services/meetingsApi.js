/**
 * Meetings API Service
 * Connects jen_frontend to jenc_backend Django REST endpoints under /api/meetings/
 */

import api from './api';

/**
 * Normalize meeting object for components (MeetingsList, MeetingDetailsModal, etc.)
 */
export const normalizeMeeting = (m) => {
  if (!m) return null;
  const start = m.start_time ? new Date(m.start_time) : null;
  const end = m.end_time ? new Date(m.end_time) : null;
  const now = new Date();

  let status = 'Upcoming';
  if (start && start < now) {
    status = (end && end < now) || !end ? 'Completed' : 'In Progress';
  }

  const dateStr = start ? start.toISOString().split('T')[0] : '';
  const timeStr = start ? start.toTimeString().slice(0, 5) : '';
  const endTimeStr = end ? end.toTimeString().slice(0, 5) : '';

  return {
    ...m,
    id: m.id,
    title: m.name || m.title || 'Untitled Meeting',
    name: m.name || m.title || 'Untitled Meeting',
    category: m.meeting_type_name || m.category || 'General',
    meeting_type_id: m.meeting_type_id,
    facilitator: m.facilitator_name || m.facilitator || 'Ministry Facilitator',
    facilitator_id: m.facilitator_id,
    date: dateStr,
    time: timeStr,
    end_time: endTimeStr,
    start_time: m.start_time,
    attendee_count: m.attendance_count ?? 0,
    attendance_count: m.attendance_count ?? 0,
    has_minutes: Boolean(m.has_minutes),
    meeting_link: m.meeting_link || '',
    meeting_code: m.meeting_code || '',
    status: status,
  };
};

/**
 * Fetch paginated list of meetings
 */
export const getMeetings = async ({ status = '', page = 1, limit = 10, search = '' } = {}) => {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('page_size', limit);
  if (search) params.append('q', search);

  const res = await api.get(`meetings/?${params.toString()}`);
  const results = res.results || res.data || (Array.isArray(res) ? res : []);
  const count = res.count ?? results.length;

  let filtered = results.map(normalizeMeeting);
  if (status && status.toLowerCase() !== 'all') {
    filtered = filtered.filter(m => m.status.toLowerCase() === status.toLowerCase());
  }

  return {
    success: true,
    data: {
      meetings: filtered,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        total_pages: Math.ceil(count / limit) || 1,
      },
    },
  };
};

/**
 * Fetch meeting statistics for MeetingStatsCards.jsx
 */
export const getMeetingStats = async () => {
  try {
    const [meetingsRes, summaryRes] = await Promise.all([
      api.get('meetings/?page_size=100').catch(() => ({ results: [] })),
      api.get('meetings/attendance/summary/').catch(() => null),
    ]);

    const meetings = (meetingsRes.results || []).map(normalizeMeeting);
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcoming7Days = meetings.filter(m => {
      if (!m.start_time) return false;
      const d = new Date(m.start_time);
      return d >= now && d <= next7Days;
    }).length;

    const completed = meetings.filter(m => {
      if (!m.start_time) return false;
      return new Date(m.start_time) < now;
    }).length;

    const totalAttendance = meetings.reduce((sum, m) => sum + (m.attendance_count || 0), 0);
    const avgAttendance = meetings.length > 0 ? Math.round(totalAttendance / meetings.length) : 0;

    return {
      success: true,
      data: {
        stats: {
          total_meetings: meetingsRes.count ?? meetings.length,
          upcoming_7_days: upcoming7Days,
          completed_meetings: completed,
          average_attendance: summaryRes?.kpis?.average_attendance ?? avgAttendance,
        },
      },
    };
  } catch (err) {
    console.error('Failed to calculate meeting stats:', err);
    return {
      success: true,
      data: {
        stats: {
          total_meetings: 0,
          upcoming_7_days: 0,
          completed_meetings: 0,
          average_attendance: 0,
        },
      },
    };
  }
};

/**
 * Fetch meeting filters (types, facilitators, cells, departments)
 */
export const getMeetingFilters = async () => {
  const res = await api.get('meetings/filters/');
  return { success: true, data: res };
};

/**
 * Fetch list of meeting types
 */
export const getMeetingTypes = async () => {
  const res = await api.get('meetings/types/');
  const list = Array.isArray(res) ? res : (res.results || res.data || []);
  return {
    success: true,
    data: {
      meeting_types: list.map(t => ({
        id: t.id,
        name: t.name,
        meeting_count: t.meeting_count || 0,
      })),
    },
  };
};

/**
 * Create a new meeting type
 */
export const createMeetingType = async (name) => {
  const res = await api.post('meetings/types/', { name });
  return { success: true, data: res };
};

/**
 * Create a new meeting
 */
export const createMeeting = async (meetingData) => {
  // Combine date + time into ISO format
  let startTime = meetingData.start_time;
  if (!startTime && meetingData.date && meetingData.time) {
    startTime = `${meetingData.date}T${meetingData.time}:00`;
  }

  let endTime = meetingData.end_time;
  if (endTime && meetingData.date && !endTime.includes('T')) {
    endTime = `${meetingData.date}T${meetingData.end_time}:00`;
  }

  const payload = {
    name: meetingData.title || meetingData.name || 'Untitled Meeting',
    meeting_type_id: Number(meetingData.meeting_type || meetingData.meeting_type_id || 1),
    facilitator_id: Number(meetingData.facilitator || meetingData.facilitator_id || 1),
    start_time: startTime || new Date().toISOString(),
    end_time: endTime || null,
    meeting_link: meetingData.meeting_link || '',
    description: meetingData.description || '',
  };

  const res = await api.post('meetings/', payload);
  return { success: true, data: normalizeMeeting(res) };
};

/**
 * Fetch minutes for a specific meeting
 */
export const getMeetingMinutes = async (meetingId) => {
  const res = await api.get(`meetings/${meetingId}/minutes/`);
  return { success: true, data: res };
};

/**
 * Save or update minutes for a meeting
 */
export const saveMeetingMinutes = async (meetingId, minutesContent, personnelId = null) => {
  const payload = {
    minutes: minutesContent,
  };
  if (personnelId) payload.personnel_id = personnelId;

  const res = await api.put(`meetings/${meetingId}/minutes/`, payload);
  return { success: true, data: res };
};

/**
 * Download official Meeting Minutes PDF
 */
export const downloadMeetingMinutesPdf = async (meetingId) => {
  const token = localStorage.getItem('jen_access_token');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  const response = await fetch(`${cleanBase}meetings/${meetingId}/minutes/pdf/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/pdf',
    },
  });

  if (!response.ok) throw new Error('Failed to download meeting minutes PDF');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meeting_${meetingId}_minutes.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);
};

export default {
  getMeetings,
  getMeetingStats,
  getMeetingTypes,
  createMeetingType,
  createMeeting,
  getMeetingMinutes,
  saveMeetingMinutes,
  downloadMeetingMinutesPdf,
  normalizeMeeting,
};
