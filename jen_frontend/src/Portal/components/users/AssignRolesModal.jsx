import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { updateUser } from '../../../services/userApi';

const AssignRolesModal = ({ targetUser, onClose, onSuccess }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [selectedRole, setSelectedRole] = useState(targetUser?.role || 'Member');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const roles = [
        { id: 'Super Admin', label: 'Super Administrator', desc: 'Unrestricted full access across all modules, settings, and user permissions' },
        { id: 'Admin', label: 'Administrator', desc: 'Staff portal administrative access to meetings, attendance, finance, and members' },
        { id: 'Cell Leader', label: 'Cell Leader / Overseer', desc: 'Access to cell fellowship records, attendance logs, and members follow-up' },
        { id: 'Member', label: 'Church Member', desc: 'Standard member portal access (personal devotionals, giving, and cell profile)' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!targetUser?.id) return;

        try {
            setSubmitting(true);
            setError(null);
            await updateUser(targetUser.id, { role: selectedRole });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to update user role:', err);
            setError(err.message || 'Failed to update user role.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                background: isDark ? '#151128' : '#ffffff',
                padding: '2rem',
                borderRadius: '1.25rem',
                width: '100%',
                maxWidth: '520px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                color: isDark ? '#f8fafc' : '#0f172a'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: isDark ? 'rgba(139,92,246,0.2)' : '#f3e8ff',
                            color: '#8b5cf6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            🛡️
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', margin: 0, fontWeight: '700' }}>
                                Modify Access Role
                            </h2>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                Assign security permissions for {targetUser?.full_name || targetUser?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: isDark ? '#252038' : '#f1f5f9',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#ef4444',
                        fontSize: '0.85rem',
                        marginBottom: '1rem'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{
                        padding: '0.85rem 1rem',
                        background: isDark ? '#0d0a1a' : '#f8fafc',
                        borderRadius: '0.65rem',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`
                    }}>
                        <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                            Selected Account
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.2rem' }}>
                            {targetUser?.full_name} ({targetUser?.email})
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '0.65rem' }}>
                        {roles.map(r => {
                            const isSelected = selectedRole === r.id;
                            return (
                                <div
                                    key={r.id}
                                    onClick={() => setSelectedRole(r.id)}
                                    style={{
                                        padding: '0.85rem 1rem',
                                        borderRadius: '0.65rem',
                                        border: `1px solid ${isSelected ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0')}`,
                                        background: isSelected ? (isDark ? 'rgba(139,92,246,0.15)' : '#f5f3ff') : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: isSelected ? '#8b5cf6' : (isDark ? '#ffffff' : '#0f172a') }}>
                                            {r.label}
                                        </div>
                                        {isSelected && <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>✓</span>}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '0.2rem' }}>
                                        {r.desc}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                        <button type="button" onClick={onClose} disabled={submitting} style={{
                            padding: '0.75rem 1.25rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                            background: isDark ? '#252038' : '#f1f5f9',
                            color: isDark ? '#cbd5e1' : '#475569',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: '#8b5cf6',
                            color: '#ffffff',
                            fontWeight: '700',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(139,92,246,0.25)'
                        }}>
                            {submitting ? 'Updating...' : 'Save Role Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignRolesModal;
