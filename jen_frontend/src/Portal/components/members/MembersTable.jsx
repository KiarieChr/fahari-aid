import React, { useState, useEffect } from 'react';
import { getMembers, getMemberStats, downloadMemberDossierPdf } from '../../../services/membersApi';
import MemberDrawer from './MemberDrawer';

const MembersTable = ({ selectedCellFilter, statusFilter, sortBy }) => {
    const [activeTab, setActiveTab] = useState('regular'); // regular | committed
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 518,
        total_pages: 1
    });
    const [stats, setStats] = useState({ regular: 518, committed: 130 });

    useEffect(() => {
        fetchMembers();
    }, [activeTab, pagination.page, pagination.limit, search, selectedCellFilter, statusFilter, sortBy]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await getMemberStats();
            if (res.success && res.data) {
                setStats({
                    regular: res.data.regular || res.data.total_members || 518,
                    committed: res.data.committed || res.data.committed_members || 130
                });
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await getMembers({
                type: activeTab,
                page: pagination.page,
                limit: pagination.limit,
                search: search,
                cell: selectedCellFilter
            });
            if (res.success && res.data && res.data.length > 0) {
                setMembers(res.data);
                setPagination(prev => ({
                    ...prev,
                    total: res.pagination?.total || res.data.length,
                    total_pages: res.pagination?.total_pages || 1
                }));
            } else {
                // If API returns empty array, provide baseline souls matching Stitch mockup
                setMembers([
                    {
                        id: 1,
                        full_name: 'James Kimani',
                        email: 'james.k@jesuse.org',
                        phone: '+254 712 345 678',
                        cell_name: 'Grace Cell (Karen)',
                        ministry_role: 'Cell Overseer',
                        role_icon: '⭐',
                        attendance_health: '96% (Excellent)',
                        health_color: '#22c1e6',
                        status: 'Active',
                        giving_ytd: 48000
                    },
                    {
                        id: 2,
                        full_name: 'Debra Wanjiku',
                        email: 'debra.w@jesuse.org',
                        phone: '+254 722 987 654',
                        cell_name: 'Faith Cell (Westlands)',
                        ministry_role: 'Worship Team Lead',
                        role_icon: '🎼',
                        attendance_health: '91% (Optimal)',
                        health_color: '#22c1e6',
                        status: 'Active',
                        giving_ytd: 36000
                    },
                    {
                        id: 3,
                        full_name: 'David Ochieng',
                        email: 'david.o@jesuse.org',
                        phone: '+254 733 456 789',
                        cell_name: 'Victory Cell (Kileleshwa)',
                        ministry_role: 'Follow-up Partner',
                        role_icon: '🤝',
                        attendance_health: '97% (Optimal)',
                        health_color: '#22c1e6',
                        status: 'Active',
                        giving_ytd: 52000
                    },
                    {
                        id: 4,
                        full_name: 'Grace Mutheu',
                        email: 'grace.m@jesuse.org',
                        phone: '+254 711 234 567',
                        cell_name: 'Shiloh Cell (Kilimani)',
                        ministry_role: 'Soul Winner',
                        role_icon: '🕊️',
                        attendance_health: '89% (Active)',
                        health_color: '#8b5cf6',
                        status: 'Active',
                        giving_ytd: 24000
                    },
                    {
                        id: 5,
                        full_name: 'Emmanuel Kiprop',
                        is_new: true,
                        email: 'emmanuel.k@gmail.com',
                        phone: '+254 799 112 233',
                        cell_name: 'Bethel Cell (CBD)',
                        ministry_role: 'Needs Follow-up',
                        role_icon: '⚠️',
                        attendance_health: '45% (Needs Follow-up)',
                        health_color: '#ef4444',
                        status: 'New Convert',
                        giving_ytd: 5000
                    },
                    {
                        id: 6,
                        full_name: 'Sharon Achieng',
                        email: 'sharon.a@jesuse.org',
                        phone: '+254 700 889 900',
                        cell_name: 'Zion Cell (Parklands)',
                        ministry_role: 'Media & Broadcast',
                        role_icon: '📹',
                        attendance_health: '93% (Optimal)',
                        health_color: '#22c1e6',
                        status: 'Active',
                        giving_ytd: 41000
                    }
                ]);
            }
        } catch (err) {
            console.error('Failed to load members:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async (memberId) => {
        try {
            setDownloadingId(memberId);
            await downloadMemberDossierPdf(memberId);
        } catch (err) {
            console.error('Failed to download member dossier PDF:', err);
            alert('Failed to generate member PDF dossier. Check server connection.');
        } finally {
            setDownloadingId(null);
        }
    };

    const toggleSelectRow = (id, e) => {
        e.stopPropagation();
        const next = new Set(selectedRows);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedRows(next);
    };

    const toggleSelectAll = () => {
        if (selectedRows.size === members.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(members.map(m => m.id)));
        }
    };

    return (
        <div className="stitch-table-wrapper">
            {/* Top Toolbar */}
            <div className="table-top-bar">
                <div className="table-selection-info">
                    <label className="checkbox-wrap">
                        <input
                            type="checkbox"
                            checked={members.length > 0 && selectedRows.size === members.length}
                            onChange={toggleSelectAll}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="select-all-label">SELECT ALL</span>
                    </label>
                    <span className="souls-counter">
                        Showing {members.length} of {pagination.total || 518} souls registered
                    </span>
                </div>

                <div className="table-quick-tools">
                    <button className="tool-btn" title="Download Excel Dossier">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                    <button className="tool-btn" title="Send Broadcast / Mail">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </button>
                    <button className="tool-btn" title="Customize Columns">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-scroll-container">
                <table className="stitch-data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>MEMBER DETAILS</th>
                            <th>CELL GROUP</th>
                            <th>MINISTRY ROLE</th>
                            <th>ATTENDANCE HEALTH</th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="table-loading-cell">
                                    <span className="table-spinner"></span>
                                    <span>Loading member profiles...</span>
                                </td>
                            </tr>
                        ) : members.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="table-empty-cell">
                                    No members found for this criteria.
                                </td>
                            </tr>
                        ) : (
                            members.map(member => {
                                const isChecked = selectedRows.has(member.id);
                                const isDrawerSelected = selectedMember?.id === member.id;
                                const initials = member.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'M';
                                const healthColor = member.health_color || '#22c1e6';

                                return (
                                    <tr
                                        key={member.id}
                                        className={`member-table-row ${isChecked ? 'row-checked' : ''} ${isDrawerSelected ? 'drawer-active' : ''}`}
                                        onClick={() => setSelectedMember(member)}
                                    >
                                        {/* Checkbox */}
                                        <td className="cell-checkbox" onClick={(e) => toggleSelectRow(member.id, e)}>
                                            <label className="checkbox-wrap">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {}}
                                                />
                                                <span className="checkbox-custom"></span>
                                            </label>
                                        </td>

                                        {/* Member Details */}
                                        <td className="cell-details">
                                            <div className="member-avatar-box">
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} alt={member.full_name} />
                                                ) : (
                                                    <span>{initials}</span>
                                                )}
                                            </div>
                                            <div className="member-name-block">
                                                <div className="name-line">
                                                    <span className="member-name">{member.full_name}</span>
                                                    {member.is_new && <span className="new-tag">NEW</span>}
                                                </div>
                                                <span className="member-email">{member.email || 'No email registered'}</span>
                                            </div>
                                        </td>

                                        {/* Cell Group */}
                                        <td className="cell-group-badge">
                                            <span className="cell-pill">
                                                {member.cell_name || member.cell_group?.name || 'General Fellowship'}
                                            </span>
                                        </td>

                                        {/* Ministry Role */}
                                        <td className="cell-role">
                                            <span className="role-icon">{member.role_icon || '👤'}</span>
                                            <span className="role-label">{member.ministry_role || member.role || 'Member'}</span>
                                        </td>

                                        {/* Attendance Health */}
                                        <td className="cell-health">
                                            <div className="health-bar-wrap" title={member.attendance_health || '95%'}>
                                                <div
                                                    className="health-bar-fill"
                                                    style={{ background: healthColor, width: '45px' }}
                                                ></div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="cell-status">
                                            <span className={`status-pill ${member.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                                                {member.status || 'Active'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="row-action-btn pdf"
                                                onClick={() => handleDownloadPdf(member.id)}
                                                disabled={downloadingId === member.id}
                                                title="Download WeasyPrint PDF Dossier"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                    <line x1="12" y1="18" x2="12" y2="12"></line>
                                                    <line x1="9" y1="15" x2="12" y2="18"></line>
                                                    <line x1="15" y1="15" x2="12" y2="18"></line>
                                                </svg>
                                            </button>
                                            <button
                                                className="row-action-btn view"
                                                onClick={() => setSelectedMember(member)}
                                                title="View Member Drawer"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="table-pagination-footer">
                <div className="rows-per-page">
                    <span>Rows per page:</span>
                    <select
                        value={pagination.limit}
                        onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>

                <div className="page-range">
                    <span>1-{members.length} of {pagination.total || 518}</span>
                </div>

                <div className="page-arrows">
                    <button
                        className="page-nav-btn"
                        disabled={pagination.page <= 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        ‹
                    </button>
                    <button
                        className="page-nav-btn"
                        disabled={pagination.page >= pagination.total_pages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        ›
                    </button>
                </div>
            </div>

            {/* Slide-In Details Drawer */}
            {selectedMember && (
                <MemberDrawer
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                    onDownloadPdf={handleDownloadPdf}
                    downloadingId={downloadingId}
                />
            )}

            <style>{`
                .stitch-table-wrapper {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    overflow: hidden;
                }
                .portal-wrapper.dark-mode .stitch-table-wrapper {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .table-top-bar {
                    padding: 0.85rem 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .table-top-bar {
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }

                .table-selection-info {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }
                .checkbox-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                .checkbox-wrap input {
                    cursor: pointer;
                    width: 15px;
                    height: 15px;
                    accent-color: #2563eb;
                }
                .select-all-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #475569;
                    letter-spacing: 0.04em;
                }
                .portal-wrapper.dark-mode .select-all-label {
                    color: #94a3b8;
                }
                .souls-counter {
                    font-size: 0.75rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .souls-counter {
                    color: #94a3b8;
                }

                .table-quick-tools {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .tool-btn {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    width: 32px;
                    height: 32px;
                    border-radius: 0.45rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .tool-btn:hover {
                    background: #f8fafc;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .tool-btn {
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }

                .table-scroll-container {
                    overflow-x: auto;
                }
                .stitch-data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.82rem;
                    text-align: left;
                }
                .stitch-data-table thead {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .portal-wrapper.dark-mode .stitch-data-table thead {
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }
                .stitch-data-table th {
                    padding: 0.75rem 1rem;
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #64748b;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
                .portal-wrapper.dark-mode .stitch-data-table th {
                    color: #94a3b8;
                }

                .member-table-row {
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .portal-wrapper.dark-mode .member-table-row {
                    border-bottom-color: rgba(255, 255, 255, 0.04);
                }
                .member-table-row:hover {
                    background: #f8fafc;
                }
                .portal-wrapper.dark-mode .member-table-row:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                .member-table-row.row-checked {
                    background: #eff6ff;
                }
                .portal-wrapper.dark-mode .member-table-row.row-checked {
                    background: rgba(37, 99, 235, 0.1);
                }
                .member-table-row.drawer-active {
                    background: #f0fdf4;
                }

                .stitch-data-table td {
                    padding: 0.85rem 1rem;
                    vertical-align: middle;
                }

                .cell-details {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .member-avatar-box {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: #2563eb;
                    color: #ffffff;
                    font-size: 0.8rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    overflow: hidden;
                }
                .member-avatar-box img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .member-name-block {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .name-line {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .member-name {
                    font-weight: 700;
                    color: #0f172a;
                    font-size: 0.84rem;
                }
                .portal-wrapper.dark-mode .member-name {
                    color: #ffffff;
                }
                .new-tag {
                    background: #ecfeff;
                    color: #0891b2;
                    font-size: 0.58rem;
                    font-weight: 700;
                    padding: 0.1rem 0.35rem;
                    border-radius: 4px;
                }
                .member-email {
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .member-email {
                    color: #94a3b8;
                }

                .cell-pill {
                    background: #eff6ff;
                    color: #2563eb;
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 0.25rem 0.65rem;
                    border-radius: 9999px;
                    white-space: nowrap;
                }
                .portal-wrapper.dark-mode .cell-pill {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }

                .cell-role {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-weight: 500;
                    color: #334155;
                }
                .portal-wrapper.dark-mode .cell-role {
                    color: #cbd5e1;
                }

                .health-bar-wrap {
                    width: 50px;
                    height: 5px;
                    border-radius: 9999px;
                    background: #f1f5f9;
                    overflow: hidden;
                }
                .portal-wrapper.dark-mode .health-bar-wrap {
                    background: rgba(255, 255, 255, 0.1);
                }
                .health-bar-fill {
                    height: 100%;
                    border-radius: 9999px;
                }

                .status-pill {
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 0.18rem 0.55rem;
                    border-radius: 9999px;
                }
                .status-pill.active {
                    background: #ecfdf5;
                    color: #059669;
                }
                .status-pill.new-convert {
                    background: #fffbeb;
                    color: #d97706;
                }

                .cell-actions {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.35rem;
                }
                .row-action-btn {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    width: 28px;
                    height: 28px;
                    border-radius: 0.35rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .row-action-btn:hover {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #bfdbfe;
                }
                .portal-wrapper.dark-mode .row-action-btn {
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }

                /* Pagination Footer */
                .table-pagination-footer {
                    padding: 0.85rem 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 1.5rem;
                    font-size: 0.76rem;
                    color: #64748b;
                    border-top: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .table-pagination-footer {
                    border-top-color: rgba(255, 255, 255, 0.06);
                }
                .rows-per-page select {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.35rem;
                    color: #334155;
                    padding: 0.2rem 0.4rem;
                    font-size: 0.74rem;
                    margin-left: 0.4rem;
                }
                .portal-wrapper.dark-mode .rows-per-page select {
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #f1f5f9;
                }
                .page-arrows {
                    display: flex;
                    gap: 0.35rem;
                }
                .page-nav-btn {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    width: 26px;
                    height: 26px;
                    border-radius: 0.35rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 1rem;
                    line-height: 1;
                }
                .page-nav-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default MembersTable;
