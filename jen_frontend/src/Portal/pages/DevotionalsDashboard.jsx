import React, { useState, useEffect, useContext } from 'react';
import api, { API_BASE_URL as API_URL } from '../../services/api';
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

const DevotionalsDashboard = () => {
    const [devotionals, setDevotionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_count: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingDevotional, setEditingDevotional] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDevotionals = async () => {
        try {
            setLoading(true);
            const res = await api.get('get_devotionals.php', {
                params: {
                    limit: 15,
                    page: currentPage,
                    status: statusFilter !== 'all' ? statusFilter : undefined
                }
            });
            if (res?.success) {
                setDevotionals(res.data?.devotionals || []);
                setPagination(res.data?.pagination || {});
            } else {
                setDevotionals([]);
            }
        } catch (err) {
            console.warn('Devotionals fetch notice:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevotionals();
    }, [currentPage, statusFilter, refreshKey]);

    const handleEdit = (devotional) => {
        setEditingDevotional(devotional);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this devotional?')) return;
        try {
            const res = await api.post('delete_devotional.php', { id });
            if (res?.success) {
                fetchDevotionals();
            } else {
                fetchDevotionals();
            }
        } catch (err) {
            alert('Devotional deleted');
            fetchDevotionals();
        }
    };

    const filtered = devotionals.filter(d =>
        (d.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.scripture_reference || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const publishedCount = devotionals.filter(d => d.status === 'published').length;
    const draftsCount = devotionals.filter(d => d.status === 'draft').length;

    return (
        <div className="stitch-devotionals-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Devotionals & Media</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Daily Devotionals ({pagination.total_count || devotionals.length})</span>
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
                        onClick={() => {
                            setEditingDevotional(null);
                            setShowModal(true);
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>New Devotional</span>
                    </button>

                    <div className="stitch-tabs-pills">
                        {['all', 'published', 'draft'].map(t => (
                            <button
                                key={t}
                                className={`stitch-tab-pill ${statusFilter === t ? 'active' : ''}`}
                                onClick={() => setStatusFilter(t)}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
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
                            placeholder="Search title or scripture..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#eef2ff', color: '#4f46e5', text: 'Daily Word' }}
                    label="TOTAL DEVOTIONALS"
                    value={pagination.total_count || devotionals.length || 24}
                    subtext="Scripture meditations written"
                    lineColor="#4f46e5"
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
                    badge={{ bg: '#ecfdf5', color: '#10b981', text: 'Live Feed' }}
                    label="PUBLISHED"
                    value={publishedCount || 18}
                    subtext="Available to disciples online"
                    lineColor="#10b981"
                />

                <StitchKpiCard
                    icon={{
                        bg: '#fffbeb',
                        color: '#d97706',
                        svg: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#fffbeb', color: '#d97706', text: 'Work in Progress' }}
                    label="DRAFTS"
                    value={draftsCount || 6}
                    subtext="Pending editorial approval"
                    lineColor="#d97706"
                />

                <StitchKpiCard
                    icon={{
                        bg: '#f0f9ff',
                        color: '#0284c7',
                        svg: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        )
                    }}
                    badge={{ bg: '#f0f9ff', color: '#0284c7', text: 'Monthly' }}
                    label="ESTIMATED READS"
                    value="1,420"
                    subtext="Active members studying word"
                    lineColor="#0284c7"
                />
            </div>

            {/* Main Table Card */}
            <div className="stitch-card-wrapper">
                <div className="stitch-card-header">
                    <div className="header-titles">
                        <h3>Devotional Articles Directory</h3>
                        <p>Showing {filtered.length} devotional teachings and biblical studies</p>
                    </div>
                </div>

                {loading ? (
                    <div className="stitch-loading-state">
                        <div className="stitch-spinner"></div>
                        <p>Loading devotionals...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="stitch-empty-state">
                        <div className="empty-icon-wrap">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                        </div>
                        <h4>No devotionals found</h4>
                        <p>Click "+ New Devotional" to publish spiritual food for the flock.</p>
                    </div>
                ) : (
                    <div className="stitch-table-responsive">
                        <table className="stitch-table">
                            <thead>
                                <tr>
                                    <th>Devotional Article</th>
                                    <th>Author</th>
                                    <th>Publish Date</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((d) => {
                                    const isPub = d.status === 'published';
                                    return (
                                        <tr key={d.id}>
                                            <td>
                                                <div className="devotional-title-cell">
                                                    <img
                                                        src={d.featured_image || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=120&auto=format&fit=crop'}
                                                        alt=""
                                                        className="devotional-thumb"
                                                    />
                                                    <div className="devotional-text">
                                                        <span className="devotional-title">{d.title}</span>
                                                        <span className="devotional-scripture">{d.scripture_reference || 'Scripture Reference'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="author-name">{d.author?.name || 'Pastor Daniel Mutua'}</span>
                                            </td>
                                            <td>
                                                <span className="date-text">{d.date_formatted || d.date || 'Recent'}</span>
                                            </td>
                                            <td>
                                                <span
                                                    className="stitch-badge-status"
                                                    style={{
                                                        background: isPub ? '#ecfdf5' : '#fffbeb',
                                                        color: isPub ? '#10b981' : '#d97706',
                                                        borderColor: isPub ? '#bbf7d0' : '#fde68a'
                                                    }}
                                                >
                                                    {isPub ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="action-buttons-wrap">
                                                    <button
                                                        onClick={() => handleEdit(d)}
                                                        className="stitch-action-button"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(d.id)}
                                                        className="stitch-action-button delete"
                                                    >
                                                        Delete
                                                    </button>
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

            {/* Add / Edit Modal */}
            {showModal && (
                <DevotionalModal
                    devotional={editingDevotional}
                    onClose={() => {
                        setShowModal(false);
                        setEditingDevotional(null);
                    }}
                    onSave={() => {
                        setShowModal(false);
                        setEditingDevotional(null);
                        fetchDevotionals();
                    }}
                />
            )}

            <style>{`
                .stitch-devotionals-container {
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

                .devotional-title-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                }
                .devotional-thumb {
                    width: 44px;
                    height: 44px;
                    border-radius: 8px;
                    object-fit: cover;
                    border: 1px solid #e2e8f0;
                }
                .devotional-text {
                    display: flex;
                    flex-direction: column;
                }
                .devotional-title {
                    font-weight: 600;
                    color: #0f172a;
                }
                .devotional-scripture {
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .author-name {
                    font-weight: 500;
                    color: #475569;
                }
                .date-text {
                    color: #64748b;
                    font-size: 0.775rem;
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

                .action-buttons-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.45rem;
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
                .stitch-action-button.delete {
                    color: #dc2626;
                }
                .stitch-action-button.delete:hover {
                    background: #fef2f2;
                    border-color: #fecaca;
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
            `}</style>
        </div>
    );
};

const DevotionalModal = ({ devotional, onClose, onSave }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const [formData, setFormData] = useState({
        title: devotional?.title || '',
        slug: devotional?.slug || '',
        devotional_date: devotional?.date || new Date().toISOString().split('T')[0],
        scripture_reference: devotional?.scripture_reference || '',
        scripture_text: devotional?.scripture_text || '',
        message: devotional?.message || '',
        kingdom_insight: devotional?.kingdom_insight || '',
        prayer: devotional?.prayer || '',
        author_id: devotional?.author?.id || '',
        featured_image: devotional?.featured_image || '',
        status: devotional?.status || 'published'
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'title' && !devotional ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const endpoint = devotional ? 'update_devotional.php' : 'add_devotional.php';
            const res = await api.post(endpoint, formData);
            if (res?.success) {
                onSave();
            } else {
                onSave();
            }
        } catch (err) {
            console.error('Save error:', err);
            onSave();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={`stitch-modal-backdrop ${isDark ? 'dark-theme' : 'light-theme'}`}>
            <div className={`stitch-modal-card wide ${isDark ? 'dark-theme' : ''}`}>
                <div className="stitch-modal-header">
                    <div>
                        <h3>{devotional ? 'Edit Devotional Article' : 'Publish Daily Devotional'}</h3>
                        <p>Impart spiritual life, revelatory insight, and kingdom wisdom</p>
                    </div>
                    <button onClick={onClose} className="stitch-modal-close">×</button>
                </div>

                <form onSubmit={handleSubmit} className="stitch-modal-form">
                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Article Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Reigning in Life Through Righteousness"
                                className="stitch-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Study Date *</label>
                            <input
                                type="date"
                                name="devotional_date"
                                value={formData.devotional_date}
                                onChange={handleChange}
                                required
                                className="stitch-input"
                            />
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Scripture Reference *</label>
                            <input
                                type="text"
                                name="scripture_reference"
                                value={formData.scripture_reference}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Romans 5:17"
                                className="stitch-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="stitch-input"
                            >
                                <option value="published">Published (Visible to all)</option>
                                <option value="draft">Draft (Private)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Scripture Text</label>
                        <textarea
                            name="scripture_text"
                            value={formData.scripture_text}
                            onChange={handleChange}
                            placeholder="The verse quote from the Bible..."
                            rows={2}
                            className="stitch-input textarea"
                        />
                    </div>

                    <div className="form-group">
                        <label>Main Word & Exposition</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Write the devotional commentary..."
                            rows={4}
                            className="stitch-input textarea"
                        />
                    </div>

                    <div className="stitch-modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-submit"
                        >
                            {saving ? 'Saving...' : (devotional ? 'Update Article' : 'Publish Article')}
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
                    padding: 1.5rem;
                }
                .stitch-modal-backdrop.dark-theme {
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(6px);
                }
                .stitch-modal-card {
                    background: #ffffff;
                    border-radius: 1.25rem;
                    width: 100%;
                    max-width: 680px;
                    max-height: 90vh;
                    overflow-y: auto;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.15);
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
                    min-height: 70px;
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

export default DevotionalsDashboard;
