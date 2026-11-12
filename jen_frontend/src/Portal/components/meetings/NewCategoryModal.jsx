import React, { useState, useContext } from 'react';
import { createMeetingType } from '../../../services/meetingsApi';
import { ThemeContext } from '../../../context/ThemeContext';

const NewCategoryModal = ({ onClose, onCreated }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            const res = await createMeetingType(name.trim());
            if (res.success) {
                if (onCreated) onCreated();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.name?.[0] || err.response?.data?.detail || err.message || 'Failed to create meeting type');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.65rem 0.85rem',
        borderRadius: '0.5rem',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
        background: isDark ? '#0d0a1a' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontSize: '0.85rem',
        marginTop: '0.35rem',
        outline: 'none',
        transition: 'border-color 0.15s, background 0.2s, color 0.2s'
    };

    const labelStyle = {
        color: isDark ? '#cbd5e1' : '#334155',
        fontSize: '0.8rem',
        fontWeight: '600'
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '1rem'
        }}>
            <div style={{
                background: isDark ? '#151128' : '#ffffff',
                padding: '1.75rem 2rem',
                borderRadius: '1.25rem',
                width: '100%',
                maxWidth: '460px',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
                boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
                color: isDark ? '#f8fafc' : '#0f172a',
                transition: 'background 0.2s, border-color 0.2s, color 0.2s'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.25rem',
                    paddingBottom: '1rem',
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'}`
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>Create Meeting Category</h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            Add a new classification for services and assemblies
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', padding: '0.75rem', color: '#ef4444', fontSize: '0.825rem' }}>
                            ⚠️ {error}
                        </div>
                    )}
                    <div>
                        <label style={labelStyle}>Category Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Word Session, Prophetic Encounter"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.55rem 1.15rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
                                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                                color: isDark ? '#cbd5e1' : '#64748b',
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: '0.55rem 1.35rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%)',
                                color: '#ffffff',
                                fontWeight: '600',
                                fontSize: '0.8125rem',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)'
                            }}
                        >
                            {submitting ? 'Creating...' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewCategoryModal;
