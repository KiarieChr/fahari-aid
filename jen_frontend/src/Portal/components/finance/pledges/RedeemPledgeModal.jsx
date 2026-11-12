import React, { useState, useContext } from 'react';
import api from '../../../../services/api';
import { ThemeContext } from '../../../../context/ThemeContext';

const RedeemPledgeModal = ({ pledge, onClose, onSuccess }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const remaining = (pledge.pledged_amount || 0) - (pledge.redeemed_amount || 0);
    const [form, setForm] = useState({
        redeemed_amount: '',
        mpesa_code: '',
        payment_method: 'mpesa',
        date: new Date().toISOString().split('T')[0]
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const amount = parseFloat(form.redeemed_amount);
        if (!amount || amount <= 0) { setError('Please enter a valid amount'); return; }
        if (amount > remaining + 0.01) { setError(`Amount exceeds remaining balance of KES ${remaining.toLocaleString()}`); return; }
        setSubmitting(true);
        setError('');
        try {
            const data = await api.post('redeem_pledge.php', {
                pledge_id: pledge.id,
                redeemed_amount: amount,
                mpesa_code: form.mpesa_code,
                payment_method: form.payment_method,
                date: form.date
            });
            if (data.success) { onSuccess?.(); onClose(); }
            else setError(data.error || 'Failed to redeem pledge');
        } catch (err) { setError('Failed to redeem pledge'); }
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
    const pct = pledge.pledged_amount > 0 ? Math.min(100, (pledge.redeemed_amount / pledge.pledged_amount) * 100) : 0;

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
                        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>Redeem Partner Pledge</h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            Record pledge installment or final redemption
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>

                {/* Pledge summary card */}
                <div style={{
                    background: isDark ? '#0d0a1a' : '#f8fafc',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                        <span style={{ fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.9rem' }}>{pledge.full_name}</span>
                        <span style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '500' }}>{pledge.purpose || 'Partner Fund'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: isDark ? '#cbd5e1' : '#475569', marginBottom: '0.5rem' }}>
                        <span>Pledged: <strong>KES {(pledge.pledged_amount || 0).toLocaleString()}</strong></span>
                        <span>Redeemed: <strong style={{ color: '#16a34a' }}>KES {(pledge.redeemed_amount || 0).toLocaleString()}</strong></span>
                    </div>
                    <div style={{ background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0', borderRadius: '1rem', height: '6px', overflow: 'hidden', marginBottom: '0.35rem' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #22c1e6, #10b981)', borderRadius: '1rem' }}></div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                        Remaining Balance: <strong style={{ color: '#d97706' }}>KES {remaining.toLocaleString()}</strong> ({pct.toFixed(0)}% redeemed)
                    </div>
                </div>

                {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.825rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Redemption Amount (KES) *</label>
                            <input
                                type="number"
                                min="1"
                                max={remaining}
                                value={form.redeemed_amount}
                                onChange={e => setForm(f => ({ ...f, redeemed_amount: e.target.value }))}
                                placeholder="0.00"
                                style={fieldStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Payment Method</label>
                            <select
                                value={form.payment_method}
                                onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                                style={fieldStyle}
                            >
                                <option value="mpesa">M-Pesa</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="card">Card / Online</option>
                                <option value="cash">Cash / Cheque</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>M-Pesa / Reference Code</label>
                            <input
                                type="text"
                                value={form.mpesa_code}
                                onChange={e => setForm(f => ({ ...f, mpesa_code: e.target.value }))}
                                placeholder="e.g. QK91823JX"
                                style={fieldStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Redemption Date *</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                style={fieldStyle}
                                required
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
                            {submitting ? 'Processing...' : 'Confirm Redemption'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RedeemPledgeModal;
