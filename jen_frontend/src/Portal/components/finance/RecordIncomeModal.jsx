import React, { useState, useEffect, useContext } from 'react';
import api from '../../../services/api';
import { ThemeContext } from '../../../context/ThemeContext';

const RecordIncomeModal = ({ onClose, onSuccess }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [form, setForm] = useState({ incometype: '', incometype_id: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    const [types, setTypes] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('get_income_types.php').then(d => { if (d.success) setTypes(d.data.types || []); }).catch(() => {});
    }, []);

    const handleTypeChange = (e) => {
        const selectedId = e.target.value;
        const type = types.find(t => String(t.id) === selectedId);
        setForm(f => ({ ...f, incometype_id: selectedId, incometype: type ? type.name : '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.incometype_id || !form.amount || !form.date) { setError('Please fill required fields'); return; }
        setSubmitting(true);
        setError('');
        try {
            const data = await api.post('add_income.php', { ...form, incometype_id: parseInt(form.incometype_id), amount: parseFloat(form.amount) });
            if (data.success) { onSuccess?.(); onClose(); }
            else setError(data.error || 'Failed to record income');
        } catch (err) { setError('Failed to record income'); }
        finally { setSubmitting(false); }
    };

    const fieldStyle = {
        width: '100%',
        padding: '0.65rem 0.85rem',
        borderRadius: '0.5rem',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
        background: isDark ? '#0d0a1a' : '#f8fafc',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box'
    };
    const labelStyle = {
        display: 'block',
        fontSize: '0.85rem',
        color: isDark ? '#94a3b8' : '#475569',
        marginBottom: '0.35rem',
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
                    borderRadius: '1.25rem',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '520px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                    boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: isDark ? 'rgba(22,163,74,0.2)' : '#f0fdf4',
                            color: '#16a34a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            💰
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '700' }}>Record Income</h2>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>Log collections, gifts, grants and ministry inflows</p>
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

                {error && (
                    <div style={{
                        background: isDark ? 'rgba(248,113,113,0.1)' : '#fef2f2',
                        border: `1px solid ${isDark ? 'rgba(248,113,113,0.3)' : '#fecaca'}`,
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        color: '#dc2626',
                        fontSize: '0.85rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Income Type *</label>
                        <select
                            value={form.incometype_id}
                            onChange={handleTypeChange}
                            style={fieldStyle}
                            required
                        >
                            <option value="">Select income category...</option>
                            {types.map(t => (
                                <option key={t.id} value={t.id} style={{ background: isDark ? '#151128' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a' }}>
                                    {t.account_code ? `${t.account_code} - ` : ''}{t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Amount (KES) *</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.amount}
                            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                            placeholder="0.00"
                            style={fieldStyle}
                            required
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Date Received *</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                            style={fieldStyle}
                            required
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Description / Reference</label>
                        <input
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="e.g. Special anniversary offering / Bank wire receipt"
                            style={fieldStyle}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
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
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: '#16a34a',
                                color: '#ffffff',
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(22,163,74,0.25)'
                            }}
                        >
                            {submitting ? 'Recording...' : 'Record Income'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordIncomeModal;
