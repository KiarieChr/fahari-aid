import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const TransactionsTable = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });

    useEffect(() => {
        fetchTransactions();
    }, [activeTab, pagination.page, search]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                type: activeTab,
                page: pagination.page,
                limit: pagination.limit,
                search
            });
            const data = await api.get(`get_transactions.php?${params}`);
            if (data.success) {
                setTransactions(data.data.transactions || []);
                setPagination(prev => ({
                    ...prev,
                    total: data.data.pagination?.total || 0,
                    total_pages: data.data.pagination?.total_pages || 1
                }));
            }
        } catch (err) {
            console.error('Failed to load transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'all', label: 'All Transactions' },
        { key: 'income', label: 'Income' },
        { key: 'expense', label: 'Expenses' },
        { key: 'contribution', label: 'Contributions' },
    ];

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'income': return '#4ade80';
            case 'expense': return '#f87171';
            case 'contribution': return '#22c1e6';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            marginBottom: '1.5rem'
        }}>
            {/* Tabs + Search */}
            <div style={{
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '0.75rem'
            }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPagination(p => ({ ...p, page: 1 })); }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab.key ? 'var(--bg-color)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab.key ? '700' : '500',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                    placeholder="Search transactions..."
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)',
                        fontSize: '0.85rem',
                        width: '250px'
                    }}
                />
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            {['Date', 'Description', 'Category', 'Type', 'Amount', 'Method'].map(h => (
                                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found</td></tr>
                        ) : (
                            transactions.map((tx, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{tx.date}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: '500' }}>{tx.description}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tx.category}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '0.3rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: `${getTypeColor(tx.type)}20`,
                                            color: getTypeColor(tx.type),
                                            textTransform: 'capitalize'
                                        }}>{tx.type}</span>
                                    </td>
                                    <td style={{
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.9rem',
                                        fontWeight: '700',
                                        color: tx.type === 'expense' ? '#f87171' : '#4ade80'
                                    }}>
                                        {tx.type === 'expense' ? '-' : '+'}KES {(tx.amount || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tx.method || '—'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div>Showing {transactions.length > 0 ? ((pagination.page - 1) * pagination.limit + 1) : 0} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {(pagination.total || 0).toLocaleString()} entries</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}
                        style={{ background: 'var(--border-color)', border: 'none', color: 'var(--text-color)', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1 }}>
                        ‹ Prev
                    </button>
                    <span style={{ padding: '0.3rem 0.6rem' }}>Page {pagination.page} of {pagination.total_pages}</span>
                    <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.total_pages}
                        style={{ background: 'var(--border-color)', border: 'none', color: 'var(--text-color)', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', cursor: pagination.page === pagination.total_pages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.total_pages ? 0.5 : 1 }}>
                        Next ›
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionsTable;
