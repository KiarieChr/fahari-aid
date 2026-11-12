import React from 'react';
import BalanceSheet from '../../components/accounting/BalanceSheet';

const BalanceSheetPage = () => {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>Balance Sheet</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Snapshot of assets, liabilities, and equity at a point in time.</p>
            </div>
            <BalanceSheet />
        </div>
    );
};

export default BalanceSheetPage;
