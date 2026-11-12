import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, total_pages: 1 });
    const [loading, setLoading] = useState(true);
    const [tableFilter, setTableFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            let url = `get_audit_log.php?page=${page}&limit=20`;
            if (tableFilter) url += `&table_name=${tableFilter}`;
            if (actionFilter) url += `&action=${actionFilter}`;
            const res = await api.get(url);
            if (res.success) {
                setLogs(res.data.logs);
                setPagination(res.data.pagination);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, [tableFilter, actionFilter]);

    const tables = ['', 'income', 'expense', 'contribution', 'journal_entry', 'account', 'payroll_run', 'accounting_period'];
    const actions = ['', 'create', 'update', 'delete', 'post', 'reverse', 'close'];

    const actionColors = {
        create: '#4ade80', update: '#22c1e6', delete: '#f87171',
        post: '#a78bfa', reverse: '#f59e0b', close: '#8b5cf6'
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <select value={tableFilter} onChange={e => setTableFilter(e.target.value)} style={inputStyle}>
                    <option value="">All Tables</option>
                    {tables.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={inputStyle}>
                    <option value="">All Actions</option>
                    {actions.filter(Boolean).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>

            <div style={{ background: 'var(--surface-1)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-2)' }}>
                            {['Timestamp', 'User', 'Table', 'Action', 'Record ID', 'Details'].map(h => (
                                <th key={h} style={thStyle}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center' }}>Loading...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs found</td></tr>
                        ) : logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ ...tdStyle, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                                <td style={tdStyle}>{log.user_email || `User #${log.user_id}`}</td>
                                <td style={tdStyle}><code style={{ fontSize: '0.75rem' }}>{log.table_name}</code></td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '0.1rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '600',
                                        background: `${actionColors[log.action] || '#666'}20`, color: actionColors[log.action] || '#666'
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={tdStyle}>#{log.record_id}</td>
                                <td style={{ ...tdStyle, maxWidth: '300px' }}>
                                    {log.new_values && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {JSON.stringify(log.new_values)}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.total_pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    {Array.from({ length: Math.min(pagination.total_pages, 10) }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => fetchLogs(p)}
                            style={{
                                padding: '0.3rem 0.6rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer',
                                background: p === pagination.page ? 'var(--primary-color)' : 'var(--surface-2)',
                                color: p === pagination.page ? '#fff' : 'var(--text-color)', fontSize: '0.8rem'
                            }}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const inputStyle = { padding: '0.4rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-color)', fontSize: '0.85rem', outline: 'none' };
const thStyle = { padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' };
const tdStyle = { padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-color)' };

export default AuditLog;
