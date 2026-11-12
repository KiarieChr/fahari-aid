import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';

const PledgesTable = ({ refreshKey = 0, onMakePledge, onRedeemPledge }) => {
    const [pledges, setPledges] = useState([]);
    const [stats, setStats] = useState({ total_pledged: 0, total_redeemed: 0, total_remaining: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });

    useEffect(() => {
        fetchPledges();
    }, [pagination.page, pagination.limit, search, statusFilter, dateFrom, dateTo, refreshKey]);

    const fetchPledges = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ 
                page: pagination.page, 
                limit: pagination.limit, 
                search,
                status: statusFilter,
                date_from: dateFrom,
                date_to: dateTo
            });
            const data = await api.get(`get_pledges.php?${params}`);
            if (data.success) {
                setPledges(data.data.pledges || []);
                setStats(data.data.stats || { total_pledged: 0, total_redeemed: 0, total_remaining: 0 });
                setPagination(prev => ({
                    ...prev,
                    total: data.data.pagination?.total || 0,
                    total_pages: data.data.pagination?.total_pages || 1
                }));
            }
        } catch (err) {
            console.error('Failed to load pledges:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (redeemed, total) => {
        const pct = total > 0 ? (redeemed / total) * 100 : 0;
        if (pct >= 100) return '#4ade80';
        if (pct >= 50) return '#f59e0b';
        return '#f87171';
    };

    const handleLimitChange = (e) => {
        setPagination(p => ({ ...p, limit: parseInt(e.target.value), page: 1 }));
    };

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setPagination(p => ({ ...p, page: 1 }));
    };

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= pagination.total_pages; i++) {
            if (
                i === 1 || 
                i === pagination.total_pages || 
                (i >= pagination.page - 2 && i <= pagination.page + 2)
            ) {
                pages.push(
                    <button 
                        key={i} 
                        onClick={() => setPagination(p => ({ ...p, page: i }))}
                        style={{ 
                            background: i === pagination.page ? 'var(--primary)' : 'var(--border-color)', 
                            border: 'none', 
                            color: i === pagination.page ? 'var(--bg-color)' : 'var(--text-color)', 
                            padding: '0.3rem 0.6rem', 
                            borderRadius: '0.3rem', 
                            cursor: 'pointer',
                            fontWeight: i === pagination.page ? 'bold' : 'normal'
                        }}
                    >
                        {i}
                    </button>
                );
            } else if (
                i === pagination.page - 3 || 
                i === pagination.page + 3
            ) {
                pages.push(<span key={i} style={{ padding: '0 0.2rem', color: 'var(--text-muted)' }}>...</span>);
            }
        }
        return pages;
    };

    return (
        <div>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--surface-1)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Pledged</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-color)', marginTop: '0.5rem' }}>KES {stats.total_pledged.toLocaleString()}</div>
                </div>
                <div style={{ background: 'var(--surface-1)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Redeemed</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4ade80', marginTop: '0.5rem' }}>KES {stats.total_redeemed.toLocaleString()}</div>
                </div>
                <div style={{ background: 'var(--surface-1)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Remaining Balance</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f87171', marginTop: '0.5rem' }}>KES {stats.total_remaining.toLocaleString()}</div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div style={{ 
                background: 'var(--surface-1)', 
                borderRadius: '1rem', 
                border: '1px solid var(--border-color)', 
                padding: '1.5rem', 
                marginBottom: '1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: 1 }}>
                    <input 
                        value={search} 
                        onChange={handleFilterChange(setSearch)}
                        placeholder="Search pledges..."
                        style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.9rem', minWidth: '200px' }}
                    />
                    <select 
                        value={statusFilter} 
                        onChange={handleFilterChange(setStatusFilter)}
                        style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.9rem' }}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="fulfilled">Fulfilled</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                            type="date" 
                            value={dateFrom} 
                            onChange={handleFilterChange(setDateFrom)}
                            style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.9rem' }}
                            title="From Date"
                        />
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                        <input 
                            type="date" 
                            value={dateTo} 
                            onChange={handleFilterChange(setDateTo)}
                            style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.9rem' }}
                            title="To Date"
                        />
                    </div>
                </div>
                {onMakePledge && (
                    <button onClick={onMakePledge} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', background: 'var(--primary)', color: 'var(--bg-color)', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        + Make Pledge
                    </button>
                )}
            </div>

            {/* Main Table */}
            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                marginBottom: '1.5rem'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['Date', 'Name', 'Purpose', 'Pledged', 'Redeemed', 'Progress', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading pledges...</td></tr>
                            ) : pledges.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pledges found matching your criteria.</td></tr>
                            ) : (
                                pledges.map((p, i) => {
                                    const pct = p.pledged_amount > 0 ? Math.min(100, (p.redeemed_amount / p.pledged_amount) * 100) : 0;
                                    return (
                                        <tr key={p.id || i} style={{ borderBottom: '1px solid var(--border-color)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{p.date}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: '500' }}>{p.full_name}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.purpose || '—'}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>KES {(p.pledged_amount || 0).toLocaleString()}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '600', color: '#4ade80' }}>KES {(p.redeemed_amount || 0).toLocaleString()}</td>
                                            <td style={{ padding: '1rem', width: '120px' }}>
                                                <div style={{ background: 'var(--border-color)', borderRadius: '1rem', height: '6px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', background: getStatusColor(p.redeemed_amount, p.pledged_amount), borderRadius: '1rem', transition: 'width 0.3s' }}></div>
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{pct.toFixed(0)}%</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '0.3rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: `${getStatusColor(p.redeemed_amount, p.pledged_amount)}20`,
                                                    color: getStatusColor(p.redeemed_amount, p.pledged_amount)
                                                }}>{pct >= 100 ? 'Fulfilled' : pct > 0 ? 'Partial' : 'Pending'}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {pct < 100 && onRedeemPledge && (
                                                    <button onClick={() => onRedeemPledge(p)}
                                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '0.3rem', border: 'none', background: '#4ade8030', color: '#4ade80', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                        Redeem
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <div>
                            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {(pagination.total || 0).toLocaleString()} entries
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>Rows per page:</span>
                            <select 
                                value={pagination.limit} 
                                onChange={handleLimitChange}
                                style={{ padding: '0.3rem', borderRadius: '0.3rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.85rem' }}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                            onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} 
                            disabled={pagination.page === 1}
                            style={{ background: 'var(--border-color)', border: 'none', color: 'var(--text-color)', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1 }}
                        >
                            ‹ Prev
                        </button>
                        
                        {renderPageNumbers()}

                        <button 
                            onClick={() => setPagination(p => ({ ...p, page: Math.min(p.total_pages, p.page + 1) }))} 
                            disabled={pagination.page >= pagination.total_pages}
                            style={{ background: 'var(--border-color)', border: 'none', color: 'var(--text-color)', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', cursor: pagination.page >= pagination.total_pages ? 'not-allowed' : 'pointer', opacity: pagination.page >= pagination.total_pages ? 0.5 : 1 }}
                        >
                            Next ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PledgesTable;
