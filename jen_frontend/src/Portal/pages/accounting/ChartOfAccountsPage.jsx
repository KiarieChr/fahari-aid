import React from 'react';
import ChartOfAccounts from '../../components/accounting/ChartOfAccounts';

const ChartOfAccountsPage = () => {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>Chart of Accounts</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage your organization's accounts for double-entry bookkeeping.</p>
            </div>
            <ChartOfAccounts />
        </div>
    );
};

export default ChartOfAccountsPage;
