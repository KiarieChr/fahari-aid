import React from 'react';
import IncomeStatement from '../../components/accounting/IncomeStatement';

const IncomeStatementPage = () => {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>Income Statement</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Profit & Loss report showing revenue and expenses for a period.</p>
            </div>
            <IncomeStatement />
        </div>
    );
};

export default IncomeStatementPage;
