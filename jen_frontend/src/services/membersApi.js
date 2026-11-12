/**
 * Members API Service
 * Connects jen_frontend directly to jenc_backend Django REST endpoints:
 *  - /api/members/
 *  - /api/members/analytics/
 *  - /api/members/committed/
 *  - /api/members/{id}/profile/pdf/
 */

import api from './api';

/**
 * Fetch paginated list of regular or committed members
 * @param {Object} params - { type, page, limit, search, cell_id }
 */
export const getMembers = async ({ type = 'regular', page = 1, limit = 20, search = '', cell_id = '' } = {}) => {
  if (type === 'committed') {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('page_size', limit);
    if (search) params.append('q', search);

    const res = await api.get(`members/committed/?${params.toString()}`);
    const results = res.results || res.data || (Array.isArray(res) ? res : []);
    const count = res.count ?? results.length;

    return {
      success: true,
      data: results.map(item => ({
        id: item.id,
        name: item.names || item.name || 'Member',
        full_name: item.names || item.name || 'Member',
        first_name: item.names || item.name || 'Member',
        last_name: '',
        phone: item.phone_no || item.phone || '—',
        phone_no: item.phone_no || item.phone || '—',
        email: item.email || '—',
        residence: item.residence || item.location || '—',
        location: item.residence || item.location || '—',
        status: item.linked_member_id ? 'Linked' : 'Unlinked',
        is_committed: true,
        linked: Boolean(item.linked_member_id),
        member_id: item.linked_member_id,
        linked_member_id: item.linked_member_id,
        created_at: item.created_at,
        joined_on_formatted: item.created_at ? new Date(item.created_at).toLocaleDateString() : '—',
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        total_pages: Math.ceil(count / limit) || 1,
      },
    };
  }

  // Regular members via DRF ModelViewSet
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('page_size', limit);
  if (search) params.append('q', search);
  if (cell_id) params.append('cell_id', cell_id);

  const res = await api.get(`members/?${params.toString()}`);
  const results = res.results || res.data || (Array.isArray(res) ? res : []);
  const count = res.count ?? results.length;

  return {
    success: true,
    data: results.map(m => {
      const fullName = m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Member';
      return {
        ...m,
        id: m.id || m.member_id,
        name: fullName,
        full_name: fullName,
        phone: m.phone_no || m.phone_number || m.phone || '—',
        phone_no: m.phone_no || m.phone_number || m.phone || '—',
        cell_name: m.cell_name || 'Unassigned',
        department: m.department || m.cell_name || '—',
        location: m.location || m.residence || '—',
        residence: m.location || m.residence || '—',
        status: m.status || m.delete_status || 'Active',
        is_committed: false,
      };
    }),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      total_pages: Math.ceil(count / limit) || 1,
    },
  };
};

/**
 * Fetch member summary analytics and dashboard stats
 */
export const getMemberStats = async () => {
  try {
    const res = await api.get('members/analytics/');
    if (res?.kpis) {
      return {
        success: true,
        data: {
          total_members: res.kpis.total || 0,
          regular: res.kpis.total || 0,
          active_members: res.kpis.active || 0,
          committed_members: res.committed_count || 0,
          committed: res.committed_count || 0,
          linked_accounts: res.kpis.assigned_cells || 0,
          unlinked_accounts: res.kpis.unassigned_cells || 0,
          new_last_30_days: res.kpis.new_30d || 0,
        },
      };
    }
  } catch (err) {
    console.warn('Analytics endpoint failed, falling back to overview:', err);
  }

  // Fallback to overview analytics
  const overview = await api.get('analytics/overview/').catch(() => null);
  const total = overview?.kpis?.active_members || 0;
  return {
    success: true,
    data: {
      total_members: total,
      regular: total,
      active_members: total,
      committed_members: 0,
      committed: 0,
      linked_accounts: 0,
      unlinked_accounts: 0,
      new_last_30_days: 0,
    },
  };
};

/**
 * Register a new member
 * @param {Object} memberData
 */
export const createMember = async (memberData) => {
  // Support both full_name or split first_name / last_name
  let firstName = memberData.first_name;
  let lastName = memberData.last_name;

  if (!firstName && memberData.fullName) {
    const parts = memberData.fullName.trim().split(' ');
    firstName = parts[0] || 'Member';
    lastName = parts.slice(1).join(' ') || '';
  }

  const payload = {
    first_name: firstName || 'Member',
    last_name: lastName || '',
    phone_no: memberData.phone || memberData.phone_no || '',
    email: memberData.email || '',
    gender: memberData.gender || 'Other',
    location: memberData.address || memberData.location || '',
    cell_id: memberData.cell_id || memberData.cellGroup || null,
    department: memberData.category || memberData.department || 'General',
  };

  const res = await api.post('members/', payload);
  return res;
};

/**
 * Download member 360 PDF dossier
 * @param {number|string} memberId
 */
export const downloadMemberDossierPdf = async (memberId) => {
  const token = localStorage.getItem('jen_access_token');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  const url = `${cleanBase}members/${memberId}/profile/pdf/?orientation=portrait`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/pdf',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download member PDF dossier');
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `member_dossier_${memberId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
};

export default {
  getMembers,
  getMemberStats,
  createMember,
  downloadMemberDossierPdf,
};
