import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const JournalEntries = () => {
    const [entries, setEntries] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, total_pages: 1 });
    const [loading, setLoading] = useState(true);
    const [sourceFilter, setSourceFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({ entry_date: new Date().toISOString().split('T')[0], description: '', lines: [{ account_id: '', debit: '', credit: '' }, { account_id: '', debit: '', credit: '' }] });
    const [saving, setSaving] = useState(false);

    const fetchEntries = async (page = 1) => {
        setLoading(true);
        try {
            let url = `get_journal_entries.php?page=${page}&limit=15`;
            if (sourceFilter) url += `&source_type=${sourceFilter}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            const res = await api.get(url);
            if (res.success) {
                setEntries(res.data.entries);
                setPagination(res.data.pagination);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEntries(); }, [sourceFilter]);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await api.get('get_chart_of_accounts.php?type=all');
                if (data.success) setAccounts(data.data.accounts.filter(a => a.is_active));
            } catch (err) { console.error(err); }
        };
        fetchAccounts();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEntries(1);
    };

    const handleReverse = async (id) => {
        if (!confirm('Are you sure you want to reverse this journal entry?')) return;
        try {
            const res = await api.post('reverse_journal_entry.php', { journal_entry_id: id });
            if (res.success) fetchEntries(pagination.page);
        } catch (err) { alert(err.message); }
    };

    const addLine = () => setForm({ ...form, lines: [...form.lines, { account_id: '', debit: '', credit: '' }] });
    const removeLine = (i) => {
        if (form.lines.length <= 2) return;
        setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });
    };
    const updateLine = (i, field, val) => {
        const newLines = [...form.lines];
        newLines[i] = { ...newLines[i], [field]: val };
        setForm({ ...form, lines: newLines });
    };

    const handleCreateEntry = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                entry_date: form.entry_date,
                description: form.description,
                lines: form.lines.map(l => ({
                    account_id: parseInt(l.account_id),
                    debit: parseFloat(l.debit) || 0,
                    credit: parseFloat(l.credit) || 0,
                }))
            };
            const res = await api.post('add_journal_entry.php', payload);
            if (res.success) {
                setShowForm(false);
                setForm({ entry_date: new Date().toISOString().split('T')[0], description: '', lines: [{ account_id: '', debit: '', credit: '' }, { account_id: '', debit: '', credit: '' }] });
                fetchEntries(1);
            }
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const fmt = (n) => (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const sourceTypes = ['', 'income', 'expense', 'contribution', 'pledge', 'pledge_redeem', 'payroll', 'adjustment'];
    const totalDebit = form.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
    const totalCredit = form.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);

    return (
        <div>
            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={inputStyle}>
                        <option value="">All Sources</option>
                        {sourceTypes.filter(Boolean).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.25rem' }}>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ref/desc..." style={{ ...inputStyle, width: '180px' }} />
                        <button type="submit" style={btnPrimary}>Search</button>
                    </form>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>+ Manual Entry</button>
            </div>

            {/* Manual Entry Form */}
            {showForm && (
                <form onSubmit={handleCreateEntry} style={{ background: 'var(--surface-1)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                            <label style={labelStyle}>Date</label>
                            <input type="date" required value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Description</label>
                            <input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" style={inputStyle} />
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)' }}>
                                <th style={thStyle}>Account</th>
                                <th style={{ ...thStyle, width: '140px' }}>Debit</th>
                                <th style={{ ...thStyle, width: '140px' }}>Credit</th>
                                <th style={{ ...thStyle, width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.lines.map((line, i) => (
                                <tr key={i}>
                                    <td style={tdStyle}>
                                        <select required value={line.account_id} onChange={e => updateLine(i, 'account_id', e.target.value)} style={{ ...inputStyle, width: '100%' }}>
                                            <option value="">Select account...</option>
                                            {accounts.map(a => <option key={a.id} value={a.id}>{a.account_code} — {a.account_name}</option>)}
                                        </select>
                                    </td>
                                    <td style={tdStyle}><input type="number" step="0.01" min="0" value={line.debit} onChange={e => updateLine(i, 'debit', e.target.value)} style={{ ...inputStyle, width: '100%' }} placeholder="0.00" /></td>
                                    <td style={tdStyle}><input type="number" step="0.01" min="0" value={line.credit} onChange={e => updateLine(i, 'credit', e.target.value)} style={{ ...inputStyle, width: '100%' }} placeholder="0.00" /></td>
                                    <td style={tdStyle}>
                                        {form.lines.length > 2 && (
                                            <button type="button" onClick={() => removeLine(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            <tr style={{ background: 'var(--surface-2)' }}>
                                <td style={{ ...tdStyle, fontWeight: '700' }}>Totals</td>
                                <td style={{ ...tdStyle, fontWeight: '700' }}>{fmt(totalDebit)}</td>
                                <td style={{ ...tdStyle, fontWeight: '700' }}>{fmt(totalCredit)}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button type="button" onClick={addLine} style={{ ...btnPrimary, background: 'var(--surface-2)', color: 'var(--text-color)' }}>+ Add Line</button>
                        <div style={{ flex: 1 }}></div>
                        {Math.abs(totalDebit - totalCredit) > 0.01 && <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: '600' }}>Difference: {fmt(Math.abs(totalDebit - totalCredit))}</span>}
                        <button type="submit" disabled={saving || Math.abs(totalDebit - totalCredit) > 0.01} style={btnPrimary}>{saving ? 'Saving...' : 'Post Entry'}</button>
                        <button type="button" onClick={() => setShowForm(false)} style={{ ...btnPrimary, background: 'var(--surface-2)', color: 'var(--text-color)' }}>Cancel</button>
                    </div>
                </form>
            )}

            {/* Entries List */}
            <div style={{ background: 'var(--surface-1)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                ) : entries.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No journal entries found</div>
                ) : entries.map(entry => (
                    <div key={entry.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <div onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            style={{ padding: '0.75rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600' }}>{entry.reference_no}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{entry.entry_date}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>{entry.description}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{
                                    padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '600',
                                    background: entry.is_reversed ? '#f8717120' : '#4ade8020',
                                    color: entry.is_reversed ? '#f87171' : '#4ade80'
                                }}>
                                    {entry.is_reversed ? 'Reversed' : entry.source_type}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{expandedId === entry.id ? '▲' : '▼'}</span>
                            </div>
                        </div>
                        {expandedId === entry.id && (
                            <div style={{ padding: '0 0.75rem 0.75rem' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--surface-2)' }}>
                                            <th style={thStyle}>Account</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Debit</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entry.lines.map((line, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={tdStyle}>{line.account_code} — {line.account_name}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{line.debit > 0 ? fmt(line.debit) : '-'}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{line.credit > 0 ? fmt(line.credit) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {!entry.is_reversed && (
                                    <button onClick={() => handleReverse(entry.id)} style={{ marginTop: '0.5rem', padding: '0.3rem 0.75rem', borderRadius: '0.25rem', border: 'none', background: '#f8717120', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                                        Reverse Entry
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => fetchEntries(p)}
                            style={{ ...btnPrimary, background: p === pagination.page ? 'var(--primary-color)' : 'var(--surface-1)', color: p === pagination.page ? '#fff' : 'var(--text-color)', minWidth: '32px' }}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.25rem' };
const inputStyle = { padding: '0.4rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-color)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
const btnPrimary = { padding: '0.4rem 0.75rem', borderRadius: '0.375rem', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' };
const thStyle = { padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' };
const tdStyle = { padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-color)' };

export default JournalEntries;
