import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const IncomeStatement = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date().getFullYear() + '-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`get_income_statement.php?start_date=${startDate}&end_date=${endDate}`);
            if (res.success) setData(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const fmt = (n) => (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div>
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
                    {/* Header */}
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-color)' }}>Income Statement</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>For the period {startDate} to {endDate}</div>
                    </div>

                    <div style={{ padding: '1rem' }}>
                        {/* Revenue Section */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#4ade80', marginBottom: '0.5rem', borderBottom: '2px solid #4ade8040', paddingBottom: '0.3rem' }}>
                                REVENUE
                            </div>
                            {data.revenue.length === 0 ? (
                                <div style={{ padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No revenue recorded</div>
                            ) : data.revenue.map(r => (
                                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-color)' }}>{r.account_code} — {r.account_name}</span>
                                    <span style={{ fontWeight: '600', color: '#4ade80' }}>KES {fmt(r.amount)}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', fontWeight: '800', borderTop: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                                <span style={{ color: 'var(--text-color)' }}>Total Revenue</span>
                                <span style={{ color: '#4ade80' }}>KES {fmt(data.total_revenue)}</span>
                            </div>
                        </div>

                        {/* Expenses Section */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#f87171', marginBottom: '0.5rem', borderBottom: '2px solid #f8717140', paddingBottom: '0.3rem' }}>
                                EXPENSES
                            </div>
                            {data.expenses.length === 0 ? (
                                <div style={{ padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No expenses recorded</div>
                            ) : data.expenses.map(e => (
                                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-color)' }}>{e.account_code} — {e.account_name}</span>
                                    <span style={{ fontWeight: '600', color: '#f87171' }}>KES {fmt(e.amount)}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', fontWeight: '800', borderTop: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                                <span style={{ color: 'var(--text-color)' }}>Total Expenses</span>
                                <span style={{ color: '#f87171' }}>KES {fmt(data.total_expenses)}</span>
                            </div>
                        </div>

                        {/* Net Income */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', padding: '0.75rem',
                            background: data.net_income >= 0 ? '#4ade8015' : '#f8717115',
                            borderRadius: '0.5rem', fontWeight: '800', fontSize: '1.1rem'
                        }}>
                            <span style={{ color: 'var(--text-color)' }}>NET {data.net_income >= 0 ? 'SURPLUS' : 'DEFICIT'}</span>
                            <span style={{ color: data.net_income >= 0 ? '#4ade80' : '#f87171' }}>KES {fmt(Math.abs(data.net_income))}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const inputStyle = { padding: '0.4rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-color)', fontSize: '0.85rem', outline: 'none' };
const btnStyle = { padding: '0.4rem 0.75rem', borderRadius: '0.375rem', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' };

export default IncomeStatement;
