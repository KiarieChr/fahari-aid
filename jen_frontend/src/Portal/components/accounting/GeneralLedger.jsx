import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const GeneralLedger = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [ledger, setLedger] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date().getFullYear() + '-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await api.get('get_chart_of_accounts.php?type=all');
                if (data.success) setAccounts(data.data.accounts.filter(a => a.is_active));
            } catch (err) { console.error(err); }
        };
        fetchAccounts();
    }, []);

    const fetchLedger = async (accountId) => {
        setLoading(true);
        try {
            const data = await api.get(`get_account_ledger.php?account_id=${accountId}&start_date=${startDate}&end_date=${endDate}&limit=100`);
            if (data.success) setLedger(data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSelect = (acct) => {
        setSelectedAccount(acct);
        fetchLedger(acct.id);
    };

    const fmt = (n) => (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem', minHeight: '500px' }}>
            {/* Left: Account List */}
            <div style={{ background: 'var(--surface-1)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                    Accounts
                </div>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {accounts.map(a => (
                        <div key={a.id} onClick={() => handleSelect(a)}
                            style={{
                                padding: '0.5rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)',
                                background: selectedAccount?.id === a.id ? 'var(--primary-color)10' : 'transparent',
                                borderLeft: selectedAccount?.id === a.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                            }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-color)' }}>{a.account_code} — {a.account_name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.account_type}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Ledger Detail */}
            <div style={{ background: 'var(--surface-1)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                {!selectedAccount ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Select an account to view its ledger
                    </div>
                ) : (
                    <>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-color)' }}>
                                    {selectedAccount.account_code} — {selectedAccount.account_name}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedAccount.account_type} | {selectedAccount.normal_balance} balance</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
                                <span style={{ color: 'var(--text-muted)' }}>to</span>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
                                <button onClick={() => fetchLedger(selectedAccount.id)} style={btnStyle}>Apply</button>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                        ) : ledger && (
                            <>
                                {/* Summary */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', padding: '0.75rem' }}>
                                    {[
                                        { label: 'Opening', val: fmt(ledger.opening_balance) },
                                        { label: 'Debits', val: fmt(ledger.period_debit) },
                                        { label: 'Credits', val: fmt(ledger.period_credit) },
                                        { label: 'Closing', val: fmt(ledger.closing_balance) },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: 'var(--surface-2)', borderRadius: '0.5rem', padding: '0.5rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-color)' }}>KES {s.val}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Lines */}
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--surface-2)' }}>
                                            {['Date', 'Reference', 'Description', 'Debit', 'Credit', 'Balance'].map(h => (
                                                <th key={h} style={thStyle}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledger.lines.length === 0 ? (
                                            <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No transactions in this period</td></tr>
                                        ) : ledger.lines.map((line, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={tdStyle}>{line.entry_date}</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.8rem' }}>{line.reference_no}</td>
                                                <td style={tdStyle}>{line.line_description || line.entry_description}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', color: line.debit > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                                                    {line.debit > 0 ? fmt(line.debit) : '-'}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'right', color: line.credit > 0 ? '#4ade80' : 'var(--text-muted)' }}>
                                                    {line.credit > 0 ? fmt(line.credit) : '-'}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>KES {fmt(line.running_balance)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const inputStyle = { padding: '0.35rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-color)', fontSize: '0.8rem', outline: 'none' };
const btnStyle = { padding: '0.35rem 0.75rem', borderRadius: '0.375rem', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' };
const thStyle = { padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' };
const tdStyle = { padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-color)' };

export default GeneralLedger;
