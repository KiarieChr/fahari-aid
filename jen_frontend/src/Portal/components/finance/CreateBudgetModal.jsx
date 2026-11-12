import React, { useState, useContext } from 'react';
import api from '../../../services/api';
import { ThemeContext } from '../../../context/ThemeContext';

const CreateBudgetModal = ({ onClose, onSuccess }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [form, setForm] = useState({ budget_name: '', budget_purpose: '', items: [{ description: '', amount: '' }] });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', amount: '' }] }));
    const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    const updateItem = (idx, field, value) => setForm(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.budget_name) { setError('Budget name is required'); return; }
        setSubmitting(true);
        setError('');
        try {
            const data = await api.post('add_budget.php', {
                ...form,
                items: form.items.filter(i => i.description && i.amount).map(i => ({ ...i, amount: parseFloat(i.amount) }))
            });
            if (data.success) { onSuccess?.(); onClose(); }
            else setError(data.error || 'Failed to create budget');
        } catch (err) { setError('Failed to create budget'); }
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
                    maxWidth: '600px',
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
                            background: isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            📋
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '700' }}>Create Budget</h2>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>Define expenditure caps and line items</p>
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
                        <label style={labelStyle}>Budget Name *</label>
                        <input
                            value={form.budget_name}
                            onChange={e => setForm(f => ({ ...f, budget_name: e.target.value }))}
                            placeholder="e.g. Q2 2026 Operational Budget"
                            style={fieldStyle}
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Purpose</label>
                        <input
                            value={form.budget_purpose}
                            onChange={e => setForm(f => ({ ...f, budget_purpose: e.target.value }))}
                            placeholder="e.g. Outreaches, missions and operations"
                            style={fieldStyle}
                        />
                    </div>

                    <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`, paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Budget Line Items</label>
                            <button
                                type="button"
                                onClick={addItem}
                                style={{
                                    background: '#2563eb',
                                    border: 'none',
                                    color: '#ffffff',
                                    padding: '0.4rem 0.85rem',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                + Add Item
                            </button>
                        </div>
                        {form.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                <input
                                    value={item.description}
                                    onChange={e => updateItem(idx, 'description', e.target.value)}
                                    placeholder="Line description"
                                    style={{ ...fieldStyle, flex: 2 }}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.amount}
                                    onChange={e => updateItem(idx, 'amount', e.target.value)}
                                    placeholder="Amount (KES)"
                                    style={{ ...fieldStyle, flex: 1 }}
                                />
                                {form.items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(idx)}
                                        style={{
                                            background: isDark ? 'rgba(248,113,113,0.1)' : '#fee2e2',
                                            border: 'none',
                                            color: '#dc2626',
                                            padding: '0.65rem 0.8rem',
                                            borderRadius: '0.375rem',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            lineHeight: 1
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '0.5rem' }}>
                            Total Budget: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>KES {form.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0).toLocaleString()}</strong>
                        </div>
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
                                background: '#2563eb',
                                color: '#ffffff',
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                            }}
                        >
                            {submitting ? 'Creating...' : 'Create Budget'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBudgetModal;
