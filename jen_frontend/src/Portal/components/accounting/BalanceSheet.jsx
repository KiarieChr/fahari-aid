import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const BalanceSheet = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`get_balance_sheet.php?as_of_date=${asOfDate}`);
            if (res.success) setData(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const fmt = (n) => (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const Section = ({ title, items, total, color }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color, marginBottom: '0.5rem', borderBottom: `2px solid ${color}40`, paddingBottom: '0.3rem' }}>
                {title}
            </div>
            {items.length === 0 ? (
                <div style={{ padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No items</div>
            ) : items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-color)' }}>{item.account_code} — {item.account_name}</span>
                    <span style={{ fontWeight: '600', color }}>KES {fmt(item.balance)}</span>
                </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', fontWeight: '800', borderTop: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-color)' }}>Total {title}</span>
                <span style={{ color }}>KES {fmt(total)}</span>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>As of:</span>
                <input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} style={inputStyle} />
                <button onClick={fetchData} style={btnStyle}>Generate</button>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : data && (
                <div style={{ background: 'var(--surface-1)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-color)' }}>Balance Sheet</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>As of {asOfDate}</div>
                        <div style={{
                            display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.75rem', borderRadius: '1rem',
                            fontSize: '0.8rem', fontWeight: '600',
                            background: data.is_balanced ? '#4ade8020' : '#f8717120',
                            color: data.is_balanced ? '#4ade80' : '#f87171'
                        }}>
                            {data.is_balanced ? '✓ Balanced' : '✗ Unbalanced'}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem' }}>
                        {/* Left: Assets */}
                        <div>
                            <Section title="ASSETS" items={data.assets} total={data.total_assets} color="#22c1e6" />
                        </div>

                        {/* Right: Liabilities + Equity */}
                        <div>
                            <Section title="LIABILITIES" items={data.liabilities} total={data.total_liabilities} color="#f87171" />
                            <Section title="EQUITY" items={data.equity} total={data.total_equity} color="#a78bfa" />
                            {data.net_income !== 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-color)', fontStyle: 'italic' }}>Net Income (Current Period)</span>
                                    <span style={{ fontWeight: '600', color: data.net_income >= 0 ? '#4ade80' : '#f87171' }}>KES {fmt(data.net_income)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Totals */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--surface-2)', borderTop: '2px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1rem' }}>
                            <span style={{ color: 'var(--text-color)' }}>Total Assets</span>
                            <span style={{ color: '#22c1e6' }}>KES {fmt(data.total_assets)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1rem' }}>
                            <span style={{ color: 'var(--text-color)' }}>Liabilities + Equity</span>
                            <span style={{ color: '#a78bfa' }}>KES {fmt(data.total_liabilities_and_equity)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const inputStyle = { padding: '0.4rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-color)', fontSize: '0.85rem', outline: 'none' };
const btnStyle = { padding: '0.4rem 0.75rem', borderRadius: '0.375rem', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' };

export default BalanceSheet;
