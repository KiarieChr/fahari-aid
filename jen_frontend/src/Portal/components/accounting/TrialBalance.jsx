import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const TrialBalance = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date().getFullYear() + '-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`get_trial_balance.php?start_date=${startDate}&end_date=${endDate}`);
            if (res.success) setData(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const fmt = (n) => (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const typeOrder = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

    const grouped = data ? typeOrder.reduce((acc, type) => {
        const items = data.accounts.filter(a => a.account_type === type);
        if (items.length > 0) acc[type] = items;
        return acc;
    }, {}) : {};

    return (
        <div>
            {/* Date Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
                <button onClick={fetchData} style={btnStyle}>Generate</button>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : data && (
                <div style={{ background: 'var(--surface-1)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    {/* Balance Status */}
                    <div style={{
                        padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>Trial Balance</span>
                        <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600',
                            background: data.is_balanced ? '#4ade8020' : '#f8717120',
                            color: data.is_balanced ? '#4ade80' : '#f87171'
                        }}>
                            {data.is_balanced ? '✓ Balanced' : '✗ Unbalanced'}
                        </span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-2)' }}>
                                <th style={thStyle}>Code</th>
                                <th style={thStyle}>Account Name</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Debit (KES)</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Credit (KES)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(grouped).map(([type, items]) => (
                                <React.Fragment key={type}>
                                    <tr>
                                        <td colSpan={4} style={{ padding: '0.5rem 0.75rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary-color)', background: 'var(--surface-2)' }}>{type}</td>
                                    </tr>
                                    {items.map(a => (
                                        <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{a.account_code}</td>
                                            <td style={tdStyle}>{a.account_name}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{a.debit > 0 ? fmt(a.debit) : '-'}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{a.credit > 0 ? fmt(a.credit) : '-'}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            {/* Totals */}
                            <tr style={{ background: 'var(--surface-2)', fontWeight: '800' }}>
                                <td colSpan={2} style={{ ...tdStyle, fontWeight: '800' }}>TOTALS</td>
                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '800' }}>KES {fmt(data.total_debit)}</td>
                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '800' }}>KES {fmt(data.total_credit)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const inputStyle = { padding: '0.4rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-color)', fontSize: '0.85rem', outline: 'none' };
const btnStyle = { padding: '0.4rem 0.75rem', borderRadius: '0.375rem', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' };
const thStyle = { padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' };
const tdStyle = { padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-color)' };

export default TrialBalance;
