import React, { useState, useEffect, useContext } from 'react';
import api from '../../../services/api';
import { ThemeContext } from '../../../context/ThemeContext';

const RecordContributionModal = ({ onClose, onSuccess }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [form, setForm] = useState({ member: '', contritype: '', fund: '', amount: '', paymentmethod: '', date: new Date().toISOString().split('T')[0] });
    const [contriTypes, setContriTypes] = useState([]);
    const [funds, setFunds] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('get_contribution_options.php').then(d => {
            if (d.success) {
                setContriTypes(d.data.contribution_types || []);
                setFunds(d.data.funds || []);
                setPaymentMethods(d.data.payment_methods || []);
            }
        }).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.member || !form.contritype || !form.amount || !form.date) { setError('Please fill required fields'); return; }
        setSubmitting(true);
        setError('');
        try {
            const data = await api.post('add_contribution.php', { ...form, amount: parseFloat(form.amount) });
            if (data.success) { onSuccess?.(); onClose(); }
            else setError(data.error || 'Failed to record contribution');
        } catch (err) { setError('Failed to record contribution'); }
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
                        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>Record Contribution</h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            Register tithes, offerings, building funds, or kingdom seeds
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>

                {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.825rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                        <label style={labelStyle}>Member Name *</label>
                        <input value={form.member} onChange={e => setForm(f => ({ ...f, member: e.target.value }))} placeholder="e.g. John Mwangi" style={fieldStyle} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Contribution Type *</label>
                            <select value={form.contritype} onChange={e => setForm(f => ({ ...f, contritype: e.target.value }))} style={fieldStyle} required>
                                <option value="">Select type...</option>
                                {contriTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Fund / Purpose</label>
                            <select value={form.fund} onChange={e => setForm(f => ({ ...f, fund: e.target.value }))} style={fieldStyle}>
                                <option value="">General Fund</option>
                                {funds.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Amount (KES) *</label>
                            <input type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" style={fieldStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Payment Method</label>
                            <select value={form.paymentmethod} onChange={e => setForm(f => ({ ...f, paymentmethod: e.target.value }))} style={fieldStyle}>
                                <option value="">Select method...</option>
                                {paymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Date *</label>
                        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={fieldStyle} required />
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
                            {submitting ? 'Recording...' : 'Record Contribution'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordContributionModal;
