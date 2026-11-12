import React from 'react';
import PayrollManager from '../../components/accounting/PayrollManager';

const PayrollPage = () => {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>Payroll</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Create, approve, and process payroll runs for staff.</p>
            </div>
            <PayrollManager />
        </div>
    );
};

export default PayrollPage;
