import React, { useState, useEffect, useContext } from 'react';
import api from '../../../services/api';
import { ThemeContext } from '../../../context/ThemeContext';

const CreateCellModal = ({ onClose, onCreated }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState({
        cellName: '',
        category: 'General',
        leader: '',
        day: 'Wednesday',
        time: '18:00',
        location: '',
        capacity: 15
    });
    const [members, setMembers] = useState([]);
    const [leaderSearch, setLeaderSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch unassigned members for leader selection
        const fetchMembers = async () => {
            try {
                const res = await api.get('get_unassigned_members.php');
                if (res.success) setMembers(res.data.members || []);
            } catch (err) { console.error(err); }
        };
        fetchMembers();
    }, []);

    const filteredMembers = members.filter(m =>
        `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase().includes(leaderSearch.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.leader) { setError('Please select a cell leader'); return; }
        setSubmitting(true);
        setError('');
        try {
            const res = await api.post('create_cell.php', formData);
            if (res.success) {
                if (onCreated) onCreated();
                else onClose();
            } else {
                setError(res.error || 'Failed to create cell');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create cell');
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
                maxWidth: '600px',
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
                        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>Create New Cell Outpost</h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            Establish a new home fellowship group or campus hub
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

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.15rem' }}>
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', color: '#ef4444', fontSize: '0.825rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Cell Name *</label>
                            <input
                                type="text"
                                name="cellName"
                                value={formData.cellName}
                                onChange={handleChange}
                                placeholder="e.g. Goshen Alpha"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option>General</option>
                                <option>Youth & Teens</option>
                                <option>Men of Honor</option>
                                <option>Women of Virtue</option>
                                <option>Campus & College</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={labelStyle}>Cell Leader / Overseer *</label>
                        <input
                            type="text"
                            placeholder="Type leader name..."
                            value={leaderSearch}
                            onChange={(e) => {
                                setLeaderSearch(e.target.value);
                                setFormData(prev => ({ ...prev, leader: '' }));
                            }}
                            style={inputStyle}
                            required
                        />
                        {formData.leader && (
                            <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.25rem' }}>
                                Selected: <strong>{formData.leader}</strong>
                            </div>
                        )}
                        {leaderSearch && !formData.leader && filteredMembers.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: isDark ? '#151128' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0'}`,
                                borderRadius: '0.5rem',
                                maxHeight: '160px',
                                overflowY: 'auto',
                                zIndex: 10,
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                marginTop: '0.25rem'
                            }}>
                                {filteredMembers.slice(0, 8).map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, leader: `${m.first_name} ${m.last_name}` }));
                                            setLeaderSearch(`${m.first_name} ${m.last_name}`);
                                        }}
                                        style={{
                                            padding: '0.55rem 0.85rem',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            color: isDark ? '#f8fafc' : '#0f172a',
                                            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc'}`
                                        }}
                                    >
                                        {m.first_name} {m.last_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Meeting Schedule Day</label>
                            <select
                                name="day"
                                value={formData.day}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option>Monday</option>
                                <option>Tuesday</option>
                                <option>Wednesday</option>
                                <option>Thursday</option>
                                <option>Friday</option>
                                <option>Saturday</option>
                                <option>Sunday</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Meeting Time</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Location / Physical Hub</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Karen / Kilimani / Westlands"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Capacity</label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                min="1"
                                max="100"
                                style={inputStyle}
                            />
                        </div>
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
                            {submitting ? 'Creating...' : 'Create Cell Outpost'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCellModal;
