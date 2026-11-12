import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const ChartOfAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ account_code: '', account_name: '', account_type: 'Asset', description: '', parent_id: '' });
    const [saving, setSaving] = useState(false);

    const fetchAccounts = async () => {
        try {
            const data = await api.get(`get_chart_of_accounts.php?type=${filter}`);
            if (data.success) {
                setAccounts(data.data.accounts);
                setSummary(data.data.summary || {});
            }
        } catch (err) {
            console.error('Failed to load accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAccounts(); }, [filter]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = await api.post('manage_account.php', { action: 'create', ...formData });
            if (data.success) {
                setShowForm(false);
                setFormData({ account_code: '', account_name: '', account_type: 'Asset', description: '', parent_id: '' });
                fetchAccounts();
            }
        } catch (err) {
            alert(err.message || 'Failed to create account');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await api.post('manage_account.php', { action: 'toggle', id });
            fetchAccounts();
        } catch (err) {
            alert(err.message || 'Failed to toggle account');
        }
    };

    const typeColors = {
        Asset: '#4ade80', Liability: '#f87171', Equity: '#a78bfa', Revenue: '#22c1e6', Expense: '#f59e0b'
    };

    const filterTabs = ['all', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

    return (
        <div>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {Object.entries(summary).map(([type, count]) => (
                    <div key={type} style={{
                        background: 'var(--surface-1)', borderRadius: '0.75rem', padding: '1rem',
                        border: '1px solid var(--border-color)', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: typeColors[type] || 'var(--text-color)' }}>{count}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{type}</div>
                    </div>
                ))}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {filterTabs.map(t => (
                        <button key={t} onClick={() => setFilter(t)}
                            style={{
                                padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                                fontSize: '0.8rem', fontWeight: '600',
                                background: filter === t ? 'var(--primary-color)' : 'var(--surface-1)',
                                color: filter === t ? '#fff' : 'var(--text-muted)'
                            }}>
                            {t === 'all' ? 'All' : t}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{
                    padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                    background: 'var(--primary-color)', color: '#fff', fontWeight: '600', fontSize: '0.85rem'
                }}>
                    + Add Account
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleCreate} style={{
                    background: 'var(--surface-1)', borderRadius: '0.75rem', padding: '1.25rem',
                    border: '1px solid var(--border-color)', marginBottom: '1rem'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        <div>
                            <label style={labelStyle}>Account Code</label>
                            <input required value={formData.account_code} onChange={e => setFormData({ ...formData, account_code: e.target.value })}
                                placeholder="e.g. 4090" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Account Name</label>
                            <input required value={formData.account_name} onChange={e => setFormData({ ...formData, account_name: e.target.value })}
                                placeholder="e.g. Special Events Income" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Account Type</label>
                            <select value={formData.account_type} onChange={e => setFormData({ ...formData, account_type: e.target.value })} style={inputStyle}>
                                {['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Description</label>
                            <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button type="submit" disabled={saving} style={{ ...btnStyle, background: 'var(--primary-color)', color: '#fff' }}>
                            {saving ? 'Saving...' : 'Create Account'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} style={{ ...btnStyle, background: 'var(--surface-2)', color: 'var(--text-color)' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Accounts Table */}
            <div style={{ background: 'var(--surface-1)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-2)' }}>
                            {['Code', 'Account Name', 'Type', 'Normal Balance', 'Status', 'Actions'].map(h => (
                                <th key={h} style={thStyle}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center' }}>Loading...</td></tr>
                        ) : accounts.length === 0 ? (
                            <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No accounts found</td></tr>
                        ) : accounts.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '700' }}>{a.account_code}</td>
                                <td style={tdStyle}>
                                    {a.account_name}
                                    {a.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.description}</div>}
                                </td>
                                <td style={tdStyle}>
                                    <span style={{
                                        display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '1rem',
                                        fontSize: '0.75rem', fontWeight: '600',
                                        background: `${typeColors[a.account_type]}20`, color: typeColors[a.account_type]
                                    }}>
                                        {a.account_type}
                                    </span>
                                </td>
                                <td style={tdStyle}>{a.normal_balance}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '1rem',
                                        fontSize: '0.75rem', fontWeight: '600',
                                        background: a.is_active ? '#4ade8020' : '#f8717120',
                                        color: a.is_active ? '#4ade80' : '#f87171'
                                    }}>
                                        {a.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleToggle(a.id)} style={{
                                        padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: 'none',
                                        cursor: 'pointer', fontSize: '0.75rem',
                                        background: 'var(--surface-2)', color: 'var(--text-muted)'
                                    }}>
                                        {a.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.25rem' };
const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-color)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
const btnStyle = { padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' };
const thStyle = { padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' };
const tdStyle = { padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-color)' };

export default ChartOfAccounts;
