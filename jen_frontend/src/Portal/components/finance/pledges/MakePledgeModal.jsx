import React, { useState, useContext } from 'react';
import api from '../../../../services/api';
import { ThemeContext } from '../../../../context/ThemeContext';

const MakePledgeModal = ({ onClose, onSuccess }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [form, setForm] = useState({
        full_name: '', email: '', phone_no: '', pledges_amount: '',
        purpose: '', date: new Date().toISOString().split('T')[0],
        notes: '', pledge_type: '', attendees_sponsored: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.full_name || !form.email || !form.pledges_amount || !form.date) {
            setError('Name, email, amount, and date are required');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const data = await api.post('add_pledge.php', {
                ...form,
                pledges_amount: parseFloat(form.pledges_amount),
                attendees_sponsored: form.attendees_sponsored ? parseInt(form.attendees_sponsored) : 0
            });
            if (data.success) { onSuccess?.(); onClose(); }
            else setError(data.error || 'Failed to record pledge');
        } catch (err) { setError('Failed to record pledge'); }
        finally { setSubmitting(false); }
    };

    const fieldStyle = {
        width: '100%',
        padding: '0.65rem 0.85rem',
        borderRadius: '0.5rem',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
        background: isDark ? '#0d0a1a' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontSize: '0.85rem',
        outline: 'none',
        transition: 'border-color 0.15s, background 0.2s, color 0.2s'
    };
    const labelStyle = { display: 'block', fontSize: '0.8rem', color: isDark ? '#cbd5e1' : '#334155', marginBottom: '0.35rem', fontWeight: '600' };

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
                borderRadius: '1.25rem',
                padding: '1.75rem 2rem',
                width: '100%',
                maxWidth: '520px',
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
                        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>Make Kingdom Partner Pledge</h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            Covenant giving commitment for kingdom expansion
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>

                {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.825rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="e.g. Debra Wanjiku" style={fieldStyle} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Email Address *</label>
                            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" style={fieldStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Phone Number</label>
                            <input value={form.phone_no} onChange={e => setForm(f => ({ ...f, phone_no: e.target.value }))} placeholder="07XXXXXXXX" style={fieldStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Pledge Amount (KES) *</label>
                            <input type="number" min="1" value={form.pledges_amount} onChange={e => setForm(f => ({ ...f, pledges_amount: e.target.value }))} placeholder="0.00" style={fieldStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Pledge Purpose / Category</label>
                            <select value={form.pledge_type} onChange={e => setForm(f => ({ ...f, pledge_type: e.target.value }))} style={fieldStyle}>
                                <option value="">Select Category...</option>
                                <option value="Monthly Partner">Monthly Kingdom Partner</option>
                                <option value="Building Fund">Building Fund</option>
                                <option value="Event Sponsorship">Event Sponsorship</option>
                                <option value="Missions">Missions & Outreach</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Pledge Date *</label>
                            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={fieldStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Attendees Sponsored (Optional)</label>
                            <input type="number" min="0" value={form.attendees_sponsored} onChange={e => setForm(f => ({ ...f, attendees_sponsored: e.target.value }))} placeholder="0" style={fieldStyle} />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Covenant Purpose / Notes</label>
                        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Prayer declaration or fulfillment schedule notes..." rows={2} style={{ ...fieldStyle, resize: 'vertical' }} />
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
                            {submitting ? 'Recording...' : 'Record Partner Pledge'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MakePledgeModal;
