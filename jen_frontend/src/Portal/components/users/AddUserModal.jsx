import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { createUser } from '../../../services/userApi';

const AddUserModal = ({ onClose, onSuccess }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_no: '',
        password: '',
        role: 'Member'
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setError('Email address is required.');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await createUser({
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_no: formData.phone_no,
                password: formData.password || 'JesusEnthroned2026!',
                role: formData.role
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to create user:', err);
            setError(err.message || 'Failed to create user. Verify email is unique.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.65rem 0.85rem',
        background: isDark ? '#0d0a1a' : '#f8fafc',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
        borderRadius: '0.5rem',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontSize: '0.9rem',
        marginTop: '0.35rem',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        color: isDark ? '#94a3b8' : '#475569',
        fontSize: '0.85rem',
        fontWeight: '600'
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
                maxWidth: '540px',
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
                            background: isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            👤
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', margin: 0, fontWeight: '700' }}>
                                Create User Account
                            </h2>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                Register staff login or member portal credentials
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="e.g. Timothy"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="e.g. Mwangi"
                                style={inputStyle}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Email Address (Login Username) *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="user@jesusemthroned.org"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Phone Number</label>
                            <input
                                type="text"
                                name="phone_no"
                                value={formData.phone_no}
                                onChange={handleChange}
                                placeholder="e.g. +254 712 345678"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Initial Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Default: JesusEnthroned2026!"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>System Access Role *</label>
                        <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
                            <option value="Member">Church Member (Default)</option>
                            <option value="Cell Leader">Cell Leader (Overseer)</option>
                            <option value="Admin">Administrator (Staff Access)</option>
                            <option value="Super Admin">Super Administrator (Full System Control)</option>
                        </select>
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
                            background: '#2563eb',
                            color: '#ffffff',
                            fontWeight: '700',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                        }}>
                            {submitting ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
