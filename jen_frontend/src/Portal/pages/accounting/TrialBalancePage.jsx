import React from 'react';
import TrialBalance from '../../components/accounting/TrialBalance';

const TrialBalancePage = () => {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>Trial Balance</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Verify that total debits equal total credits across all accounts.</p>
            </div>
            <TrialBalance />
        </div>
    );
};

export default TrialBalancePage;
