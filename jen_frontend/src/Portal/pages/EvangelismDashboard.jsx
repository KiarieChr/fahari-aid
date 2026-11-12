import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
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

const EvangelismDashboard = () => {
    const [souls, setSouls] = useState([]);
    const [stats, setStats] = useState(null);
    const [cells, setCells] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showSoulModal, setShowSoulModal] = useState(false);
    const [showFollowupModal, setShowFollowupModal] = useState(false);
    const [selectedSoul, setSelectedSoul] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            // First fetch live cells from Django REST Framework
            const cellsRes = await api.get('cells/').catch(() => null);
            if (cellsRes?.success && Array.isArray(cellsRes.data)) {
                setCells(cellsRes.data);
            } else {
                const legacyCells = await api.get('get_cells.php').catch(() => null);
                if (legacyCells?.success) setCells(legacyCells.data?.cells || []);
            }

            const [soulsRes, statsRes] = await Promise.allSettled([
                api.get('get_evangelism_souls.php'),
                api.get('get_evangelism_stats.php')
            ]);

            if (soulsRes.status === 'fulfilled' && soulsRes.value?.success) {
                setSouls(soulsRes.value.data.souls || []);
            }
            if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
                setStats(statsRes.value.data);
            }
        } catch (err) {
            console.error('Error fetching evangelism data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshKey]);

    const filteredSouls = souls.filter(soul => {
        const matchesQuery = (soul.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (soul.phone || '').includes(searchQuery);
        if (statusFilter === 'ALL') return matchesQuery;
        return matchesQuery && (soul.status || '').toLowerCase() === statusFilter.toLowerCase();
    });

    const getStatusBadge = (st) => {
        const s = (st || 'following_up').toLowerCase();
        if (s === 'established') {
            return { bg: '#ecfdf5', color: '#10b981', border: '#bbf7d0', label: 'Established' };
        }
        if (s === 'following_up') {
            return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Following Up' };
        }
        return { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'New Decision' };
    };

    return (
        <div className="stitch-evangelism-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Soul Winning & Outreach</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Harvest Directory ({souls.length || stats?.total || 0})</span>
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
                        onClick={() => setShowSoulModal(true)}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Record New Soul</span>
                    </button>

                    <div className="stitch-tabs-pills">
                        {['ALL', 'FOLLOWING_UP', 'ESTABLISHED', 'NEW'].map(t => (
                            <button
                                key={t}
                                className={`stitch-tab-pill ${statusFilter === t ? 'active' : ''}`}
                                onClick={() => setStatusFilter(t)}
                            >
                                {t.replace('_', ' ')}
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
                            placeholder="Search soul or phone..."
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
                        bg: '#fdf4ff',
                        color: '#c026d3',
                        svg: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 14 14"></polyline>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#fdf4ff', color: '#c026d3', text: 'Outreach Log' }}
                    label="TOTAL SOULS WON"
                    value={stats?.total ?? souls.length}
                    subtext="Decisions made across all ministries"
                    lineColor="#c026d3"
                />

                <StitchKpiCard
                    icon={{
                        bg: '#ecfdf5',
                        color: '#10b981',
                        svg: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#ecfdf5', color: '#10b981', text: 'Assimilated' }}
                    label="JOINED CELLS"
                    value={stats?.cell_stats?.actually_joined_cell ?? 0}
                    subtext="Actively integrated in cell fellowships"
                    lineColor="#10b981"
                />

                <StitchKpiCard
                    icon={{
                        bg: '#e0f2fe',
                        color: '#0284c7',
                        svg: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#e0f2fe', color: '#0284c7', text: 'In Progress' }}
                    label="FOLLOWING UP"
                    value={stats?.status_counts?.find(s => s.status === 'following_up')?.count ?? 0}
                    subtext="Scheduled pastoral discipleship touches"
                    lineColor="#0284c7"
                />

                <StitchKpiCard
                    icon={{
                        bg: '#f5f3ff',
                        color: '#7c3aed',
                        svg: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#f5f3ff', color: '#7c3aed', text: 'Rooted' }}
                    label="ESTABLISHED"
                    value={stats?.status_counts?.find(s => s.status === 'established')?.count ?? 0}
                    subtext="Firm foundation in Jesus Christ"
                    lineColor="#7c3aed"
                />
            </div>

            {/* Table Container Card */}
            <div className="stitch-card-wrapper">
                <div className="stitch-card-header">
                    <div className="header-titles">
                        <h3>Harvest Outreach & Conversion Log</h3>
                        <p>Showing {filteredSouls.length} recorded decisions for Christ</p>
                    </div>
                </div>

                {loading ? (
                    <div className="stitch-loading-state">
                        <div className="stitch-spinner"></div>
                        <p>Loading evangelism records...</p>
                    </div>
                ) : filteredSouls.length === 0 ? (
                    <div className="stitch-empty-state">
                        <div className="empty-icon-wrap">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <h4>No soul records found</h4>
                        <p>Record souls won through street outreach, church services, and community impact.</p>
                    </div>
                ) : (
                    <div className="stitch-table-responsive">
                        <table className="stitch-table">
                            <thead>
                                <tr>
                                    <th>Soul Details</th>
                                    <th>Decision Date</th>
                                    <th>Assigned Cell Outpost</th>
                                    <th>Discipleship Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSouls.map(soul => {
                                    const sb = getStatusBadge(soul.status);
                                    const initials = (soul.name || 'S').slice(0, 2).toUpperCase();
                                    return (
                                        <tr key={soul.id}>
                                            <td>
                                                <div className="stitch-cell-profile">
                                                    <div className="avatar-circle">
                                                        {initials}
                                                    </div>
                                                    <div className="profile-text">
                                                        <span className="profile-name">{soul.name}</span>
                                                        <span className="profile-sub">{soul.phone || 'No phone recorded'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="date-display">
                                                    {soul.won_date ? new Date(soul.won_date).toLocaleDateString() : 'Recent'}
                                                </div>
                                            </td>
                                            <td>
                                                {soul.cell_name ? (
                                                    <span className="stitch-badge-cell">
                                                        {soul.cell_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-tag">Unassigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className="stitch-badge-status"
                                                    style={{ background: sb.bg, color: sb.color, borderColor: sb.border }}
                                                >
                                                    {sb.label}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedSoul(soul);
                                                        setShowFollowupModal(true);
                                                    }}
                                                    className="stitch-action-button"
                                                >
                                                    Log Follow-up
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showSoulModal && (
                <AddSoulModal
                    cells={cells}
                    onClose={() => setShowSoulModal(false)}
                    onSave={fetchData}
                />
            )}

            {showFollowupModal && selectedSoul && (
                <LogFollowupModal
                    soul={selectedSoul}
                    onClose={() => setShowFollowupModal(false)}
                    onSave={fetchData}
                />
            )}

            <style>{`
                .stitch-evangelism-container {
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
                }

                .stitch-search-field {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    padding: 0.4rem 0.85rem;
                    min-width: 220px;
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

                .date-display {
                    font-size: 0.8125rem;
                    color: #475569;
                }
                .stitch-badge-cell {
                    display: inline-block;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    background: #eff6ff;
                    color: #2563eb;
                    border: 1px solid #dbeafe;
                }
                .text-muted-tag {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-style: italic;
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
                .stitch-action-button {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 0.35rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #0f172a;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .stitch-action-button:hover {
                    background: #f8fafc;
                    color: #2563eb;
                    border-color: #cbd5e1;
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

const AddSoulModal = ({ cells, onClose, onSave }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        won_date: new Date().toISOString().split('T')[0],
        cell_id: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await api.post('add_evangelism_soul.php', formData);
            if (response.success) {
                onSave();
                onClose();
            } else {
                onSave();
                onClose();
            }
        } catch (err) {
            console.error('Save error:', err);
            onSave();
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`stitch-modal-backdrop ${isDark ? 'dark-theme' : 'light-theme'}`}>
            <div className={`stitch-modal-card ${isDark ? 'dark-theme' : ''}`}>
                <div className="stitch-modal-header">
                    <div>
                        <h3>Record New Decision</h3>
                        <p>Register a soul won for Christ into the kingdom registry</p>
                    </div>
                    <button onClick={onClose} className="stitch-modal-close">×</button>
                </div>

                <form onSubmit={handleSubmit} className="stitch-modal-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. John Mwangi"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="stitch-input"
                        />
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                placeholder="+254 7..."
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="stitch-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Decision Date</label>
                            <input
                                type="date"
                                value={formData.won_date}
                                onChange={e => setFormData({ ...formData, won_date: e.target.value })}
                                required
                                className="stitch-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Assign to Cell Outpost (Optional)</label>
                        <select
                            value={formData.cell_id}
                            onChange={e => setFormData({ ...formData, cell_id: e.target.value })}
                            className="stitch-input"
                        >
                            <option value="">Select Cell Hub...</option>
                            {cells.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Outreach Location / Notes</label>
                        <textarea
                            placeholder="Where was this soul met? Prayer points..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="stitch-input textarea"
                        />
                    </div>

                    <div className="stitch-modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-submit"
                        >
                            {submitting ? 'Recording...' : 'Save Decision'}
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
                .form-row-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
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
                    min-height: 75px;
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
            `}</style>
        </div>
    );
};

const LogFollowupModal = ({ soul, onClose, onSave }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const [formData, setFormData] = useState({
        soul_id: soul.id,
        followup_date: new Date().toISOString().split('T')[0],
        method: 'call',
        joined_session: false,
        joined_cell: false,
        session_details: '',
        feedback: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await api.post('add_evangelism_followup.php', formData);
            if (response.success) {
                onSave();
                onClose();
            } else {
                onSave();
                onClose();
            }
        } catch (err) {
            console.error('Log error:', err);
            onSave();
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`stitch-modal-backdrop ${isDark ? 'dark-theme' : 'light-theme'}`}>
            <div className={`stitch-modal-card ${isDark ? 'dark-theme' : ''}`}>
                <div className="stitch-modal-header">
                    <div>
                        <h3>Log Evangelism Follow-up</h3>
                        <p>Outreach touch with <strong>{soul.name}</strong></p>
                    </div>
                    <button onClick={onClose} className="stitch-modal-close">×</button>
                </div>

                <form onSubmit={handleSubmit} className="stitch-modal-form">
                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Follow-up Date</label>
                            <input
                                type="date"
                                value={formData.followup_date}
                                onChange={e => setFormData({ ...formData, followup_date: e.target.value })}
                                required
                                className="stitch-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Method</label>
                            <select
                                value={formData.method}
                                onChange={e => setFormData({ ...formData, method: e.target.value })}
                                className="stitch-input"
                            >
                                <option value="call">Phone Call</option>
                                <option value="whatsapp">WhatsApp Outreach</option>
                                <option value="visit">Home / Work Visitation</option>
                                <option value="sms">SMS Text</option>
                            </select>
                        </div>
                    </div>

                    <div className="checkboxes-pill-row">
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={formData.joined_session}
                                onChange={e => setFormData({ ...formData, joined_session: e.target.checked })}
                            />
                            <span>Attended Church Service</span>
                        </label>
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={formData.joined_cell}
                                onChange={e => setFormData({ ...formData, joined_cell: e.target.checked })}
                            />
                            <span>Attended Cell Fellowship</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Session / Service Attended</label>
                        <input
                            type="text"
                            placeholder="e.g. Sunday 1st Service, Midweek Word"
                            value={formData.session_details}
                            onChange={e => setFormData({ ...formData, session_details: e.target.value })}
                            className="stitch-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Feedback / Spiritual Needs</label>
                        <textarea
                            placeholder="Notes on responsiveness, salvation assurance, prayer request..."
                            value={formData.feedback}
                            onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                            rows={3}
                            className="stitch-input textarea"
                        />
                    </div>

                    <div className="stitch-modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-submit"
                        >
                            {submitting ? 'Saving...' : 'Log Discipleship Activity'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .checkboxes-pill-row {
                    display: flex;
                    gap: 1.5rem;
                    padding: 0.75rem 1rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                }
                .stitch-modal-card.dark-theme .checkboxes-pill-row {
                    background: #0d0a1a;
                    border-color: rgba(255, 255, 255, 0.12);
                }
                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.8125rem;
                    color: #0f172a;
                    cursor: pointer;
                }
                .stitch-modal-card.dark-theme .checkbox-item {
                    color: #f8fafc;
                }
            `}</style>
        </div>
    );
};

export default EvangelismDashboard;
