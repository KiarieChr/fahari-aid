import React, { useState, useEffect, useContext } from 'react';
import { getUsersList, updateUser } from '../../../services/userApi';
import { ThemeContext } from '../../../context/ThemeContext';

const UsersTable = ({ onEditRole, refreshKey }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [page, setPage] = useState(1);
    const pageSize = 15;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsersList({
                search: search || undefined,
                role: filterRole !== 'All' ? filterRole : undefined,
                status: filterStatus !== 'All' ? filterStatus : undefined
            });
            const list = data?.results || data?.data?.results || (Array.isArray(data) ? data : []);
            setUsers(list);
        } catch (err) {
            console.error('Failed to load users table:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, filterRole, filterStatus, refreshKey]);

    const handleToggleStatus = async (user) => {
        const nextStatus = !user.status;
        const confirmMsg = nextStatus
            ? `Re-activate credentials for ${user.email}?`
            : `Deactivate and lock credentials for ${user.email}?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await updateUser(user.id, { status: nextStatus });
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus, is_active: nextStatus } : u));
        } catch (err) {
            console.error('Failed to toggle status:', err);
            alert('Failed to update user status.');
        }
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'Super Admin':
                return { bg: isDark ? 'rgba(139, 92, 246, 0.2)' : '#f3e8ff', color: '#8b5cf6', border: '#c084fc' };
            case 'Admin':
            case 'Staff':
                return { bg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff', color: '#2563eb', border: '#93c5fd' };
            case 'Cell Leader':
                return { bg: isDark ? 'rgba(14, 165, 233, 0.2)' : '#f0f9ff', color: '#0ea5e9', border: '#7dd3fc' };
            default:
                return { bg: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b', border: '#e2e8f0' };
        }
    };

    // Client Pagination
    const totalPages = Math.ceil(users.length / pageSize) || 1;
    const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div style={{
            background: isDark ? '#1a1625' : '#ffffff',
            borderRadius: '1rem',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            width: '100%'
        }}>
            {/* Table Controls */}
            <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <select
                        value={filterRole}
                        onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                        style={{
                            background: isDark ? '#151128' : '#f8fafc',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                            color: isDark ? '#f8fafc' : '#0f172a',
                            borderRadius: '0.5rem',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                    >
                        <option value="All">All Roles</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Cell Leader">Cell Leader</option>
                        <option value="Member">Member</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                        style={{
                            background: isDark ? '#151128' : '#f8fafc',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                            color: isDark ? '#f8fafc' : '#0f172a',
                            borderRadius: '0.5rem',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Locked / Inactive</option>
                    </select>
                </div>

                <div style={{ position: 'relative', minWidth: '260px' }}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by name, email, phone..."
                        style={{
                            background: isDark ? '#151128' : '#f8fafc',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                            color: isDark ? '#f8fafc' : '#0f172a',
                            padding: '0.45rem 1rem 0.45rem 2.2rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.85rem',
                            width: '100%',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.8rem' }}>
                        🔍
                    </span>
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{
                            color: isDark ? '#94a3b8' : '#64748b',
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'}`,
                            background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                            fontSize: '0.75rem',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase'
                        }}>
                            <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem' }}>User Credential</th>
                            <th style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>Access Role</th>
                            <th style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>Member Link</th>
                            <th style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>Last Login</th>
                            <th style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>Status</th>
                            <th style={{ textAlign: 'right', padding: '0.85rem 1.25rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                    Loading user directory...
                                </td>
                            </tr>
                        ) : paginatedUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                    No users found matching current filters.
                                </td>
                            </tr>
                        ) : (
                            paginatedUsers.map(u => {
                                const roleStyle = getRoleBadgeStyle(u.role);
                                const lastLoginStr = u.last_login
                                    ? new Date(u.last_login).toLocaleDateString('default', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                    : 'Never logged in';

                                return (
                                    <tr
                                        key={u.id}
                                        style={{
                                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'}`,
                                            transition: 'background 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '0.9rem 1.25rem' }}>
                                            <div style={{ fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                                                {u.full_name}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '0.15rem' }}>
                                                {u.email}
                                            </div>
                                        </td>

                                        <td style={{ padding: '0.9rem 1rem' }}>
                                            <span style={{
                                                background: roleStyle.bg,
                                                color: roleStyle.color,
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                display: 'inline-block'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>

                                        <td style={{ padding: '0.9rem 1rem' }}>
                                            {u.member_id ? (
                                                <span style={{
                                                    color: '#10b981',
                                                    fontSize: '0.78rem',
                                                    fontWeight: '600',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem'
                                                }}>
                                                    ✓ Linked ({u.member_name || `#${u.member_id}`})
                                                </span>
                                            ) : (
                                                <span style={{ color: isDark ? '#94a3b8' : '#94a3b8', fontSize: '0.78rem' }}>
                                                    — Unlinked
                                                </span>
                                            )}
                                        </td>

                                        <td style={{ padding: '0.9rem 1rem', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                                            {lastLoginStr}
                                        </td>

                                        <td style={{ padding: '0.9rem 1rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                fontSize: '0.78rem',
                                                fontWeight: '600',
                                                color: u.status ? '#10b981' : '#ef4444'
                                            }}>
                                                ● {u.status ? 'Active' : 'Locked'}
                                            </span>
                                        </td>

                                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                                                {onEditRole && (
                                                    <button
                                                        onClick={() => onEditRole(u)}
                                                        title="Assign Role & Permissions"
                                                        style={{
                                                            background: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff',
                                                            color: '#2563eb',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            padding: '0.3rem 0.65rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Role
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleToggleStatus(u)}
                                                    title={u.status ? "Deactivate user" : "Activate user"}
                                                    style={{
                                                        background: u.status
                                                            ? (isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2')
                                                            : (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'),
                                                        color: u.status ? '#ef4444' : '#10b981',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '0.3rem 0.65rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {u.status ? 'Lock' : 'Unlock'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: isDark ? '#94a3b8' : '#64748b'
                }}>
                    <span>
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, users.length)} of {users.length} users
                    </span>
                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            style={{
                                background: isDark ? '#151128' : '#f1f5f9',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                                color: isDark ? '#ffffff' : '#0f172a',
                                padding: '0.35rem 0.85rem',
                                borderRadius: '6px',
                                cursor: page === 1 ? 'not-allowed' : 'pointer',
                                opacity: page === 1 ? 0.5 : 1
                            }}
                        >
                            Previous
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            style={{
                                background: isDark ? '#151128' : '#f1f5f9',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                                color: isDark ? '#ffffff' : '#0f172a',
                                padding: '0.35rem 0.85rem',
                                borderRadius: '6px',
                                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                opacity: page === totalPages ? 0.5 : 1
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersTable;
