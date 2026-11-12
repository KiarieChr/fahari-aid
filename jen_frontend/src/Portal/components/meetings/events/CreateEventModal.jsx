import React, { useState, useContext } from 'react';
import { createEvent } from '../../../../services/eventsApi';
import { ThemeContext } from '../../../../context/ThemeContext';

const EVENT_TYPES = [
    { value: 'conference', label: 'Conference' },
    { value: 'service', label: 'Service' },
    { value: 'concert', label: 'Concert' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'outreach', label: 'Outreach' },
    { value: 'prayer', label: 'Prayer' },
    { value: 'training', label: 'Training' },
    { value: 'general', label: 'General' },
];

const CreateEventModal = ({ onClose, onCreated }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState({
        name: '',
        type: 'conference',
        date: '',
        time: '',
        endDate: '',
        endTime: '',
        location: '',
        description: '',
        targetAttendees: '',
        facilitationFee: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await createEvent({
                name: formData.name,
                type: formData.type,
                date: formData.date,
                time: formData.time,
                endDate: formData.endDate,
                endTime: formData.endTime,
                location: formData.location,
                description: formData.description,
                targetAttendees: formData.targetAttendees,
                facilitationFee: formData.facilitationFee,
            });
            if (res.success) {
                if (onCreated) onCreated();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to create event');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.65rem 0.85rem',
        background: isDark ? '#0d0a1a' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
        borderRadius: '0.5rem',
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
                maxWidth: '650px',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
                boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
                maxHeight: '92vh',
                overflowY: 'auto',
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
                        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>Create Kingdom Event</h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            Register special conferences, leadership summits, and outreaches
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', padding: '0.75rem', color: '#ef4444', fontSize: '0.825rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Event Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Supernatural Increase Conference"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                                {EVENT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Start Date *</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Start Time *</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} style={inputStyle} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>End Date</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>End Time</label>
                            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Venue / Location *</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Main Sanctuary, Nairobi"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Target Attendance</label>
                            <input
                                type="number"
                                name="targetAttendees"
                                value={formData.targetAttendees}
                                onChange={handleChange}
                                placeholder="e.g. 500"
                                style={inputStyle}
                                min="0"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Registration Fee (KES)</label>
                            <input
                                type="number"
                                name="facilitationFee"
                                value={formData.facilitationFee}
                                onChange={handleChange}
                                placeholder="0 for Free entry"
                                style={inputStyle}
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Description & Details</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Event overview, ministers, guidelines..."
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical' }}
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
                                cursor: submitting ? 'wait' : 'pointer',
                                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)'
                            }}
                        >
                            {submitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;
