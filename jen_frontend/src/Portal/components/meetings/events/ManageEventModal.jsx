import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../../../context/ThemeContext';

const ManageEventModal = ({ event, onClose, onUpdate }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [activeTab, setActiveTab] = useState('overview');
    const [formData, setFormData] = useState({ ...event });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = () => {
        onUpdate(formData);
        onClose();
    };

    const copyLink = () => {
        const url = `${window.location.origin}/events/${event.id}/register`;
        navigator.clipboard.writeText(url);
        alert('Registration link copied to clipboard!');
    };

    const tabStyle = (isActive) => ({
        padding: '0.75rem 1.25rem',
        cursor: 'pointer',
        borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
        color: isActive ? '#2563eb' : (isDark ? '#94a3b8' : '#64748b'),
        background: 'transparent',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        fontSize: '0.95rem',
        fontWeight: isActive ? '700' : '500',
        transition: 'all 0.15s ease'
    });

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
            <div
                style={{
                    background: isDark ? '#151128' : '#ffffff',
                    padding: '2rem',
                    borderRadius: '1.25rem',
                    width: '100%',
                    maxWidth: '720px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                    boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    color: isDark ? '#f8fafc' : '#0f172a'
                }}
                onClick={e => e.stopPropagation()}
            >
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
                            ⚙️
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', margin: 0, fontWeight: '700' }}>
                                Manage Event: {event.name || event.ename}
                            </h2>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                Details, registration gateway, and attendees
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
                    >
                        ×
                    </button>
                </div>

                <div style={{ display: 'flex', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, marginBottom: '1.5rem' }}>
                    <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Overview</button>
                    <button style={tabStyle(activeTab === 'registration')} onClick={() => setActiveTab('registration')}>Registration Link</button>
                    <button style={tabStyle(activeTab === 'registrants')} onClick={() => setActiveTab('registrants')}>
                        Registrants ({event.registrations?.length || 0})
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Event Name</label>
                            <input type="text" name="name" value={formData.name || formData.ename || ''} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Date</label>
                                <input type="date" name="date" value={formData.date || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Time</label>
                                <input type="time" name="time" value={formData.time || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Location / Venue</label>
                            <input type="text" name="location" value={formData.location || ''} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                    background: isDark ? '#252038' : '#f1f5f9',
                                    color: isDark ? '#cbd5e1' : '#475569',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'registration' && (
                    <div>
                        <div style={{
                            background: isDark ? 'rgba(37,99,235,0.1)' : '#eff6ff',
                            padding: '1.25rem',
                            borderRadius: '0.75rem',
                            marginBottom: '1.5rem',
                            border: `1px solid ${isDark ? 'rgba(37,99,235,0.25)' : '#bfdbfe'}`
                        }}>
                            <h4 style={{ color: '#2563eb', margin: '0 0 0.35rem 0', fontSize: '1rem' }}>Public Registration Link</h4>
                            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                Share this link on WhatsApp, bulletin, or email to allow members and guests to self-register.
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={`${window.location.origin}/events/${event.id}/register`}
                                    readOnly
                                    style={{ ...inputStyle, marginTop: 0 }}
                                />
                                <button
                                    onClick={copyLink}
                                    style={{
                                        background: '#2563eb',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        padding: '0 1.25rem',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '600', fontSize: '0.9rem' }}>
                                Registration Status:
                            </label>
                            <select
                                name="status"
                                value={formData.status || 'Upcoming'}
                                onChange={handleChange}
                                style={{ ...inputStyle, width: 'auto', marginTop: 0 }}
                            >
                                <option value="Upcoming">Upcoming (Closed)</option>
                                <option value="Registration Open">Registration Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '0.65rem 1.25rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    marginLeft: 'auto'
                                }}
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'registrants' && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, textAlign: 'left', background: isDark ? '#0d0a1a' : '#f8fafc' }}>
                                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Phone</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Date Registered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {event.registrations && event.registrations.length > 0 ? (
                                    event.registrations.map((reg, index) => (
                                        <tr key={index} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}` }}>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{reg.name}</td>
                                            <td style={{ padding: '0.75rem 1rem', color: isDark ? '#94a3b8' : '#64748b' }}>{reg.email || '—'}</td>
                                            <td style={{ padding: '0.75rem 1rem', color: isDark ? '#94a3b8' : '#64748b' }}>{reg.phone || '—'}</td>
                                            <td style={{ padding: '0.75rem 1rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                                {reg.date ? new Date(reg.date).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2.5rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
                                            No attendees registered yet for this event.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageEventModal;
