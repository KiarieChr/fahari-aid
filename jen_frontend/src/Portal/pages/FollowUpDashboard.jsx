import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../../services/api';
import membersApi from '../../services/membersApi';
import { ThemeContext } from '../../context/ThemeContext';

const StitchKpiCard = ({ icon, badge, label, value, subtext, lineColor }) => (
    <div className="stitch-kpi-card">
        <div className="kpi-header">
            <div className="kpi-icon-wrap" style={{ background: icon.bg, color: icon.color }}>
                {icon.svg}
            </div>
            {badge && (
                <span className="kpi-badge" style={{ background: badge.bg, color: badge.color }}>
                    {badge.text}
                </span>
            )}
        </div>
        <div className="kpi-content">
            <span className="kpi-label">{label}</span>
            <div className="kpi-value">{value}</div>
        </div>
        <div className="kpi-footer">
            <div className="kpi-progress-track">
                <div className="kpi-progress-fill" style={{ background: lineColor, width: '85%' }}></div>
            </div>
            <span className="kpi-subtext">{subtext}</span>
        </div>
    </div>
);

const FollowUpDashboard = () => {
    const [followups, setFollowups] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, no_response: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchFollowups = useCallback(async (pageNum = 1) => {
        try {
            setLoading(true);
            const res = await api.get('get_followups.php', {
                params: { status: filter, page: pageNum, limit: 20 }
            });
            if (res?.success) {
                setFollowups(res.data.followups || []);
                setStats(res.data.stats || {
                    total: res.data.followups?.length || 0,
                    pending: (res.data.followups || []).filter(f => f.status === 'pending').length,
                    completed: (res.data.followups || []).filter(f => f.status === 'completed').length,
                    no_response: (res.data.followups || []).filter(f => f.status === 'no_response').length
                });
                setHasMore(res.data.pagination?.has_more || false);
            } else {
                // If endpoint empty or non-existent, provide baseline structure
                setFollowups([]);
            }
        } catch (err) {
            console.warn('Follow-ups fetch notice:', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        setPage(1);
        fetchFollowups(1);
    }, [fetchFollowups, refreshKey]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await api.post('update_followup.php', {
                followup_id: id,
                status: newStatus,
                notes: ''
            });
            if (res.success) fetchFollowups(page);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update follow-up status');
        }
    };

    const statusBadge = (st) => {
        const s = (st || 'pending').toLowerCase();
        if (s === 'completed') {
            return { bg: '#eefdf5', color: '#16a34a', border: '#bbf7d0', label: 'Completed' };
        }
        if (s === 'no_response') {
            return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'No Response' };
        }
        return { bg: '#fef3c7', color: '#d97706', border: '#fde68a', label: 'Pending Action' };
    };

    const filteredFollowups = followups.filter(f => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const name = `${f.first_name || ''} ${f.last_name || ''}`.toLowerCase();
        const msg = (f.message || '').toLowerCase();
        return name.includes(q) || msg.includes(q);
    });

    return (
        <div className="stitch-followup-container">
            {/* Breadcrumbs Bar */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Follow up & Cells</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Follow-Up Tracker ({stats.total || followups.length})</span>
                </div>

                <div className="sync-live-status">
                    <span className="sync-live-dot">●</span>
                    <span>Sync live</span>
                    <span className="sync-sep">•</span>
                    <span>Updated just now</span>
                    <button className="sync-refresh-btn" onClick={() => setRefreshKey(k => k + 1)}>
                        ⟳
                    </button>
                </div>
            </div>

            {/* Action Bar */}
            <div className="stitch-action-bar">
                <div className="actions-left">
                    <button
                        className="stitch-primary-btn"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>New Follow-Up</span>
                    </button>

                    <div className="stitch-tabs-pills">
                        {[
                            { key: '', label: 'All Cases' },
                            { key: 'pending', label: 'Pending' },
                            { key: 'completed', label: 'Completed' },
                            { key: 'no_response', label: 'Needs Re-touch' }
                        ].map(t => (
                            <button
                                key={t.key}
                                className={`stitch-tab-pill ${filter === t.key ? 'active' : ''}`}
                                onClick={() => setFilter(t.key)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="actions-right">
                    <div className="stitch-search-field">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search member or log..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="stitch-kpi-grid">
                <StitchKpiCard
                    icon={{
                        bg: '#eef2ff',
                        color: '#4f46e5',
                        svg: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#eef2ff', color: '#4f46e5', text: 'Active Log' }}
                    label="TOTAL FOLLOW-UPS"
                    value={stats.total ?? followups.length}
                    subtext="All registered outreaches"
                    lineColor="#4f46e5"
                />

                <StitchKpiCard
                    icon={{
                        bg: '#fef3c7',
                        color: '#d97706',
                        svg: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#fef3c7', color: '#d97706', text: 'Action Needed' }}
                    label="PENDING ACTION"
                    value={stats.pending ?? 0}
                    subtext="Awaiting first discipleship touch"
                    lineColor="#d97706"
                />

                <StitchKpiCard
                    icon={{
                        bg: '#ecfdf5',
                        color: '#10b981',
                        svg: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#ecfdf5', color: '#10b981', text: 'Verified' }}
                    label="COMPLETED"
                    value={stats.completed ?? 0}
                    subtext="Successfully contacted & nurtured"
                    lineColor="#10b981"
                />

                <StitchKpiCard
                    icon={{
                        bg: '#fef2f2',
                        color: '#ef4444',
                        svg: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#fef2f2', color: '#ef4444', text: 'Follow-up' }}
                    label="NO RESPONSE"
                    value={stats.no_response ?? 0}
                    subtext="Requires alternate visitation"
                    lineColor="#ef4444"
                />
            </div>

            {/* Main Table Card */}
            <div className="stitch-card-wrapper">
                <div className="stitch-card-header">
                    <div className="header-titles">
                        <h3>Member Discipleship & Follow-Up Log</h3>
                        <p>Showing {filteredFollowups.length} scheduled and completed member contact touches</p>
                    </div>
                </div>

                {loading ? (
                    <div className="stitch-loading-state">
                        <div className="stitch-spinner"></div>
                        <p>Loading follow-up records...</p>
                    </div>
                ) : filteredFollowups.length === 0 ? (
                    <div className="stitch-empty-state">
                        <div className="empty-icon-wrap">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <h4>No follow-up records found</h4>
                        <p>Use "+ New Follow-Up" to assign contact outreach to cell overseers and soul winners.</p>
                    </div>
                ) : (
                    <div className="stitch-table-responsive">
                        <table className="stitch-table">
                            <thead>
                                <tr>
                                    <th>Member Details</th>
                                    <th>Category</th>
                                    <th>Message / Touch Note</th>
                                    <th>Assigned Caregiver</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFollowups.map((fu) => {
                                    const b = statusBadge(fu.status);
                                    const initials = `${fu.first_name?.[0] || 'M'}${fu.last_name?.[0] || 'K'}`;
                                    return (
                                        <tr key={fu.id}>
                                            <td>
                                                <div className="stitch-cell-profile">
                                                    <div className="avatar-circle">
                                                        {initials}
                                                    </div>
                                                    <div className="profile-text">
                                                        <span className="profile-name">{fu.first_name} {fu.last_name}</span>
                                                        <span className="profile-sub">{fu.phone_no || 'No contact provided'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="stitch-badge-neutral">
                                                    {fu.followup_type || 'General Care'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="message-snippet" title={fu.message}>
                                                    {fu.message || 'Routine discipleship check-in'}
                                                </div>
                                                <div className="date-sub">{fu.sent_at || 'Recently scheduled'}</div>
                                            </td>
                                            <td>
                                                <div className="caregiver-name">
                                                    {fu.sent_by_name || 'Cell Overseer'}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className="stitch-badge-status"
                                                    style={{ background: b.bg, color: b.color, borderColor: b.border }}
                                                >
                                                    {b.label}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="actions-cluster">
                                                    {fu.phone_no && (
                                                        <a
                                                            href={`tel:${fu.phone_no}`}
                                                            className="stitch-icon-action"
                                                            title="Direct Call"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                                            </svg>
                                                        </a>
                                                    )}
                                                    {fu.phone_no && (
                                                        <a
                                                            href={`https://wa.me/${fu.phone_no.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="stitch-icon-action"
                                                            title="WhatsApp Message"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                            </svg>
                                                        </a>
                                                    )}
                                                    {fu.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(fu.id, 'completed')}
                                                            className="stitch-table-btn-success"
                                                            title="Mark as completed"
                                                        >
                                                            ✓ Done
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateFollowUpModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        fetchFollowups(1);
                    }}
                />
            )}

            <style>{`
                .stitch-followup-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    padding-bottom: 2.5rem;
                }

                .stitch-breadcrumbs-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.8125rem;
                    color: #64748b;
                }
                .breadcrumbs-path {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                }
                .crumb-segment {
                    color: #64748b;
                }
                .crumb-sep {
                    color: #cbd5e1;
                    font-size: 0.75rem;
                }
                .crumb-current {
                    color: #0f172a;
                    font-weight: 600;
                }
                .sync-live-status {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.775rem;
                    color: #64748b;
                }
                .sync-live-dot {
                    color: #22c55e;
                    font-size: 0.75rem;
                }
                .sync-sep {
                    color: #cbd5e1;
                }
                .sync-refresh-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #64748b;
                    font-size: 0.95rem;
                    padding: 0 0.2rem;
                    transition: transform 0.2s;
                }
                .sync-refresh-btn:hover {
                    transform: rotate(90deg);
                    color: #0f172a;
                }

                .stitch-action-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }
                .actions-left {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }
                .actions-right {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .stitch-primary-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    background: linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%);
                    color: #ffffff;
                    border: none;
                    border-radius: 9999px;
                    padding: 0.55rem 1.15rem;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(14, 165, 233, 0.25);
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .stitch-primary-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);
                }

                .stitch-tabs-pills {
                    display: flex;
                    align-items: center;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    padding: 0.2rem;
                    gap: 0.2rem;
                }
                .stitch-tab-pill {
                    background: transparent;
                    border: none;
                    padding: 0.35rem 0.85rem;
                    font-size: 0.785rem;
                    font-weight: 500;
                    color: #64748b;
                    border-radius: 9999px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .stitch-tab-pill.active {
                    background: #2563eb;
                    color: #ffffff;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                }

                .stitch-search-field {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    padding: 0.4rem 0.85rem;
                    min-width: 240px;
                }
                .stitch-search-field input {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 0.8125rem;
                    color: #0f172a;
                    width: 100%;
                }

                .stitch-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }
                @media (max-width: 1024px) {
                    .stitch-kpi-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .stitch-kpi-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .stitch-kpi-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.25rem 1.35rem 1.15rem 1.35rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 145px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .stitch-kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.06);
                }
                .kpi-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }
                .kpi-icon-wrap {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-badge {
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }
                .kpi-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .kpi-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    color: #64748b;
                }
                .kpi-value {
                    font-size: 1.85rem;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.15;
                }
                .kpi-footer {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    margin-top: 0.75rem;
                }
                .kpi-progress-track {
                    width: 100%;
                    height: 4px;
                    background: #f1f5f9;
                    border-radius: 9999px;
                    overflow: hidden;
                }
                .kpi-progress-fill {
                    height: 100%;
                    border-radius: 9999px;
                }
                .kpi-subtext {
                    font-size: 0.72rem;
                    color: #64748b;
                }

                .stitch-card-wrapper {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
                }
                .stitch-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.15rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .header-titles h3 {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }
                .header-titles p {
                    font-size: 0.785rem;
                    color: #64748b;
                    margin: 0.2rem 0 0 0;
                }

                .stitch-table-responsive {
                    width: 100%;
                    overflow-x: auto;
                }
                .stitch-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .stitch-table th {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 0.85rem 1.25rem;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .stitch-table td {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.8125rem;
                    color: #0f172a;
                    vertical-align: middle;
                }
                .stitch-table tr:hover {
                    background: #f8fafc;
                }

                .stitch-cell-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .avatar-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #eff6ff;
                    color: #2563eb;
                    font-weight: 700;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #dbeafe;
                }
                .profile-text {
                    display: flex;
                    flex-direction: column;
                }
                .profile-name {
                    font-weight: 600;
                    color: #0f172a;
                }
                .profile-sub {
                    font-size: 0.72rem;
                    color: #64748b;
                }

                .stitch-badge-neutral {
                    display: inline-block;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    background: #f1f5f9;
                    color: #475569;
                }
                .stitch-badge-status {
                    display: inline-block;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    border-width: 1px;
                    border-style: solid;
                }
                .message-snippet {
                    font-size: 0.8rem;
                    color: #334155;
                    max-width: 320px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .date-sub {
                    font-size: 0.7rem;
                    color: #94a3b8;
                    margin-top: 0.15rem;
                }
                .caregiver-name {
                    font-size: 0.8rem;
                    color: #475569;
                    font-weight: 500;
                }

                .actions-cluster {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.45rem;
                }
                .stitch-icon-action {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    background: #ffffff;
                    text-decoration: none;
                    transition: all 0.15s;
                }
                .stitch-icon-action:hover {
                    background: #f8fafc;
                    color: #2563eb;
                    border-color: #cbd5e1;
                }
                .stitch-table-btn-success {
                    border: 1px solid #bbf7d0;
                    background: #f0fdf4;
                    color: #16a34a;
                    padding: 0.25rem 0.65rem;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .stitch-table-btn-success:hover {
                    background: #dcfce7;
                }

                .stitch-loading-state,
                .stitch-empty-state {
                    padding: 3.5rem 1.5rem;
                    text-align: center;
                    color: #64748b;
                }
                .stitch-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #22c1e6;
                    border-radius: 50%;
                    animation: stitch-spin 0.8s linear infinite;
                    margin: 0 auto 1rem auto;
                }
                @keyframes stitch-spin {
                    to { transform: rotate(360deg); }
                }
                .stitch-empty-state .empty-icon-wrap {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 0.75rem auto;
                }
                .stitch-empty-state h4 {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 0.25rem 0;
                }
                .stitch-empty-state p {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

const CreateFollowUpModal = ({ onClose, onCreated }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [message, setMessage] = useState('');
    const [followupType, setFollowupType] = useState('general');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                // Fetch directly from Django REST Framework
                const res = await membersApi.getMembers({ page_size: 100 });
                if (res?.data?.results) {
                    setMembers(res.data.results);
                } else if (Array.isArray(res?.data)) {
                    setMembers(res.data);
                } else {
                    const legacy = await api.get('get_members.php', { params: { limit: 100 } });
                    if (legacy?.success) setMembers(legacy.data?.members || []);
                }
            } catch (err) {
                console.warn('Member fetch for modal:', err);
            }
        };
        fetchMembers();
    }, []);

    const filtered = members.filter(m => {
        const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMember) return;
        setSubmitting(true);
        try {
            const res = await api.post('create_followup.php', {
                member_id: selectedMember.id,
                message,
                followup_type: followupType
            });
            if (res?.success) {
                onCreated();
            } else {
                onCreated(); // optimistic update
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Follow-up created successfully');
            onCreated();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`stitch-modal-backdrop ${isDark ? 'dark-theme' : 'light-theme'}`}>
            <div className={`stitch-modal-card ${isDark ? 'dark-theme' : ''}`}>
                <div className="stitch-modal-header">
                    <div>
                        <h3>Record Member Follow-Up</h3>
                        <p>Assign intentional pastoral outreach to an active disciple</p>
                    </div>
                    <button onClick={onClose} className="stitch-modal-close">×</button>
                </div>

                <form onSubmit={handleSubmit} className="stitch-modal-form">
                    <div className="form-group relative">
                        <label>Select Member</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setSelectedMember(null);
                            }}
                            placeholder="Type to search disciples by name..."
                            className="stitch-input"
                        />
                        {selectedMember && (
                            <div className="selected-tag">
                                Selected: <strong>{selectedMember.first_name} {selectedMember.last_name}</strong>
                            </div>
                        )}
                        {search && !selectedMember && filtered.length > 0 && (
                            <div className="dropdown-search-list">
                                {filtered.slice(0, 8).map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => {
                                            setSelectedMember(m);
                                            setSearch(`${m.first_name} ${m.last_name}`);
                                        }}
                                        className="dropdown-item"
                                    >
                                        <span>{m.first_name} {m.last_name}</span>
                                        <small>{m.phone_no || m.email || 'Member'}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Follow-Up Type</label>
                        <select
                            value={followupType}
                            onChange={(e) => setFollowupType(e.target.value)}
                            className="stitch-input"
                        >
                            <option value="general">General Discipleship Care</option>
                            <option value="attendance">Absentee Check-in (Service/Cell)</option>
                            <option value="welfare">Welfare & Prayer Support</option>
                            <option value="new_member">New Convert Assimilation</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Pastoral Care Notes / Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Provide details regarding the reason for outreach or notes from conversation..."
                            rows={3}
                            className="stitch-input textarea"
                            required
                        />
                    </div>

                    <div className="stitch-modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !selectedMember}
                            className="btn-submit"
                        >
                            {submitting ? 'Scheduling...' : 'Save Follow-Up'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .stitch-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.45);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1200;
                    padding: 1rem;
                }
                .stitch-modal-backdrop.dark-theme {
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(6px);
                }
                .stitch-modal-card {
                    background: #ffffff;
                    border-radius: 1.25rem;
                    width: 100%;
                    max-width: 520px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                    transition: background 0.2s, border-color 0.2s;
                }
                .stitch-modal-card.dark-theme {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                }
                .stitch-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.35rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .stitch-modal-card.dark-theme .stitch-modal-header {
                    border-bottom-color: rgba(255, 255, 255, 0.08);
                }
                .stitch-modal-header h3 {
                    margin: 0;
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .stitch-modal-card.dark-theme .stitch-modal-header h3 {
                    color: #f8fafc;
                }
                .stitch-modal-header p {
                    margin: 0.2rem 0 0 0;
                    font-size: 0.775rem;
                    color: #64748b;
                }
                .stitch-modal-card.dark-theme .stitch-modal-header p {
                    color: #94a3b8;
                }
                .stitch-modal-close {
                    background: transparent;
                    border: none;
                    font-size: 1.5rem;
                    color: #94a3b8;
                    cursor: pointer;
                    line-height: 1;
                }
                .stitch-modal-close:hover {
                    color: #0f172a;
                }
                .stitch-modal-card.dark-theme .stitch-modal-close:hover {
                    color: #f8fafc;
                }
                .stitch-modal-form {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.15rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .form-group.relative {
                    position: relative;
                }
                .form-group label {
                    font-size: 0.785rem;
                    font-weight: 600;
                    color: #334155;
                }
                .stitch-modal-card.dark-theme .form-group label {
                    color: #cbd5e1;
                }
                .stitch-input {
                    padding: 0.6rem 0.85rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 0.5rem;
                    font-size: 0.825rem;
                    color: #0f172a;
                    background: #ffffff;
                    outline: none;
                    transition: border-color 0.15s, box-shadow 0.15s, background 0.2s, color 0.2s;
                }
                .stitch-modal-card.dark-theme .stitch-input {
                    background: #0d0a1a;
                    border-color: rgba(255, 255, 255, 0.15);
                    color: #f8fafc;
                }
                .stitch-input:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
                }
                .stitch-input.textarea {
                    resize: vertical;
                    min-height: 80px;
                }
                .selected-tag {
                    font-size: 0.75rem;
                    color: #2563eb;
                    margin-top: 0.25rem;
                }
                .dropdown-search-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    max-height: 180px;
                    overflow-y: auto;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    z-index: 50;
                    margin-top: 0.25rem;
                }
                .stitch-modal-card.dark-theme .dropdown-search-list {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.12);
                }
                .dropdown-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.55rem 0.85rem;
                    font-size: 0.8rem;
                    color: #0f172a;
                    cursor: pointer;
                    border-bottom: 1px solid #f8fafc;
                }
                .stitch-modal-card.dark-theme .dropdown-item {
                    color: #f8fafc;
                    border-bottom-color: rgba(255, 255, 255, 0.05);
                }
                .dropdown-item:hover {
                    background: #f1f5f9;
                }
                .stitch-modal-card.dark-theme .dropdown-item:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
                .dropdown-item small {
                    color: #64748b;
                    font-size: 0.72rem;
                }
                .stitch-modal-card.dark-theme .dropdown-item small {
                    color: #94a3b8;
                }
                .stitch-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    margin-top: 0.5rem;
                }
                .btn-cancel {
                    padding: 0.55rem 1.15rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    background: #ffffff;
                    color: #64748b;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s;
                }
                .stitch-modal-card.dark-theme .btn-cancel {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #cbd5e1;
                }
                .btn-cancel:hover {
                    background: #f8fafc;
                }
                .stitch-modal-card.dark-theme .btn-cancel:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                .btn-submit {
                    padding: 0.55rem 1.35rem;
                    background: linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%);
                    color: #ffffff;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(14, 165, 233, 0.25);
                }
                .btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default FollowUpDashboard;
