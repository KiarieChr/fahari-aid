import React, { useState, useEffect, useContext } from 'react';
import api from '../../../../services/api';
import { ThemeContext } from '../../../../context/ThemeContext';

const ContributionsTable = () => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });

    useEffect(() => {
        fetchContributions();
    }, [pagination.page, search]);

    const fetchContributions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                search: search || ''
            });

            // Try modern DRF endpoint first, falling back to legacy endpoint
            let data;
            try {
                data = await api.get(`finance/contributions/?${params}`);
            } catch (endpointErr) {
                data = await api.get(`get_contributions.php?${params}`);
            }

            const items = data?.data?.contributions || data?.results || (Array.isArray(data) ? data : []);
            const total = data?.data?.pagination?.total ?? data?.count ?? items.length;
            const total_pages = data?.data?.pagination?.total_pages ?? Math.max(1, Math.ceil(total / pagination.limit));

            setContributions(items);
            setPagination(prev => ({
                ...prev,
                total,
                total_pages
            }));
        } catch (err) {
            console.error('Failed to load contributions:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`stitch-card-wrapper ${isDark ? 'dark-mode' : 'light-mode'}`}>
            <div className="stitch-card-header">
                <div className="header-titles">
                    <h3>Contribution Records & Tithes</h3>
                    <p>Live financial ledger of all giving, offerings, and kingdom seeds</p>
                </div>
                <div className="stitch-search-field">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#94a3b8' : '#64748b'} strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                        placeholder="Search by member, type, fund, method..."
                    />
                </div>
            </div>

            <div className="stitch-table-responsive">
                <table className="stitch-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Member / Contributor</th>
                            <th>Category</th>
                            <th>Fund / Purpose</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="stitch-loading-state">
                                        <div className="stitch-spinner"></div>
                                        <p>Loading contributions from financial ledger...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : contributions.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="stitch-empty-state">
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
                                        <h4>No contributions found</h4>
                                        <p>Try refining your search filter or recording a new contribution.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            contributions.map((c, i) => (
                                <tr key={c.id || i}>
                                    <td className="cell-date">{c.date || c.contribution_date || '—'}</td>
                                    <td className="cell-member">{c.member || c.member_name || 'Anonymous Giver'}</td>
                                    <td>
                                        <span className="stitch-badge-neutral">{c.type || c.contritype || 'Offering'}</span>
                                    </td>
                                    <td className="cell-fund">{c.fund || c.fund_name || 'General Ministry'}</td>
                                    <td className="cell-amount">
                                        KES {(c.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="cell-method">{c.method || c.payment_method || c.paymentmethod || 'M-Pesa'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="stitch-table-footer">
                <span className="page-info">
                    Page {pagination.page} of {pagination.total_pages} ({(pagination.total || 0).toLocaleString()} total records)
                </span>
                <div className="pagination-buttons">
                    <button
                        onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                        disabled={pagination.page <= 1}
                        className="pagination-btn"
                    >
                        ‹ Prev
                    </button>
                    <button
                        onClick={() => setPagination(p => ({ ...p, page: Math.min(pagination.total_pages, p.page + 1) }))}
                        disabled={pagination.page >= pagination.total_pages}
                        className="pagination-btn"
                    >
                        Next ›
                    </button>
                </div>
            </div>

            <style>{`
                .stitch-card-wrapper {
                    border-radius: 1.25rem;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    transition: background 0.2s ease, border-color 0.2s ease;
                }
                .stitch-card-wrapper.dark-mode {
                    background: #1a1625;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .stitch-card-wrapper.light-mode {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                }

                .stitch-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    padding: 1.25rem 1.75rem;
                }
                .dark-mode .stitch-card-header {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                .light-mode .stitch-card-header {
                    border-bottom: 1px solid #f1f5f9;
                }

                .header-titles h3 {
                    font-size: 1.05rem;
                    font-weight: 800;
                    margin: 0;
                }
                .dark-mode .header-titles h3 {
                    color: #ffffff;
                }
                .light-mode .header-titles h3 {
                    color: #0f172a;
                }

                .header-titles p {
                    font-size: 0.8125rem;
                    margin: 0.2rem 0 0 0;
                }
                .dark-mode .header-titles p {
                    color: #94a3b8;
                }
                .light-mode .header-titles p {
                    color: #64748b;
                }

                .stitch-search-field {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border-radius: 9999px;
                    padding: 0.45rem 1rem;
                    min-width: 260px;
                }
                .dark-mode .stitch-search-field {
                    background: #0d0a1a;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }
                .light-mode .stitch-search-field {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                }

                .stitch-search-field input {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 0.825rem;
                    width: 100%;
                }
                .dark-mode .stitch-search-field input {
                    color: #f8fafc;
                }
                .light-mode .stitch-search-field input {
                    color: #0f172a;
                }

                .stitch-table-responsive {
                    width: 100%;
                    overflow-x: auto;
                }
                .stitch-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .stitch-table th {
                    font-size: 0.725rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 0.95rem 1.5rem;
                }
                .dark-mode .stitch-table th {
                    background: rgba(255, 255, 255, 0.02);
                    color: #94a3b8;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                .light-mode .stitch-table th {
                    background: #f8fafc;
                    color: #64748b;
                    border-bottom: 1px solid #e2e8f0;
                }

                .stitch-table td {
                    padding: 1rem 1.5rem;
                    font-size: 0.85rem;
                    vertical-align: middle;
                }
                .dark-mode .stitch-table td {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                }
                .light-mode .stitch-table td {
                    border-bottom: 1px solid #f1f5f9;
                }

                .dark-mode .cell-date { color: #94a3b8; }
                .light-mode .cell-date { color: #64748b; }

                .dark-mode .cell-member { font-weight: 700; color: #ffffff; }
                .light-mode .cell-member { font-weight: 700; color: #0f172a; }

                .dark-mode .cell-fund { color: #cbd5e1; }
                .light-mode .cell-fund { color: #475569; }

                .cell-amount {
                    font-weight: 800;
                    color: #22c55e !important;
                }

                .dark-mode .cell-method { color: #94a3b8; }
                .light-mode .cell-method { color: #64748b; }

                .dark-mode .stitch-table tr:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
                .light-mode .stitch-table tr:hover {
                    background: #f8fafc;
                }

                .stitch-badge-neutral {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.725rem;
                    font-weight: 700;
                }
                .dark-mode .stitch-badge-neutral {
                    background: rgba(37, 99, 235, 0.18);
                    color: #60a5fa;
                    border: 1px solid rgba(37, 99, 235, 0.3);
                }
                .light-mode .stitch-badge-neutral {
                    background: #eff6ff;
                    color: #2563eb;
                    border: 1px solid #dbeafe;
                }

                .stitch-table-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem;
                }
                .dark-mode .stitch-table-footer {
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    background: #1a1625;
                }
                .light-mode .stitch-table-footer {
                    border-top: 1px solid #f1f5f9;
                    background: #ffffff;
                }

                .page-info {
                    font-size: 0.8125rem;
                }
                .dark-mode .page-info { color: #94a3b8; }
                .light-mode .page-info { color: #64748b; }

                .pagination-buttons {
                    display: flex;
                    gap: 0.5rem;
                }
                .pagination-btn {
                    padding: 0.4rem 0.85rem;
                    border-radius: 9999px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .dark-mode .pagination-btn {
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: rgba(255, 255, 255, 0.05);
                    color: #f8fafc;
                }
                .light-mode .pagination-btn {
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #0f172a;
                }

                .pagination-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .dark-mode .pagination-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .light-mode .pagination-btn:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                .stitch-loading-state,
                .stitch-empty-state {
                    padding: 3.5rem 1.5rem;
                    text-align: center;
                }
                .dark-mode .stitch-loading-state,
                .dark-mode .stitch-empty-state { color: #94a3b8; }
                .light-mode .stitch-loading-state,
                .light-mode .stitch-empty-state { color: #64748b; }

                .stitch-empty-state h4 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin: 0 0 0.35rem 0;
                }
                .dark-mode .stitch-empty-state h4 { color: #ffffff; }
                .light-mode .stitch-empty-state h4 { color: #0f172a; }

                .stitch-spinner {
                    width: 34px;
                    height: 34px;
                    border: 3px solid rgba(34, 193, 230, 0.2);
                    border-top-color: #22c1e6;
                    border-radius: 50%;
                    animation: stitch-spin 0.8s linear infinite;
                    margin: 0 auto 1rem auto;
                }
                @keyframes stitch-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ContributionsTable;
