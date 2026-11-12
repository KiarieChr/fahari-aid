import React, { useState, useContext } from 'react';
import { changePassword } from '../../../../services/userApi';
import { useAuth } from '../../../../context/AuthContext';
import { ThemeContext } from '../../../../context/ThemeContext';

const AccountSecurityPanel = () => {
    const { user } = useAuth();
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!oldPassword || !newPassword) {
            setError('Please enter both your current password and your new password.');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match.');
            return;
        }

        try {
            setLoading(true);
            await changePassword({ old_password: oldPassword, new_password: newPassword });
            setSuccess('Your password has been changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err?.response?.data?.detail || err?.response?.data?.error || err.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: isDark ? '#1a1625' : '#ffffff',
            borderRadius: '1.25rem',
            padding: '2rem',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(15,23,42,0.04)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.75rem',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                paddingBottom: '1.25rem'
            }}>
                <div>
                    <h2 style={{
                        margin: '0 0 0.25rem 0',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '1.25rem',
                        fontWeight: '800'
                    }}>
                        Account Security & Password Credentials
                    </h2>
                    <p style={{
                        margin: 0,
                        color: isDark ? '#94a3b8' : '#64748b',
                        fontSize: '0.85rem'
                    }}>
                        Manage authentication credentials, token sessions, and role permissions
                    </p>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem'
            }}>
                {/* Left: Change Password Form */}
                <div>
                    <h3 style={{
                        margin: '0 0 1rem 0',
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: isDark ? '#ffffff' : '#0f172a'
                    }}>
                        Change Account Password
                    </h3>

                    {error && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
                            color: '#ef4444',
                            border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : '#fee2e2'}`,
                            borderRadius: '0.65rem',
                            fontSize: '0.825rem',
                            marginBottom: '1rem'
                        }}>
                            ✕ {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: isDark ? 'rgba(34,197,94,0.15)' : '#ecfdf5',
                            color: '#22c55e',
                            border: `1px solid ${isDark ? 'rgba(34,197,94,0.25)' : '#a7f3d0'}`,
                            borderRadius: '0.65rem',
                            fontSize: '0.825rem',
                            marginBottom: '1rem'
                        }}>
                            ✓ {success}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.725rem',
                                fontWeight: '700',
                                color: isDark ? '#94a3b8' : '#64748b',
                                textTransform: 'uppercase',
                                marginBottom: '0.35rem'
                            }}>
                                Current Password *
                            </label>
                            <input
                                type="password"
                                required
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '0.7rem 0.9rem',
                                    background: isDark ? '#0d0a1a' : '#f8fafc',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                    borderRadius: '0.5rem',
                                    color: isDark ? '#f8fafc' : '#0f172a',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.725rem',
                                fontWeight: '700',
                                color: isDark ? '#94a3b8' : '#64748b',
                                textTransform: 'uppercase',
                                marginBottom: '0.35rem'
                            }}>
                                New Password *
                            </label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                style={{
                                    width: '100%',
                                    padding: '0.7rem 0.9rem',
                                    background: isDark ? '#0d0a1a' : '#f8fafc',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                    borderRadius: '0.5rem',
                                    color: isDark ? '#f8fafc' : '#0f172a',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.725rem',
                                fontWeight: '700',
                                color: isDark ? '#94a3b8' : '#64748b',
                                textTransform: 'uppercase',
                                marginBottom: '0.35rem'
                            }}>
                                Confirm New Password *
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                style={{
                                    width: '100%',
                                    padding: '0.7rem 0.9rem',
                                    background: isDark ? '#0d0a1a' : '#f8fafc',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                    borderRadius: '0.5rem',
                                    color: isDark ? '#f8fafc' : '#0f172a',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.65rem 1.4rem',
                                background: 'linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%)',
                                border: 'none',
                                borderRadius: '9999px',
                                color: '#ffffff',
                                fontSize: '0.825rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)',
                                alignSelf: 'flex-start'
                            }}
                        >
                            {loading ? 'Updating Password...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* Right: Security & Session Status */}
                <div>
                    <h3 style={{
                        margin: '0 0 1rem 0',
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: isDark ? '#ffffff' : '#0f172a'
                    }}>
                        Active Session & Privilege Badges
                    </h3>

                    <div style={{ display: 'grid', gap: '0.85rem' }}>
                        <div style={{
                            padding: '1.15rem 1.25rem',
                            borderRadius: '0.85rem',
                            background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ fontSize: '1.5rem' }}>🛡️</div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                                    Role Access Level
                                </div>
                                <div style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                    {user?.role || (user?.is_superuser ? 'Super Administrator' : (user?.is_staff ? 'Administrator' : 'Church Member'))}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '1.15rem 1.25rem',
                            borderRadius: '0.85rem',
                            background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ fontSize: '1.5rem' }}>🔑</div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                                    Authentication Mode
                                </div>
                                <div style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                    Django SimpleJWT Bearer Authentication Active
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '1.15rem 1.25rem',
                            borderRadius: '0.85rem',
                            background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ fontSize: '1.5rem' }}>⛪</div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                                    Member Database Linkage
                                </div>
                                <div style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                    {user?.member_id ? `Linked to Member ID #${user.member_id}` : 'Synchronized with Church Records'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSecurityPanel;

