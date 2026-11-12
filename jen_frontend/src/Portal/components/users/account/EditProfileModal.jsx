import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { ThemeContext } from '../../../../context/ThemeContext';

const EditProfileModal = ({ onClose }) => {
    const { user, updateProfile } = useAuth();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_no: '',
        dob: '',
        location: '',
        bio: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Pre-fill form when user data is available
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || user.firstname || '',
                last_name: user.last_name || user.lastname || '',
                email: user.email || '',
                phone_no: user.phone_no || user.phone || '',
                dob: user.dob ? user.dob.split('T')[0] : '',
                location: user.location || '',
                bio: user.bio || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await updateProfile(formData);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (err) {
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
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
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        color: isDark ? '#94a3b8' : '#475569',
        fontSize: '0.8rem',
        fontWeight: '600',
        marginBottom: '0.35rem',
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
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
            padding: '1rem',
        }} onClick={onClose}>
            <div style={{
                background: isDark ? '#151128' : '#ffffff',
                padding: '2rem',
                borderRadius: '1.25rem',
                width: '100%',
                maxWidth: '600px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
                color: isDark ? '#f8fafc' : '#0f172a',
                maxHeight: '90vh',
                overflowY: 'auto',
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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
                            ✏️
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', margin: '0 0 0.15rem 0', fontWeight: '700' }}>
                                Edit Profile
                            </h2>
                            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', margin: 0 }}>
                                Update your personal details and contact information
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
                            justifyContent: 'center',
                            lineHeight: 1
                        }}
                    >×</button>
                </div>

                {/* Alerts */}
                {error && (
                    <div style={{ background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`, borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>
                        ⚠ {error}
                    </div>
                )}
                {success && (
                    <div style={{ background: isDark ? 'rgba(34,197,94,0.15)' : '#f0fdf4', border: `1px solid ${isDark ? 'rgba(34,197,94,0.3)' : '#bbf7d0'}`, borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: '600' }}>
                        ✓ Profile updated successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    {/* Name row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>First Name *</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                                placeholder="e.g. James"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Last Name *</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                                placeholder="e.g. Kimani"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="e.g. james.k@jesuse.org"
                        />
                    </div>

                    {/* Phone & Location */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Phone Number</label>
                            <input
                                type="tel"
                                name="phone_no"
                                value={formData.phone_no}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="e.g. +254 712 345 678"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Residence / Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="e.g. Karen, Nairobi"
                            />
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label style={labelStyle}>Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label style={labelStyle}>Ministry Bio / About</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                            placeholder="Tell the ministry a little about your role and journey..."
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                background: isDark ? '#252038' : '#f1f5f9',
                                color: isDark ? '#cbd5e1' : '#475569',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}
                        >Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: '#2563eb',
                                color: '#ffffff',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.95rem',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                            }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
