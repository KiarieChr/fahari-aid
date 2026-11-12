import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import UserStatsCards from '../components/users/UserStatsCards';
import UsersTable from '../components/users/UsersTable';
import AddUserModal from '../components/users/AddUserModal';
import AssignRolesModal from '../components/users/AssignRolesModal';
import { useAuth } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

const UsersDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Permission Check: Super Admin or Staff or Admin permissions
    const hasAdminAccess = Boolean(
        user?.is_superuser ||
        user?.is_staff ||
        user?.role === 'Super Admin' ||
        user?.role === 'Administrator' ||
        user?.role === 'Admin' ||
        user?.roles?.some(r => r.id === 'superuser' || r.id === 'admin' || r.name?.toLowerCase().includes('admin')) ||
        user?.permissions?.includes('admin') ||
        user?.permissions?.includes('manage_users')
    );

    if (authLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                Verifying authorization credentials...
            </div>
        );
    }

    // Access Restricted Guard for Non-Admins
    if (!hasAdminAccess) {
        return (
            <div style={{ width: '100%', padding: '2rem 0' }}>
                <div style={{
                    maxWidth: '650px',
                    margin: '0 auto',
                    background: isDark ? '#1a1625' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : '#fee2e2'}`,
                    borderRadius: '1.25rem',
                    padding: '3rem 2.5rem',
                    textAlign: 'center',
                    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '20px',
                        background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        🛡️
                    </div>

                    <span style={{
                        background: isDark ? 'rgba(239,68,68,0.2)' : '#fee2e2',
                        color: '#ef4444',
                        padding: '0.3rem 0.85rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Restricted Access
                    </span>

                    <h2 style={{
                        fontSize: '1.65rem',
                        fontWeight: '800',
                        color: isDark ? '#ffffff' : '#0f172a',
                        margin: '1.25rem 0 0.5rem 0'
                    }}>
                        Super Administrator Access Required
                    </h2>

                    <p style={{
                        color: isDark ? '#94a3b8' : '#64748b',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        margin: '0 auto 2rem auto',
                        maxWidth: '480px'
                    }}>
                        The User Credentials & Access Control module is restricted to Super Administrators and authorized church staff. Your current account profile does not possess user management authorization.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link
                            to="/portal/dashboard"
                            style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                padding: '0.75rem 1.75rem',
                                borderRadius: '9999px',
                                textDecoration: 'none',
                                fontWeight: '700',
                                fontSize: '0.875rem',
                                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                            }}
                        >
                            Return to Dashboard
                        </Link>
                        <Link
                            to="/portal/users/account"
                            style={{
                                background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                color: isDark ? '#ffffff' : '#0f172a',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                                padding: '0.75rem 1.75rem',
                                borderRadius: '9999px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '0.875rem'
                            }}
                        >
                            View My Profile
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', paddingBottom: '2.5rem' }}>
            {/* Breadcrumb Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8125rem',
                color: '#64748b',
                marginBottom: '1.25rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span>Portal</span>
                    <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>&gt;</span>
                    <span>Settings & Security</span>
                    <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>&gt;</span>
                    <span style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: '600' }}>User Access & Permissions</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.775rem' }}>
                    <span style={{ color: '#22c55e', fontSize: '0.75rem' }}>●</span>
                    <span>Admin Active</span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <button
                        onClick={() => setRefreshKey(k => k + 1)}
                        title="Refresh user directory"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            fontSize: '0.95rem'
                        }}
                    >
                        ⟳
                    </button>
                </div>
            </div>

            {/* Action Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '1.65rem',
                        fontWeight: '800',
                        color: isDark ? '#ffffff' : '#0f172a',
                        margin: '0 0 0.35rem 0'
                    }}>
                        User Access & Security Control
                    </h1>
                    <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                        Manage staff credentials, cell overseer roles, and administrative permissions
                    </p>
                </div>

                <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '0.65rem 1.35rem',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                    }}
                >
                    <span>+</span> Add New User
                </button>
            </div>

            {/* Real Stats Cards */}
            <UserStatsCards key={`stats-${refreshKey}`} />

            {/* Users Table */}
            <UsersTable
                key={`table-${refreshKey}`}
                refreshKey={refreshKey}
                onEditRole={(user) => setEditingUser(user)}
            />

            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <AddUserModal
                    onClose={() => setIsAddUserModalOpen(false)}
                    onSuccess={() => setRefreshKey(k => k + 1)}
                />
            )}

            {/* Assign Role Modal */}
            {editingUser && (
                <AssignRolesModal
                    targetUser={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => setRefreshKey(k => k + 1)}
                />
            )}
        </div>
    );
};

export default UsersDashboard;
