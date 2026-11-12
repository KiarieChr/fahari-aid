import React from 'react';
import GeneralLedger from '../../components/accounting/GeneralLedger';

const GeneralLedgerPage = () => {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>General Ledger</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>View transaction history and running balances for each account.</p>
            </div>
            <GeneralLedger />
        </div>
    );
};

export default GeneralLedgerPage;
