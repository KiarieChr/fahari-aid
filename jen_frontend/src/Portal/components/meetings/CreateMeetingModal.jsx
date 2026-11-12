import React, { useState, useEffect, useContext } from 'react';
import { getMeetingFilters, createMeeting } from '../../../services/meetingsApi';
import { getMembers } from '../../../services/membersApi';
import { ThemeContext } from '../../../context/ThemeContext';

const CreateMeetingModal = ({ onClose, onCreated }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [meetingTypes, setMeetingTypes] = useState([]);
    const [members, setMembers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        meeting_type: '',
        date: '',
        time: '',
        end_time: '',
        facilitator: '',
        meeting_link: '',
        format: 'Physical',
        description: ''
    });
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [filtersRes, membersRes] = await Promise.all([
                    getMeetingFilters().catch(() => null),
                    getMembers({ limit: 100 }).catch(() => ({ data: [] }))
                ]);

                if (filtersRes?.data?.types) {
                    setMeetingTypes(filtersRes.data.types);
                    if (filtersRes.data.types.length > 0 && !formData.meeting_type) {
                        setFormData(prev => ({ ...prev, meeting_type: String(filtersRes.data.types[0].id) }));
                    }
                }

                if (filtersRes?.data?.facilitators?.length) {
                    setMembers(filtersRes.data.facilitators);
                    if (!formData.facilitator) {
                        setFormData(prev => ({ ...prev, facilitator: String(filtersRes.data.facilitators[0].id) }));
                    }
                } else if (membersRes?.data?.length) {
                    setMembers(membersRes.data);
                }
            } catch (err) {
                console.error('Failed to load form data:', err);
                setError('Failed to load meeting types and facilitators.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Banner image must be under 5MB');
                return;
            }
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await createMeeting(formData);
            if (res.success) {
                if (onCreated) onCreated();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to create meeting');
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
                maxWidth: '620px',
                maxHeight: '92vh',
                overflowY: 'auto',
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
                        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>Create New Meeting & Service</h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            Schedule corporate ministry gatherings, cell meetups, or prayer summits
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

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Loading form options...</div>
                        <div style={{ fontSize: '0.8rem' }}>Fetching meeting types and facilitators from server</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.15rem' }}>
                        {error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', padding: '0.75rem', color: '#ef4444', fontSize: '0.825rem' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div>
                            <label style={labelStyle}>Meeting Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Midweek Word & Miracle Communion"
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Meeting Type *</label>
                                <select name="meeting_type" value={formData.meeting_type} onChange={handleChange} style={inputStyle}>
                                    <option value="">Select type...</option>
                                    {meetingTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Format</label>
                                <select name="format" value={formData.format} onChange={handleChange} style={inputStyle}>
                                    <option>Physical</option>
                                    <option>Online / Stream</option>
                                    <option>Hybrid</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Date *</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Start</label>
                                    <input type="time" name="time" value={formData.time} onChange={handleChange} style={inputStyle} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>End</label>
                                    <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Facilitator / Minister</label>
                            <select name="facilitator" value={formData.facilitator} onChange={handleChange} style={inputStyle}>
                                <option value="">Select facilitator...</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name || `${m.first_name || ''} ${m.last_name || ''}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formData.format !== 'Physical' && (
                            <div>
                                <label style={labelStyle}>Meeting / Stream Link</label>
                                <input
                                    type="url"
                                    name="meeting_link"
                                    value={formData.meeting_link}
                                    onChange={handleChange}
                                    placeholder="https://zoom.us/j/... or YouTube Live URL"
                                    style={inputStyle}
                                />
                            </div>
                        )}

                        <div>
                            <label style={labelStyle}>Agenda / Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Meeting agenda notes or scripture focus..."
                                rows={2}
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
                                {submitting ? 'Creating...' : 'Create Meeting'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateMeetingModal;
