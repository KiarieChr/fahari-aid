import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';

const BudgetsList = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const data = await api.get('get_budgets.php');
                if (data.success) setBudgets(data.data.budgets || []);
            } catch (err) {
                console.error('Failed to load budgets:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBudgets();
    }, []);

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            marginBottom: '1.5rem'
        }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-color)' }}>Budgets</h3>
            </div>
            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : budgets.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No budgets found. Create one to get started.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', padding: '1rem' }}>
                    {budgets.map((b, i) => {
                        const spent = b.total_spent || 0;
                        const allocated = b.total_allocated || 0;
                        const pct = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
                        return (
                            <div key={i} style={{
                                background: 'var(--bg-color)',
                                borderRadius: '0.75rem',
                                padding: '1.25rem',
                                border: '1px solid var(--border-color)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '1rem' }}>{b.budget_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{b.budget_purpose}</div>
                                    </div>
                                    <span style={{
                                        padding: '0.15rem 0.5rem',
                                        borderRadius: '0.3rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        background: b.is_active ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                                        color: b.is_active ? '#4ade80' : '#f87171'
                                    }}>{b.is_active ? 'Active' : 'Closed'}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                                    <span>KES {spent.toLocaleString()} spent</span>
                                    <span>KES {allocated.toLocaleString()} allocated</span>
                                </div>
                                <div style={{ background: 'var(--border-color)', borderRadius: '1rem', height: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${pct}%`,
                                        height: '100%',
                                        borderRadius: '1rem',
                                        background: pct > 90 ? '#f87171' : pct > 70 ? '#f59e0b' : '#4ade80',
                                        transition: 'width 0.3s'
                                    }}></div>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>{pct.toFixed(0)}% utilized</div>

                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    {b.item_count || 0} line items
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BudgetsList;
